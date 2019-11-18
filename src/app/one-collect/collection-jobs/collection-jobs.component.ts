import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { UserService } from 'src/app/services/user/user.service';
import { Subscription } from 'rxjs';
import { GridComponent } from '../grid/grid.component';
import { Settings } from 'src/app/content/settings';
import * as _ from 'lodash';
import { HelperService } from 'src/app/services/helper/helper.service';
declare var $: any;

import { TranslateService } from '../../services/translate/translate.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'oc-collection-jobs',
  templateUrl: './collection-jobs.component.html',
  styleUrls: ['./collection-jobs.component.css']
})
export class CollectionJobsComponent implements OnInit, OnDestroy {
  /*********************************************/
  /* Class properties
  /*********************************************/
  settings: any = Settings;
  // grid related
  grid: any;
  gridDo: any;
  jobs: any[] = [];
  jobsLoaded: boolean = false;
  showAll: boolean = false;
  refresh: any;
  hosted: boolean = false;
  activeUser: any;

  // notification modal
  notification: any;
  removeJobId: number;

  // pagination
  pages: any[] = [];
  currentPage: number = 1;
  totalJobs: number = 0;
  jobsInPage: number = 0;
  start: number = 0;
  interval: number = 20;
  next: boolean = false;

  // property for ASUP upload
  enableASUP: boolean = false;
  settingsSubscription: Subscription;
  setIdx: number;

  // tour properties
  tourStarted: boolean = false;

  caLaunch: boolean = environment.caLaunch;
  fields: any[];
  // CA selected jobs
  selectedJobs: any[] = [];

  //For onecollect settings
  enableOneCollect: any = false;
  enableOneCollectSubscription: Subscription;

  //configcompare
  showConfigButton: boolean;
  config_selectedjobs: any[] = [];

  //Check jobs avaialble
  jobsAvailable: any = true;
  colSpanPagination: number;

  client: any = environment.client;

  /*********************************************/
  /* Constructor method
  /*********************************************/
  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private userService: UserService,
    private helper: HelperService,
    private router: Router,
    private translate: TranslateService
  ) {
    // detect changes in settings model to reflect in enableASUP
    this.settingsSubscription = dataService.settingsChanged$.subscribe(
      preferences => {
        this.enableASUP = preferences['enableASUP'];
      }
    );
  }

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {
    if (this.caLaunch) {
      this.showConfigButton = false;
      this.enableOneCollect = this.dataService.getEnableOneCollect();
      this.enableOneCollectSubscription = this.dataService.modalCustomOC$.subscribe(
        ocvalue => {
          this.enableOneCollect = ocvalue;
        }
      );
    }
    this.hosted = this.dataService.appMeta.hosted;
    this.activeUser = this.userService.getActiveUser();
    this.gridSetup();
    this.getAsupFromSettings();
    this.paginate();
  }

  /*********************************************/
  /* Lifecycle hook OnDestroy
  /*********************************************/
  ngOnDestroy() {
    this.clearJobReload();
    if (this.caLaunch) {
      this.enableOneCollectSubscription.unsubscribe();
    }
    this.settingsSubscription.unsubscribe();
    if (this.grid.processClick) {
      document
        .getElementsByTagName('body')[0]
        .removeEventListener('click', this.grid.processClick);
    }
  }

  /*********************************************/
  /* Method to bootstrap grid
  /*********************************************/
  gridSetup() {
    this.grid = new GridComponent();
    let actionsWidth;
    if (!this.caLaunch) {
      actionsWidth = '100px';
    } else {
      actionsWidth = '145px';
    }
    this.grid.mergeMeta({
      tableId: 'collection-jobs',
      tableStriped: false,
      messages: true,
      actionsWidth: actionsWidth,
      showBottomScroll: false
    });

    this.grid.headers = [
      {
        width: '100px',
        title: this.translate.instant('Jobspage_table_col10'),
        key: 'user',
        hidden: !this.hosted || !this.activeUser.is_superuser
      },
      {
        width: '110px',
        title: this.translate.instant('Jobspage_table_col2'),
        key: 'group'
      },
      {
        width: '115px',
        title: this.translate.instant('Jobspage_table_col3'),
        key: 'project_id'
      },
      {
        width: '140px',
        title: this.translate.instant('Jobspage_table_col4'),
        key: 'name'
      },
      {
        width: '130px',
        title: this.translate.instant('Jobspage_table_col5'),
        key: 'profile'
      },
      {
        width: '120px',
        title: this.translate.instant('Jobspage_table_col6'),
        key: 'progress',
        filter: false
      },
      {
        width: '170px',
        title: this.translate.instant('Jobspage_table_col7'),
        key: 'start_time',
        filter: false
      },
      {
        width: '170px',
        title: this.translate.instant('Jobspage_table_col8'),
        key: 'end_time',
        filter: false
      },
      {
        width: '100px',
        title: this.translate.instant('Jobspage_table_col9'),
        key: 'status'
      }
    ];

    this.grid.initGrid();

    this.gridDo = (action, index, value?) => {
      this.jobs = this.grid.gridDo(action, this.jobs, index, value);
    };
    this.colSpanPagination =
      this.hosted && this.activeUser.is_superuser
        ? this.grid.meta.msgColSpan
        : this.grid.meta.msgColSpan - 1;
  }

  /*********************************************/
  /* Method to dynamically show actions button
  /* based on additional actions
  /*********************************************/
  isMoreActions(index) {
    let job = this.jobs[index];
    if (
      job.saved &&
      job.status != 'In progress' &&
      job.profile != 'Performance'
    ) {
      // Re-run job
      return true;
    } else if (job.status != 'In progress' && job.profile != 'Performance') {
      // Remove job
      return true;
    } else if (
      job.status != 'Failed' &&
      job.status != 'In progress' &&
      job.status != 'Terminated' &&
      (job.profile == 'AutoSupport' || job.profile == 'Component Based')
    ) {
      // IMT Advise
      return true;
    } else if (
      job.status == 'In progress' &&
      job.profile != 'Performance' &&
      job.progress >= 1
    ) {
      // Terminate job
      return true;
    } else if (
      job.asup_status == 'Uploaded' ||
      job.asup_status == 'Completed'
    ) {
      // Cluster view
      return true;
    }
    return false;
  }

  /*********************************************/
  /* Method to change route for new collections
  /* view
  /*********************************************/
  changeRoute(uri) {
    uri = '/' + uri;
    this.router.navigate([uri]);
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
    this.apiService.getPreferences().subscribe(preferences => {
      preferences = JSON.parse(
        preferences.preference == null ? '{}' : preferences.preference
      )['basic'];
      if (_.has(preferences, 'enableASUP')) {
        this.enableASUP = preferences.enableASUP;
      } else {
        this.enableASUP = true;
      }
    });
  }

  /*********************************************/
  /* Method to stop auto-refresh of jobs
  /*********************************************/
  clearJobReload() {
    if (this.refresh) {
      clearInterval(this.refresh);
    }
    this.refresh = null;
  }

  /*********************************************/
  /* Method to set IMT job and change to IMT tab
  /*********************************************/
  navigatetoImtAdvise(i) {
    let job = this.jobs[i];
    let jobName = job.name;
    this.apiService.getJobLog(jobName).subscribe(data => {
      // to get host name from every job which is running and
      // setting to newJob object for IMT Advisor UI
      let components = JSON.parse(data.components);
      let newJob = _.assignIn(job, { components: components });
      this.dataService.setImtJob(newJob);
      $('#imtadvise').css('display', 'block');
      this.router.navigate(['/main/imtadvise']);
    });
  }

  /*********************************************/
  /* Method to generate pagination links
  /*********************************************/
  paginate(cb?) {
    // get total jobs to generate pagination
    this.apiService.getJobsCount().subscribe(data => {
      let jobCount = data.count;
      this.totalJobs = jobCount;
      let pages = Math.floor(jobCount / this.interval);
      let remainder = jobCount % this.interval;
      // add an extra page if there is a remainder
      if (remainder != 0) {
        pages += 1;
      }
      this.pages = _.range(1, pages + 1);
      // Get the first set of jobs
      this.getJobs(this.start, this.interval);
      // run any callback if any
      if (cb) {
        cb();
      }
    });
  }

  /*********************************************/
  /* Method to fetch all jobs and add meta data
  /*********************************************/
  getJobs(start, interval) {
    // clear subscriptions for job updates
    this.clearJobReload();
    this.apiService.getJobsList(start, interval).subscribe(data => {
      if (this.caLaunch) {
        this.totalJobs = data.count;
        if (data.jobs.length > 0) {
          this.jobsAvailable = true;
        } else {
          this.jobsAvailable = false;
        }
      }

      this.jobsLoaded = true;
      this.jobs = data.jobs;
      if (data.jobs.length) {
        this.dataService.setTopBar(true);
      } else {
        this.showNewCollection();
      }

      if (this.caLaunch) {
        let jobs = data.jobs;
        this.jobs = _.map(jobs, job => {
          if (this.selectedJobs.length > 0) {
            if (this.selectedJobs.indexOf(job.name) !== -1) {
              return _.extend(job, {
                show: false,
                components: [],
                checked: true
              });
            } else {
              return _.extend(job, {
                show: false,
                components: [],
                checked: false
              });
            }
          } else {
            return _.extend(job, {
              show: false,
              components: [],
              checked: false
            });
          }
        });
      }

      _.forEach(this.jobs, (job, i) => {
        job['showRow'] = true;
        job['showMessage'] = false;
        job['showActions'] = false;
        job['components'] = [];
        this.helper.setPerfArchive(job, 'component_category');
      });

      // set pagination property values
      this.jobsInPage = this.jobs.length;
      this.start = start;
      this.currentPage = Math.floor(start / interval) + 1;
      let lastPage = this.pages[this.pages.length - 1];
      if (this.start != (lastPage - 1) * this.interval) {
        this.next = true;
      } else {
        this.next = false;
      }

      // auto-update progress
      if (!this.refresh) {
        this.refresh = setInterval(() => {
          this.refreshJobs(start, interval);
        }, 5000);
      }
    });
  }
  showNewCollection() {
    this.router.navigate(
      this.client.features.purposeBasedCollection
        ? ['main/purposes']
        : ['main/new-collection/device-based']
    );
  }

  //**CA Code
  setJob(job) {
    if (this.selectedJobs.indexOf(job.name) == -1) {
      if (job.checked) {
        this.selectedJobs.push(job.name);
      }
      _.forEach(this.jobs, (value1, key1) => {
        if (this.jobs[key1]['name'] == job.name) {
          if (this.jobs[key1]['profile'] == 'AutoSupport') {
            this.config_selectedjobs.push(job.name);
          }
          if (this.jobs[key1]['profile'] == 'ONTAP') {
            this.config_selectedjobs.push(job.name);
          }
        }
      });
    } else {
      if (!job.checked) {
        var index = this.selectedJobs.indexOf(job.name, 0);
        var config_index = this.config_selectedjobs.indexOf(job.name, 0);
        if (index > -1) {
          this.selectedJobs.splice(index, 1);
        }
        if (config_index > -1) {
          this.config_selectedjobs.splice(config_index, 1);
        }
      }
    }
    if (this.config_selectedjobs.length == 2) {
      this.showConfigButton = true;
    } else {
      this.showConfigButton = false;
    }
    this.sendSelectedJobs(this.selectedJobs, this.config_selectedjobs);
    console.log('config button' + this.showConfigButton);
  }

  /*********************************************/
  /* Method to refresh jobs meta data
  /*********************************************/
  refreshJobs(start, interval) {
    this.apiService.getJobsList(start, interval).subscribe(data => {
      let jobs = data.jobs;
      if (data.jobs.length) {
        this.dataService.setTopBar(true);
      }
      let addedNewJob = false;
      // reverse loop to add new jobs to front of array
      _.forEachRight(jobs, (job, i) => {
        // find the job by name
        let existingJob = _.find(this.jobs, { name: job.name });
        if (existingJob) {
          // get job log if existingJob is open
          if (existingJob['showMessage'] && existingJob['progress'] < 100) {
            this.getJobLog(i);
          }
          if (parseInt(job['progress']) == 0) {
            job['progress'] = 2;
          }
          // update the values for the project
          existingJob['progress'] = job['progress'];
          if (job['status'] == 'Failed') {
            existingJob['progress'] = 100;
          }
          existingJob['status'] = job['status'];
          existingJob['end_time'] = job['end_time'];
        } else {
          addedNewJob = true;
          // add custom properties
          _.extend(job, { showMessage: false, components: [], showRow: true });
          // the job is new so add it to the top
          this.jobs.unshift(job);
          // update pagination fields
          this.totalJobs++;
          this.jobsInPage++;
          // check if total jobs exceeds limit per page
          if (this.jobs.length > this.interval) {
            this.jobs.pop();
            this.jobsInPage--;
          }
        }
      });
      if (addedNewJob) {
        this.paginate();
      }
    });
  }

  /*********************************************/
  /* Method to fetch job log and add meta data
  /*********************************************/
  getJobLog(idx, scroll = true) {
    // when job is still not set return
    if (!_.has(this.jobs[idx], 'name')) {
      return;
    }
    let jobName = this.jobs[idx]['name'];
    this.apiService.getJobLog(jobName).subscribe(data => {
      let components = data.components;
      if (!components) {
        components = {};
      } else {
        components = JSON.parse(components);
      }
      // check if there are any components to iterate over
      if (!_.isEmpty(components)) {
        _.forEach(components, (component, host) => {
          // check if component is already pushed in array
          let existingComponent = _.find(this.jobs[idx]['components'], {
            host: host
          });
          if (existingComponent) {
            // only update the progress and status when it exists
            let index = existingComponent['index'];
            if (parseInt(component['progress']) == 0) {
              component['progress'] = 2;
            }
            this.jobs[idx]['components'][index]['progress'] =
              component['progress'];
            this.jobs[idx]['components'][index]['status'] = component['status'];
            this.jobs[idx]['components'][index]['file_path'] =
              component['file_path'];
          } else {
            // since component is not there, push in a new one
            component['host'] = host;
            component['index'] = this.jobs[idx]['components'].length;
            this.jobs[idx]['components'].push(component);
          }
        });
      }
      // update log if available
      if (data['log']) {
        let lines = data.log.split('\n');
        let log = '';
        _.forEach(lines, line => {
          if (line.startsWith('Executed')) {
            log += "<span class='log-line pass'>" + line + '</span>';
          } else {
            log += "<span class='log-line fail'>" + line + '</span>';
          }
        });
        this.jobs[idx]['log'] = log;
      } else {
        this.jobs[idx]['log'] = this.translate.instant('Jobspage_log_nojob');
      }
      if (scroll) {
        this.scrollBottom(idx);
      }
    });
  }

  /*********************************************/
  /* Method to get job log based on whether
  /* it is for all jobs or just one job
  /*********************************************/
  dispatchJobLog(idx = 'all') {
    if (idx == 'all') {
      for (let i = 0; i < this.jobs.length; i++) {
        // request job log only if it was not requested earlier
        if (!_.has(this.jobs[i], 'log')) {
          this.getJobLog(i);
        } else {
          this.scrollBottom(i);
        }
      }
    } else {
      if (!_.has(this.jobs[idx], 'log')) {
        this.getJobLog(idx);
      } else {
        this.scrollBottom(idx);
      }
    }
  }

  /*********************************************/
  /* Method to confirm job removal from list
  /*********************************************/
  confirmRemoveJob(event) {
    // do nothing if there is no jobId that has been set for deletion
    if (this.removeJobId != 0 && !this.removeJobId) {
      return;
    }
    // proceed to delete otherwise
    let idx = this.removeJobId;
    let jobName = this.jobs[idx]['name'];
    this.apiService.deleteJob(jobName).subscribe(jobs => {
      let checkPage = () => {
        if (this.pages.indexOf(this.currentPage) != -1) {
          // get jobs for present page since the page exists
          this.getJobs(this.start, this.interval);
        } else {
          // get jobs for previous page
          let newStart = this.start - this.interval;
          if (newStart >= 0) {
            this.getJobs(this.start - this.interval, this.interval);
          } else {
            this.getJobs(0, this.interval);
          }
        }
      };
      // reset pagination
      this.paginate(checkPage);
    });
  }

  /*********************************************/
  /* Method to initiate job removal by
  /* displaying confirmation modal
  /*********************************************/
  removeJob(idx) {
    this.removeJobId = idx;
    this.notification = {
      title: this.translate.instant('Jobpage_del_title'),
      message:
        this.translate.instant('Jobspage_del_msg') +
        `<br/><span style="color:red">${this.jobs[idx]['name']}</span>`,
      confirm: true
    };
    this.helper.showModalPopup('#remove-job');
    // set focus to confirm button so that user can press
    // enter key to delete instead of click by mouse
    $('#remove-job').on('shown.bs.modal', event => {
      $('#remove-job .confirm').focus();
    });
  }

  /*********************************************/
  /* Method to stop collecting job
  /*********************************************/
  stopCollecting(idx) {
    let jobName = this.jobs[idx].name;
    this.apiService.stopCollecting(jobName).subscribe(data => {
      // do something
    });
  }

  /*********************************************/
  /* Callback to re-initiate job after checking
  /* connectivity to ASUP network
  /*********************************************/
  playJob = idx => {
    let jobName = this.jobs[idx]['project_id'];
    if (jobName) {
      this.apiService.playJob(jobName).subscribe(data => {
        this.getJobs(this.start, this.interval);
        // reset pagination
        this.paginate();
      });
    }
  };

  /*********************************************/
  /* Method to navigate to job's data view
  /*********************************************/
  viewData(job, component = null) {
    this.dataService.setDataView(job, component);
    this.router.navigate(['/main/data-view/']);
  }

  /*********************************************/
  /* Method to scroll to bottom of content for
  /* job log
  /*********************************************/
  scrollBottom(i) {
    setTimeout(() => {
      let selector = $(`.log-view:eq(${i}) div.textarea`);
      let pos = selector.get(0).scrollHeight;
      selector.scrollTop(pos);
    }, 0);
  }

  /*********************************************/
  /* Method to show all component details for
  /* all jobs
  /*********************************************/
  viewMessages() {
    this.showAll = true;
    _.forEach(this.jobs, (obj, i) => {
      obj['showMessage'] = true;
    });
    this.dispatchJobLog();
  }

  /*********************************************/
  /* Method to hide all component details for
  /* all jobs
  /*********************************************/
  hideMessages() {
    this.showAll = false;
    _.forEach(this.jobs, (obj, i) => {
      obj['showMessage'] = false;
    });
  }

  /*********************************************/
  /* Method to show component details for
  /* specified job
  /*********************************************/
  viewMessage(i) {
    this.jobs[i]['showMessage'] = true;
    this.dispatchJobLog(i);
  }

  /*********************************************/
  /* Method to hide component details for
  /* specified job
  /*********************************************/
  hideMessage(i) {
    this.jobs[i]['showMessage'] = false;
  }

  /*********************************************/
  /* Method to check connectivity to ASUP
  /*********************************************/
  checkLiveStatus(callback, idx) {
    this.setIdx = idx;
    let job = this.jobs[idx];
    // check if enableASUP is checked in settings
    if (this.enableASUP) {
      // check if user object is available in browser
      if (this.dataService.getUserData()) {
        // continue next level check if api server has session for user
        this.apiService.getLiveStatus().subscribe(response => {
          if (response.status == 200) {
            // process request for search data
            callback(idx);
          } else {
            if (!this.caLaunch) {
              this.showSsoModal(idx);
            } else {
              if (
                job.profile == 'Component Based' ||
                job.profile == 'SnapCenter'
              ) {
                this.showSsoModal(idx);
              } else {
                callback(idx);
              }
            }
          }
        });
      } else {
        if (!this.caLaunch) {
          this.showSsoModal(idx);
        } else {
          if (job.profile == 'Component Based' || job.profile == 'SnapCenter') {
            this.showSsoModal(idx);
          } else {
            callback(idx);
          }
        }
      }
    } else {
      callback(idx);
    }
  }

  ////CA CODE///

  viewAnalyze(job) {
    this.router.navigate(['/main/job/' + job.name]);
  }

  navigateToCollection() {
    this.router.navigate(['/new-collection/solution-based']);
  }

  navigateToConfigCompareTab() {
    if (this.selectedJobs.length == 0) {
      this.showConfigButton = false;
      // show the notification modal
    } else if (this.selectedJobs.length == 1 || this.selectedJobs.length >= 3) {
      this.showConfigButton = false;
    } else {
      this.showConfigButton = true;
      this.router.navigate(['/configCompare'], {
        queryParams: { Job1: this.selectedJobs[0], Job2: this.selectedJobs[1] }
      });
    }
  }

  //Send selcted jobs to dataservice
  sendSelectedJobs(selectedJobs, configCompareJobs) {
    this.dataService.selectedJobs(selectedJobs);
    this.dataService.sendConfigCompareJobs(configCompareJobs);
  }

  /**
   * SSO Modal will be shown if the components for the perticular device
   * does not contain PERFARCHIEVE in the components otherwise it will skip
   * login process.
   * @param idx : row index
   */
  showSsoModal(idx: number) {
    if (this.jobs[idx].isPerfArchive || !this.client.features.asupUpload) {
      document.getElementById('btnSkip').click();
    } else {
      this.helper.showModalPopup('#sso-modal');
    }
  }
}
