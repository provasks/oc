import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { Subscription } from 'rxjs';
import { Purposes } from 'src/app/content/purposes';
import * as _ from 'lodash';
declare var $: any;

import { environment } from 'src/environments/environment';

@Component({
  selector: 'oc-modal-collect-asup',
  templateUrl: './modal-collect-asup.component.html',
  styleUrls: ['./modal-collect-asup.component.css']
})
export class ModalCollectAsupComponent implements OnInit, OnDestroy {
  /*********************************************/
  /* Class properties
  /*********************************************/
  @Input() modalData;
  collectOptions: any = {};
  messages: any = {};
  groups: any[] = [];
  showDropdown: boolean = false;
  validation: any = {};
  showPurposeNote: boolean = false;

  caLaunch: boolean = environment.caLaunch;
  purpose_dropdown: any[] = [];

  /*********************************************/
  /* Constructor method
  /*********************************************/
  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private router: Router
  ) {}

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {
    // initialize validations
    this.resetValidation();
    this.messages['type'] = '';
    this.messages['status'] = '';
    this.collectOptions['projectName'] = '';
    this.collectOptions['purpose'] = '';
    this.collectOptions['opportunityId'] = '';
    this.collectOptions['caseId'] = '';
    this.collectOptions['comments'] = '';

    //dropdown for purpose of data collection
    // _.forEach(Purposes, (purpose_obj, index) => {
    //   if(purpose_obj.title != '' ){
    //     this.purpose_dropdown.push({title:purpose_obj.title})
    //   }
    // })
    this.collectOptions['purposes'] = Purposes;
    this.collectOptions['group'] = '';
    // get groups to populate drop downs
    this.apiService.getGroups().subscribe(data => {
      this.groups = data['groups'];
    });
  }

  /*********************************************/
  /* Lifecycle hook OnDestroy
  /*********************************************/
  ngOnDestroy() {}

  /*********************************************/
  /* Method to set group value to model on
  /* mouse click
  /*********************************************/
  setGroup(group) {
    this.collectOptions['group'] = group;
    this.showDropdown = false;
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
  }

  /*********************************************/
  /* Method to define validation rules for
  /* specified fields
  /*********************************************/
  validateFields() {
    // clear previous validations
    this.resetValidation();
    // check if purpose of collection is selected
    if (!this.caLaunch && !this.collectOptions['purpose']) {
      this.validation['purpose'] = true;
    }
    // check if project name matches regex
    let projectName = this.collectOptions['projectName'];
    this.validation['projectName'] = /^$|[^a-zA-Z0-9_]+/g.test(projectName);
    // check if project name is within 20 characters
    if (projectName.length > 20) {
      this.validation['projectNameLength'] = true;
    }
    // check if group name matches regex
    let groupName = this.collectOptions['group'];
    this.validation['groupName'] = /[^a-zA-Z0-9_]+/g.test(groupName);
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
  /* Method to initiate collect after checking
  /* validation errors of fields
  /*********************************************/
  collect() {
    // validate input fields
    let error = this.validateFields();
    if (!error) {
      let options = this.getProcessedOptions();
      let obj = this.getPostData(options);
      this.apiService.collectOnlyAsupIds(obj).subscribe(response => {
        if (response['status'] == 200) {
          this.router.navigate(['/main/collection/']);
        }
      });
      $('#modal-collect-asup').modal('hide');
    }
  }

  /*********************************************/
  /* Method to consolidate data that will be
  /* sent to backend for collecting
  /*********************************************/
  getPostData(options) {
    let obj = this.modalData.obj;
    obj['collectOptions'] = options;
    obj['queryName'] = options['projectName'];
    obj['jobId'] = '';
    return obj;
  }

  /*********************************************/
  /* Method to process data fields correctly
  /* before passing to backend for collecting
  /*********************************************/
  getProcessedOptions() {
    // make clone of form inputs object
    let options = _.cloneDeep(this.collectOptions);
    // only title is passed to backend; this needs to be changed to
    // include whole object including purpose code to enable multi-lingual support
    options['purpose'] = options['purpose']['title'];
    // build start_time string
    options['start_time'] =
      options['startTimeHours'] +
      ':' +
      options['startTimeMinutes'] +
      ':' +
      options['startTimeSeconds'];
    // build week_names property
    options['week_names'] = {};
    if (options['scheduleProject'] && options['rec_pattern'] == 'weekly') {
      _.forEach(options['weekDays'], (obj, i) => {
        if (obj['checked']) {
          options['week_names'][obj.title] = true;
        }
      });
    }
    // remove unnecessary properties
    options = _.omit(options, [
      'weekDays',
      'startTimeHours',
      'startTimeMinutes',
      'startTimeSeconds'
    ]);
    // return the processed object
    return options;
  }

  /*********************************************/
  /* Method to check if purpose is
  /* Case Troubleshooting to notify user that
  /* all personas will be automatically set to
  /* diagnostic mode
  /*********************************************/
  checkPurpose() {
    if (this.collectOptions['purpose']['code'] == 3) {
      this.showPurposeNote = true;
    } else {
      this.showPurposeNote = false;
    }
  }
}
