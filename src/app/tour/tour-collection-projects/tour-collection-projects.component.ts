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
import * as TourData from 'src/app/content/tour.collection-projects.json';
import { HelperService } from 'src/app/services/helper/helper.service';
const TourContent = (<any>TourData).data;

@Component({
  selector: 'oc-tour-collection-projects',
  templateUrl: './tour-collection-projects.component.html',
  styleUrls: ['./tour-collection-projects.component.css']
})
export class TourCollectionProjectsComponent implements OnInit, OnDestroy {
  grid: any;
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
      document.getElementById('myjobs-tools-dropdown-1').style.display = 'none';
    });
    // subscription to listen to stepShow$
    this.stepShowSubscription = this.tourService.stepShow$.subscribe(step => {
      if (step.anchorId == 're-run') {
        document.getElementById('myjobs-tools-dropdown-1').style.display =
          'block';
      }
      if (step.anchorId == 'more-actions') {
        document.getElementById('myjobs-tools-dropdown-1').style.display =
          'none';
      }
    });
  }

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {
    this.grid = {};

    this.grid.meta = {
      tableId: 'myjobs',
      tableBordered: true,
      tableStriped: false,
      cellPadding: '8px',
      minCellWidth: '120px',
      // actions column
      actions: true,
      actionsWidth: '100px',
      actionsTitle: 'Actions',
      // horizontal scroll buttons
      scrollButtons: true,
      showBottomScroll: false,
      // select all column
      selectAll: false,
      // extra messages row
      messages: true,
      msgColSpan: 9
    };

    this.grid.headers = [
      { width: '170px', title: 'Group Name', key: 'group' },
      { width: '120px', title: 'Project Name', key: 'project_id' },
      { width: '170px', title: 'Job Name', key: 'name' },
      { width: '120px', title: 'Profile', key: 'profile' },
      { width: '120px', title: 'Progress', key: 'progress', filter: false },
      { width: '120px', title: 'Start Time', key: 'start_time', filter: false },
      { width: '120px', title: 'End Time', key: 'end_time', filter: false },
      { width: '120px', title: 'Status', key: 'status' }
    ];
  }

  ngOnDestroy() {
    this.tourStartByUserSubscription.unsubscribe();
    this.tourStartSubscription.unsubscribe();
    this.tourEndSubscription.unsubscribe();
    this.stepShowSubscription.unsubscribe();
  }
}
