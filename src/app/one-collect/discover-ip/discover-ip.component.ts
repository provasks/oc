import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { DeviceBasedComponent } from '../device-based/device-based.component';
import * as _ from 'lodash';
import { HelperService } from 'src/app/services/helper/helper.service';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from 'src/app/services/translate/translate.service';
import { CredentialService } from 'src/app/services/credential/credential.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'oc-discover-ip',
  templateUrl: './discover-ip.component.html',
  styleUrls: ['./discover-ip.component.css']
})
export class DiscoverIpComponent extends DeviceBasedComponent
  implements OnInit, OnDestroy {
  client: any = environment.client;
  typeCheck: any;
  uploadMsg: any;
  showContent: boolean;
  validation: any = { badIpRange: true };
  notification: any;
  useCredentials: boolean = false;
  hasCredentials: boolean = true;

  //Progress bar
  progress: any;
  progressText: string;
  progressValue: number;
  progressing: boolean = false;
  discoverSubscription: Subscription;
  progressSubscription: Subscription;

  //Auto-discovery
  ipRange: string = '';
  // ipRange: string = '10.195.66.0/19';
  // ipRange: string = '10.195.66.14-20';
  // ipRange: string = '10.195.66.15';
  communityString: string = '';
  settings: any;
  exported: boolean = true;

  constructor(
    public apiService: ApiService,
    public dataService: DataService,
    public helper: HelperService,
    public router: Router,
    public route: ActivatedRoute,
    public translate: TranslateService,
    public credentialService: CredentialService
  ) {
    super(
      apiService,
      dataService,
      helper,
      router,
      route,
      translate,
      credentialService
    );
    this.settings = this.settings.autoDiscovery; //get autodiscovery related settings
  }

  canDeactivate(): Promise<boolean> | boolean {
    if (!this.exported) {
      return this.helper.confirm(
        this.translate.instant('IP_Discovery_leaving_warning')
      );
    } else return true;
  }

  initialize() {
    // const netmask = new netmask()
    // initialize validations
    this.resetValidation();
    this.showContent = false;
    this.initDeviceData();
    this.credentialService.reloadCredentials(this.enableUseCredential, this);
  }

  /**********************************************************
   * The checkbox Use credentials will be enabled only when
   * There are saved credential in the Credential Manager
   *********************************************************/
  enableUseCredential(credentials, scope) {
    scope.hasCredentials = credentials.length;
  }
  /*****************************************************
   * Life cycle hooks using for cleaning the resourcess
   ****************************************************/
  ngOnDestroy() {
    this.clearInterval();
  }

  /*****************************************************
   * Removing rows and cleaning the veriable data
   ****************************************************/
  reset() {
    this.rows = [];
    this.showContent = false;
    this.progressText = '';
    this.progressValue = 0;
    this.progressing = false;
    this.discoveredDevices = [];
    this.filteredDevices = [];
    this.lstCommands = {};
  }

  /*****************************************************
   * releasing the validataion data
   ****************************************************/
  resetValidation() {
    this.validation = {};
  }

  showSsoModal() {
    if (!this.client.features.asupUpload) {
      document.getElementById('btnSkip').click();
    } else {
      this.helper.showModalPopup('#sso-modal');
    }
  }

  /*****************************************************
   * Validate the IP / IP range / IP subnet mask
   ****************************************************/
  validateFields() {
    this.resetValidation();
    const validation = {
      range: { valid: false, symbol: '-' },
      subnet: { valid: false, symbol: '/' }
    };
    // check if IP (range/subnet) value matches regex
    const regexIprange = /^(?:\s+)?(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:(\s+)?(-)(\s+)?(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))?(?:\s+)?$/;
    const regexSubnet = /^(?:\s+)?(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:(\s+)?(\/)(\s+)?(?:2[0-9]|3[0-2]?))?(?:\s+)?$/;
    const subnets = this.ipRange.split(',');

    subnets.forEach(s => {
      const subnet = s.trim();
      validation.range.valid = regexIprange.test(subnet);
      validation.subnet.valid = regexSubnet.test(subnet);
      if (validation.range.valid || validation.subnet.valid) {
        this.validation['badIpRange'] = false;
      } else {
        if (subnet.includes(validation.range.symbol)) {
          this.validation['badIpRange'] = true;
          this.validation['error'] = 'Discover_iprange';
          return;
        } else {
          this.validation['badIpRange'] = true;
          this.validation['error'] = 'Discover_iprange';
          const tokens = subnet.split('/');
          if (tokens.length > 1) {
            if (parseInt(tokens[1]) > this.settings.validation.subnet.max) {
              this.validation['error'] = 'Discover_validation_subnet_max';
            } else if (
              parseInt(tokens[1]) < this.settings.validation.subnet.min
            ) {
              this.validation['error'] = 'Discover_validation_subnet_min';
            }
          }
          return;
        }
      }
    });

    if (
      !this.validation['badIpRange'] &&
      this.helper.getHostCount(subnets) > 4096
    ) {
      this.validation['badIpRange'] = true;
      this.validation['error'] = 'Maximum allowed hosts is 4096';
    }

    // check all validations
    let error = false;
    _.forEach(this.validation, (value: any, key: any) => {
      if (value) {
        error = true;
      }
    });
    return error;
  }

  /*****************************************************
   * This function is responsible to discover different
   * devices and the progress of the discovering
   ****************************************************/
  discover() {
    let error = this.validateFields();
    if (!error) {
      const time: string = new Date().getTime().toString();
      const ipRange: string = this.getIpRange();
      this.discoverDevices(
        ipRange,
        time,
        this.communityString,
        this.useCredentials
      );
      this.progressing = true;
      this.progress = setInterval(() => {
        this.getProgress(time);
      }, this.settings.progressInterval);
    } else {
      this.clearInterval();
    }
  }
  /*****************************************************
   * This function is responsible to get the progress
   * discovering and show the status as well
   ****************************************************/
  getProgress(time: string) {
    this.apiService.getDiscoveryProgress(time).subscribe(
      response => {
        const token = response.statusText.split(',');
        if (token.length === 3) {
          const completed: number = parseInt(token[1]);
          const outOf: number = parseInt(token[2]);
          this.progressText = completed + '/' + outOf;
          this.progressValue = Math.round((completed / outOf) * 100);
        } else console.log(response.statusText);
      },
      error => {
        this.clearInterval();
      }
    );
  }

  /*****************************************************
   * This function is responsible to stop the repeatative
   * call to get the progress after reaching 100%
   ****************************************************/
  clearInterval() {
    clearInterval(this.progress);
    this.progressing = false;
    if (this.discoverSubscription) {
      this.discoverSubscription.unsubscribe();
    }
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
  }

  /*****************************************************
   * This function is responsible to get the discovered
   * devices infomation and show the information to the
   * user. If anything goes wrong, it will display the
   * error message as well.
   ****************************************************/
  discoverDevices(
    ipRange: string,
    time: string,
    cs?: string,
    useCredentials = false
  ) {
    this.discoverSubscription = this.apiService
      .getIpJson(ipRange, time, cs, useCredentials)
      .subscribe(
        response => {
          let components = response['body'];
          if (typeof components !== 'object') {
            components = JSON.parse(components);
          }
          this.exported = components.length === 0;
          _.forEach(components, (component: { ip: any }, ip: any) => {
            component.ip = ip;
            this.updateDiscoveredDevices(component);
          });
          this.showContent = true;
          this.populateIpRangeComponents();
          this.clearInterval();
        },
        error => {
          let message = error['statusText'];
          if (message.toLowerCase() == 'ok') {
            message = this.translate.instant('Discover_ip_notreachable');
          }
          this.notification = {
            title: this.translate.instant('Error_title'),
            message: message,
            width: this.settings.notification.width,
            color: this.settings.notification.color
          };
          this.helper.showModalPopup('#notification-modal');
          this.clearInterval();
        }
      );
  }
  /*****************************************************
   * If any device called twice then it will replace the
   * old status by new one
   ****************************************************/
  updateDiscoveredDevices(component: any) {
    _.forEach(this.discoveredDevices, (device: { ip: any }, i: number) => {
      if (device.ip === component.ip) {
        this.discoveredDevices.splice(i, 1); //Remove if the IP is exists already
        return false;
      }
    });
    this.discoveredDevices.push(component);
  }
  /************************************************************
   * Should returns the trimmed IP / IP Ranage / Subnet
   * @param ip = Ip address or IP Range or Subnet
   * @param delimeter
   ***********************************************************/
  getTrimedIpRange(ip: string, delimeter: string = ''): string {
    const ipRange = ip.split(delimeter).map(token => this.helper.trim(token));
    return ipRange.join(delimeter);
  }
  /***********************************************************
   * Should returns the IP address / IP range / Subnet
   **********************************************************/
  getIpRange(): string {
    let ipRange = this.getTrimedIpRange(this.ipRange, '/'); //for subnet
    ipRange = this.getTrimedIpRange(ipRange, '-'); //for IP Range
    return ipRange;
  }

  /*****************************************************
   * This function should do the following tasks:
   * 1. Accept the filtered devices
   * 2. Sort the filtered devices by their IP
   * 3. Store the devices in the grid rows
   * 4. Updating the row informations like Type, subtypes, IP etc
   * 5. Updating the commands for each device based on type, commandset and persona
   ****************************************************/
  populateIpRangeComponents() {
    // console.log(`processing started at : ${new Date().getTime()}`);
    this.dataService.showLoader();
    setTimeout(() => {
      const devices = this.getFilteredDevices(this.settings.selected);

      this.filteredDevices = this.getSortedDevices(devices);
      this.rows.length = 0; //remove all rows

      // loop through imported components
      _.forEach(this.filteredDevices, (device: any, idx: number) => {
        // add a row to end
        this.addRow();
        this.selectType(device, idx);
        this.selectSubtype(device, idx);
        this.setOtherProperties(device, idx);
        this.addCommandKey(idx);
      });
      _.forOwn(
        this.lstCommands,
        (value: any, key: { split: (arg0: string) => void }) => {
          const temp = key.split('-');
          this.updateCommandsValue(temp[0], temp[1], temp[2]);
        }
      );
      this.dataService.hideLoader();
      console.log(`processing finished at : ${new Date().getTime()}`);
    }, 100);
  }

  /*****************************************************
   * Update the hostname, device details, validation
   * message, validation status, validation report etc
   ****************************************************/
  setOtherProperties(device: any, idx: any) {
    // pre-fill hostname with IP address
    this.rows[idx]['output']['hostname']['value'] = device['ip'];
    this.rows[idx]['output']['username']['value'] = device['username'];
    this.rows[idx]['output']['password']['value'] = device['password'];

    // pre-fill validation messages
    if (_.has(device, 'device_details')) {
      this.rows[idx]['details'] = device.device_details;
    }
    if (_.has(device, 'validation_message') && device['validation_message']) {
      this.rows[idx]['validation']['status'] = 'fail';
      this.rows[idx]['validation']['report'] = device['validation_message'];
    }
    this.rows[idx]['validation']['show'] = true; //show validation messages
  }

  /*****************************************************
   * Update the subtype of the device
   ****************************************************/
  selectSubtype(device: any, idx: any) {
    // pre-select sub-type
    if (_.has(device, 'subtype') && device['subtype']) {
      let subtype_idx = _.findIndex(this.rows[idx]['input']['subtypes'], {
        title: device['subtype']
      });
      if (subtype_idx > -1) {
        this.rows[idx]['output']['subtype'] = this.rows[idx]['input'][
          'subtypes'
        ][subtype_idx];
        this.changeSubType(null, idx);
      } else {
        this.rows[idx]['output']['subtype'] = '';
      }
    } else {
      this.rows[idx]['output']['subtype'] = '';
    }
  }

  /*****************************************************
   * Upate the Type of the device
   ****************************************************/
  selectType(device: { [x: string]: any }, idx: string | number) {
    // pre-select type
    if (_.has(device, 'type') && device['type']) {
      let type_idx = _.findIndex(this.rows[idx]['input']['types'], {
        title: device['type']
      });
      if (type_idx > -1) {
        this.rows[idx]['output']['type'] = this.rows[idx]['input']['types'][
          type_idx
        ];
        this.changeType(null, idx);
      } else {
        this.rows[idx]['output']['type'] = '';
      }
    } else {
      this.rows[idx]['output']['type'] = '';
    }
  }

  /*****************************************************
   * Returns the sorted devices by their IP
   ****************************************************/
  getSortedDevices(devices: any): any[] {
    // make array of components for sorting
    let temp = [];
    _.forEach(devices, device => {
      device['intIP'] = parseInt(device.ip.split('.').join(''));
      temp.push(device);
    });
    // sort devices by IP
    return _.sortBy(temp, 'intIP');
  }

  /*****************************************************
   * Returns the filtered devices as per user selection
   ****************************************************/
  getFilteredDevices(selectedFilter: string = 'online') {
    switch (selectedFilter) {
      case 'online':
        return _.filter(
          this.discoveredDevices,
          data =>
            !(
              _.has(data, 'validation_message') &&
              data['validation_message'].includes('offline')
            )
        );
      case 'offline':
        return _.filter(
          this.discoveredDevices,
          data =>
            _.has(data, 'validation_message') &&
            data['validation_message'].includes('offline')
        );
      case 'mapped':
        return _.filter(
          this.discoveredDevices,
          (data: { type: any; subtype: any }) => data.type && data.subtype
        );
      case 'unmapped':
        return _.filter(
          this.discoveredDevices,
          (data: { type: any; subtype: any }) =>
            !(data.type && data.subtype) &&
            !(
              _.has(data, 'validation_message') &&
              data['validation_message'].includes('offline')
            )
        );
      default:
        return this.discoveredDevices;
    }
  }

  /*****************************************************
   * This function will help to export the filtered
   * devices displayed in the UI
   ****************************************************/
  export() {
    this.dataService.showLoader();
    const exportData = this.filteredDevices.map(v => {
      delete v.intIP;
      return v;
    });
    this.apiService.exportDiscoveredExcel(exportData).subscribe(
      response => {
        let a = document.createElement('a');
        a.href = URL.createObjectURL(response);
        a.download = 'Auto_Discovery.xls';
        document.body.appendChild(a);
        a.click();
        this.exported = true;
        this.dataService.hideLoader();
      },
      error => {
        this.dataService.hideLoader();
      }
    );
  }

  toggleChecked() {
    if (this.useCredentials) {
      this.notification = {
        title: this.translate.instant('Credential_management_use_save'),
        message: this.translate.instant(
          'Credential_management_use_save_tooltip'
        ),
        color: 'black',
        width: '500'
      };
      $('#notification-modal').modal({
        backdrop: 'static',
        keyboard: false
      });
    }
  }
}
