import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeviceBasedComponent } from '../device-based/device-based.component';
import { ModalCollectPerformanceComponent } from '../modal-collect-performance/modal-collect-performance.component';
import * as _ from 'lodash';
declare var $: any;

@Component({
  selector: 'oc-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.css']
})
export class PerformanceComponent extends DeviceBasedComponent
  implements OnInit, OnDestroy {
  tokenData: any = { token: '' };
  notification: any;
  prevSubType: any;
  prevIdx: any;
  prevDeviceId: any;

  /*********************************************/
  /* Override method to fetch basic devices 
  /* data before generating any rows
  /*********************************************/

  initDeviceData(cbMakeRows?) {
    // fetch device types
    this.apiService.getPerfDeviceTypes().subscribe(deviceTypes => {
      this.deviceTypes = _.sortBy(deviceTypes, 'title');
      // fetch device details for each type
      this.apiService
        .getPerfDeviceDetails(this.deviceTypes)
        .subscribe(deviceDetails => {
          this.dataService.hideLoader();
          this.deviceDetails = deviceDetails;
          this.convertTypes();
          this.setHeaders();
          if (cbMakeRows) {
            // call back to add rows based on pre-populated or new collection
            cbMakeRows();
          }
        });
    });
  }

  convertTypes() {
    if (!this.deviceDetails.length) {
      return;
    }
    let subTypes = this.deviceDetails[0]['subtypes'];
    let keys = [
      'max_devices',
      'max_hours',
      'max_minutes',
      'min_hours',
      'min_minutes',
      'default_hours',
      'default_minutes',
      'step_hours',
      'step_minutes'
    ];
    _.forEach(subTypes, (obj, id) => {
      _.forEach(keys, key => {
        if (_.has(obj, key)) {
          obj[key] = parseInt(obj[key], 10);
        }
      });
    });
  }

  initTokenModal() {
    let error = this.validateGridFields();
    if (!error) {
      this.helper.showModalPopup('#modal-token');
    } else {
      this.fieldsValidation = true;
    }
  }

  /*********************************************/
  /* Callback to show collect modal
  /*********************************************/
  doSaveCollect = () => {
    let row = this.rows[0];
    this.dataService.perfModal(row);
    this.setObj();
    $('#perf-collect-modal').modal({
      backdrop: 'static',
      keyboard: false
    });
  };

  checkAndChangeSubType(event, i) {
    this.prevIdx = i;
    this.prevSubType = this.rows[i].output.subtype;
    this.rows[i].output.subtype = event;
    let sameSubTypeId = this.rows[i].output.subtype.id == this.prevSubType.id;
    if (this.rows.length > 1 && !sameSubTypeId) {
      let title = this.rows[i]['output']['subtype']['title'];
      this.notification = {
        title: this.translate.instant('Performance_notification_title'),
        message:
          this.translate.instant('Performance_notification_msg') +
          `${title}` +
          this.translate.instant('Performance_notification_msg1'),
        confirm: true
      };
      $('#reset-rows').modal({
        backdrop: 'static',
        keyboard: false
      });
      // set focus to confirm button so that user can press
      // enter key to delete instead of click by mouse
      $('#reset-rows').on('shown.bs.modal', event => {
        $('#reset-rows .confirm').focus();
      });
    } else {
      this.changeSubType(event, i);
    }
  }

  confirmResetRows(event) {
    let idx = this.prevIdx;
    let nextSubType = this.rows[idx].output.subtype;
    this.reset();
    // change first row to current selection
    let obj = _.find(this.rows[0]['input']['subtypes'], { id: nextSubType.id });
    this.rows[0].output.subtype = obj;
    this.changeSubType(false, 0);
  }

  cancelResetRows(event) {
    let idx = this.prevIdx;
    this.rows[idx].output.subtype = this.prevSubType;
  }
}
