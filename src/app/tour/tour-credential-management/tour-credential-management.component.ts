import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';
import { Subscription } from 'rxjs';
import { TourService } from 'ngx-tour-ngx-bootstrap';
import * as TourData from 'src/app/content/tour.credential-management.json';
import { HelperService } from 'src/app/services/helper/helper.service';
import { Credential } from 'src/app/types/credential.type';
const TourContent = (<any>TourData).data;

@Component({
  selector: 'oc-tour-credential-management',
  templateUrl: './tour-credential-management.component.html',
  styleUrls: ['./tour-credential-management.component.css']
})
export class TourCredentialManagementComponent implements OnInit {
  @Input() grid;
  @Output() toggleTour = new EventEmitter<boolean>();
  tourStartByUserSubscription: Subscription;
  tourStartSubscription: Subscription;
  tourEndSubscription: Subscription;
  stepShowSubscription: Subscription;

  credentials: Array<Credential>;

  /*********************************************/
  /* Constructor method
  /*********************************************/
  constructor(
    private dataService: DataService,
    private tourService: TourService,
    private helper: HelperService
  ) {
    const data =
      '[{"alias": "Windows 10", "updated": "2019-05-30T10:14:19.393Z", "priority": "High"}, {"alias": "Cisco Catalyst 2000", "updated": "2019-05-30T10:18:05.251Z", "priority": "High"}, {"alias": "L3 Switch", "updated": "2019-05-30T10:19:20.687Z", "priority": "High"}]';
    this.credentials = JSON.parse(data);
  }

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {
    this.tourService.initialize(this.helper.translateTourData(TourContent));
    // subscription to start tour only when user clicks start tour button
    this.tourStartByUserSubscription = this.dataService.tourStart$.subscribe(
      () => {
        this.tourService.start();
      }
    );
    // subscription to listen to start$ when tour has started
    this.tourStartSubscription = this.tourService.start$.subscribe(step => {
      this.toggleTour.emit(true);
    });
    // subscription to listen to end$ when tour has ended
    this.tourEndSubscription = this.tourService.end$.subscribe(step => {
      this.toggleTour.emit(false);
      document.getElementById('tools-dropdown-test-0').style.display = 'none';
    });
    // subscription to listen to stepShow$
    this.stepShowSubscription = this.tourService.stepShow$.subscribe(step => {
      if (step.anchorId == 'edit0' || step.anchorId == 'delete0') {
        document.getElementById('tools-dropdown-test-0').style.display =
          'block';
      }
    });
  }

  ngOnDestroy() {
    this.tourStartByUserSubscription.unsubscribe();
    this.tourStartSubscription.unsubscribe();
    this.tourEndSubscription.unsubscribe();
    this.stepShowSubscription.unsubscribe();
  }
}
