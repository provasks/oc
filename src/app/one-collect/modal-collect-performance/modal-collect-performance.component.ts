import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ModalCollectComponent } from '../modal-collect/modal-collect.component';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { HelperService } from 'src/app/services/helper/helper.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
declare var $: any;

import { TranslateService } from '../../services/translate/translate.service';

@Component({
  selector: 'oc-modal-collect-performance',
  templateUrl: './modal-collect-performance.component.html',
  styleUrls: ['./modal-collect-performance.component.css']
})
export class ModalCollectPerformanceComponent extends ModalCollectComponent
  implements OnInit, OnDestroy {
  /*********************************************/
  /* Class properties
  /*********************************************/
  @Input() tokenData: any;
  settings = {
    bigBanner: true,
    timePicker: true,
    format: 'dd MMM yyyy hh:mm a',
    defaultOpen: false
  };
  sameTime: boolean = false;
  intervalId: any;
  setDropDownsSubscription: Subscription;
  options: any;
  schedulerMetaNote: string = '';
  hour_min_multiplier: number = 60;
  max_allowed_minutes: number = 60 * 24; //one day
  /*********************************************/
  /* Constructor method
  /*********************************************/
  constructor(
    public apiService: ApiService,
    public dataService: DataService,
    public helper: HelperService,
    public router: Router,
    public translate: TranslateService,
    public route: ActivatedRoute
  ) {
    super(apiService, dataService, helper, router, translate, route);

    // change performance modal drop down values
    this.setDropDownsSubscription = dataService.perfModal$.subscribe(row => {
      this.setTriggerEveryDropDowns(row);
    });
  }

  /*********************************************/
  /* Lifecycle hook OnDestroy
  /*********************************************/
  ngOnDestroy() {
    this.setDropDownsSubscription.unsubscribe();
    this.closeTimer();
  }

  /*********************************************/
  /* Method to set additional properties to 
  /* collectOptions
  /*********************************************/
  setExtendedClassDefaults() {
    this.collectOptions['token'] = '';
    //this.collectOptions['token_valid'] = false;
    //this.collectOptions['token_uuid'] = "";
    // first time setting of dates
    this.setDateTime(new Date());
    // subsequent changes in dates as time progresses
    this.intervalId = window.setInterval(() => {
      let newDateTime = new Date();
      let seconds = newDateTime.getSeconds();
      if (seconds == 1) {
        this.setDateTime(newDateTime);
      }
    }, 1000);
  }

  setDateTime(newDateTime) {
    // increment by 5 minutes from current time
    newDateTime.setMinutes(newDateTime.getMinutes() + 5);
    this.collectOptions['perfStartDateTime'] = newDateTime;
    let endDate = _.cloneDeep(newDateTime);
    endDate.setDate(endDate.getDate() + 7);
    this.collectOptions['perfEndDateTime'] = endDate;
  }

  closeTimer() {
    clearInterval(this.intervalId);
  }

  checkDateTime(event) {
    if (
      Date.parse(this.collectOptions['perfStartDateTime']) ==
      Date.parse(this.collectOptions['perfEndDateTime'])
    ) {
      this.sameTime = true;
    } else {
      this.sameTime = false;
    }
  }

  /*********************************************/
  /* Method to initialize start and end
  /* datetime with values in profile
  /*********************************************/
  setTriggerEveryDropDowns(row) {
    let options = row.output.subtype;
    this.validateSchedulerTime(options);
    options.max_minutes =
      options.max_minutes > this.max_allowed_minutes
        ? this.max_allowed_minutes
        : options.max_minutes;
    options.default_minutes =
      options.default_minutes < options.min_minutes
        ? options.min_minutes
        : options.default_minutes > options.max_minutes
        ? options.max_minutes
        : options.default_minutes;

    this.options = options;
    this.hours = _.range(
      _.floor(options.min_minutes / this.hour_min_multiplier),
      _.floor(options.max_minutes / this.hour_min_multiplier) + 1,
      1
    );
    this.triggerMinutes = _.range(
      options.min_minutes,
      options.max_minutes + 1,
      options.step_minutes
    );
    this.collectOptions['selectedHour'] = 0;
    this.collectOptions['skip_minutes'] = options.default_minutes;
  }

  validateSchedulerTime(options) {
    // debugger;
    if (options.max_minutes < 0) {
      this.schedulerMetaNote += this.translate.instant(
        'ERR_MAX_MINUTE_NEGETIVE'
      );
    }
    if (options.min_minutes < 0) {
      this.schedulerMetaNote += this.translate.instant(
        'ERR_MIN_MINUTE_NEGETIVE'
      );
    }
    if (options.min_minutes > options.max_minutes) {
      this.schedulerMetaNote += this.translate.instant(
        'ERR_MIN_GREATER_THAN_MAX'
      );
    }
    if (options.step_minutes < 1) {
      this.schedulerMetaNote += this.translate.instant('ERR_STEP_INCR');
    }
    if (options.step_minutes > options.max_minutes - options.min_minutes) {
      this.schedulerMetaNote += this.translate.instant('ERR_STEP_MAX_VALUE');
    }
  }

  alterMinutes() {
    const selectedHour = parseInt(this.collectOptions['selectedHour']);
    const remainingMinutes =
      this.options.max_minutes - selectedHour * this.hour_min_multiplier;
    const start =
      parseInt(this.collectOptions['selectedHour']) === 0
        ? this.options.min_minutes
        : 0;
    const end =
      remainingMinutes > this.hour_min_multiplier
        ? this.hour_min_multiplier
        : remainingMinutes + this.options.step_minutes;
    this.triggerMinutes = _.range(start, end, this.options.step_minutes);
    if (!this.triggerMinutes.length) {
      this.triggerMinutes.push(0);
    }
    this.collectOptions['skip_minutes'] = 0;
  }

  /*********************************************/
  /* Method to reset all fields that need to be
  /* validated
  /*********************************************/
  resetValidation() {
    this.validation['purpose'] = false;
    this.validation['projectName'] = false;
    this.validation['projectNameLength'] = false;
    this.validation['groupName'] = false;
    this.validation['token'] = false;
    this.validation['startDate'] = false;
    this.validation['endDate'] = false;
    this.validation['passPhrase'] = false;
  }

  /*********************************************/
  /* Method to define validation rules for 
  /* specified fields
  /*********************************************/
  validateFields() {
    // clear previous validations
    this.resetValidation();
    // check if purpose of collection is selected
    if (!this.collectOptions['purpose']['title']) {
      this.validation['purpose'] = true;
    }
    // check if project name matches regex
    let projectName = this.collectOptions['projectName'];
    this.validation['projectName'] = /[^a-zA-Z0-9_]+/g.test(projectName);
    // check if project name is within 20 characters
    if (projectName.length > 20) {
      this.validation['projectNameLength'] = true;
    }
    // check if group name matches regex
    let groupName = this.collectOptions['group'];
    this.validation['groupName'] = /[^a-zA-Z0-9_]+/g.test(groupName);
    // check if start date is less than today
    let start = Math.floor(
      Date.parse(this.collectOptions['perfStartDateTime']) / (1000 * 60)
    );
    let now = Math.floor(Date.now() / (1000 * 60));
    if (start < now) {
      this.validation['startDate'] = true;
    }
    // check if end date is greater than start date
    let end = Math.floor(
      Date.parse(this.collectOptions['perfEndDateTime']) / (1000 * 60)
    );
    if (start > end) {
      this.validation['endDate'] = true;
    }
    // check if passphrases match if not already set
    if (!this.settingsPassPhrase) {
      if (
        this.collectOptions['passPhrase'] == '' ||
        this.collectOptions['confirmPassPhrase'] == '' ||
        this.collectOptions['passPhrase'] !==
          this.collectOptions['confirmPassPhrase']
      ) {
        this.validation['passPhrase'] = true;
      } else {
        // validation is fine for passphrase so indicate this to modal-settings
        this.dataService.settingsSave(this.collectOptions['passPhrase']);
      }
    }
    // check all validations
    let error = false;
    _.forEach(this.validation, (value, key) => {
      if (value) {
        error = true;
      }
    });
    return error;
  }

  /*********************************************/
  /* Method to save and collect project
  /*********************************************/
  saveAndCollect() {
    this.messages['type'] = '';
    this.messages['status'] = '';
    let error = this.validateFields();
    if (!error) {
      let options = this.getProcessedOptions();
      let obj = this.getPostData(options);
      obj['jobId'] = options['projectName'];

      // send data to backend
      this.apiService.postSaveAndCollectPerfDevice(obj).subscribe(
        data => {
          $('#perf-collect-modal').modal('hide');
          this.router.navigate(['/main/collection']);
        },
        error => {
          this.messages['type'] = 'error';
          this.messages['status'] = this.translate.instant(
            'Collection_modal_error_msg1'
          );
        }
      );
    }
  }

  getAdditionalProcessedOptions(options) {
    // remove seconds from time
    //options['perfStartDateTime'] = Math.floor( Date.parse( this.collectOptions['perfStartDateTime'] ) / (1000 * 60) ) * 60;
    //options['perfEndDateTime'] = Math.floor( Date.parse( this.collectOptions['perfEndDateTime'] ) / (1000 * 60) ) * 60;

    options['perfStartDateTime'] =
      Math.floor(Date.parse(this.collectOptions['perfStartDateTime']) / 1000) +
      0.001;
    options['perfEndDateTime'] =
      Math.floor(Date.parse(this.collectOptions['perfEndDateTime']) / 1000) +
      0.001;
    // add token to options
    options['token'] = this.tokenData['token'];
    // check if start date-time equals end date-time
    if (
      Date.parse(this.collectOptions['perfStartDateTime']) ==
      Date.parse(this.collectOptions['perfEndDateTime'])
    ) {
      options['selectedHour'] = 0;
      options['skip_minutes'] = 2;
    }
    return options;
  }
}
