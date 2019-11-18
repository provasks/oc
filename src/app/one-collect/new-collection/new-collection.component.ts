import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import * as _ from 'lodash';

import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'oc-new-collection',
  templateUrl: './new-collection.component.html',
  styleUrls: ['./new-collection.component.css']
})
export class NewCollectionComponent implements OnInit, OnDestroy {
  collectType: any;
  hasPerf: boolean;

  //CA Variables
  caLaunch: boolean = environment.caLaunch;
  enableOneCollect: any = false;
  enableOneCollectSubscription: Subscription;
  client: any = environment.client;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    if (this.caLaunch) {
      this.enableOneCollect = this.dataService.getEnableOneCollect();
      this.enableOneCollectSubscription = this.dataService.modalCustomOC$.subscribe(
        ocvalue => {
          this.enableOneCollect = ocvalue;
        }
      );
    }
    this.setHasPerf();
  }

  setHasPerf() {
    this.apiService.hasPerfProfile().subscribe(
      data => {
        if (_.has(data, 'has_perf') && data['has_perf'] === true) {
          this.dataService.setHasPerf(true);
          this.hasPerf = true;
        } else {
          this.dataService.setHasPerf(false);
          this.hasPerf = false;
        }
        this.navigateToUrl();
      },
      error => {
        this.dataService.setHasPerf(false);
        this.hasPerf = false;
        this.navigateToUrl();
      }
    );
  }

  navigateToUrl() {
    let url = this.router.url;
    let arr = url.split('/');
    url = arr[arr.length - 1];
    url = url.split('?')[0];
    switch (url) {
      case 'performance':
        if (this.hasPerf) {
          this.collectType = 'performance';
        } else {
          this.collectType = 'device-based';
        }
        break;
      case 'device-based':
        this.collectType = 'device-based';
        break;
      case 'solution-based':
        this.collectType = 'solution-based';
        break;
      case 'asup-based':
        this.collectType = 'asup-based';
        break;
      case 'discover-ip':
        this.collectType = 'discover-ip';
        break;
      case 'import-devices':
        this.collectType = 'import-devices';
        break;
      case 'import-collected':
        this.collectType = 'import-collected';
        break;
      case 'import-performance':
        this.collectType = 'import-performance';
        break;
      default:
        if (!this.caLaunch) {
          this.collectType = 'device-based';
        } else {
          this.collectType = 'solution-based';
        }
    }
  }

  changeRoute(uri) {
    switch (uri) {
      case 'device-based':
        uri = uri + '/general';
        break;
    }
    uri = '/main/new-collection/' + uri;
    this.router.navigate([uri]);
  }

  //CA Code
  getPreference() {
    this.apiService.getPreferences().subscribe(preferences => {
      preferences = JSON.parse(preferences.preference)['basic'];
      this.enableOneCollect = preferences.enableOneCollect;
    });
  }

  ngOnDestroy() {
    if (this.caLaunch) {
      this.enableOneCollectSubscription.unsubscribe();
    }
  }
}
