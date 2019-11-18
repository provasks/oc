import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { UserService } from 'src/app/services/user/user.service';
import { Subscription } from 'rxjs';
import { GridComponent } from '../grid/grid.component';
import * as _ from 'lodash';
declare var $: any;

import { TranslateService } from '../../services/translate/translate.service';
import { environment } from 'src/environments/environment';
import { HelperService } from 'src/app/services/helper/helper.service';

@Component({
  selector: 'oc-collection-projects',
  templateUrl: './collection-projects.component.html',
  styleUrls: ['./collection-projects.component.css']
})
export class CollectionProjectsComponent implements OnInit, OnDestroy {
  text: any = Text;

  /*********************************************/
  /* Class properties
  /*********************************************/
  projects: any[] = [];
  projectsLoaded: boolean = false;
  projectsRefresh: any = null;
  hosted: boolean = false;
  activeUser: any;

  // notification modal
  notification: any;
  removeProjIdx: any;
  removeJobIdx: any;

  // property for ASUP upload
  enableASUP: boolean = false;
  settingsSubscription: Subscription;
  setProjIdx: number;
  setJobIdx: number;

  // tour properties
  tourStarted: boolean = false;

  // CA selected jobs
  selectedJobs: any[] = [];

  //new
  grid: any;
  gridDo: any;
  jobs: any[] = [];
  jobsLoaded: boolean = false;
  showAll: boolean = false;
  refresh: any;
  pages: any[] = [];

  //configcompare
  showConfigButton: boolean;
  config_selectedjobs: any[] = [];
  caLaunch: boolean = environment.caLaunch;

  client: any = environment.client;

  /*********************************************/
  /* Constructor method
  /*********************************************/
  constructor(
    private helper: HelperService,
    private apiService: ApiService,
    private dataService: DataService,
    private userService: UserService,
    private router: Router,
    private translate: TranslateService
  ) {
    //super();
    // detect changes in settings model to reflect in enableASUP
    this.settingsSubscription = dataService.settingsChanged$.subscribe(
      preferences => {
        this.enableASUP = preferences.enableASUP;
      }
    );
  }

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {
    this.showConfigButton = false;
    this.hosted = this.dataService.appMeta.hosted;
    this.activeUser = this.userService.getActiveUser();
    this.getAsupFromSettings();
    this.getProjects();
  }

  /*********************************************/
  /* Lifecycle hook OnDestroy
  /*********************************************/
  ngOnDestroy() {
    this.clearProjectsReload();
    this.clearJobReload('all');
    this.settingsSubscription.unsubscribe();
    _.forEach(this.projects, (project, i) => {
      if (project.grid.processClick) {
        document
          .getElementsByTagName('body')[0]
          .removeEventListener('click', project.grid.processClick);
      }
    });
  }

  /*********************************************/
  /* Method to initialize component tour
  /*********************************************/
  toggleTour(state) {
    this.tourStarted = state;
    this.dataService.tourStartJob$.next(state);
  }

  /*********************************************/
  /* Method to fetch whether auto upload to ASUP
  /* has been enabled in settings
  /*********************************************/
  getAsupFromSettings() {
    this.apiService.getPreferences().subscribe(preferences => {
      preferences = JSON.parse(preferences.preference)['basic'];
      if (_.has(preferences, 'enableASUP')) {
        this.enableASUP = preferences.enableASUP;
      } else {
        this.enableASUP = true;
      }
    });
  }

  /*********************************************/
  /* Method to stop auto-refresh of projects
  /*********************************************/
  clearProjectsReload() {
    if (this.projectsRefresh) {
      clearInterval(this.projectsRefresh);
    }
    this.projectsRefresh = null;
  }

  /*********************************************/
  /* Method to stop auto-refresh of jobs
  /*********************************************/
  clearJobReload(projIdx) {
    let clear = projIdx => {
      let project = this.projects[projIdx];
      if (project.refresh) {
        clearInterval(project.refresh);
      }
      project.refresh = null;
    };

    if (projIdx == 'all') {
      _.forEach(this.projects, (project, i) => {
        clear(i);
      });
    } else {
      clear(projIdx);
    }
  }

  /*********************************************/
  /* Method to set IMT job and change to IMT tab
  /*********************************************/
  navigatetoImtAdvise(projIdx, jobIdx) {
    let project = this.projects[projIdx];
    let job = project.jobs[jobIdx];
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

  getProjects() {
    this.clearProjectsReload();
    this.apiService.getProjectsList().subscribe(data => {
      this.projects = [];
      this.projectsLoaded = true;
      let projects = data.jobs;
      if (!data.jobs.length && this.client.features.purposeBasedCollection) {
        this.router.navigate(['main/purposes']);
        return;
      }
      // add project meta data
      _.forEach(projects, (project, i) => {
        let obj = this.getProjectMeta(project);
        this.projects.push(obj);
      });
      // setup all grids
      _.forEach(this.projects, (project, i) => {
        this.gridSetup(project, i);
      });
      // open the first item by default
      this.toggleProject(0);
    });

    // auto-update progress
    if (!this.projectsRefresh) {
      this.projectsRefresh = setInterval(() => {
        this.refreshProjects();
      }, 5000);
    }
  }

  getProjectMeta(project) {
    let obj = {
      project_id: project.project_id,
      show: false,
      shown: false,
      jobs: [],
      jobsLoaded: false,
      checkAll: false,
      disableCheckAll: false,
      // refresh job data
      refresh: null,
      removeJobIdx: null,
      // pagination related
      pages: [],
      currentPage: 1,
      totalJobs: 0,
      jobsInPage: 0,
      start: 0,
      interval: 5,
      next: false
    };
    if (!obj.project_id) {
      obj.project_id = '__blank';
    }
    obj = _.extend(project, obj);
    return obj;
  }

  /*********************************************/
  /* Method to refresh projects meta data
  /*********************************************/
  refreshProjects() {
    this.apiService.getProjectsList().subscribe(data => {
      let jobs = data.jobs;
      if (data.jobs.length) {
        this.dataService.setTopBar(true);
      }
      // reverse loop to add new jobs to front of array
      _.forEachRight(jobs, (job, jobIdx) => {
        // find the job by name
        if (!job.project_id) {
          job.project_id = '__blank';
        }
        let existingJob = _.find(this.projects, { project_id: job.project_id });
        if (existingJob) {
          if (parseInt(job.progress) == 0) {
            job.progress = 2;
          }
          // update the values for the project
          existingJob.progress = job.progress;
          if (job.status == 'Failed') {
            existingJob.progress = 100;
          }
          existingJob.profile = job.profile;
          existingJob.status = job.status;
          existingJob.end_time = job.end_time;
        } else {
          // add custom properties
          job = this.getProjectMeta(job);
          this.gridSetup(job);
          // the project is new so add it to the top
          this.projects.unshift(job);
        }
      });
    });
  }

  /*********************************************/
  /* Method to bootstrap grid
  /*********************************************/
  gridSetup(project, i = -1) {
    if (i == -1) {
      i = this.projects.length;
    }

    project.grid = new GridComponent();
    let actionsWidth;
    if (!this.caLaunch) {
      actionsWidth = '100px';
    } else {
      actionsWidth = '145px';
    }

    project.grid.mergeMeta({
      tableId: `collection-jobs-${i}`,
      tableStriped: false,
      messages: true,
      actionsWidth: actionsWidth,
      showBottomScroll: true
    });

    project.grid.headers = [
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

    project.grid.initGrid(false);

    project.gridDo = function(action, index, value?) {
      this.jobs = this.grid.gridDo(action, this.jobs, index, value);
    };
  }

  isMoreActions(projIdx, jobIdx) {
    let project = this.projects[projIdx];
    let job = project.jobs[jobIdx];
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
    }
    return false;
  }

  toggleProject(projIdx) {
    let project = this.projects[projIdx];
    if (!project.show) {
      if (!project.shown) {
        this.paginate(projIdx);
        project.shown = true;
      }
      project.show = true;
    } else {
      project.show = false;
    }
  }

  /*********************************************/
  /* Method to generate pagination links
  /*********************************************/
  paginate(projIdx, cb?) {
    let project = this.projects[projIdx];
    // get total jobs for project to generate pagination
    this.apiService
      .getJobsCountForProject(project.project_id)
      .subscribe(data => {
        this.dataService.showLoader();
        let jobCount = data.count;
        project.totalJobs = jobCount;
        let pages = Math.floor(jobCount / project.interval);
        let remainder = jobCount % project.interval;
        // add an extra page if there is a remainder
        if (remainder != 0) {
          pages += 1;
        }
        project.pages = _.range(1, pages + 1);
        // Get the first set of jobs
        this.getJobs(projIdx, project.start, project.interval);
        // run any callback if any
        if (cb) {
          cb();
        }
      });
  }

  /*********************************************/
  /* Method to fetch all jobs and add meta data
  /*********************************************/
  getJobs(projIdx, start, interval) {
    let project = this.projects[projIdx];
    this.dataService.showLoader();
    // clear subscriptions for job updates
    this.clearJobReload(projIdx);
    this.apiService
      .getJobsForProject(project.project_id, start, interval)
      .subscribe(data => {
        this.dataService.hideLoader();
        project.jobsLoaded = true;
        project.jobs = data.jobs;
        if (this.caLaunch) {
          this.jobs = _.map(project.jobs, job => {
            if (this.selectedJobs.length > 0) {
              if (this.selectedJobs.indexOf(job.name) !== -1) {
                return _.extend(job, { checked: true });
              } else {
                return _.extend(job, { checked: false });
              }
            } else {
              return _.extend(job, { checked: false });
            }
          });
        }
        _.forEach(project.jobs, (job, i) => {
          job.showRow = true;
          job.showMessage = false;
          job.showActions = false;
          job.components = [];
          this.helper.setPerfArchive(job, 'component_category');
        });
        // set pagination property values
        project.jobsInPage = project.jobs.length;
        project.start = start;
        project.currentPage = Math.floor(start / interval) + 1;
        let lastPage = project.pages[project.pages.length - 1];
        if (project.start != (lastPage - 1) * project.interval) {
          project.next = true;
        } else {
          project.next = false;
        }

        // auto-update progress
        if (!project.refresh) {
          project.refresh = setInterval(() => {
            this.refreshJobs(projIdx, start, interval);
          }, 5000);
        }
      });
  }

  /*********************************************/
  /* Method to refresh jobs meta data
  /*********************************************/
  refreshJobs(projIdx, start, interval) {
    let project = this.projects[projIdx];
    this.apiService
      .getJobsForProject(project.project_id, start, interval)
      .subscribe(data => {
        let jobs = data.jobs;
        let addedNewJob = false;
        // reverse loop to add new jobs to front of array
        _.forEachRight(jobs, (job, jobIdx) => {
          // find the job by name
          let existingJob = _.find(project.jobs, { name: job.name });
          if (existingJob) {
            // get job log if existingJob is open
            if (existingJob.showMessage && existingJob.progress < 100) {
              this.getJobLog(projIdx, jobIdx);
            }
            if (parseInt(job.progress) == 0) {
              job.progress = 2;
            }
            // update the values for the project
            existingJob.progress = job.progress;
            if (job.status == 'Failed') {
              existingJob.progress = 100;
            }
            existingJob.status = job.status;
            existingJob.end_time = job.end_time;
          } else {
            addedNewJob = true;
            // add custom properties
            _.extend(job, {
              showMessage: false,
              components: [],
              showRow: true
            });
            // the job is new so add it to the top
            project.jobs.unshift(job);
            // update pagination fields
            project.totalJobs++;
            project.jobsInPage++;
            // check if total jobs exceeds limit per page
            if (project.jobs.length > project.interval) {
              project.jobs.pop();
              project.jobsInPage--;
            }
          }
        });
        if (addedNewJob) {
          this.paginate(projIdx);
        }
      });
  }

  /*********************************************/
  /* Method to fetch job log and add meta data
  /*********************************************/
  getJobLog(projIdx, jobIdx, scroll = true) {
    let project = this.projects[projIdx];
    // when job is still not set return
    if (!_.has(project.jobs[jobIdx], 'name')) {
      return;
    }
    let jobName = project.jobs[jobIdx].name;
    this.apiService.getJobLog(jobName).subscribe(data => {
      // parse all components and store in array
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
          let existingComponent = _.find(project.jobs[jobIdx].components, {
            host: host
          });
          if (existingComponent) {
            // only update the progress and status when it exists
            let compIdx = existingComponent.index;
            if (parseInt(component.progress) == 0) {
              component.progress = 2;
            }
            project.jobs[jobIdx].components[compIdx].progress =
              component.progress;
            project.jobs[jobIdx].components[compIdx].status = component.status;
            project.jobs[jobIdx].components[compIdx].file_path =
              component.file_path;
          } else {
            // since component is not there, push in a new one
            component.host = host;
            component.index = project.jobs[jobIdx].components.length;
            project.jobs[jobIdx].components.push(component);
          }
        });
      }
      // update log if available
      if (data.log) {
        let lines = data.log.split('\n');
        let log = '';
        _.forEach(lines, line => {
          if (line.startsWith('Executed')) {
            log += "<span class='log-line pass'>" + line + '</span>';
          } else {
            log += "<span class='log-line fail'>" + line + '</span>';
          }
        });
        project.jobs[jobIdx].log = log;
      } else {
        project.jobs[jobIdx].log = this.translate.instant('Jobspage_log_nojob');
      }
      if (scroll) {
        this.scrollBottom(projIdx, jobIdx);
      }
    });
  }

  /*********************************************/
  /* Method to get job log based on whether
  /* it is for all jobs or just one job
  /*********************************************/
  dispatchJobLog(projIdx, jobIdx = 'all') {
    let project = this.projects[projIdx];
    if (jobIdx == 'all') {
      for (let i = 0; i < project.jobs.length; i++) {
        // request job log only if it was not requested earlier
        if (!_.has(project.jobs[i], 'log')) {
          this.getJobLog(projIdx, i);
        } else {
          this.scrollBottom(projIdx, i);
        }
      }
    } else {
      if (!_.has(project.jobs[jobIdx], 'log')) {
        this.getJobLog(projIdx, jobIdx);
      } else {
        this.scrollBottom(projIdx, jobIdx);
      }
    }
  }

  /*********************************************/
  /* Method to confirm job removal from list
  /*********************************************/
  confirmRemoveJob(event) {
    // do nothing if there is no jobId that has been set for deletion
    if (
      this.removeProjIdx != 0 &&
      !this.removeProjIdx &&
      this.removeJobIdx != 0 &&
      !this.removeJobIdx
    ) {
      return;
    }
    // proceed to delete otherwise
    let projIdx = this.removeProjIdx;
    let jobIdx = this.removeJobIdx;
    let jobName = this.projects[projIdx].jobs[jobIdx].name;

    this.apiService.deleteJob(jobName).subscribe(jobs => {
      let checkPage = () => {
        let project = this.projects[projIdx];
        if (project.pages.indexOf(project.currentPage) != -1) {
          // get jobs for present page since the page exists
          this.getJobs(projIdx, project.start, project.interval);
        } else {
          // get jobs for previous page
          let newStart = project.start - project.interval;
          if (newStart >= 0) {
            this.getJobs(
              projIdx,
              project.start - project.interval,
              project.interval
            );
          } else {
            this.getJobs(projIdx, 0, project.interval);
          }
        }
      };
      // reset pagination
      this.paginate(projIdx, checkPage);
    });
  }

  /*********************************************/
  /* Method to initiate job removal by
  /* displaying confirmation modal
  /*********************************************/
  removeJob(projIdx, jobIdx) {
    this.removeProjIdx = projIdx;
    this.removeJobIdx = jobIdx;
    this.notification = {
      title: this.translate.instant('Jobpage_del_title'),
      message:
        this.translate.instant('Jobspage_del_msg') +
        `<br/><span style="color:red">${this.projects[projIdx].jobs[jobIdx].name}</span>`,
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
  stopCollecting(projIdx, jobIdx) {
    let jobName = this.projects[projIdx].jobs[jobIdx].name;
    this.apiService.stopCollecting(jobName).subscribe(data => {
      // do something
    });
  }

  /*********************************************/
  /* Callback to re-initiate job after checking
  /* connectivity to ASUP network
  /*********************************************/
  playJob = projIdx => {
    let project = this.projects[projIdx];
    let jobName = project.project_id;
    if (jobName) {
      this.apiService.playJob(jobName).subscribe(data => {
        this.getJobs(projIdx, project.start, project.interval);
        // reset pagination
        this.paginate(projIdx);
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
  scrollBottom(projIdx, jobIdx) {
    setTimeout(() => {
      let tableId = `collection-jobs-${projIdx}`;
      let selector = $(`#${tableId} .log-view:eq(${jobIdx}) div.textarea`);
      let pos = selector.get(0).scrollHeight;
      selector.scrollTop(pos);
    }, 0);
  }

  /*********************************************/
  /* Method to show all component details for
  /* all jobs
  /*********************************************/
  viewMessages(projIdx) {
    let project = this.projects[projIdx];
    project.showAll = true;
    _.forEach(project.jobs, (job, i) => {
      job.showMessage = true;
    });
    this.dispatchJobLog(projIdx);
  }

  /*********************************************/
  /* Method to hide all component details for
  /* all jobs
  /*********************************************/
  hideMessages(projIdx) {
    let project = this.projects[projIdx];
    project.showAll = false;
    _.forEach(project.jobs, (job, i) => {
      job.showMessage = false;
    });
  }

  /*********************************************/
  /* Method to show component details for
  /* specified job
  /*********************************************/
  viewMessage(projIdx, jobIdx) {
    this.projects[projIdx].jobs[jobIdx].showMessage = true;
    this.dispatchJobLog(projIdx, jobIdx);
  }

  /*********************************************/
  /* Method to hide component details for
  /* specified job
  /*********************************************/
  hideMessage(projIdx, jobIdx) {
    this.projects[projIdx].jobs[jobIdx].showMessage = false;
  }

  /*********************************************/
  /* Method to check connectivity to ASUP
  /*********************************************/
  checkLiveStatus(callback, projIdx, jobIdx) {
    this.setProjIdx = projIdx;
    this.setJobIdx = jobIdx;
    let project = this.projects[projIdx];
    let job = project.jobs[jobIdx];
    // check if enableASUP is checked in settings
    if (this.enableASUP) {
      // check if user object is available in browser
      if (this.dataService.getUserData()) {
        // continue next level check if api server has session for user
        this.apiService.getLiveStatus().subscribe(response => {
          if (response.status == 200) {
            // process request for search data
            callback(projIdx, jobIdx);
          } else {
            if (!this.caLaunch) {
              this.helper.showModalPopup('#sso-modal');
            } else {
              if (
                job.profile == 'Component Based' ||
                job.profile == 'SnapCenter'
              ) {
                this.helper.showModalPopup('#sso-modal');
              } else {
                callback(projIdx, jobIdx);
              }
            }
          }
        });
      } else {
        if (!this.caLaunch) {
          this.helper.showModalPopup('#sso-modal');
        } else {
          if (job.profile == 'Component Based' || job.profile == 'SnapCenter') {
            this.helper.showModalPopup('#sso-modal');
          } else {
            callback(projIdx, jobIdx);
          }
        }
      }
    } else {
      callback(projIdx, jobIdx);
    }
  }

  //**CA Code**//
  setJob(job) {
    if (this.selectedJobs.indexOf(job.name) == -1) {
      if (job.checked == false) {
        this.selectedJobs.push(job.name);
      }
      _.forEach(this.projects, (project, key1) => {
        let joblist = project.jobs;
        _.forEach(joblist, (value2, each_job) => {
          if (joblist[each_job]['name'] == job.name) {
            if (joblist[each_job]['profile'] == 'AutoSupport') {
              this.config_selectedjobs.push(job.name);
            }
            if (joblist[each_job]['profile'] == 'ONTAP') {
              this.config_selectedjobs.push(job.name);
            }
          }
        });
      });
    } else {
      if (job.checked == true) {
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
  }

  //Send selcted jobs to dataservice
  sendSelectedJobs(selectedJobs, configCompareJobs) {
    this.dataService.selectedJobs(selectedJobs);
    this.dataService.sendConfigCompareJobs(configCompareJobs);
  }

  viewAnalyze(job) {
    this.router.navigate(['/main/job/' + job.name]);
  }
}
