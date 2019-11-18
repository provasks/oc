import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { GridComponent } from '../grid/grid.component';
import { HelperService } from 'src/app/services/helper/helper.service';
import { Settings } from 'src/app/content/settings';

import { Subscription } from 'rxjs';
import * as _ from 'lodash';
declare var $: any;

import { TranslateService } from '../../services/translate/translate.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'oc-upload-asup',
  templateUrl: './upload-asup.component.html',
  styleUrls: ['./upload-asup.component.css']
})
export class UploadAsupComponent implements OnInit, OnDestroy {
  settings: any = Settings;
  // grid related
  grid: any;
  gridDo: any;
  jobs: any[] = [];
  jobsLoaded: boolean = false;
  metaData: any = {};
  tokenData: any = {};
  userData: any;
  formData: any;
  uploadType: any;
  notification: any;
  start: number = 0;
  interval: number = 20;
  refresh: any;
  next: boolean = false;
  countSelected: number;
  checkAll: boolean;
  disableCheckAll: boolean = false;
  storedRows: any[] = [];
  selected: any = '';

  // tour properties
  tourStarted: boolean = false;
  client: any = environment.client;

  /*********************************************/
  /* Constructor
  /*********************************************/
  constructor(
    public apiService: ApiService,
    public dataService: DataService,
    private helper: HelperService,
    public router: Router,
    private translate: TranslateService
  ) {}

  /*********************************************/
  /* On bootstrapping component
  /*********************************************/
  ngOnInit() {
    if (!this.client.features.asupUpload) return;
    this.gridSetup();
    this.metaData['caseId'] = '';
    this.metaData['comments'] = '';
    this.getJobs(this.start, this.interval);
  }

  /*********************************************/
  /* On destroying component
  /*********************************************/
  ngOnDestroy() {
    this.clearJobReload();
  }

  /*********************************************/
  /* Method to bootstrap grid
  /*********************************************/
  gridSetup() {
    this.grid = new GridComponent();

    this.grid.mergeMeta({
      tableId: 'upload-asup',
      tableStriped: false,
      actionsWidth: '100px',
      showBottomScroll: false,
      selectAll: true
    });

    this.grid.headers = [
      {
        width: '150px',
        title: this.translate.instant('Job Name'),
        key: 'name'
      },
      {
        width: '150px',
        title: this.translate.instant('SPM Project ID'),
        key: 'spm_project_id'
      },
      {
        width: '150px',
        title: this.translate.instant('Profile'),
        key: 'profile'
      },
      {
        width: '180px',
        title: this.translate.instant('Start Time'),
        key: 'start_time',
        filter: false
      },
      {
        width: '180px',
        title: this.translate.instant('End Time'),
        key: 'end_time',
        filter: false
      },
      {
        width: '150px',
        title: this.translate.instant('Status'),
        key: 'status'
      },
      {
        width: '150px',
        title: this.translate.instant('Upload Status'),
        key: 'asup_status'
      }
    ];

    this.grid.initGrid();

    this.gridDo = (action, index, value?) => {
      this.jobs = this.grid.gridDo(action, this.jobs, index, value);
    };
  }

  /*********************************************/
  /* Method to initialize component tour
  /*********************************************/
  toggleTour(state) {
    this.tourStarted = state;
  }

  /*********************************************/
  /* Method to stop auto-reload of jobs
  /*********************************************/
  clearJobReload() {
    if (this.refresh) {
      clearInterval(this.refresh);
    }
    this.refresh = null;
  }

  /*********************************************/
  /* Method to get ASUP jobs 
  /*********************************************/
  getJobs(start, interval) {
    this.start = start;
    this.clearJobReload();
    this.apiService.getAsupJobsList(start, interval).subscribe(data => {
      this.jobsLoaded = true;
      let jobs = data.jobs;
      this.jobs = _.map(jobs, function(job) {
        return _.extend(job, { select: false, disabled: false, showRow: true });
      });
      // get total items in next page to enable/disable next button pagination
      this.apiService
        .getAsupJobsList(start + interval, interval)
        .subscribe(data => {
          let jobs = data.jobs;
          if (jobs.length) {
            this.next = true;
          } else {
            this.next = false;
          }
        });
      // auto-update progress
      if (!this.refresh) {
        this.refresh = setInterval(() => {
          this.refreshJobs(start, interval);
        }, 2000);
      }
    });
  }

  /*********************************************/
  /* Method to auto-refresh ASUP jobs 
  /*********************************************/
  refreshJobs(start, interval) {
    this.apiService.getAsupJobsList(start, interval).subscribe(data => {
      let jobs = data.jobs;
      // reverse loop to add new jobs to front of array
      _.forEachRight(jobs, (job, i) => {
        // find the job by name
        let existingJob = _.find(this.jobs, { name: job.name });
        if (existingJob) {
          // update the values for the project
          existingJob['end_time'] = job['end_time'];
          existingJob['status'] = job['status'];
          existingJob['asup_status'] = job['asup_status'];
        } else {
          // add custom properties
          _.extend(job, { select: false, disabled: false, showRow: true });
          // the job is new so add it to the top
          this.jobs.unshift(job);
        }
      });
    });
  }

  /*********************************************/
  /* Method to check SSO login and whether 
  /* api server has session of user
  /*********************************************/
  checkLiveStatus(callback) {
    // check if user object is available in browser
    if (this.dataService.getUserData()) {
      // continue next level check if api server has session for user
      this.apiService.getLiveStatus().subscribe(response => {
        if (response.status == 200) {
          // process request for search data
          callback();
        } else {
          this.showSsoModal();
        }
      });
    } else {
      this.showSsoModal();
    }
  }

  /*********************************************/
  /* Method called after SSO login to process
  /* job upload or file upload
  /*********************************************/

  processRequest(validated) {
    if (validated) {
      if (this.uploadType == 'Job Upload') {
        this.checkLiveStatus(this.jobUploadCallback);
      } else if (this.uploadType == 'File Upload') {
        this.checkLiveStatus(this.fileUploadCallback);
      }
    }
  }

  /*********************************************/
  /* Callback for success on uploading to ASUP
  /*********************************************/
  uploadSuccess() {
    this.notification = {
      title: this.translate.instant('Manual_Upload_modaltitle'),
      message: this.translate.instant('Manual_Upload_modalmsg'),
      color: 'green'
    };
    this.helper.showModalPopup('#asup-upload-status');
  }

  /*********************************************/
  /* Callback on failure to upload to ASUP
  /*********************************************/
  uploadFailed() {
    this.notification = {
      title: this.translate.instant('Manual_Upload_modaltitle'),
      message: this.translate.instant('Manual_Upload_modalfailed'),
      color: 'red'
    };
    this.helper.showModalPopup('#asup-upload-status');
  }

  /*********************************************/
  /* Callback on failed validation of file for
  /* upload to ASUP
  /*********************************************/
  uploadFailedValidation() {
    this.notification = {
      title: this.translate.instant('Manual_Upload_modaltitle'),
      message: this.translate.instant('Manual_Upload_modal_file'),
      color: 'red'
    };
    this.helper.showModalPopup('#asup-upload-status');
  }

  /*********************************************/
  /* Callback to upload ASUP jobs
  /*********************************************/
  jobUploadCallback = () => {
    let data = {};
    data['files'] = this.getFilesFromSelectedJobs();
    data['caseId'] = this.metaData['caseId'];
    data['opportunityId'] = this.metaData['opportunityId'];
    data['comments'] = this.metaData['comments'];
    data['token'] = this.tokenData['token'];
    let firstSelectedJob = _.find(this.jobs, { selected: true });
    if (firstSelectedJob['profile'] == 'Performance') {
      data['project_name'] = firstSelectedJob['name'];
      data['project_group'] = firstSelectedJob['group'];
    } else {
      data['project_name'] = '';
      data['project_group'] = '';
    }

    let processUpload = () => {
      if (firstSelectedJob['profile'] == 'Performance') {
        this.apiService.uploadToPerfAsup(data).subscribe(
          response => {
            this.uploadSuccess();
          },
          error => {
            this.uploadFailed();
          }
        );
      } else {
        this.apiService.uploadToAsup(data).subscribe(
          response => {
            this.uploadSuccess();
          },
          error => {
            this.uploadFailed();
          }
        );
      }
    };

    // check ASUP status and then process upload
    this.apiService.checkInternet().subscribe(
      response => {
        let data = response.body;
        if (typeof data !== 'object') {
          data = JSON.parse(data);
        }
        if (data.Network) {
          processUpload();
        } else {
          this.uploadFailed();
        }
      },
      error => {
        this.uploadFailed();
      }
    );
  };

  /*********************************************/
  /* Method to initiate ASUP job upload
  /*********************************************/
  initiateAsupUpload(e) {
    this.uploadType = 'Job Upload';
    this.checkLiveStatus(this.jobUploadCallback);
  }

  initiateAsupUploadWithoutCheck(e) {
    this.uploadType = 'Job Upload';
    this.jobUploadCallback();
  }

  /*********************************************/
  /* Method to show meta data modal for caseID
  /* and comments
  /*********************************************/
  showMetaDataModal() {
    // check if performance is selected
    let firstSelectedRow = _.find(this.jobs, { selected: true });
    if (firstSelectedRow['profile'] == 'Performance') {
      let projectName = firstSelectedRow['name'];
      this.apiService.isTokenAvailableAndValid(projectName).subscribe(data => {
        if (data['is_valid']) {
          this.initiateAsupUploadWithoutCheck(true);
        } else {
          this.helper.showModalPopup('#modal-token');
        }
      });
    } else {
      this.helper.showModalPopup('#upload-asup-modal');
    }
  }

  /*********************************************/
  /* Method to build files string 
  /* of selected jobs
  /*********************************************/
  getFilesFromSelectedJobs() {
    let files = '';
    _.forEach(this.jobs, job => {
      if (job['selected']) {
        let components = JSON.parse(job['components']);
        _.forEach(components, (component, key) => {
          files += component['file_path'] + ',';
        });
      }
    });
    // remove trailing comma
    files = files.replace(/,$/g, '');
    return files;
  }

  checkProfileType(idx) {
    let currentRowSelected = this.jobs[idx]['selected'];
    // store selected row in storedRows
    if (currentRowSelected) {
      this.storedRows.push(idx);
    } else {
      let itemIdx = this.storedRows.indexOf(idx);
      if (itemIdx > -1) {
        this.storedRows.splice(itemIdx, 1);
      }
    }
    // disable selection of all other jobs if selected
    // row has profile of performance
    if (this.jobs[idx]['profile'] == 'Performance') {
      if (currentRowSelected) {
        this.checkAll = false;
        this.disableCheckAll = true;
      } else {
        this.disableCheckAll = false;
      }
      _.forEach(this.jobs, (job, i) => {
        if (i != idx) {
          if (currentRowSelected) {
            this.selected = 'performance';
            this.jobs[i]['disabled'] = true;
            this.jobs[i]['selected'] = false;
          } else {
            this.selected = '';
            this.jobs[i]['disabled'] = false;
            if (this.storedRows.indexOf(i) > -1) {
              this.jobs[i]['selected'] = true;
            }
          }
        }
      });
    }
    this.doCountSelected();
  }

  /*********************************************/
  /* Method to maintain number of selected jobs
  /* in order to enable/disable upload button
  /*********************************************/
  doCountSelected() {
    let count = 0;
    _.forEach(this.jobs, job => {
      if (job['selected']) {
        count++;
      }
    });
    this.countSelected = count;
  }

  /*********************************************/
  /* Method to select/un-select all checkboxes
  /*********************************************/
  toggleChecked() {
    this.checkAll = !this.checkAll;
    // change state for each row
    _.forEach(this.jobs, (job, idx) => {
      if (this.checkAll) {
        if (job['profile'] != 'Performance') {
          job['selected'] = true;
          this.storedRows.push(idx);
        }
      } else {
        job['selected'] = false;
        let itemIdx = this.storedRows.indexOf(idx);
        if (itemIdx > -1) {
          this.storedRows.splice(itemIdx, 1);
        }
      }
    });
    this.doCountSelected();
  }

  /*********************************************/
  /* Method to reset file input so that onChange
  /* event responds to selecting same file again
  /*********************************************/
  resetFileUpload(event) {
    event.target.value = '';
  }

  /*********************************************/
  /* Callback to upload file to ASUP
  /*********************************************/
  fileUploadCallback = () => {
    this.apiService.uploadFileToAsup(this.formData).subscribe(
      response => {
        if (response.status == 200) {
          this.uploadSuccess();
        }
      },
      error => {
        if (error.status == 400) {
          this.uploadFailedValidation();
        } else {
          this.uploadFailed();
        }
      }
    );
  };

  /*********************************************/
  /* Initiate file upload by setting form data
  /* and checking if SSO login is done
  /*********************************************/
  setFileUpload(event) {
    this.uploadType = 'File Upload';
    let files = event.target.files;
    if (files && files.length > 0) {
      let file = files.item(0);
      this.formData = new FormData();
      this.formData.append('select_file', file, file.name);
      this.formData.append('type', 'edit');
      this.checkLiveStatus(this.fileUploadCallback);
    }
  }

  /**
   * SSO Modal will be shown if the components for the perticular device
   * does not contain PERFARCHIEVE in the components otherwise it will skip
   * login process.
   * @param idx : row index
   */
  showSsoModal() {
    if (!this.client.features.asupUpload) {
      document.getElementById('btnSkip').click();
    } else if (this.checkOtherCategoryExceptPerfArchive()) {
      this.helper.showModalPopup('#sso-modal');
    } else {
      document.getElementById('btnSkip').click();
      this.jobUploadCallback();
    }
  }

  /**
   * Check if there are Non-PerfArchive items in the selected job
   */
  checkOtherCategoryExceptPerfArchive() {
    //get the selected Jobs
    let flag = false;
    const selectedJobs = _.filter(this.jobs, job => job.selected);
    _.forEach(selectedJobs, job => {
      const components = JSON.parse(job.components);
      for (let key in components) {
        if (
          !this.helper.isContains(
            components[key].component_category,
            this.settings.perfArchive
          )
        ) {
          flag = true;
          break;
        }
      }
      if (flag) return false;
    });
    return flag;
  }
}
