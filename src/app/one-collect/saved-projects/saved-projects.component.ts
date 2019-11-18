import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { UserService } from 'src/app/services/user/user.service';
import { Subscription } from 'rxjs';
import { GridComponent } from '../grid/grid.component';
import { DatePipe } from '@angular/common';

import * as _ from 'lodash';
import { HelperService } from 'src/app/services/helper/helper.service';
declare var $: any;

import { TranslateService } from '../../services/translate/translate.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'oc-saved-projects',
  templateUrl: './saved-projects.component.html',
  styleUrls: ['./saved-projects.component.css']
})
export class SavedProjectsComponent implements OnInit, OnDestroy {
  client: any = environment.client;
  // grid related
  grid: any;
  gridDo: any;
  jobs: any[] = [];
  jobsLoaded: boolean = false;
  hosted: boolean = false;
  activeUser: any;

  // notification modal
  notification: any;
  removeJobIdx: number;

  // property for ASUP upload
  enableASUP: boolean = false;
  settingsSubscription: Subscription;
  setIdx: number;
  cloneJobIdx: number;
  cloneProjectName: any;

  // tour properties
  tourStarted: boolean = false;

  caLaunch: boolean = environment.caLaunch;

  constructor(
    public apiService: ApiService,
    public dataService: DataService,
    public userService: UserService,
    public helper: HelperService,
    public router: Router,
    public datePipe: DatePipe,
    public translate: TranslateService
  ) {
    // detect changes in settings model to reflect in enableASUP
    this.settingsSubscription = dataService.settingsChanged$.subscribe(
      preferences => {
        this.enableASUP = preferences.enableASUP;
      }
    );
  }
  consoleLog(job) {
    console.log('Job: ', job);
    console.log('User: ', this.activeUser);
  }
  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {
    this.hosted = this.dataService.appMeta.hosted;
    this.activeUser = this.userService.getActiveUser();
    this.gridSetup();
    this.getAsupFromSettings();
    this.getJobs();
  }

  /*********************************************/
  /* Lifecycle hook OnDestroy
  /*********************************************/
  ngOnDestroy() {
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

    this.grid.mergeMeta({
      tableId: 'saved-projects',
      tableStriped: false,
      actionsWidth: '90px',
      showBottomScroll: false
    });

    this.grid.headers = [
      {
        width: '100px',
        title: this.translate.instant('Savedproj_table_col6'),
        key: 'user',
        hidden: !this.hosted || !this.activeUser.is_superuser
      },
      {
        width: '200px',
        title: this.translate.instant('Savedproj_table_col2'),
        key: 'name'
      },
      {
        width: '200px',
        title: this.translate.instant('Savedproj_table_col3'),
        key: 'group'
      },
      {
        width: '170px',
        title: this.translate.instant('Savedproj_table_col4'),
        key: 'profileName'
      },
      {
        width: '180px',
        title: this.translate.instant('Savedproj_table_col5'),
        key: 'update_time',
        filter: false
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

  getJobs(cb?) {
    this.apiService.getSavedProjects().subscribe(jobs => {
      this.jobsLoaded = true;
      this.jobs = jobs;
      // extract profiles from jobs
      _.forEach(this.jobs, (job, i) => {
        job.showRow = true;
        job.profileName = job.profile.split(':')[0];
        // this.checkPerfArchiveExists(job);
        this.helper.setPerfArchive(job, 'component_subtype');
      });
      // execute callback if any
      if (cb) {
        cb();
      }
    });
  }

  refreshJobs() {
    this.getJobs();
  }

  editJob(idx) {
    let job = this.jobs[idx];
    let uri = '';
    // set job in dataService
    this.dataService.setJob(job);
    if (job.profile == 'Component Based') {
      // redirect to device-based collection
      uri = '/main/new-collection/device-based/';
    } else if (job.profile == 'Performance') {
      // redirect to performance based collection
      uri = '/main/new-collection/performance/';
    } else {
      // redirect to solution-based collection
      uri = '/main/new-collection/solution-based/';
    }
    this.router.navigate([uri], { queryParams: { edit: job.name } });
  }

  confirmRemoveJob(event) {
    // do nothing if there is no jobId that has been set for deletion
    if (this.removeJobIdx != 0 && !this.removeJobIdx) {
      return;
    }
    // proceed to delete otherwise
    let idx = this.removeJobIdx;
    let jobName = this.jobs[idx].name;
    this.apiService.deleteSavedProject(jobName).subscribe(jobs => {
      // property saved is not there in jobs so we call getJobs instead
      this.getJobs();
    });
  }

  removeJob(idx) {
    this.removeJobIdx = idx;
    this.notification = {
      title: this.translate.instant('Savedproj_del_title'),
      message:
        this.translate.instant('Savedproj_del_msg') +
        `<br/><span style="color:red">${this.jobs[idx].name}</span>
                <br><br>` +
        this.translate.instant('Savedproj_del_msg2'),
      confirm: true
    };
    this.helper.showModalPopup('#remove-job');
  }

  playJob = idx => {
    let job = this.jobs[idx];
    this.apiService.playJob(job.name).subscribe(data => {
      this.router.navigate(['/main/collection/']);
    });
  };

  scheduleJob(idx) {
    let job = this.jobs[idx];
    this.dataService.scheduler(job);
    this.helper.showModalPopup('#schedule-modal');
  }

  initCloneJob(idx) {
    // remove previous open menu
    $('body').click();
    this.cloneProjectName = this.jobs[idx].name;
    this.cloneJobIdx = idx;
    this.helper.showModalPopup('#modal-clone-job');
  }

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
  /**
   * SSO Modal will be shown if the components is not PerfArchive
   * otherwise it will skip login process.
   * @param idx : row index
   */
  showSsoModal(idx: number) {
    if (!this.client.features.asupUpload) {
      document.getElementById('btnSkip').click();
    } else if (this.jobs[idx].isPerfArchive) {
      document.getElementById('btnSkip').click();
    } else {
      this.helper.showModalPopup('#sso-modal');
    }
  }
}
