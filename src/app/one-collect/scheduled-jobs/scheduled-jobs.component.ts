import { Component, OnInit } from '@angular/core';
import { SavedProjectsComponent } from '../saved-projects/saved-projects.component';
import { GridComponent } from '../grid/grid.component';
import * as _ from 'lodash';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { UserService } from 'src/app/services/user/user.service';
import { HelperService } from 'src/app/services/helper/helper.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslateService } from 'src/app/services/translate/translate.service';
declare var $: any;

@Component({
  selector: 'oc-scheduled-jobs',
  templateUrl: './scheduled-jobs.component.html',
  styleUrls: ['./scheduled-jobs.component.css']
})
export class ScheduledJobsComponent extends SavedProjectsComponent
  implements OnInit {
  // property to filter saved jobs that have a schedule
  scheduledJobs: any[] = [];
  scheduledJobsLoaded: boolean = false;
  scheduledJobLink: string = ''; //url for create new scheduled job
  url: any = {
    newJob: '/main/new-collection/device-based',
    jobList: '/main/collection/jobs',
    savedProject: '/main/saved-projects'
  };

  constructor(
    public apiService: ApiService,
    public dataService: DataService,
    public userService: UserService,
    public helper: HelperService,
    public router: Router,
    public datePipe: DatePipe,
    public translate: TranslateService
  ) {
    super(
      apiService,
      dataService,
      userService,
      helper,
      router,
      datePipe,
      translate
    );
  }

  ngOnInit() {
    this.hosted = this.dataService.appMeta.hosted;
    this.gridSetup();
    this.refreshJobs();
  }

  /*********************************************/
  /* Method to bootstrap grid
  /*********************************************/
  gridSetup() {
    this.grid = new GridComponent();

    this.grid.mergeMeta({
      tableId: 'scheduled-jobs',
      tableStriped: false,
      actionsWidth: '90px',
      showBottomScroll: false
    });

    this.grid.headers = [
      {
        width: '100px',
        title: this.translate.instant('Schedule_table_col7'),
        key: 'user',
        hidden: !this.hosted
      },
      {
        width: '150px',
        title: this.translate.instant('Schedule_table_col2'),
        key: 'schedule.project_id'
      },
      {
        width: '150px',
        title: this.translate.instant('Schedule_table_col3'),
        key: 'group'
      },
      {
        width: '100px',
        title: this.translate.instant('Schedule_table_col4'),
        key: 'schedule.rec_pattern'
      },
      {
        width: '150px',
        title: this.translate.instant('Schedule_table_col5'),
        key: 'schedule.start_time',
        filter: false
      },
      {
        width: '150px',
        title: this.translate.instant('Schedule_table_col8'),
        key: 'schedule.next_schedule',
        filter: false
      },
      {
        width: '150px',
        title: this.translate.instant('Schedule_table_col9'),
        key: 'schedule.last_status'
      },
      {
        width: '200px',
        title: this.translate.instant('Schedule_table_col6'),
        key: 'schedule.message'
      }
    ];

    this.grid.initGrid();

    this.gridDo = (action, index, value?) => {
      this.scheduledJobs = this.grid.gridDo(
        action,
        this.scheduledJobs,
        index,
        value
      );
    };
  }

  /*********************************************/
  /* Method to dynamically show actions button 
  /* based on additional actions
  /*********************************************/
  isMoreActions(index) {
    let job = this.scheduledJobs[index];
    if (job.profile != 'Performance') {
      return true;
    }
    return false;
  }

  refreshJobs() {
    this.apiService.getRecordsInfo(this.getScheduledJobs);
  }

  scheduleJob(idx) {
    let job = this.scheduledJobs[idx];
    this.dataService.scheduler(job);
    this.helper.showModalPopup('#schedule-modal');
  }

  /*********************************************/
  /* Method to get scheduled jobs and map them  
  /* with corresponding saved job 
  /*********************************************/
  getScheduledJobs = response => {
    const jobs = [];
    const dataCollectionJobs = response[0];
    const savedJobs = response[1];
    const scheduledJobs = response[2];
    this.scheduledJobsLoaded = true;

    _.forEach(scheduledJobs, scheduledJob => {
      // find the saved job associated with the schedule
      let savedJob = _.find(savedJobs, { name: scheduledJob['project_id'] });
      if (savedJob) {
        // merge scheduleJob with savedJob to access properties in html
        savedJob['schedule'] = scheduledJob;
        // add a custom message for the schedule
        savedJob['message'] = this.getMessage(scheduledJob, savedJob);
        savedJob['showRow'] = true;
        // add the new job to array
        jobs.push(savedJob);
      }
    });
    this.scheduledJobs = jobs;

    //set the url for create scheduled job link when there is no scheduled job
    this.scheduledJobLink = savedJobs.length //if there is any saved project
      ? this.url.savedProject
      : dataCollectionJobs.count //if there is any job
      ? this.url.jobList
      : this.url.newJob; //new job collection page
  };

  /*********************************************/
  /* Method to delete only schedule and 
  /* NOT the project itself
  /*********************************************/
  removeSchedule(idx) {
    this.removeJobIdx = idx;
    this.notification = {
      title: this.translate.instant('Schedule_del'),
      message:
        this.translate.instant('Schedule_delmsg') +
        `<br\><span style="color:red">${
          this.scheduledJobs[idx]['name']
        }</span>`,
      confirm: true
    };
    this.helper.showModalPopup('#remove-schedule');
  }

  /*********************************************/
  /* Method to confirm removal of schedule
  /* This is called by modal output event
  /*********************************************/
  confirmRemoveSchedule(event) {
    // do nothing if there is no jobId that has been set for deletion
    if (this.removeJobIdx != 0 && !this.removeJobIdx) {
      return;
    }
    // proceed to delete schedule otherwise
    let idx = this.removeJobIdx;
    let schedule_id = this.scheduledJobs[idx]['schedule']['schedule_id'];
    this.apiService.deleteScheduledProject(schedule_id).subscribe(projects => {
      this.refreshJobs();
    });
  }

  /*********************************************/
  /* Method to generate custom message 
  /* for given schedule
  /*********************************************/
  getMessage(scheduledJob, savedJob) {
    let message = ``;
    if (scheduledJob['occur'] == 1) {
      message += this.translate.instant('Schedule_msg');
    } else {
      message +=
        this.translate.instant('Schedule_occur') +
        ` ${scheduledJob['occur']}` +
        this.translate.instant('Schedule_times');
    }
    if (scheduledJob['rec_pattern'] == 'hourly') {
      message += this.translate.instant('Schedule_trigger');
      if (scheduledJob['skip_hours'] != 0) {
        if (scheduledJob['skip_hours'] == 1) {
          message += this.translate.instant('Schedule_hour');
        } else {
          message +=
            `${scheduledJob['skip_hours']}` +
            this.translate.instant('Schedule_hours');
        }
      }
      if (scheduledJob['skip_minutes'] != 0) {
        if (scheduledJob['skip_minutes'] == 1) {
          message += this.translate.instant('Schedule_min');
        } else {
          message +=
            `${scheduledJob['skip_minutes']}` +
            this.translate.instant('Schedule_mins');
        }
      }
    } else if (scheduledJob['rec_pattern'] == 'daily') {
      if (scheduledJob['day_skip'] == 1) {
        message += this.translate.instant('Schedule_recurr');
      } else if (scheduledJob['day_skip'] > 1) {
        message +=
          this.translate.instant('Schedule_recurr_every') +
          `${scheduledJob['day_skip']}` +
          this.translate.instant('Schedule_days');
      }
    } else if (scheduledJob['rec_pattern'] == 'weekly') {
      let week_names = scheduledJob['week_names'].replace(/'/g, '"');
      let days = _.keys(JSON.parse(week_names));
      days = this.sortDays(days);
      if (!_.isEmpty(days)) {
        message += this.translate.instant('Schedule_on');
        _.forEach(days, day => {
          message += day + ', ';
        });
        // remove trailing space and comma
        message = message.replace(/, $/g, '');
      }
    }
    if (savedJob['profile'] == 'Performance') {
      message = ``;
      let startDate = this.datePipe.transform(
        scheduledJob['start_time'],
        'medium'
      );
      let endDate = this.datePipe.transform(scheduledJob['end_time'], 'medium');
      let recur = scheduledJob['rec_pattern'];
      message =
        this.translate.instant('Schedule_starts') +
        `${startDate}` +
        this.translate.instant('Schedule_ends') +
        `${endDate}` +
        this.translate.instant('Schedule_recurring') +
        `${recur}`;
      scheduledJob['message'] = message;
    }
    return message;
  }

  /*********************************************/
  /* Method to sort days
  /*********************************************/
  sortDays(days) {
    let dayOrder = {
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
      sun: 7
    };
    // sort days in order
    days.sort((a, b) => {
      let day1 = a.toLowerCase();
      let day2 = b.toLowerCase();
      return dayOrder[day1] > dayOrder[day2];
    });
    // make first alphabet uppercase
    let newDays = [];
    _.forEach(days, day => {
      newDays.push(day.charAt(0).toUpperCase() + day.slice(1));
    });
    return newDays;
  }
}
