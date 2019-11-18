import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';
import { Subscription } from 'rxjs';
import { TourService } from 'ngx-tour-ngx-bootstrap';
import * as TourData from 'src/app/content/tour.collection-jobs.json';
import { TranslateService } from 'src/app/services/translate/translate.service';
import { HelperService } from 'src/app/services/helper/helper.service';
const TourContent = (<any>TourData).data;

@Component({
  selector: 'oc-tour-collection-jobs',
  templateUrl: './tour-collection-jobs.component.html',
  styleUrls: ['./tour-collection-jobs.component.css']
})
export class TourCollectionJobsComponent implements OnInit, OnDestroy {
  @Input() grid;
  @Output() toggleTour = new EventEmitter<boolean>();
  tourStartByUserSubscription: Subscription;
  tourStartSubscription: Subscription;
  tourEndSubscription: Subscription;
  stepShowSubscription: Subscription;

  /*********************************************/
  /* Constructor method
  /*********************************************/
  constructor(
    private dataService: DataService,
    private tourService: TourService,
    public translate: TranslateService,
    private helper: HelperService
  ) {
    tourService.initialize(this.helper.translateTourData(TourContent));
    // subscription to start tour only when user clicks start tour button
    this.tourStartByUserSubscription = this.dataService.tourStart$.subscribe(
      () => {
        this.tourService.start();
        this.dataService.tourStartJob$.next(true);
      }
    );
    // subscription to listen to start$ when tour has started
    this.tourStartSubscription = this.tourService.start$.subscribe(step => {
      this.toggleTour.emit(true);
      this.dataService.setTopBar(false);
    });
    // subscription to listen to end$ when tour has ended
    this.tourEndSubscription = this.tourService.end$.subscribe(step => {
      this.toggleTour.emit(false);
      this.dataService.setTopBar(true);
      document.getElementById('tools-dropdown-test').style.display = 'none';
      this.dataService.tourStartJob$.next(false);
    });
    // subscription to listen to stepShow$
    this.stepShowSubscription = this.tourService.stepShow$.subscribe(step => {
      if (step.anchorId == 're-run') {
        document.getElementById('tools-dropdown-test').style.display = 'block';
      }
      if (step.anchorId == 'more-actions') {
        document.getElementById('tools-dropdown-test').style.display = 'none';
      }
    });
  }

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {}

  ngOnDestroy() {
    this.tourStartByUserSubscription.unsubscribe();
    this.tourStartSubscription.unsubscribe();
    this.tourEndSubscription.unsubscribe();
    this.stepShowSubscription.unsubscribe();
  }
}
