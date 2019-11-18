import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';
import { Subscription } from 'rxjs';
import { TourService } from 'ngx-tour-ngx-bootstrap';
import * as TourData from 'src/app/content/tour.discover-ip.json';
import { HelperService } from 'src/app/services/helper/helper.service';
import { TranslateService } from 'src/app/services/translate/translate.service';
const TourContent = (<any>TourData).data;

@Component({
  selector: 'oc-tour-discover-ip',
  templateUrl: './tour-discover-ip.component.html',
  styleUrls: ['./tour-discover-ip.component.css']
})
export class TourDiscoverIpComponent implements OnInit {
  @Input() settings;

  @Output() toggleTour = new EventEmitter<boolean>();
  tourStartByUserSubscription: Subscription;
  tourStartSubscription: Subscription;
  tourEndSubscription: Subscription;
  stepShowSubscription: Subscription;
  // tour properties
  tourStarted: boolean = false;
  selectedFilter = 'all';

  constructor(
    private dataService: DataService,
    private tourService: TourService,
    private helper: HelperService,
    public translate: TranslateService
  ) {
    // this.settings = this.helper.settings['autoDiscovery'];
    tourService.initialize(this.helper.translateTourData(TourContent));
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
      // document.getElementById('tools-dropdown-test').style.display = 'none';
    });
    // subscription to listen to stepShow$
    this.stepShowSubscription = this.tourService.stepShow$.subscribe(step => {
      if (step.anchorId == 'filter') {
        // $('#filter').show().focus().click();
      }
    });
    // console.log(this.settings);
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.tourStartByUserSubscription.unsubscribe();
    this.tourStartSubscription.unsubscribe();
    this.tourEndSubscription.unsubscribe();
    this.stepShowSubscription.unsubscribe();
  }
}
