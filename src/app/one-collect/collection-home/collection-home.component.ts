import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

import { TranslateService } from '../../services/translate/translate.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'oc-collection-home',
  templateUrl: './collection-home.component.html',
  styleUrls: ['./collection-home.component.css']
})
export class CollectionHomeComponent implements OnInit {
  viewBy: any;
  routerSubscription: Subscription;
  showTopBar: boolean = false;

  //CA Variables
  caLaunch: boolean = environment.caLaunch;
  selectedJobs: any[] = [];
  showConfigButton: boolean;
  config_selectedjobs: any[] = [];
  jobsSubscription: Subscription;
  configCompareSubscription: Subscription;
  buttonText: any;

  tourSubscription: Subscription;
  client: any = environment.client;

  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.tourSubscription = this.dataService.tourStartJob$.subscribe(
      state => (this.showTopBar = !state)
    );

    this.routerSubscription = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        let urlParts = event.urlAfterRedirects.split('/');
        if (urlParts.length <= 2 && urlParts[1] == 'collection') {
          this.setViewBy();
        }
      }
    });

    //**CA CODE**//
    this.buttonText = translate.instant('Joblisting_configcompare_button');
    this.jobsSubscription = this.dataService
      .getSelectedJobs()
      .subscribe(selJobs => {
        this.selectedJobs = selJobs;
      });

    this.configCompareSubscription = this.dataService
      .getConfigCompareJobs()
      .subscribe(configJobs => {
        this.config_selectedjobs = configJobs;
        if (
          (this.config_selectedjobs.length == 1 && !this.client.isOEM) ||
          this.config_selectedjobs.length == 2
        ) {
          this.showConfigButton = true;
        } else {
          this.showConfigButton = false;
        }

        // Change button text appropriately
        if (this.config_selectedjobs.length == 1 && !this.client.isOEM) {
          this.buttonText = translate.instant(
            'Joblisting_popularconfig_button'
          );
        } else {
          this.buttonText = translate.instant(
            'Joblisting_configcompare_button'
          );
        }
      });
  }

  /*********************************************/
  /* Lifecycle hooks
  /*********************************************/
  ngOnInit() {
    this.showConfigButton = false;
    this.setViewBy();
    this.dataService.showTopBar$.subscribe(status => {
      this.showTopBar = status;
    });
  }
  ngAfterViewChecked() {
    this.viewBy = this.getView();
  }
  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
    this.jobsSubscription.unsubscribe();
    this.configCompareSubscription.unsubscribe();
    if (this.tourSubscription) {
      this.tourSubscription.unsubscribe();
    }
  }

  /*********************************************/
  /* Method to change route for new collections
  /* view based on selection in dropdown
  /*********************************************/
  changeRoute(uri) {
    uri = '/main/collection/' + uri;
    this.router.navigate([uri]);
  }
  getView() {
    const url = this.router.url;
    return url.substring(url.lastIndexOf('/') + 1);
  }

  /*********************************************/
  /* Method to automatically set view based on
  /* url parts
  /*********************************************/
  setViewBy() {
    switch (this.getView()) {
      case 'jobs':
        this.viewBy = 'jobs';
        this.changeRoute('jobs');
        break;
      case 'projects':
        this.viewBy = 'projects';
        this.changeRoute('projects');
        break;
      default:
        this.setByLatestJobType();
    }
  }

  setByLatestJobType() {
    this.viewBy = 'projects';
    this.apiService.getJobsList(0, 1).subscribe(data => {
      if (data.jobs.length) {
        let job = data.jobs[0];
        if (job.profile == 'Performance' || job.trigger == 'Scheduler') {
          this.viewBy = 'projects';
          this.changeRoute('projects');
        } else {
          this.viewBy = 'jobs';
          this.changeRoute('jobs');
        }
      } else {
        this.viewBy = 'jobs';
        this.changeRoute('jobs');
      }
    });
  }

  //*CA Code//
  navigateToConfigCompareTab() {
    if (this.config_selectedjobs.length == 0) {
      this.showConfigButton = false;
      // show the notification modal
    } else if (
      this.config_selectedjobs.length == 0 ||
      this.config_selectedjobs.length >= 3
    ) {
      this.showConfigButton = false;
    } else if (this.config_selectedjobs.length == 1) {
      if (!this.client.isOEM) {
        this.showConfigButton = true;
        this.router.navigate(['/main/configCompare'], {
          queryParams: {
            Job1: this.config_selectedjobs[0],
            Job2: 'popular_conf'
          }
        });
      }
    } else {
      this.showConfigButton = true;
      this.router.navigate(['/main/configCompare'], {
        queryParams: {
          Job1: this.config_selectedjobs[0],
          Job2: this.config_selectedjobs[1]
        }
      });
    }

    if (this.config_selectedjobs.length == 2) {
      this.showConfigButton = true;
      this.router.navigate(['/main/configCompare'], {
        queryParams: {
          Job1: this.config_selectedjobs[0],
          Job2: this.config_selectedjobs[1]
        }
      });
    } else {
      this.showConfigButton = false;
    }
  }
}
