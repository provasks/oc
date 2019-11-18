import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { HelperService } from 'src/app/services/helper/helper.service';
import { Settings } from 'src/app/content/settings';
import { Subscription, Subject } from 'rxjs';
import { CommonComponent } from '../common/common.component';
import * as _ from 'lodash';
declare var $: any;

import { environment } from 'src/environments/environment';
import { TranslateService } from '../../services/translate/translate.service';
import { NgForm } from '@angular/forms';
import { CredentialService } from 'src/app/services/credential/credential.service';

@Component({
  selector: 'oc-device-based',
  templateUrl: './device-based.component.html',
  styleUrls: ['./device-based.component.css']
})
export class DeviceBasedComponent extends CommonComponent
  implements OnInit, OnDestroy {
  client: any = environment.client;
  /*********************************************/
  /* Class properties
  /*********************************************/
  // properties to hold basic data
  settings: any = Settings;
  deviceTypes: any;
  deviceDetails: any;
  cloneObj: any = {};
  headers: any[] = [];
  fieldsValidation: boolean = false;
  validation: any = {};
  lstCommands: any = {};
  // loadCache:any = {}
  commandsLoaded: boolean = false;

  // properties for collect modal
  modalData: any = {};
  // property to store input, output, validation, commands
  rows: any[] = [];
  notifiedRowsExceeded: boolean = false;

  // properties to control modal commands
  modalCommands: any = {};
  modalItem: any = { type: { title: '' }, subtype: { title: '' } };

  // properties to control auto-validation
  currentIdx: any;
  currentObj: any;

  // property to unsubscribe auto-validation
  validationSubjects: any = {};

  // properties to control visibility of validation results
  showSummary: boolean = false;
  showAll: boolean = false;
  selectAll: boolean = true;

  // saved project
  savedProject: any;
  savedProjectFlag: boolean = false;

  // property for ASUP upload
  enableASUP: boolean = false;
  settingsSubscription: Subscription;

  // property for update credentials
  distinctRows: any[] = [];

  // headers visibility
  headerKeys: any = [
    'type',
    'subtype',
    'persona',
    'enable_sudo',
    'enable_mfa',
    'enable_autodiscover',
    'perf_start',
    'perf_end'
  ];
  headerState: any = {};
  // tour properties
  tourStarted: boolean = false;

  // performance start and end datetime settings
  perfsettings: any = {
    bigBanner: true,
    timePicker: true,
    format: 'dd MMM yyyy hh:mm a',
    defaultOpen: false
  };

  caLaunch: boolean = environment.caLaunch;
  subType: Subject<any> = new Subject();

  //Auto-discovery
  discoveredDevices = [];
  filteredDevices = [];

  //Notification default data
  notification = {
    title: this.translate.instant('Error_title'),
    message: '',
    width: '300',
    color: 'red'
  };

  //Credential
  useCredentials: boolean = false;
  hasCredentials: boolean = true;
  objective: any;

  loadDiscoverIPComponent: boolean = false;
  loadImporDevicesComponent: boolean = false;

  ipRange: string = '';
  communityString: string = '';

  //Progress bar
  progress: any;
  progressText: string;
  progressValue: number;
  progressing: boolean = false;
  discoverSubscription: Subscription;
  progressSubscription: Subscription;

  exported: boolean = true;

  showContent: boolean;

  //To access the form data

  // Import Device variables

  typeCheck: any;
  uploadMsg: any;
  //  showContent: boolean;
  modalHeaders: any[] = [];
  failedComponents: any[] = [];
  fileLabel: any;

  /*********************************************/
  /* Constructor method
  /*********************************************/
  constructor(
    public apiService: ApiService,
    public dataService: DataService,
    public helper: HelperService,
    public router: Router,
    public route: ActivatedRoute,
    public translate: TranslateService,
    public credentialService: CredentialService
  ) {
    super();
    // detect changes in settings model to reflect in enableASUP
    this.settingsSubscription = dataService.settingsChanged$.subscribe(
      preferences => {
        this.enableASUP = preferences['enableASUP'];
      }
    );
    // this.objective = JSON.parse(sessionStorage.getItem("objective"))
    const keyword = this.route.snapshot.paramMap.get('keyword');
    if (keyword) {
      this.objective = this.helper.getDefaultKey(keyword);
      this.objective.value = keyword;
    }
  }

  canDeactivate(): Promise<boolean> | boolean {
    // if (!this.dataService.isDirtyOrValidating) return true;
    // if (this.myForm.dirty) {
    //   return this.helper.confirm(
    //     this.translate.instant('Data_lost_confirmation')
    //   );
    // } else return true;

    if (this.dataService.isDirtyOrValidating) {
      return this.helper.confirm(
        this.translate.instant('Data_lost_confirmation')
      );
    } else return true;
  }

  /**********************************************************
   * The checkbox Use credentials will be enabled only when
   * There are saved credential in the Credential Manager
   *********************************************************/
  enableUseCredential(credentials, scope) {
    scope.hasCredentials = credentials.length;
  }

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {
    this.dataService.isDirtyOrValidating = false;
    // initialize fields for filtering
    this.fields = [
      { key: 'type', filterValue: '' },
      { key: 'subtype', filterValue: '' },
      { key: 'persona', filterValue: '' }
    ];
    // tooltip re-initialize
    $('[data-toggle="tooltip"]').tooltip();
    $('#left-scroll').affix({ offset: { top: 100 } });
    $('#right-scroll').affix({ offset: { top: 100 } });
    this.modalData.savedProject = false;
    this.modalData.schedule = null;
    this.modalData.collectionType = 'device-based';
    this.initialize();
    this.getAsupFromSettings();
    this.credentialService.reloadCredentials(this.enableUseCredential, this);
  }

  /*********************************************/
  /* Lifecycle hook OnDestroy
  /*********************************************/
  ngOnDestroy() {
    // unsubscribe from settings
    this.settingsSubscription.unsubscribe();
  }

  /*************************************
   * Lifecycle hook ngAfterContentInit
   ************************************/
  ngAfterContentInit() {
    this.checkScrollVisibility();
  }

  /*********************************************/
  /* Method to initialize component tour
  /*********************************************/
  toggleTour(state) {
    this.tourStarted = state;
  }

  /*********************************************/
  /* Method to fetch whether auto upload to ASUP
  /* has been enabled in settings
  /*********************************************/
  getAsupFromSettings() {
    this.apiService.getPreferences().subscribe(data => {
      let preferences = data['preference'];
      if (preferences) {
        preferences = JSON.parse(preferences)['basic'];
      } else {
        preferences = { enableASUP: true };
      }
      if (_.has(preferences, 'enableASUP')) {
        this.enableASUP = preferences['enableASUP'];
      } else {
        this.enableASUP = true;
      }
    });
  }

  /*********************************************/
  /* Method to initialize table based on loaded
  /* job or new project
  /*********************************************/
  initialize() {
    // check if component is loading from saved projects tab
    let jobName: string;
    this.route.queryParams.subscribe(params => {
      jobName = params['edit'];
    });
    if (jobName) {
      // fetch job from data service
      let job = this.dataService.getJob();
      // verify it is the same job stored in dataService
      if (job && job['name'] == jobName) {
        this.modalData.savedProject = true;
        this.savedProjectFlag = true;
        this.initDeviceData(() => {
          // set modal values to match saved project
          setTimeout(() => {
            this.dataService.setModalCollect(job);
          }, 0);
          // pre-populate component rows
          this.savedProject = job;
          // pre-populate component rows
          this.populateComponents(job);
        });
      } else {
        // load default view when jobName exists but there is a mismatch in dataService
        this.router.navigate(['/main/new-collection/device-based/']);
        this.loadDefault();
      }
    } else {
      // load default view when there is no jobName
      this.loadDefault();
    }
  }

  /*********************************************/
  /* Method to load default new table with one
  /* row when not loading a saved project
  /*********************************************/
  loadDefault() {
    // process normal page load
    //if (!this.loadImporDevicesComponent) {
    this.initDeviceData(() => {
      // initialize rows array with first row
      this.addRow();
      this.commandsUpdate();
    });
    //}
  }

  /*********************************************/
  /* Method to pre-populating rows when loading
  /* a saved project
  /*********************************************/
  populateComponents(job) {
    let savedComponents = JSON.parse(job['components']);
    // add row for each component
    _.forEach(savedComponents, (savedComponent, savedComponentKey) => {
      this.addRow('end', this.savedProject);
    });
    // update values for each loaded component
    let idx = -1;
    _.forEach(savedComponents, (savedComponent, savedComponentKey) => {
      // maintains order of components
      //let idx = savedComponentKey.replace(/[^0-9]+/g, "");
      //idx = parseInt(idx) - 1;
      // without maintaining order of saved components (due to breaking while de-selecting rows)
      idx++;
      // pre-select type
      let type_idx = _.findIndex(this.rows[idx]['input']['types'], {
        device_id: savedComponent.type
      });
      if (type_idx == -1) {
        type_idx = 0;
      }
      this.rows[idx]['output']['type'] = this.rows[idx]['input']['types'][
        type_idx
      ];
      this.changeType(null, idx, this.savedProject);

      // pre-select sub-type
      let subtype_idx = 0;
      subtype_idx = _.findIndex(this.rows[idx]['input']['subtypes'], {
        id: savedComponent.sub_type
      });
      if (subtype_idx == -1) {
        subtype_idx = 0;
      }
      this.rows[idx]['output']['subtype'] = this.rows[idx]['input']['subtypes'][
        subtype_idx
      ];
      this.changeSubType(null, idx, this.savedProject);

      // pre-select persona
      let persona_idx = _.findIndex(this.rows[idx]['input']['personas'], {
        id: savedComponent.personas
      });
      if (persona_idx == -1) {
        persona_idx = 0;
      }
      this.rows[idx]['output']['persona'] = this.rows[idx]['input']['personas'][
        persona_idx
      ];
      this.changePersona(null, idx, this.savedProject);

      // pre-fill field values
      _.forEach(this.headers, (header, i) => {
        if (_.has(savedComponent, header.key)) {
          this.rows[idx]['output'][header.key]['value'] =
            savedComponent[header.key];
        } else {
          this.rows[idx]['output'][header.key]['value'] = '';
        }
      });

      if (
        _.has(savedComponent, 'enable_sudo') &&
        savedComponent['enable_sudo'] == 'true'
      ) {
        this.rows[idx]['output']['enable_sudo']['disabled'] = false;
        if (savedComponent['sudo_enabled'] == 'true') {
          this.rows[idx]['output']['sudo_enabled']['value'] = true;
        } else {
          this.rows[idx]['output']['sudo_enabled']['value'] = false;
        }
      } else {
        this.rows[idx]['output']['enable_sudo']['disabled'] = true;
        this.rows[idx]['output']['sudo_enabled']['value'] = false;
      }
      if (_.has(savedComponent, 'sudo_pass')) {
        this.rows[idx]['output']['sudo_password']['value'] =
          savedComponent['sudo_pass'];
      } else {
        this.rows[idx]['output']['sudo_password']['value'] = '';
      }

      if (
        _.has(savedComponent, 'enable_mfa') &&
        savedComponent['enable_mfa'] == 'true'
      ) {
        this.rows[idx]['output']['enable_mfa']['disabled'] = false;
        if (savedComponent['mfa_enabled'] == 'true') {
          this.rows[idx]['output']['mfa_enabled']['value'] = true;
        } else {
          this.rows[idx]['output']['mfa_enabled']['value'] = false;
        }
      } else {
        this.rows[idx]['output']['enable_mfa']['disabled'] = true;
        this.rows[idx]['output']['mfa_enabled']['value'] = false;
      }
      if (_.has(savedComponent, 'mfa_key')) {
        this.rows[idx]['output']['mfa_key']['value'] =
          savedComponent['mfa_key'];
      } else {
        this.rows[idx]['output']['mfa_key']['value'] = '';
      }

      if (
        _.has(savedComponent, 'enable_autodiscover') &&
        savedComponent['enable_autodiscover'] == 'true'
      ) {
        this.rows[idx]['output']['enable_autodiscover']['disabled'] = false;
        if (savedComponent['autodiscover_enabled'] == 'true') {
          this.rows[idx]['output']['autodiscover_enabled']['value'] = true;
        } else {
          this.rows[idx]['output']['autodiscover_enabled']['value'] = false;
        }
      } else {
        this.rows[idx]['output']['enable_autodiscover']['disabled'] = true;
        this.rows[idx]['output']['autodiscover_enabled']['value'] = false;
      }
      if (_.has(savedComponent, 'sid_list')) {
        this.rows[idx]['output']['sid_list']['value'] =
          savedComponent['sid_list'];
      } else {
        this.rows[idx]['output']['sid_list']['value'] = '';
      }
      if (_.has(savedComponent, 'perf_start')) {
        this.rows[idx]['output']['perf_start']['value'] =
          savedComponent['perf_start'];
      } else {
        this.rows[idx]['output']['perf_start']['value'] = '';
      }
      if (_.has(savedComponent, 'perf_end')) {
        this.rows[idx]['output']['perf_end']['value'] =
          savedComponent['perf_end'];
      } else {
        this.rows[idx]['output']['perf_end']['value'] = '';
      }
    });
  }

  /*********************************************/
  /* Method to fetch basic devices data 
  /*********************************************/
  initDeviceData(cbMakeRows?) {
    // fetch device types
    this.apiService.getDeviceTypes().subscribe(deviceTypes => {
      this.deviceTypes = _.sortBy(deviceTypes, 'title');
      // fetch device details for each type
      this.apiService
        .getDeviceDetails(this.deviceTypes)
        .subscribe(deviceDetails => {
          this.dataService.hideLoader();
          this.deviceDetails = deviceDetails;
          this.setHeaders();
          if (cbMakeRows) {
            // call back to add rows based on pre-populated or new collection
            cbMakeRows();
          }
        });
    });
  }

  /*********************************************/
  /* Method to build and set common headers for
  /* table based on fields across all forms
  /* returned from profile.xml
  /*********************************************/
  setHeaders() {
    let headers = [];
    let keys = [];
    _.forEach(this.deviceDetails, (device, i) => {
      _.forEach(device.forms, (form, formKey) => {
        _.forEach(form.Components, (component, componentKey) => {
          _.forEach(component.fields, (field, key) => {
            if (keys.indexOf(key) <= -1) {
              headers.push({
                key: key,
                order: field.order,
                tooltip: field.tooltip,
                type: field.type
              });
              keys.push(key);
              this.headerKeys.push(key);
            }
          });
        });
      });
    });
    // initialize count of headers
    _.forEach(this.headerKeys, headerKey => {
      this.headerState[headerKey] = false;
    });
    // set headers and sort them
    this.headers = headers;
    this.sortHeaders();
    // add headers to fields property for filtering
    _.forEach(this.headers, header => {
      let obj = {};
      obj['key'] = header.key;
      obj['filterValue'] = '';
      this.fields.push(obj);
    });
  }

  /*********************************************/
  /* Method to sort headers in table based on
  /* specified order
  /*********************************************/
  sortHeaders() {
    let sorter = {
      hostname: 1,
      username: 2,
      password: 3,
      privatekey: 4,
      port: 5,
      privileged_password: 6
    };

    this.headers.sort((a, b) => {
      let header1 = a.key.toLowerCase();
      let header2 = b.key.toLowerCase();
      // when both headers are present sort normally
      if (_.has(sorter, header1) && _.has(sorter, header2)) {
        return sorter[header1] - sorter[header2];
      } else if (_.has(sorter, header1) && !_.has(sorter, header2)) {
        // when only one header is present put the other header to end
        return -1;
      } else if (!_.has(sorter, header1) && _.has(sorter, header2)) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  /*********************************************/
  /* Method to initialize first row's index for
  /* detecting auto-validation
  /*********************************************/
  initValidateRow() {
    this.currentIdx = 0;
    this.currentObj = {};
    this.currentObj['hostname'] = this.rows[0]['output']['hostname']['value'];
    this.currentObj['username'] = this.rows[0]['output']['username']['value'];
    this.currentObj['password'] = this.rows[0]['output']['password']['value'];
  }

  /*********************************************/
  /* Method to add new row to end of list or in
  /* between using clone
  /*********************************************/
  addRow(item_idx: any = 'end', savedProject?) {
    // this.notifyRowsExceedsLimit();

    // trigger row validation for previous row
    if (
      item_idx != 'end' &&
      this.rows[item_idx]['output']['hostname']['value'] != '' &&
      this.rows[item_idx]['output']['username']['value'] != '' &&
      this.rows[item_idx]['output']['password']['value'] != ''
    ) {
      this.validateRow(item_idx);
    }

    // initialize and set idx based on whether to clone or add a new row to end
    let idx: number;
    if (item_idx == 'end') {
      idx = this.rows.length;
    } else {
      idx = item_idx + 1;
    }
    // initialize other indexes
    let type_idx: number;
    let subtype_idx: number;

    // initialize new object to be added
    let obj = {};
    obj['input'] = {};
    obj['output'] = { selected: true, showRow: true, privatekeyError: false };
    obj['validation'] = {
      show: false,
      loading: 'initial',
      hostname: false,
      port: false
    };
    obj['commands'] = [];
    // add a new row to end when no item_idx provided
    if (item_idx == 'end') {
      this.rows.push(obj);

      //set the index of default type
      type_idx =
        !this.client.isOEM && this.objective && this.objective['key'] === 'type'
          ? this.deviceTypes.findIndex(t => t.title === this.objective['value'])
          : 0;
      subtype_idx = 0;
    } else {
      // clone when the item_idx is provided
      this.rows.splice(idx, 0, obj);
      type_idx = this.rows[item_idx]['output']['type']['index'];
      subtype_idx = this.rows[item_idx]['output']['subtype']['index'];
    }

    // select type
    let deviceTypes = _.cloneDeep(this.deviceTypes);
    this.rows[idx]['input']['types'] = this.addIndex(deviceTypes);
    this.rows[idx]['output']['type'] = this.rows[idx]['input']['types'][
      type_idx
    ];

    // select subtype
    let subTypes = _.toArray(this.deviceDetails[type_idx]['subtypes']);
    subTypes = _.sortBy(subTypes, 'title');
    this.rows[idx]['input']['subtypes'] = this.addIndex(subTypes);
    this.rows[idx]['output']['subtype'] = this.rows[idx]['input']['subtypes'][
      subtype_idx
    ];

    // update personas, fields, commands
    if (item_idx == 'end') {
      this.updatePersonas(idx);
      this.updateFields(idx);
    } else {
      this.clonePersonas(idx);
      this.cloneFields(idx);
      this.cloneCommands(idx);
    }

    // if this is first row then initialize validation for auto-validate
    if (this.rows.length == 1) {
      this.initValidateRow();
    }

    // set header state
    this.setHeaderState();
    this.checkPerfArchiveValidation();
    this.addCommandKey(idx);
  }

  notifyRowsExceedsLimit() {
    let maxRows = 50;
    if (this.rows.length >= maxRows && !this.notifiedRowsExceeded) {
      let notification = {
        continue: true,
        callback: this.saveAndCollect,
        scope: this,
        title: this.translate.instant('Devicebased_addrow_warning'),
        message:
          this.translate.instant('Devicebased_addrow_msg1') +
          ` ${maxRows}` +
          this.translate.instant('Devicebased_addrow_msg2')
      };
      this.dataService.appNotification(notification);
      this.notifiedRowsExceeded = true;
    }
  }

  /*************************************************************
   * Key pattern should be type-commandset-persona and
   * The key should be stored in the commandList to reduced
   * several call for the same command
   * @param idx : Index
   *************************************************************/
  addCommandKey(idx: number) {
    const key = this.getCommandKey(idx);
    const sKey = `${key.type}-${key.commandset}-${key.persona}`;
    this.rows[idx]['output']['commandKey'] = sKey;
    if (!this.lstCommands[sKey]) {
      this.lstCommands[sKey] = undefined;
      this.commandsLoaded = false;
    }
  }

  /*******************************************************************
   * Should return the command key {type, commandset and persona}
   * @param idx : row index
   ******************************************************************/
  getCommandKey(idx: number): any {
    return {
      type: this.getType(this.rows[idx]),
      commandset: this.rows[idx]['output']['form']['commandset_id'],
      persona: this.rows[idx]['output']['persona']['id']
    };
  }

  /*****************************************
   * Should retun the type of the device
   * @param row : data row
   ****************************************/
  getType(row: any) {
    const temp: any = row['input']['types'][0];
    return row['output']['type'] === ''
      ? temp.device_id
      : row['output']['type']['device_id'];
  }

  /*********************************************/
  /* Method to show/hide header based on at
  /* least one row having that field
  /*********************************************/
  setHeaderState() {
    // re-initialize all headers to false
    _.forEach(this.headerKeys, key => {
      this.headerState[key] = false;
    });
    // make header state true if present in at least one row
    let keys = this.headerKeys;
    let usedKeys = [];
    _.forEach(this.rows, row => {
      _.forEach(keys, key => {
        if (_.has(row['output'], key) && !row['output'][key]['disabled']) {
          this.headerState[key] = true;
          usedKeys.push(key);
        }
      });
      keys = _.difference(keys, usedKeys);
      usedKeys = [];
      // exit outer loop if there are no more keys left
      if (!keys.length) {
        return false;
      }
    });
  }

  /*********************************************/
  /* Method to remove a row without adding first
  /* row automatically
  /*********************************************/
  deleteRow(idx) {
    this.rows.splice(idx, 1);
    this.setHeaderState();
    this.checkPerfArchiveValidation();
  }

  /*********************************************/
  /* Method to remove a specified row
  /*********************************************/
  removeRow(idx: number) {
    const ip = this.rows[idx].output.hostname.value;
    this.rows.splice(idx, 1);
    this.discoveredDevices = _.filter(
      this.discoveredDevices,
      device => device.ip != ip
    );
    this.setHeaderState();
    // if rows are all empty, add a row automatically
    if (!this.rows.length) {
      this.addRow();
      this.initValidateRow();
      this.commandsUpdate();
    }
    this.checkPerfArchiveValidation();
  }

  /*********************************************/
  /* Method to empty all rows and add first row
  /* automatically
  /*********************************************/
  reset() {
    this.rows = [];
    this.addRow();
    this.initValidateRow();
    this.commandsUpdate();
    this.showContent = false;
  }

  /*********************************************/
  /* Method to perform actions when type is
  /* changed in a specified row
  /*********************************************/
  changeType(event, idx, savedProject?, discoverIp = false) {
    // change subtypes
    let type_idx = this.rows[idx]['output']['type']['index'];
    let subTypes = _.toArray(this.deviceDetails[type_idx]['subtypes']);
    subTypes = _.sortBy(subTypes, 'title');
    this.rows[idx]['input']['subtypes'] = this.addIndex(subTypes);
    this.rows[idx]['output']['subtype'] = this.rows[idx]['input'][
      'subtypes'
    ][0];
    // update personas and fields
    this.updatePersonas(idx);
    this.updateFields(idx, discoverIp);
    if (!savedProject && this.commandsLoaded) {
      const key = this.getCommandKey(idx);
      this.updateCommandsValue(key.type, key.commandset, key.persona, idx);
    }
    this.setHeaderState();
  }

  /*********************************************/
  /* Method to perform actions when subtype is
  /* changed in a specified row
  /*********************************************/
  changeSubType(event, idx, savedProject?, discoverIp = false) {
    // update personas and fields
    this.updatePersonas(idx);
    this.updateFields(idx, discoverIp);
    if (!savedProject && this.commandsLoaded) {
      const key = this.getCommandKey(idx);
      this.updateCommandsValue(key.type, key.commandset, key.persona, idx);
    }
    this.setHeaderState();
    this.checkPerfArchiveValidation();
  }

  /*********************************************/
  /* Method to perform actions when persona is
  /* changed in a specified row
  /*********************************************/
  changePersona(event, idx, savedProject?) {
    const key = this.getCommandKey(idx);
    this.updateCommandsValue(key.type, key.commandset, key.persona, idx);
    this.setHeaderState();
  }

  /*********************************************/
  /* Method to detect change in row while
  /* filling data to initiate auto-validation
  /*********************************************/
  changeInput(event, idx) {
    let cIdx = this.currentIdx;
    // trigger validation when the row has changed
    if (cIdx != idx) {
      // check if any value has changed in previous row
      if (
        this.rows[cIdx]['output']['hostname']['value'] != '' &&
        this.rows[cIdx]['output']['username']['value'] != '' &&
        this.rows[cIdx]['output']['password']['value'] != ''
      ) {
        if (
          this.rows[cIdx]['output']['hostname']['value'] !=
            this.currentObj['hostname'] ||
          this.rows[cIdx]['output']['username']['value'] !=
            this.currentObj['username'] ||
          this.rows[cIdx]['output']['password']['value'] !=
            this.currentObj['password']
        ) {
          // trigger row validation
          this.validateRow(cIdx);
        }
      }
      // set currentObj to present row
      this.currentObj['hostname'] = this.rows[idx]['output']['hostname'][
        'value'
      ];
      this.currentObj['username'] = this.rows[idx]['output']['username'][
        'value'
      ];
      this.currentObj['password'] = this.rows[idx]['output']['password'][
        'value'
      ];
      // change current index to present row
      this.currentIdx = idx;
    }
  }

  /*********************************************/
  /* Method to validate all rows
  /*********************************************/
  validate(): boolean {
    const obj = this.getObjString();
    if (!this.validateData(obj)) {
      this.helper.showModalPopup('#notification-modal');
      return false;
    }
    this.dataService.showLoader();
    this.dataService.isDirtyOrValidating = true;
    // show loading spinner for all rows
    _.forEach(this.rows, (row, i) => {
      if (row['output']['selected']) {
        row['validation']['loading'] = 'process';
      }
    });
    this.apiService.postDeviceValidate(obj).subscribe(data => {
      let responses = JSON.parse(data['validation_response']);
      _.forEach(responses, (obj, key) => {
        const i = this.getValidationKey(key);
        this.rows[i]['validation']['show'] = true;
        this.updateValidation(obj, i);
      });
      // hide loading spinner for all rows
      _.forEach(this.rows, row => {
        if (row['output']['selected']) {
          row['validation']['loading'] = 'done';
        }
      });
      // hide main spinner
      this.dataService.hideLoader();
    });
    return true;
  }

  /*********************************************************************
   * Should validate the hostname in two ways
   * 1. Required validation: Hostname should not be empty for any row
   * 2. Duplicate validation: There should not be duplicate hostname
   * @param obj
   ********************************************************************/
  validateData(obj: string): boolean {
    //initialize validation flag for different field
    this.rows.forEach(r => {
      r.validation['type'] = false;
      r.validation['subtype'] = false;
      r.validation['username'] = false;
      r.validation['hostname'] = false;
    });
    const selectedRows = this.rows.filter(r => r['output']['selected']);
    // Check validation for different fields
    return (
      this.checkRequiredValidation(
        selectedRows,
        'type',
        'Type_error_required'
      ) &&
      this.checkRequiredValidation(
        selectedRows,
        'subtype',
        'Subtype_error_required'
      ) &&
      this.checkRequiredValidation(
        selectedRows,
        'hostname',
        'Hostname_error_required'
      ) &&
      this.checkDuplicteValidation(
        selectedRows,
        'hostname',
        'Duplicate_host'
      ) &&
      (this.useCredentials
        ? true
        : this.checkRequiredValidation(
            selectedRows,
            'username',
            'Username_error_required'
          ))
    );
  }

  /*********************************************/
  /* Method checks row duplication
  /*********************************************/
  checkDuplicteValidation(
    rows: any,
    validationField: string,
    errorMessage: string
  ) {
    //check if any duplicate hostname
    const validationFieldsValue = rows.map(
      r => r.output[validationField].value
    );
    if (this.helper.hasDuplicate(validationFieldsValue)) {
      this.notification.message = this.translate.instant(errorMessage);
      const duplicateHostnames = this.helper.getDuplicates(
        validationFieldsValue
      );
      const duplicateRows = rows.filter(r =>
        duplicateHostnames.includes(r.output[validationField].value)
      );
      duplicateRows.forEach(r => (r.validation[validationField] = true));
      return false;
    }
    return true;
  }

  /*********************************************/
  /* Method validates mandatory fields 
  /*********************************************/
  checkRequiredValidation(
    rows: any,
    validationField: string,
    errorMessage: string
  ) {
    const rowsWithEmptyFieldValue = rows.filter(
      r =>
        (r.output[validationField]['value'] ||
          r.output[validationField]['title'] ||
          '') === ''
    );
    if (rowsWithEmptyFieldValue.length) {
      rowsWithEmptyFieldValue.forEach(
        r => (r.validation[validationField] = true)
      );
      this.notification.message = this.translate.instant(errorMessage);
      return false;
    }
    return true;
  }

  /*****************************************
   * get index of returned validation
   * @param key
   ****************************************/
  getValidationKey(key: any): any {
    let i = key.replace(/[^0-9]+/g, '');
    return parseInt(i) - 1;
  }

  /*********************************************/
  /* Method to validate a single row
  /*********************************************/
  validateRow(idx: string) {
    // when the component is not selected skip validation
    if (!this.rows[idx]['output']['selected']) {
      return;
    }
    let obj = this.getObjString(idx);
    this.rows[idx]['validation']['loading'] = 'process';
    this.apiService.postDeviceValidate(obj).subscribe(data => {
      let responses = JSON.parse(data['validation_response']);
      _.forEach(responses, (obj, key) => {
        let i = this.getValidationKey(key);
        this.updateValidation(obj, i);
        this.rows[i]['validation']['loading'] = 'done';
      });
    });
  }
  updateValidation(obj, i) {
    this.rows[i]['validation']['status'] =
      obj.status === 'Failed' ? 'fail' : 'success';
    this.rows[i]['validation']['report'] = obj['report'];
    this.rows[i]['validation']['model'] = obj['model'];
    this.rows[i]['validation']['os'] = obj['os'];
  }

  /*********************************************/
  /* Method to reset all fields that need to be
  /* validated
  /*********************************************/
  resetValidation() {
    this.validation['deviceSelected'] = false;
    this.fieldsValidation = false;
    _.forEach(this.rows, (row, i) => {
      row['validation']['hostname'] = false;
      row['validation']['hostnameFormat'] = false;
      row['validation']['port'] = false;
      row['validation']['perf_start'] = false;
    });
  }

  /*********************************************/
  /* Method to define validation rules for
  /* specified fields
  /*********************************************/
  validateGridFields() {
    // clear previous validations
    this.resetValidation();
    // check if at least one row selected
    this.validation['deviceSelected'] = true;
    _.forEach(this.rows, (row, i) => {
      if (row['output']['selected']) {
        this.validation['deviceSelected'] = false;
        return false;
      }
    });
    if (this.validation['deviceSelected']) {
      return true;
    }
    // check if hostname is duplicated
    let hostnames = [];
    _.forEach(this.rows, (row, i) => {
      if (row['output']['selected']) {
        let hostname = row['output']['hostname']['value'];
        hostname = hostname.trim();
        if (hostnames.indexOf(hostname) < 0) {
          hostnames.push(hostname);
        } else {
          this.rows[i]['validation']['hostname'] = true;
        }
        // check for correct format of hostname when it is not duplicate
        if (!this.rows[i]['validation']['hostname']) {
          let regex = /(^\s*$)|(^[^\s]+$)/g;
          if (regex.test(hostname.trim())) {
            this.rows[i]['validation']['hostnameFormat'] = false;
          } else {
            this.rows[i]['validation']['hostnameFormat'] = true;
          }
        }
      }
    });
    // check if port is integer
    _.forEach(this.rows, (row, i) => {
      if (row['output']['selected']) {
        let port = row['output']['port']['value'];
        let portValidation = /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/g.test(
          port
        );
        if (portValidation || port == '') {
          this.rows[i]['validation']['port'] = false;
        } else {
          this.rows[i]['validation']['port'] = true;
        }
      }
    });
    // check if perf_start is minimum 4 hours before the current time.
    _.forEach(this.rows, (row, i) => {
      let perf_start = row['output']['perf_start']['value'];
      let perf_end: any = new Date();
      let timeDiffInHours =
        (Date.parse(perf_end) - Date.parse(perf_start)) / (60 * 60 * 1000);
      if (timeDiffInHours < 4) {
        this.rows[i]['validation']['perf_start'] = true;
      }
    });
    // check all validations
    let error = false;
    _.forEach(this.rows, (row, i) => {
      if (row['validation']['hostname']) {
        error = true;
        return false;
      }
      if (row['validation']['hostnameFormat']) {
        error = true;
        return false;
      }
      if (row['validation']['port']) {
        error = true;
        return false;
      }
      if (row['validation']['perf_start']) {
        error = true;
        return false;
      }
    });
    return error;
  }

  /*********************************************/
  /* Method to set commands modal with specified
  /* row's commands
  /*********************************************/
  setCommandsModal(idx) {
    this.modalCommands = this.rows[idx]['commands'];
    this.modalItem = this.rows[idx]['output'];
  }

  /*********************************************/
  /* Method to show all validation result rows
  /*********************************************/
  viewMessages() {
    this.showAll = true;
    _.forEach(this.rows, (row, i) => {
      row['validation']['show'] = true;
    });
  }

  /*********************************************/
  /* Method to hide all validation result rows
  /*********************************************/
  hideMessages() {
    this.showAll = false;
    _.forEach(this.rows, (row, i) => {
      row['validation']['show'] = false;
    });
  }

  /*********************************************/
  /* Method to show specific validation result
  /* row
  /*********************************************/
  viewMessage(i) {
    this.rows[i]['validation']['show'] = true;
  }

  /*********************************************/
  /* Method to hide specific validation result
  /* row
  /*********************************************/
  hideMessage(i) {
    this.rows[i]['validation']['show'] = false;
  }

  /*********************************************/
  /* Method to merge table values and user data
  /* to object that is sent to server
  /*********************************************/
  setObj() {
    this.modalData.obj = this.getObj();
    let userData = this.dataService.getUserData();
    _.assignIn(this.modalData.obj, this.getCommandsObj(), userData);
  }

  /*********************************************/
  /* Method to stringify table data
  /*********************************************/
  getObjString(idx = 'all') {
    let obj: any;
    if (idx == 'all') {
      obj = this.getObj();
    } else {
      obj = this.getObj(idx);
    }
    obj['use_credentials'] = this.dataService.useCredentials; //added useCredential for validation
    return JSON.stringify([obj]);
  }

  /*********************************************/
  /* Method to get table data either for all
  /* rows or for single row. This data can be
  /* used for processing collect or validating
  /* all rows or validating single row
  /*********************************************/
  getObj(idx = 'all') {
    let obj = {};
    obj['Components'] = {};
    // get all rows input objects
    if (idx == 'all') {
      for (let i = 0; i < this.rows.length; i++) {
        if (
          this.rows[i]['output']['type'] &&
          this.rows[i]['output']['subtype'] &&
          this.rows[i]['output']['selected']
        ) {
          this.addObj(obj, i);
        }
      }
    } else {
      // get input object for specific row
      if (
        this.rows[idx]['output']['type'] &&
        this.rows[idx]['output']['subtype'] &&
        this.rows[idx]['output']['selected']
      ) {
        this.addObj(obj, idx);
      }
    }
    return obj;
  }

  /*********************************************/
  /* Helper method that works with getObj to add
  /* row data correctly
  /*********************************************/
  addObj(obj, i) {
    let helper = this.helper;
    // add unique id
    let id = 'choice' + (i + 1);
    obj['Components'][id] = {};
    obj['Components'][id]['id'] = id;

    obj['Components'][id]['type'] = this.rows[i]['output']['type']['device_id'];
    obj['Components'][id]['typeTitle'] = this.rows[i]['output']['type'][
      'title'
    ];
    obj['Components'][id]['subTypes'] = this.rows[i]['output']['subtype']['id'];
    obj['Components'][id]['personas'] = this.rows[i]['output']['persona']['id'];
    obj['Components'][id]['title'] = this.rows[i]['output']['subtype']['title'];
    obj['Components'][id]['protocol'] = this.rows[i]['output']['form'][
      'collectors'
    ];
    obj['Components'][id]['timeout'] = this.rows[i]['output']['subtype'][
      'timeout'
    ];

    obj['Components'][id]['formData'] = {};
    _.forEach(this.rows[i]['output']['form']['fields'], (fields, key) => {
      obj['Components'][id]['formData'][key] = _.cloneDeep(
        this.rows[i]['output']['form']['fields'][key]
      );
      obj['Components'][id]['formData'][key]['id'] = key;
      obj['Components'][id]['formData'][key]['cid'] = this.rows[i]['output'][
        'form'
      ]['id'];
      if (!_.has(obj['Components'][id]['formData'][key], 'default')) {
        obj['Components'][id]['formData'][key]['default'] = '';
      }
    });

    obj['Components'][id]['formID'] = this.rows[i]['output']['subtype'][
      'next_id'
    ];
    obj['Components'][id]['enable_priv'] = _.toString(false);
    obj['Components'][id]['enable_vdc'] = _.toString(false);
    obj['Components'][id]['component_id'] = this.rows[i]['output']['form'][
      'id'
    ];
    obj['Components'][id]['commandset_id'] = this.rows[i]['output']['form'][
      'commandset_id'
    ];
    obj['Components'][id]['personasName'] = this.rows[i]['output']['persona'][
      'title'
    ];

    // sudo password
    obj['Components'][id]['enable_sudo'] = _.toString(
      !this.rows[i]['output']['enable_sudo']['disabled']
    );
    if (_.has(this.rows[i]['output']['form'], 'enable_sudo')) {
      obj['Components'][id]['sudo_enabled'] = this.rows[i]['output'][
        'sudo_enabled'
      ]['value'];
    } else {
      obj['Components'][id]['sudo_enabled'] = false;
    }
    obj['Components'][id]['sudo_pass'] = helper.trim(
      this.rows[i]['output']['sudo_password']['value']
    );

    // MFA key
    obj['Components'][id]['enable_mfa'] = _.toString(
      !this.rows[i]['output']['enable_mfa']['disabled']
    );
    if (_.has(this.rows[i]['output']['form'], 'enable_mfa')) {
      obj['Components'][id]['mfa_enabled'] = this.rows[i]['output'][
        'mfa_enabled'
      ]['value'];
    } else {
      obj['Components'][id]['mfa_enabled'] = false;
    }
    obj['Components'][id]['mfa_key'] = helper.trim(
      this.rows[i]['output']['mfa_key']['value']
    );

    // auto-discover
    obj['Components'][id]['enable_autodiscover'] = _.toString(
      !this.rows[i]['output']['enable_autodiscover']['disabled']
    );
    if (_.has(this.rows[i]['output']['form'], 'enable_autodiscover')) {
      obj['Components'][id]['autodiscover_enabled'] = this.rows[i]['output'][
        'autodiscover_enabled'
      ]['value'];
    } else {
      obj['Components'][id]['autodiscover_enabled'] = false;
    }
    obj['Components'][id]['sid_list'] = helper.trim(
      this.rows[i]['output']['sid_list']['value']
    );

    // dynamic field values
    _.forEach(this.headers, header => {
      obj['Components'][id][header.key] = helper.trim(
        this.rows[i]['output'][header.key]['value']
      );
    });

    obj['Components'][id]['os'] = this.rows[i]['validation']['os'];
    obj['Components'][id]['model'] = this.rows[i]['output']['model'];

    // performance date fields
    obj['Components'][id]['perf_start'] = this.rows[i]['output']['perf_start'][
      'value'
    ];
    obj['Components'][id]['perf_end'] = this.rows[i]['output']['perf_end'][
      'value'
    ];
  }

  /*********************************************/
  /* Method to get object of all selected
  /* commands for all rows
  /*********************************************/
  getCommandsObj() {
    let obj = {};
    obj['commandList'] = {};
    _.forEach(this.rows, (row, i) => {
      if (row['output']['type'] && row['output']['subtype']) {
        let id = 'choice' + (i + 1);
        obj['commandList'][id] = [];
        _.forEach(row['commands'], (commandObj, j) => {
          obj['commandList'][id].push(commandObj);
        });
      }
    });
    return obj;
  }

  /*********************************************/
  /* Method to add indexes to objects that are
  /* used to retain state of selected dropdown
  /* option
  /*********************************************/
  addIndex(obj) {
    // add index key to obj
    return _.map(obj, (item, i) => {
      return _.assignIn({ index: i }, item);
    });
  }

  /*********************************************/
  /* Method to make objects for each table field
  /* containing value and other display related
  /* properties
  /*********************************************/
  getFieldObj(fields, field) {
    if (_.has(fields, field)) {
      if (_.has(fields[field], 'default')) {
        return { disabled: false, value: fields[field]['default'] };
      } else {
        return { disabled: false, value: '' };
      }
    } else {
      return { disabled: true, value: '' };
    }
  }

  /*********************************************/
  /* Method to set personas dropdown when there
  /* is change in type or subtype selection
  /*********************************************/
  updatePersonas(idx) {
    let personas = this.rows[idx]['output']['subtype']['personas'];
    personas = _.split(personas, ',');
    let type_idx = this.rows[idx]['output']['type']['index'];
    let match_personas = this.deviceDetails[type_idx]['personas'];
    personas = _.map(personas, id => {
      return { id: id, title: match_personas[id] };
    });
    this.rows[idx]['input']['personas'] = this.addIndex(personas);
    // this.rows[idx]["output"]["persona"] = this.rows[idx]["input"][
    //   "personas"
    // ][0];

    const persona: string[] =
      this.client.features.purposeBasedCollection &&
      this.objective &&
      this.objective.key === 'persona'
        ? this.rows[idx]['input']['personas'].filter(
            i => i.title === this.helper.toCamelcase(this.objective.value)
          )
        : this.rows[idx]['input']['personas']; //set General

    this.rows[idx]['output']['persona'] = persona[0];
  }

  /*********************************************/
  /* Method to replicate personas dropdown and
  /* selected value based on previous row value
  /*********************************************/
  clonePersonas(idx) {
    let persona_idx = this.rows[idx - 1]['output']['persona']['index'];
    this.rows[idx]['input']['personas'] = _.cloneDeep(
      this.rows[idx - 1]['input']['personas']
    );
    this.rows[idx]['output']['persona'] = this.rows[idx]['input']['personas'][
      persona_idx
    ];
  }

  /*********************************************/
  /* Method to set fields properties state such
  /* enabled/disabled, checked/unchecked based
  /* on selection in type or subtype dropdowns
  /*********************************************/
  updateFields(idx, discoverIp = false) {
    let type_idx = this.rows[idx]['output']['type']['index'];
    let form_id = this.rows[idx]['output']['subtype']['next_id'];
    let form = _.toArray(
      this.deviceDetails[type_idx]['forms'][form_id]['Components']
    )[0];
    let fields = form['fields'];
    this.rows[idx]['output']['form'] = form;
    // update all dynamic fields
    _.forEach(this.headers, (header, i) => {
      if (!(discoverIp && header.key == 'hostname')) {
        this.rows[idx]['output'][header.key] = this.getFieldObj(
          fields,
          header.key
        );
      }
    });
    if (_.has(form, 'enable_sudo') && form['enable_sudo'] == 'true') {
      this.rows[idx]['output']['enable_sudo'] = { disabled: false, value: '' };
      this.rows[idx]['output']['sudo_enabled'] = {
        disabled: false,
        value: false
      };
      this.rows[idx]['output']['sudo_password'] = {
        disabled: false,
        value: ''
      };
    } else {
      this.rows[idx]['output']['enable_sudo'] = { disabled: true, value: '' };
      this.rows[idx]['output']['sudo_enabled'] = {
        disabled: true,
        value: false
      };
      this.rows[idx]['output']['sudo_password'] = { disabled: true, value: '' };
    }

    if (_.has(form, 'enable_mfa') && form['enable_mfa'] == 'true') {
      this.rows[idx]['output']['enable_mfa'] = { disabled: false, value: '' };
      this.rows[idx]['output']['mfa_enabled'] = {
        disabled: false,
        value: false
      };
      this.rows[idx]['output']['mfa_key'] = { disabled: false, value: '' };
    } else {
      this.rows[idx]['output']['enable_mfa'] = { disabled: true, value: '' };
      this.rows[idx]['output']['mfa_enabled'] = {
        disabled: true,
        value: false
      };
      this.rows[idx]['output']['mfa_key'] = { disabled: true, value: '' };
    }

    if (
      _.has(form, 'enable_autodiscover') &&
      form['enable_autodiscover'] == 'true'
    ) {
      this.rows[idx]['output']['enable_autodiscover'] = {
        disabled: false,
        value: ''
      };
      this.rows[idx]['output']['autodiscover_enabled'] = {
        disabled: false,
        value: false
      };
      this.rows[idx]['output']['sid_list'] = { disabled: false, value: '' };
    } else {
      this.rows[idx]['output']['enable_autodiscover'] = {
        disabled: true,
        value: ''
      };
      this.rows[idx]['output']['autodiscover_enabled'] = {
        disabled: true,
        value: false
      };
      this.rows[idx]['output']['sid_list'] = { disabled: true, value: '' };
    }

    // Add items for perf start and end time
    let subtype_id = this.rows[idx]['output']['subtype']['id'];
    let perf_end = new Date();
    let perf_start = new Date(perf_end.setHours(perf_end.getHours() - 4));

    if (subtype_id == 'ontapperf') {
      this.rows[idx]['output']['perf_start'] = {
        disabled: false,
        value: perf_start
      };
      this.rows[idx]['output']['perf_end'] = {
        disabled: false,
        value: perf_end
      };
    } else {
      this.rows[idx]['output']['perf_start'] = {
        disabled: true,
        value: perf_start
      };
      this.rows[idx]['output']['perf_end'] = {
        disabled: true,
        value: perf_end
      };
    }
  }

  /*********************************************/
  /* Method to replicate fields with values
  /* based on previous row value
  /*********************************************/
  cloneFields(idx) {
    this.rows[idx]['output']['form'] = _.cloneDeep(
      this.rows[idx - 1]['output']['form']
    );
    // clone dynamic fields
    _.forEach(this.headers, (header, i) => {
      this.rows[idx]['output'][header.key] = _.cloneDeep(
        this.rows[idx - 1]['output'][header.key]
      );
    });
    this.rows[idx]['output']['enable_sudo'] = _.cloneDeep(
      this.rows[idx - 1]['output']['enable_sudo']
    );
    this.rows[idx]['output']['sudo_enabled'] = _.cloneDeep(
      this.rows[idx - 1]['output']['sudo_enabled']
    );
    this.rows[idx]['output']['sudo_password'] = _.cloneDeep(
      this.rows[idx - 1]['output']['sudo_password']
    );

    this.rows[idx]['output']['enable_mfa'] = _.cloneDeep(
      this.rows[idx - 1]['output']['enable_mfa']
    );
    this.rows[idx]['output']['mfa_enabled'] = _.cloneDeep(
      this.rows[idx - 1]['output']['mfa_enabled']
    );
    this.rows[idx]['output']['mfa_key'] = _.cloneDeep(
      this.rows[idx - 1]['output']['mfa_key']
    );

    this.rows[idx]['output']['enable_autodiscover'] = _.cloneDeep(
      this.rows[idx - 1]['output']['enable_autodiscover']
    );
    this.rows[idx]['output']['autodiscover_enabled'] = _.cloneDeep(
      this.rows[idx - 1]['output']['autodiscover_enabled']
    );
    this.rows[idx]['output']['sid_list'] = _.cloneDeep(
      this.rows[idx - 1]['output']['sid_list']
    );

    this.rows[idx]['output']['privatekey'] = _.cloneDeep(
      this.rows[idx - 1]['output']['privatekey']
    );
    this.rows[idx]['output']['perf_start'] = _.cloneDeep(
      this.rows[idx - 1]['output']['perf_start']
    );
    this.rows[idx]['output']['perf_end'] = _.cloneDeep(
      this.rows[idx - 1]['output']['perf_end']
    );
  }

  /**************************************************
   * Store commands into row
   *************************************************/
  updateCommands(that, key, commands: any, idx?) {
    if (idx !== undefined) {
      that.rows[idx]['commands'] = _.cloneDeep(commands);
      this.updateCommandSelection(idx);
    } else {
      const rows = _.filter(that.rows, (row, i) => {
        return row['output']['commandKey'] === key;
      });
      _.forEach(rows, row => (row.commands = _.cloneDeep(commands)));
    }
  }

  /************************************************
   * This method will work only for Saved Project.
   * Basically it will update the command selection
   * for the command popup.
   */
  updateCommandSelection(idx: any) {
    if (this.savedProject) {
      const allCommands = this.rows[idx].commands;
      const selectedCommands = this.getSelectedCommands(
        JSON.parse(this.savedProject.components)
      );
      if (selectedCommands.length)
        //check if there is any command
        allCommands
          .filter(com => !selectedCommands.includes(com.command))
          .map(x => (x.selected = false)); //deselect commands which are not present in the saved command
    }
  }

  /*************************************************
   * Retuns the commands stored in the saved project
   *************************************************/
  getSelectedCommands(comp: any) {
    let commands = [];
    _.forOwn(comp, (value, key) => {
      commands = value.commands ? value.commands : [];
    });
    return commands;
  }

  /*********************************************/
  /* Method to clone command list from previous
  /* row
  /*********************************************/
  cloneCommands(idx) {
    this.rows[idx]['commands'] = _.cloneDeep(this.rows[idx - 1]['commands']);
  }

  /*********************************************/
  /* Method to remove all keys from object
  /*********************************************/
  resetObj(obj) {
    _.forEach(obj, (value, key) => {
      delete obj[key];
    });
    obj = {};
  }

  /*********************************************/
  /* Method to check or uncheck all rows
  /*********************************************/
  changeInSelectAll() {
    _.forEach(this.rows, (row, i) => {
      if (this.selectAll) {
        row['output']['selected'] = true;
      } else {
        row['output']['selected'] = false;
      }
    });
  }

  checkAllSelected() {
    this.selectAll = !_.filter(this.rows, row => !row.output.selected).length;
  }

  initSaveCollect(liveStatus = true, noValidate = false) {
    // this.notifyRowsExceedsLimit();
    if (!this.validateData(this.getObjString())) {
      this.helper.showModalPopup('#notification-modal');
      return;
    }

    let processNext = () => {
      if (liveStatus) {
        this.checkLiveStatus(this.doSaveCollect);
      } else {
        this.doSaveCollect();
      }
    };
    // check if validation needs to be done
    if (noValidate) {
      processNext();
    } else {
      let error = this.validateGridFields();
      if (!error) {
        processNext();
      } else {
        this.fieldsValidation = true;
      }
    }
  }

  /*********************************************/
  /* Callback to show collect modal after
  /* checking if optional SSO login is done
  /*********************************************/
  doSaveCollect = () => {
    this.notifyRowsExceedsLimit();
    if (!this.notifiedRowsExceeded) this.saveAndCollect();
  };
  saveAndCollect() {
    this.setObj();
    const comp = _.toArray(this.modalData.obj.Components);
    $('#collect-modal').modal({
      backdrop: 'static',
      keyboard: false
    });
    //passing data for default purpose selection
    this.subType.next(comp.length ? comp[0].title : '');
  }

  checkLiveStatus(callback) {
    // check if enableASUP is checked in settings
    if (this.enableASUP) {
      // check if user object is available in browser
      if (this.dataService.getUserData()) {
        // continue next level check if api server has session for user
        this.apiService.getLiveStatus().subscribe(response => {
          if (response.status == 200) {
            // process request for search data
            if (!this.caLaunch) {
              callback();
            } else {
              this.doSaveCollect();
            }
          } else {
            this.showSsoModal();
          }
        });
      } else {
        this.showSsoModal();
      }
    } else {
      this.doSaveCollect();
    }
  }

  /*********************************************/
  /* Method to get distinct rows based on
  /* type and subtype. These are used in Update
  /* Credentials modal
  /*********************************************/
  getDistinctRows() {
    let outputObjs = [];
    _.forEach(this.rows, (row, i) => {
      let obj = _.cloneDeep(row['output']);
      outputObjs.push(obj);
    });
    // add persona values from row
    _.forEach(outputObjs, (outputObj, i) => {
      outputObj['personas'] = _.cloneDeep(this.rows[i]['input']['personas']);
    });
    // get distinct rows
    let distinctRows = _.uniqBy(outputObjs, function(obj) {
      return [obj.type.title, obj.subtype.title].join();
    });
    // uncheck all distinct rows and select default persona to "No Change"
    _.forEach(distinctRows, obj => {
      obj['selected'] = false;
      obj['persona'] = 'No Change';
      _.forEach(this.headers, header => {
        obj[header.key]['value'] = '';
      });
    });
    // assign to modal component
    this.distinctRows = distinctRows;
    this.helper.showModalPopup('#modal-update-credentials');
  }

  /*********************************************/
  /* Method to update rows in table with values
  /* specified in Update Credentials modal
  /*********************************************/
  doUpdate(distinctRows) {
    // loop through distinct rows that are selected for update
    _.forEach(distinctRows, distinctObj => {
      _.forEach(this.rows, (row, i) => {
        let outputObj = row['output'];
        // check if object matches type and subtype
        if (
          row['output']['type']['title'] == distinctObj['type']['title'] &&
          row['output']['subtype']['title'] == distinctObj['subtype']['title']
        ) {
          // change persona
          if (distinctObj['persona'] != 'No Change') {
            let index = _.findIndex(row['input']['personas'], {
              title: distinctObj['persona']['title']
            });
            if (index != -1) {
              row['output']['persona'] = row['input']['personas'][index];
            }
          }
          // change value of fields
          _.forEach(this.headers, header => {
            // change only if the field is not blank
            if (distinctObj[header.key]['value'] != '') {
              row['output'][header.key]['value'] =
                distinctObj[header.key]['value'];
            }
          });
          // change sudo values
          row['output']['sudo_enabled']['value'] =
            distinctObj['sudo_enabled']['value'];
          row['output']['sudo_password']['value'] =
            distinctObj['sudo_password']['value'];

          // change sudo values
          row['output']['mfa_enabled']['value'] =
            distinctObj['mfa_enabled']['value'];
          row['output']['mfa_key']['value'] = distinctObj['mfa_key']['value'];

          // change sudo values
          row['output']['autodiscover_enabled']['value'] =
            distinctObj['autodiscover_enabled']['value'];
          row['output']['sid_list']['value'] = distinctObj['sid_list']['value'];
        }
      });
    });
  }

  /*********************************************/
  /* Method to select private key
  /*********************************************/
  addPKFile(idx) {
    // initiate native file explorer open
    $('#key-' + idx).click();
    $('#key-' + idx).change(event => {
      let size = event.target.files['0'].size || null;
      if (size && size < 3000) {
        let reader = new FileReader();
        reader.onload = e => {
          let keyLower = reader.result.toString().toLowerCase();
          if (keyLower.includes('rsa private key')) {
            this.rows[idx].output.privatekey.value = reader.result;
            this.rows[idx].output.privatekeyError = false;
          } else {
            this.rows[idx].output.privatekey.value = '';
            this.rows[idx].output.privatekeyError = true;
          }
        };
        reader.readAsText(event.target.files['0']);
      } else {
        this.rows[idx].output.privatekey.value = '';
        this.rows[idx].output.privatekeyError = true;
      }
    });
  }

  removePKFile(idx) {
    $('#key-' + idx).val('');
    this.rows[idx].output.privatekey.value = '';
    this.rows[idx].output.privatekeyError = false;
  }

  /*********************************************/
  /* Method to sort table rows based on column
  /*********************************************/
  sort(field) {
    // define map of ui field name to json key
    let fieldMap = {
      'type, subtype, persona': 'output.field.title',
      default: 'output.field.value'
    };
    // run sort
    this.updateSortType(field);
    this.rows = this.doSort(field, fieldMap, this.rows);
  }

  /*********************************************/
  /* Method to filter rows based on keywords
  /*********************************************/
  matcher(key) {
    // find all rows matching all values for all fields
    _.forEach(this.rows, (row, i) => {
      // set row to show initially
      row['output']['showRow'] = true;
      _.forEach(this.fields, (field, j) => {
        // for fields having a filter value
        if (field['filterValue']) {
          // get correct value from object key depth
          let value;
          if (_.includes(key, '.')) {
            let keys = key.split('.');
            _.forEach(keys, key => {
              if (!value) {
                value = row['output'][key];
              } else {
                value = value[key];
              }
            });
          } else {
            value = row['output'][field.key];
          }
          if (
            field.key == 'type' ||
            field.key == 'subtype' ||
            field.key == 'persona'
          ) {
            value = value['title'];
          } else {
            value = value['value'];
          }
          // create regular expression
          let exp = new RegExp(field['filterValue'], 'i');
          if (!exp.test(value)) {
            row['output']['showRow'] = false;
            // break from fields loop when first
            // non-matching field is found
            return false;
          }
        }
      });
    });
  }

  /**
   * SSO Modal will be shown if the components for the perticular device
   * does not contain PERFARCHIEVE in the components otherwise it will skip
   * login process.
   * @param idx : row index
   */
  showSsoModal() {
    // this.notifyRowsExceedsLimit();

    if (!this.client.features.asupUpload) {
      document.getElementById('btnSkip').click();
    } else if (this.validation['nonPerfArchive']) {
      this.helper.showModalPopup('#sso-modal');
      this.modalData.perfArchive = false;
    } else {
      document.getElementById('btnSkip').click();
      this.modalData.perfArchive = true;
    }
  }

  /**************************************************************
   * This function will set PerfArchive related validation flags
   *************************************************************/
  checkPerfArchiveValidation() {
    this.validation['perfArchive'] = false;
    this.validation['nonPerfArchive'] = false;
    this.validation['mixedWithPerfArchive'] = false;

    _.forEach(this.rows, row => {
      let flag = this.helper.isContains(
        row.output.subtype.title,
        this.settings.perfArchive
      );
      this.validation[flag ? 'perfArchive' : 'nonPerfArchive'] = true;
      if (this.validation['perfArchive'] && this.validation['nonPerfArchive']) {
        this.validation['mixedWithPerfArchive'] = true;
        return false; //way to skip way from the loop.
      }
    });
  }

  /************************************************************************
   * Responsible to set the commands into the datarow.
   * if the commands exist in the commands List then it should pick from
   * there and set for the device, otherwise, it will call the api to get
   * the commands for the command key. After getting the commands,
   * it will sort those commands alphabetically and store to the data row.
   * ----------------------------------------------------------------------
   * @param type : type of the device
   * @param commandset : commandset of the device
   * @param persona : persona for the device
   * @param idx : row index
   ***********************************************************************/
  updateCommandsValue(type, commandset, persona, idx?) {
    const key = `${type}-${commandset}-${persona}`;
    if (this.lstCommands[key]) {
      this.updateCommands(this, key, this.lstCommands[key], idx);
    } else {
      this.apiService
        .getCommands(type, commandset, persona)
        .subscribe(commands => {
          // add command objects
          const cmd = [];
          _.forEach(commands['commands'], (command, i) => {
            cmd.push({
              command: command['Command'],
              type: command['Type'],
              selected: true //select all commands
            });
          });
          // sort commands alphabetically
          this.lstCommands[key] = _.sortBy(cmd, 'command');
          this.commandsLoaded = this.isCommandsLoaded();
          this.updateCommands(this, key, this.lstCommands[key], idx);
        });
    }
  }

  /******************************************************************
   * The fuction will help when it stores commands for multiple rows.
   * It returns true if all commands are loaded otherwise false
   *****************************************************************/
  isCommandsLoaded(): any {
    let loaded = true;
    _.forOwn(this.lstCommands, (value, key) => {
      if (!value) {
        loaded = false;
        return false; //exit from the loop
      }
    });
    return loaded;
  }

  /******************************************************************
   * The fuction will help when it stores commands for single rows.
   *****************************************************************/
  commandsUpdate() {
    if (!this.savedProject) {
      const key = this.getCommandKey(0);
      this.updateCommandsValue(key.type, key.commandset, key.persona, 0);
    }
  }

  showDiscoverIP() {
    this.loadImporDevicesComponent = false;
    return (this.loadDiscoverIPComponent = !this.loadDiscoverIPComponent);
    // this.router.navigate(['discover'],{ relativeTo: this.route});
  }

  showImportDevices() {
    this.fileLabel = this.translate.instant('Importfile_nofilechosen');
    this.showContent = false;
    // this.setHeaders();
    // this.initDeviceData();
    // this.deleteRow(0);
    this.loadDiscoverIPComponent = false;
    return (this.loadImporDevicesComponent = !this.loadImporDevicesComponent);
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
   * This function is responsible to discover different
   * devices and the progress of the discovering
   ****************************************************/
  discover() {
    let error = this.validateFields();
    if (!error || error) {
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
   * This function should do the following tasks:
   * 1. Accept the filtered devices
   * 2. Sort the filtered devices by their IP
   * 3. Store the devices in the grid rows
   * 4. Updating the row informations like Type, subtypes, IP etc
   * 5. Updating the commands for each device based on type, commandset and persona
   ****************************************************/
  populateIpRangeComponents(event) {
    // console.log(`processing started at : ${new Date().getTime()}`);
    this.dataService.showLoader();
    setTimeout(() => {
      const devices = this.getFilteredDevices(event);

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
          this.populateIpRangeComponents(null);
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
  /// Import Devices

  resetFileUpload(event) {
    event.target.value = '';
  }

  uploadFile(event) {
    let files = event.target.files;
    if (files && files.length > 0) {
      let file = files.item(0);
      // validation of file extension
      let regex = /\.[^.]+$/g;
      let extension = regex.exec(file.name)[0].toLowerCase();

      // get filelabel
      if (files.length == 1) {
        let filename = file.name
          .split('.')
          .slice(0, -1)
          .join('.');
        if (filename.length > 10) {
          this.fileLabel = filename.slice(0, 10) + '...' + extension;
        } else {
          this.fileLabel = file.name;
        }
      } else {
        this.fileLabel =
          files.length + this.translate.instant('Importfile_files');
      }

      if (extension != '.csv' && extension != '.txt') {
        this.typeCheck = 'fail';
        this.uploadMsg = this.translate.instant('Importdevice_uploadmsg1');
      } else {
        // upload file since it is CSV
        this.typeCheck = 'pass';
        this.uploadMsg = this.translate.instant('ASUP_upload_msg2');
        let reader: FileReader = new FileReader();
        reader.readAsText(file);

        reader.onload = e => {
          let csv: string = reader.result as string;
          // get json representation of csv
          this.apiService.getCsvJson(csv).subscribe(
            response => {
              let components = response['body'];
              if (typeof components !== 'object') {
                components = JSON.parse(components);
              }
              let newComponents = [];
              _.forEach(components, (component, i) => {
                let type = _.keys(component)[0];
                let newObj = {};
                newObj['type'] = type;
                newObj['index'] = i;
                _.assignIn(newObj, component[type]);
                newComponents.push(newObj);
              });
              this.uploadMsg = '';
              this.populateCsvComponents(newComponents);
              // enable display of content block
              this.dataService.isDirtyOrValidating = true;
              this.showContent = true;
            },
            error => {
              this.typeCheck = 'fail';
              this.uploadMsg = error['statusText'];
            }
          );
        };
      }
    }
  }

  addFailedComponent(component, idx) {
    // remove the added row
    this.deleteRow(idx);
    // add component to failedComponents array
    this.failedComponents.push(component);
  }

  populateCsvComponents(components) {
    // clear failed components before populating
    this.failedComponents = [];
    // loop through imported components
    _.forEach(components, (component, i) => {
      // add a row to end
      this.addRow();
      // get the index of row
      let idx = this.rows.length - 1;

      // get lower-case of only alphabets of component keys
      let keys = _.keys(component);
      let newComponent = {};
      _.forEach(keys, (key, i) => {
        let newKey = key.replace(/[^a-zA-Z]/g, '').toLowerCase();
        // correction for hostname
        if (newKey == 'host') {
          newKey = 'hostname';
        }
        // add new key and associate value
        newComponent[newKey] = _.cloneDeep(component[key]);
      });
      component = newComponent;
      // pre-select type
      if (_.has(component, 'type')) {
        let type_idx = _.findIndex(this.rows[idx]['input']['types'], {
          device_id: component['type']
        });
        if (type_idx == -1) {
          this.addFailedComponent(component, idx);
          // continue with loop
          return true;
        }
        this.rows[idx]['output']['type'] = this.rows[idx]['input']['types'][
          type_idx
        ];
        this.changeType(null, idx);
      } else {
        this.rows[idx]['output']['type'] = this.rows[idx]['input']['types'][0];
      }

      // pre-select sub-type
      if (_.has(component, 'subtypes')) {
        let subtype_idx = _.findIndex(this.rows[idx]['input']['subtypes'], {
          id: component['subtypes']
        });
        if (subtype_idx == -1) {
          this.addFailedComponent(component, idx);
          // continue with loop
          return true;
        }
        this.rows[idx]['output']['subtype'] = this.rows[idx]['input'][
          'subtypes'
        ][subtype_idx];
        this.changeSubType(null, idx);
      } else {
        this.rows[idx]['output']['subtype'] = this.rows[idx]['input'][
          'subtypes'
        ][0];
      }

      // pre-select persona
      if (_.has(component, 'persona')) {
        let persona_idx = _.findIndex(this.rows[idx]['input']['personas'], {
          id: component['personas']
        });
        if (persona_idx == -1) {
          this.addFailedComponent(component, idx);
          // continue with loop
          return true;
        }
        this.rows[idx]['output']['persona'] = this.rows[idx]['input'][
          'personas'
        ][persona_idx];
        this.changePersona(null, idx);
      } else {
        this.rows[idx]['output']['persona'] = this.rows[idx]['input'][
          'personas'
        ][0];
      }

      // pre-fill dynamic fields
      _.forEach(this.headers, header => {
        let lowerCaseHeader = header['key']
          .replace(/[^a-zA-Z]/g, '')
          .toLowerCase();
        if (_.has(component, lowerCaseHeader)) {
          this.rows[idx]['output'][header.key]['value'] =
            component[lowerCaseHeader];
        }
      });

      // pre-fill sudo fields
      if (_.has(component, 'sudoenabled') && component['sudoenabled']) {
        let lower = component['sudoenabled'].toLowerCase();
        if (lower == 'yes' || lower == 'true') {
          this.rows[idx]['output']['enable_sudo']['disabled'] = false;
          this.rows[idx]['output']['sudo_enabled']['disabled'] = false;
          this.rows[idx]['output']['sudo_enabled']['value'] = true;
        } else {
          this.rows[idx]['output']['sudo_enabled']['value'] = false;
        }
      } else {
        this.rows[idx]['output']['sudo_enabled']['value'] = false;
      }
      if (_.has(component, 'sudopass')) {
        this.rows[idx]['output']['sudo_password']['value'] =
          component['sudopass'];
      } else {
        this.rows[idx]['output']['sudo_password']['value'] = '';
      }

      // pre-fill mfa fields
      if (_.has(component, 'mfaenabled') && component['mfaenabled']) {
        let lower = component['mfaenabled'].toLowerCase();
        if (lower == 'yes' || lower == 'true') {
          this.rows[idx]['output']['enable_mfa']['disabled'] = false;
          this.rows[idx]['output']['mfa_enabled']['disabled'] = false;
          this.rows[idx]['output']['mfa_enabled']['value'] = true;
        } else {
          this.rows[idx]['output']['mfa_enabled']['value'] = false;
        }
      } else {
        this.rows[idx]['output']['mfa_enabled']['value'] = false;
      }
      if (_.has(component, 'mfakey')) {
        this.rows[idx]['output']['mfa_key']['value'] = component['mfakey'];
      } else {
        this.rows[idx]['output']['mfa_key']['value'] = '';
      }

      // pre-fill autodiscover fields
      if (
        _.has(component, 'autodiscoverenabled') &&
        component['autodiscoverenabled']
      ) {
        let lower = component['autodiscoverenabled'].toLowerCase();
        if (lower == 'yes' || lower == 'true') {
          this.rows[idx]['output']['enable_autodiscover']['disabled'] = false;
          this.rows[idx]['output']['autodiscover_enabled']['disabled'] = false;
          this.rows[idx]['output']['autodiscover_enabled']['value'] = true;
        } else {
          this.rows[idx]['output']['autodiscover_enabled']['value'] = false;
        }
      } else {
        this.rows[idx]['output']['autodiscover_enabled']['value'] = false;
      }
      if (_.has(component, 'sidlist')) {
        this.rows[idx]['output']['sid_list']['value'] = component['sidlist'];
      } else {
        this.rows[idx]['output']['sid_list']['value'] = '';
      }

      // update commands if component has command state
      if (_.has(component, 'commands') && component.commands.length) {
        _.forEach(component.commands, (compObj, i) => {
          // find first match of command name in commands collection
          let commandObj = _.find(this.rows[idx]['commands'], commandObj => {
            return commandObj['command'] == compObj['command'];
          });
          if (commandObj) {
            commandObj['selected'] = compObj['selected'];
          }
        });
      }
    });
    this.triggerFailedComponentsModal();
  }

  triggerFailedComponentsModal() {
    if (this.failedComponents.length) {
      // set modal headers
      this.modalHeaders = [];
      _.forEach(this.headers, header => {
        let lowerCaseHeader = header['key']
          .replace(/[^a-zA-Z]/g, '')
          .toLowerCase();
        let newHeader = {};
        newHeader['key'] = lowerCaseHeader;
        newHeader['tooltip'] = header['tooltip'];
        this.modalHeaders.push(newHeader);
      });
      this.helper.showModalPopup('#modal-import-failed');
    }
  }

  toggleChecked() {
    this.dataService.useCredentials = this.useCredentials;
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
