import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { Router, Event, NavigationEnd } from '@angular/router';
import * as _ from 'lodash';
declare var $: any;

import 'src/assets/netapp-library/scripts/luci.js';
import { TranslateService } from './services/translate/translate.service';
import { HelperService } from './services/helper/helper.service';
import { Title } from '@angular/platform-browser';
declare var luciMenu: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  loader: any = {};
  notification: any = {};
  tourImageUrl: any = '';
  tourStarted: boolean = false;
  tourInstructionUrl: any = '';
  tourInstructionStarted: boolean = false;

  notificationSubscription: Subscription;
  routerSubscription: Subscription;
  tourImageSubscription: Subscription;

  locale: any;

  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private translate: TranslateService,
    private router: Router,
    private helper: HelperService,
    private titleService: Title
  ) {
    // subscribe to app wide notifications
    this.notificationSubscription = dataService.appNotification$.subscribe(
      notification => {
        this.notification = notification;
        this.helper.showModalPopup('#app-wide-notification');
      }
    );
    // tour image start
    this.tourImageSubscription = dataService.tourImageStart$.subscribe(() => {
      if (this.tourImageUrl) {
        this.tourStarted = true;
      }
    });
  }

  ngOnInit() {
    new luciMenu();
    this.loader = this.dataService.loader;
    this.setHasPerf();
    this.setRouterPath();

    //ca added to get locale
    this.dataService.setLocale(this.translate.currentLang);
    this.titleService.setTitle(this.translate.instant('OC_title'));
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
    this.tourImageSubscription.unsubscribe();
  }

  setRouterPath() {
    this.tourInstructionUrl = 'assets/img/tour_start.jpg';
  }

  tourClose() {
    this.tourStarted = false;
  }

  tourInstructionClose() {
    this.tourInstructionStarted = false;
  }

  setHasPerf() {
    this.apiService.hasPerfProfile().subscribe(
      data => {
        if (_.has(data, 'has_perf') && data['has_perf'] === true) {
          this.dataService.setHasPerf(true);
        } else {
          this.dataService.setHasPerf(false);
        }
      },
      error => {
        this.dataService.setHasPerf(false);
      }
    );
  }
}
