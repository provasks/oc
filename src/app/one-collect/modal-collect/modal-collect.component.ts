import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { Subscription, Subject } from 'rxjs';
import { Purposes } from 'src/app/content/purposes';
import { Settings } from 'src/app/content/settings';

import { environment } from 'src/environments/environment';
import { HelperService } from 'src/app/services/helper/helper.service';
import { TranslateService } from '../../services/translate/translate.service';
import * as _ from 'lodash';
declare var $: any;

@Component({
  selector: 'oc-modal-collect',
  templateUrl: './modal-collect.component.html',
  styleUrls: ['./modal-collect.component.css']
})
export class ModalCollectComponent implements OnInit, OnDestroy {
  /*********************************************/
  /* Class properties
  /*********************************************/
  @Input() modalData;
  @Input() subType: Subject<any>;

  settings: any = Settings;
  collectOptions: any = {};
  messages: any = {};
  hours: any[] = [];
  minutes: any[] = [];
  triggerMinutes: any[] = [];
  seconds: any[] = [];
  newSavedProject: string = '';
  settingsPassPhrase = '';
  groups: any[] = [];
  showDropdown: boolean = false;
  projectLoaded: boolean = false;
  validation: any = {};
  showPurposeNote: boolean = false;
  modalSubscription: Subscription;
  settingsSubscription: Subscription;

  caLaunch: boolean = environment.caLaunch;
  projects: any;
  errorMsg: string;
  purposes: any[] = [];

  client: any = environment.client;

  selectedPurpose: any;
  purposeName: any;

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
    // check if this is a saved project and set modal accordingly
    this.modalSubscription = dataService.modalCollect$.subscribe(job => {
      this.showInventoryCollection(job);
      this.projectLoaded = true;
      this.setModalCollect(job);
    });
    // check if settings has changed for passPhrase to show input fields accordingly
    this.settingsSubscription = dataService.settingsChanged$.subscribe(
      preferences => {
        this.settingsPassPhrase = preferences['passPhrase'];
      }
    );
  }

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {
    // initialize validations
    this.resetValidation();
    const keyword = this.route.snapshot.paramMap.get('keyword');
    this.purposeName = this.getSelectedPurpose(keyword);
    this.selectedPurpose =
      Array.isArray(this.purposeName) && this.purposeName.length > 0
        ? this.purposeName[0]
        : null;
    //messages
    this.messages['type'] = '';
    this.messages['status'] = '';
    // initialize properties
    this.hours = _.range(0, 24);
    this.minutes = _.range(0, 60);
    this.triggerMinutes = _.range(1, 60);
    this.seconds = _.range(0, 60);
    // load default values which would get over-written
    // when loading a saved project
    this.collectOptions['saveProject'] = true;
    this.collectOptions['projectName'] = '';
    this.collectOptions['group'] = '';
    this.collectOptions['passPhrase'] = '';
    this.collectOptions['confirmPassPhrase'] = '';
    // get passPhrase from dataService
    this.apiService.getPreferences().subscribe(data => {
      let preferences = data['preference'];
      if (preferences) {
        preferences = JSON.parse(preferences)['basic'];
        this.settingsPassPhrase = preferences['passPhrase'];
      } else {
        this.settingsPassPhrase = '';
      }
    });
    // get groups to populate drop downs
    this.apiService.getGroups().subscribe(data => {
      this.groups = data['groups'];
    });
    // other collect options
    this.collectOptions['scheduleProject'] = false;
    this.collectOptions['rec_pattern'] = 'hourly';
    this.collectOptions['purpose'] = Purposes[0];
    this.collectOptions['opportunityId'] = '';
    this.collectOptions['caseId'] = '';
    this.collectOptions['comments'] = '';

    //dropdown for purpose of data collection
    // this.purposes = Purposes;

    this.collectOptions['purposes'] = Purposes;
    this.collectOptions['weekDays'] = [
      { title: 'mon', checked: false },
      { title: 'tue', checked: false },
      { title: 'wed', checked: false },
      { title: 'thu', checked: false },
      { title: 'fri', checked: false },
      { title: 'sat', checked: false },
      { title: 'sun', checked: false }
    ];
    this.setDefault();
    this.subscribeSubType();
    this.showInventoryCollection();
    this.loadProjects();
  }

  /*********************************************/
  /* This method will keep track of selected purpose / objective
  /* @param keyword - route param
  /*********************************************/

  getSelectedPurpose(keyword) {
    if (keyword) {
      let objectiveId = this.helper.getDefaultKey(keyword);
      return Purposes.filter(
        purpose => purpose.objectiveId == objectiveId['id']
      ).map(purpose => purpose.title);
    }
  }
  /** Load all project */
  loadProjects() {
    this.apiService.getProjectsList().subscribe(data => {
      this.projects = data.jobs;
    });
  }

  /*********************************************/
  /* Lifecycle hook OnDestroy
  /*********************************************/
  ngOnDestroy() {
    this.modalSubscription.unsubscribe();
    this.settingsSubscription.unsubscribe();
  }

  /*********************************************/
  /* Method to set group value to model on
  /* mouse click
  /*********************************************/
  setGroup(group) {
    this.collectOptions['group'] = group;
    this.showDropdown = false;
  }

  /*********************************************/
  /* Method to set default values to modal
  /* fields
  /*********************************************/
  setDefault() {
    this.collectOptions['week_names'] = {};
    this.collectOptions['week'] = {};
    this.collectOptions['start_time'] = '10:10:00';
    this.collectOptions['startTimeHours'] = 10;
    this.collectOptions['startTimeMinutes'] = 10;
    this.collectOptions['startTimeSeconds'] = 0;
    this.collectOptions['day_skip'] = 1;
    this.collectOptions['skip_hours'] = 0;
    this.collectOptions['skip_minutes'] = 1;
    this.collectOptions['occur'] = 1;
    this.setExtendedClassDefaults();
  }

  /*********************************************/
  /* Stub method that can be extended in
  /* inherited components
  /*********************************************/
  setExtendedClassDefaults() {}

  /*********************************************/
  /* Method to populate modal values when
  /* loading a job from saved project
  /*********************************************/
  setModalCollect(job) {
    this.collectOptions['saveProject'] = true;
    this.collectOptions['projectName'] = job['name'];
    this.collectOptions['group'] = job['group'];
    if (_.has(job, 'purpose')) {
      this.collectOptions['purpose'] = _.find(this.collectOptions['purposes'], {
        title: job['purpose']
      });
    }
    if (_.has(job, 'opportunityId')) {
      this.collectOptions['opportunityId'] = job['opportunityId'];
    }
    this.apiService.getScheduleList().subscribe(schedules => {
      // find schedule matching job name
      let schedule = _.find(schedules, { project_id: job['name'] });
      // update schedule options when there is a schedule
      if (schedule) {
        this.modalData['schedule'] = schedule;
        // when loading a saved project editing or adding schedule is disabled
        this.collectOptions['scheduleProject'] = false;
        this.collectOptions['rec_pattern'] = schedule['rec_pattern'];
        this.collectOptions['day_skip'] = schedule['day_skip'];
        this.collectOptions['skip_hours'] = schedule['skip_hours'];
        this.collectOptions['skip_minutes'] = schedule['skip_minutes'];
        this.collectOptions['occur'] = schedule['occur'];
        let start_time = schedule['start_time'].split(':');
        this.collectOptions['startTimeHours'] = start_time[0];
        this.collectOptions['startTimeMinutes'] = start_time[1];
        this.collectOptions['startTimeSeconds'] = start_time[2];
        this.collectOptions['start_time'] = schedule['start_time'];
        let week_names = schedule['week_names'].replace(/'/g, '"');
        week_names = JSON.parse(week_names);
        this.collectOptions['week_names'] = week_names;
        // change selected values as per saved options
        _.forEach(week_names, (value, day) => {
          let option = _.find(this.collectOptions['weekDays'], { title: day });
          if (option) {
            option['checked'] = true;
          }
        });
      }
    });
  }

  /*********************************************/
  /* Method to enable/disable fields related to
  /* scheduling
  /*********************************************/
  changeInSchedule() {
    // make collect now default if no schedule is prescribed
    if (!this.collectOptions['scheduleProject']) {
      this.collectOptions['collectNow'] = true;
    }
  }

  /*********************************************/
  /* Method to alter minutes of "Trigger Every"
  /* based on selection of Hours
  /* If hours is zero then minutes should range
  /* from 1 to 60
  /*********************************************/
  alterMinutes() {
    if (this.collectOptions['skip_hours'] == 0) {
      this.triggerMinutes = _.range(1, 60);
      // check if skip_minutes was set to zero
      // earlier and change it to 1
      if (this.collectOptions['skip_minutes'] == 0) {
        this.collectOptions['skip_minutes'] = 1;
      }
    } else {
      // case when skip_hours is not zero
      this.triggerMinutes = _.range(0, 60);
    }
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
    this.validation['passPhrase'] = false;
    this.validation['occurPattern'] = false;
  }

  /*********************************************/
  /* Method to define validation rules for
  /* specified fields
  /*********************************************/
  validateFields() {
    // clear previous validations
    this.resetValidation();
    // check if purpose of collection is selected
    if (!this.caLaunch && !this.client.isOEM) {
      if (!this.collectOptions['purpose']['title']) {
        this.validation['purpose'] = true;
      }
    }
    this.validateProjectName(this.collectOptions['projectName']);
    // check if group name matches regex
    let groupName = this.collectOptions['group'];
    this.validation['groupName'] = /[^a-zA-Z0-9_]+/g.test(groupName);
    if (this.collectOptions['scheduleProject']) {
      //check if occurrence pattern matches regex
      let occurPattern = this.collectOptions['occur'];
      let occurValidation = /^[1-9]|[1-9][0-9]+/g.test(occurPattern);
      if (occurValidation) {
        this.validation['occurPattern'] = false;
      } else {
        this.validation['occurPattern'] = true;
      }
    }
    // check if passphrases match if not already set
    if (!this.settingsPassPhrase) {
      // Passphrase validation
      this.helper.validatePassphrase(
        this.collectOptions['passPhrase'],
        this.collectOptions['confirmPassPhrase'],
        this.validation
      );
      if (!this.validation.passPhrase) {
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
  /* Method to save and schedule project
  /*********************************************/
  saveAndSchedule(runCollect = false) {
    // validate input fields
    let error = this.validateFields();
    if (!error) {
      let options = this.getProcessedOptions();
      let obj = this.getPostData(options);
      // check if this project is loaded from saved-projects tab or
      // check if new project is being saved another time
      if (
        this.modalData['savedProject'] ||
        this.newSavedProject == options['projectName']
      ) {
        obj['jobId'] = options['projectName'];
      }
      // callback to handle success
      let success = data => {
        // update newSavedProject which can be used to check
        // if same project needs to be saved again later
        this.newSavedProject = options['projectName'];
        // don't change any schedule if this is a saved project
        if (!this.modalData['savedProject']) {
          // save schedule if available
          if (options['scheduleProject']) {
            options.timezone = this.helper.getTimezone();
            this.apiService
              .saveScheduleProject(options['projectName'], options)
              .subscribe(projects => {
                this.messages['type'] = 'success';
                this.messages['status'] = this.translate.instant(
                  'Collection_modal_success_msg1'
                );
              });
          } else if (this.modalData['schedule']) {
            // if schedule object is available then delete the schedule
            this.apiService
              .deleteScheduledProject(this.modalData['schedule']['schedule_id'])
              .subscribe(projects => {
                this.messages['type'] = 'success';
                this.messages['status'] = this.translate.instant(
                  'Collection_modal_success_msg2'
                );
              });
          } else {
            this.messages['type'] = 'success';
            this.messages['status'] = this.translate.instant(
              'Collection_modal_success_msg2'
            );
          }
        }
        if (runCollect) {
          // run collect
          this.collect();
        }
      };
      // callback to handle error
      let error = response => {
        if (response['status'] == 409) {
          this.messages['type'] = 'error';
          this.messages['status'] = response['statusText'];
          this.dataService.hideLoader();
        }
      };

      // save the project
      if (this.modalData['collectionType'] == 'device-based') {
        this.apiService.saveDeviceBasedProject(obj).subscribe(
          data => {
            success(data);
            this.saveProjectCallback(runCollect);
          },
          response => error(response)
        );
      } else if (this.modalData['collectionType'] == 'solution-based') {
        let profileId = this.modalData['profileId'];
        let subProfileId = this.modalData['subProfileId'];
        this.apiService
          .saveSolutionBasedProject(obj, profileId, subProfileId)
          .subscribe(
            data => {
              success(data);
              this.saveProjectCallback(runCollect);
            },
            response => error(response)
          );
      }
    }
  }

  saveProjectCallback(runCollect: boolean = false) {
    $('#collect-modal').modal('hide');
    this.dataService.isDirtyOrValidating = false;
    //redirect to saved page veiw
    if (!runCollect) {
      this.router.navigate(['/main/saved-projects']);
    }
  }

  /*********************************************/
  /* Method to decide whether to saveAndCollect
  /* or collectOnly
  /*********************************************/
  collect() {
    // validate input fields
    let error = this.validateFields();
    if (!error) {
      let options = this.getProcessedOptions();
      // check if this project is loaded from saved-projects tab or
      // check if new project has been saved already
      if (
        this.modalData['savedProject'] ||
        (this.newSavedProject && this.newSavedProject == options['projectName'])
      ) {
        this.saveAndCollect();
      } else {
        this.collectOnly();
      }
    }
  }

  /*********************************************/
  /* Method to save, schedule and collect
  /* project
  /*********************************************/
  saveAndCollect() {
    this.messages['type'] = '';
    this.messages['status'] = '';
    let error = this.validateFields();
    if (!error) {
      let options = this.getProcessedOptions();
      let obj = this.getPostData(options);
      obj['jobId'] = options['projectName'];
      // define callback for success and error http responses
      let successCallback = () => {
        //$("#collect-modal").modal("hide");
        this.router.navigate(['/main/collection']);
      };
      let errorCallback = () => {
        this.messages['type'] = 'error';
        this.messages['status'] = this.translate.instant(
          'Collection_modal_error_msg1'
        );
      };
      // call api for device based
      if (this.modalData['collectionType'] == 'device-based') {
        this.apiService
          .postSaveAndCollectDevice(obj)
          .subscribe(data => successCallback(), error => errorCallback());
      } else if (this.modalData['collectionType'] == 'solution-based') {
        // call api for solutions based
        let profileId = this.modalData['profileId'];
        let subProfileId = this.modalData['subProfileId'];
        this.apiService
          .postSaveAndCollectSolution(profileId, subProfileId, obj)
          .subscribe(data => successCallback(), error => errorCallback());
      }
      // run success callback anyway
      //successCallback();
    }
  }

  /*********************************************/
  /* Method to collect without saving
  /*********************************************/
  collectOnly() {
    let error = this.validateFields();
    if (!error) {
      let options = this.getProcessedOptions();
      let obj = this.getPostData(options);
      // for device based
      if (this.modalData.collectionType == 'device-based') {
        this.apiService.postCollectOnly(obj).subscribe(data => {
          this.router.navigate(['/main/collection']);
        });
      } else if (this.modalData['collectionType'] == 'solution-based') {
        // for solutions based
        let profileId = this.modalData['profileId'];
        let subProfileId = this.modalData['subProfileId'];
        this.apiService
          .postCollectSolution(profileId, subProfileId, obj)
          .subscribe(data => {
            this.router.navigate(['/main/collection']);
          });
      }
    }
  }

  /*********************************************/
  /* Method to consolidate data that will be
  /* sent to backend for collecting
  /*********************************************/
  getPostData(options) {
    let obj = this.modalData['obj'];
    obj['collectOptions'] = options;
    obj['queryName'] = options['projectName'];
    obj['jobId'] = '';
    obj['passPhrase'] = this.settingsPassPhrase;
    obj['use_credentials'] = this.dataService.useCredentials; //added useCredential for validation
    return obj;
  }

  /*********************************************/
  /* Method to process data fields correctly
  /* before passing to backend for collecting
  /*********************************************/
  getProcessedOptions() {
    // make clone of form inputs object
    let options = _.cloneDeep(this.collectOptions);
    // let options = this.collectOptions;
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
    options = this.getAdditionalProcessedOptions(options);
    // return processed object
    return options;
  }

  getAdditionalProcessedOptions(options) {
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

  /***********************************************************
   *  Subscribe to get the subtype which will be responsible
   * to set the purpose in the Collect Option popup.
   **********************************************************/
  subscribeSubType() {
    if (!this.isEditMode() && this.subType) {
      //set default purpose selection
      this.subType.subscribe(title => {
        this.collectOptions.isPerfArchive = this.helper.isContains(
          title,
          this.settings.perfArchive
        );
        this.collectOptions['purpose'] = this.collectOptions.isPerfArchive
          ? this.collectOptions['purposes'][3] // Case Troubleshooting will be selected
          : this.collectOptions['purposes'][0]; // No Purpose will be selected
      });
    }
  }

  /*****************************************************************
   * Responsilble to show the purpose "Inventory Collection" in the
   * Modal Collect for AutoDiscovery only
   *****************************************************************/
  showInventoryCollection(job?: any) {
    const url = new URL(window.location.href);
    //remove inventory collection from others except Auto-Discovery
    if (
      (job && job.purpose === 'Inventory Collection') ||
      url.pathname.includes('discover-ip')
    ) {
      this.collectOptions['purposes'] = Purposes;
    } else {
      const purposes = _.cloneDeep(Purposes);
      this.collectOptions['purposes'] = purposes.filter(
        p => !p.title.includes('Inventory')
      );
    }
  }

  validateProjectName(projectName) {
    if (this.isEditMode()) return;
    // check if project name matches regex
    if (/^$|[^a-zA-Z0-9_]+/g.test(projectName)) {
      this.validation.projectName = true;
      this.errorMsg = this.translate.instant('Clone_error_msg');
    }
    // check if project name is within 20 characters
    else if (projectName.length > 20) {
      this.validation.projectName = true;
      this.errorMsg = this.translate.instant(
        'Collection_modal_length_validationerr'
      );
    }
    // if Project name exists
    else if (_.filter(this.projects, { project_id: projectName }).length) {
      this.validation.projectName = true;
      this.errorMsg = this.translate.instant(
        'Collection_modal_project_exist_err'
      );
    }
  }

  isEditMode() {
    const url = new URL(window.location.href);
    return url.searchParams.get('edit');
  }

  disableSaveAndCollect() {
    return !this.client.features.asupUpload
      ? !this.collectOptions.projectName
      : this.caLaunch
      ? !this.collectOptions.projectName
      : !this.collectOptions.purpose.title || !this.collectOptions.projectName;
  }
}
