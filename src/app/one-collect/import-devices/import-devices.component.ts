import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeviceBasedComponent } from '../device-based/device-based.component';
import * as _ from 'lodash';
declare var $: any;

@Component({
  selector: 'oc-import-devices',
  templateUrl: './import-devices.component.html',
  styleUrls: ['./import-devices.component.css']
})
export class ImportDevicesComponent extends DeviceBasedComponent
  implements OnInit, OnDestroy {
  typeCheck: any;
  uploadMsg: any;
  showContent: boolean;
  modalHeaders: any[] = [];
  failedComponents: any[] = [];
  fileLabel: any;

  initialize() {
    this.fileLabel = this.translate.instant('Importfile_nofilechosen');
    this.showContent = false;
    this.initDeviceData();
  }

  reset() {
    this.rows = [];
    this.showContent = false;
  }

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
}
