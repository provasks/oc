import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
declare var $: any;

import { TranslateService } from '../../services/translate/translate.service';
import { HelperService } from 'src/app/services/helper/helper.service';

@Component({
  selector: 'oc-modal-schedule',
  templateUrl: './modal-schedule.component.html',
  styleUrls: ['./modal-schedule.component.css']
})
export class ModalScheduleComponent implements OnInit, OnDestroy {
  @Output() onSaved = new EventEmitter<boolean>();

  scheduleOptions: any = {};
  messages: any = {};
  hours: any[] = [];
  minutes: any[] = [];
  triggerMinutes: any[] = [];
  seconds: any[] = [];

  scheduleSubscription: Subscription;
  scheduleDefaultSubscription: Subscription;

  scheduleValidation: any = {};
  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    public translate: TranslateService,
    private helper: HelperService
  ) {
    // change default values when loading project's schedule
    this.scheduleSubscription = this.dataService.scheduler$.subscribe(
      project => {
        this.setModalSchedule(project);
      }
    );
  }

  ngOnInit() {
    this.scheduleDefault();
  }

  ngOnDestroy() {
    this.scheduleSubscription.unsubscribe();
  }

  scheduleDefault() {
    //messages
    this.messages.type = '';
    this.messages.status = '';
    // initialize properties
    this.hours = _.range(0, 24);
    this.minutes = _.range(0, 60);
    this.triggerMinutes = _.range(1, 60);
    this.seconds = _.range(0, 60);

    this.scheduleOptions.scheduleProject = true;
    this.scheduleOptions.rec_pattern = 'hourly';
    this.scheduleOptions.weekDays = [
      { title: 'mon', checked: false },
      { title: 'tue', checked: false },
      { title: 'wed', checked: false },
      { title: 'thu', checked: false },
      { title: 'fri', checked: false },
      { title: 'sat', checked: false },
      { title: 'sun', checked: false }
    ];
    this.scheduleOptions.week_names = {};
    this.scheduleOptions.week = {};
    this.scheduleOptions.start_time = '10:10:00';
    this.scheduleOptions.startTimeHours = 10;
    this.scheduleOptions.startTimeMinutes = 10;
    this.scheduleOptions.startTimeSeconds = 0;
    this.scheduleOptions.day_skip = 1;
    this.scheduleOptions.skip_hours = 0;
    this.scheduleOptions.skip_minutes = 1;
    this.scheduleOptions.occur = 1;
    this.scheduleValidation['occurPattern'] = false;
  }

  setModalSchedule(project) {
    // set default values for each job and then override
    this.scheduleDefault();
    // override values from project
    this.scheduleOptions.name = project['name'];
    this.apiService.getScheduleList().subscribe(schedules => {
      // find schedule matching job name
      let schedule = _.find(schedules, { project_id: project['name'] });
      // update schedule options when there is a schedule
      if (schedule) {
        this.scheduleOptions.scheduleProject = true;
        this.scheduleOptions.rec_pattern = schedule.rec_pattern;
        this.scheduleOptions.day_skip = schedule.day_skip;
        this.scheduleOptions.skip_hours = schedule.skip_hours;
        this.scheduleOptions.skip_minutes = schedule.skip_minutes;
        this.scheduleOptions.occur = schedule.occur;
        const start_time: Date = new Date(schedule.start_time);
        this.scheduleOptions.startTimeHours = start_time.getHours() || 0;
        this.scheduleOptions.startTimeMinutes = start_time.getMinutes() || 0;
        this.scheduleOptions.startTimeSeconds = start_time.getSeconds() || 0;

        this.scheduleOptions.start_time = schedule.start_time;
        let week_names = schedule.week_names.replace(/'/g, '"');
        week_names = JSON.parse(week_names);
        this.scheduleOptions.week_names = week_names;
        // change selected values as per saved options
        _.forEach(week_names, (value, day) => {
          let option = _.find(this.scheduleOptions.weekDays, { title: day });
          if (option) {
            option['checked'] = true;
          }
        });
      }
    });
  }

  schedule() {
    let options = this.getProcessedOptions();
    if (options.scheduleProject) {
      let occurPattern = this.scheduleOptions.occur;
      let occurValidation = /^[1-9]|[1-9][0-9]+/g.test(occurPattern);
      if (occurValidation) {
        this.scheduleValidation['occurPattern'] = false;
        options.timezone = this.helper.getTimezone();
        this.apiService
          .saveScheduleProject(options.name, options)
          .subscribe(projects => {
            this.messages.type = 'success';
            this.messages.status = this.translate.instant(
              'Modal_Schedule_success'
            );
            this.onSaved.emit(true);
          });
        this.closeScheduleModal();
      } else {
        this.scheduleValidation['occurPattern'] = true;
      }
    } else {
      this.messages.type = 'error';
      this.messages.status = this.translate.instant('Modal_Schedule_fail');
      this.closeScheduleModal();
    }
  }

  /*************************************************************************/
  // Method to alter minutes of "Trigger Every" based on selection of Hours
  // If hours is zero then minutes should range from 1 to 60
  /*************************************************************************/
  alterMinutes() {
    if (this.scheduleOptions['skip_hours'] == 0) {
      this.triggerMinutes = _.range(1, 60);
      // check if skip_minutes was set to zero earlier and change it to 1
      if (this.scheduleOptions['skip_minutes'] == 0) {
        this.scheduleOptions['skip_minutes'] = 1;
      }
    } else {
      // case when skip_hours is not zero
      this.triggerMinutes = _.range(0, 60);
    }
  }

  getProcessedOptions() {
    // make clone of form inputs object
    let options = _.cloneDeep(this.scheduleOptions);

    // build start_time string
    options['start_time'] =
      options.startTimeHours +
      ':' +
      options.startTimeMinutes +
      ':' +
      options.startTimeSeconds;

    // build week_names property
    options.week_names = {};
    if (options.scheduleProject && options.rec_pattern == 'weekly') {
      _.forEach(options.weekDays, (obj, i) => {
        if (obj.checked) {
          options.week_names[obj.title] = true;
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

  closeScheduleModal() {
    setTimeout(() => {
      $('#schedule-modal').modal('hide');
    }, 1000);
  }
}
