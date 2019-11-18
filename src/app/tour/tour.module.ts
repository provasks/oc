import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TourNgxBootstrapModule } from 'ngx-tour-ngx-bootstrap';
import { TourCollectionJobsComponent } from './tour-collection-jobs/tour-collection-jobs.component';
import { TourCollectionProjectsComponent } from './tour-collection-projects/tour-collection-projects.component';
import { TourDataViewComponent } from './tour-data-view/tour-data-view.component';
import { TourSavedProjectsComponent } from './tour-saved-projects/tour-saved-projects.component';
import { TourScheduledJobsComponent } from './tour-scheduled-jobs/tour-scheduled-jobs.component';
import { TourUploadAsupComponent } from './tour-upload-asup/tour-upload-asup.component';
import { TourDeviceBasedComponent } from './tour-device-based/tour-device-based.component';
import { TourUserManagementComponent } from './tour-user-management/tour-user-management.component';
import { TourDiscoverIpComponent } from './tour-discover-ip/tour-discover-ip.component';
import { TourCredentialManagementComponent } from './tour-credential-management/tour-credential-management.component';
@NgModule({
  imports: [CommonModule, TourNgxBootstrapModule, FormsModule],
  declarations: [
    TourCollectionJobsComponent,
    TourCollectionProjectsComponent,
    TourDataViewComponent,
    TourSavedProjectsComponent,
    TourScheduledJobsComponent,
    TourUploadAsupComponent,
    TourDeviceBasedComponent,
    TourUserManagementComponent,
    TourDiscoverIpComponent,
    TourCredentialManagementComponent
  ],
  exports: [
    TourCollectionJobsComponent,
    TourCollectionProjectsComponent,
    TourDataViewComponent,
    TourSavedProjectsComponent,
    TourScheduledJobsComponent,
    TourUploadAsupComponent,
    TourDeviceBasedComponent,
    TourUserManagementComponent,
    TourDiscoverIpComponent,
    TourCredentialManagementComponent
  ]
})
export class TourModule {}
