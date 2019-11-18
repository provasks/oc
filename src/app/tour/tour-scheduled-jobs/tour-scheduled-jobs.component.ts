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
import * as TourData from 'src/app/content/tour.scheduled-jobs.json';
import { HelperService } from 'src/app/services/helper/helper.service';
const TourContent = (<any>TourData).data;

@Component({
  selector: 'oc-tour-scheduled-jobs',
  templateUrl: './tour-scheduled-jobs.component.html',
  styleUrls: ['./tour-scheduled-jobs.component.css']
})
export class TourScheduledJobsComponent implements OnInit, OnDestroy {
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
    private helper: HelperService
  ) {
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
      document.getElementById('tools-dropdown-test').style.display = 'none';
    });
    // subscription to listen to stepShow$
    this.stepShowSubscription = this.tourService.stepShow$.subscribe(step => {
      if (step.anchorId == 'schedule') {
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
