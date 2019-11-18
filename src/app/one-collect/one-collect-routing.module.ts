import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { CollectionHomeComponent } from './collection-home/collection-home.component';
import { CollectionJobsComponent } from './collection-jobs/collection-jobs.component';
import { CollectionProjectsComponent } from './collection-projects/collection-projects.component';

import { NewCollectionComponent } from './new-collection/new-collection.component';
import { PerformanceComponent } from './performance/performance.component';
import { DeviceBasedComponent } from './device-based/device-based.component';
import { SolutionBasedComponent } from './solution-based/solution-based.component';
import { AsupBasedComponent } from './asup-based/asup-based.component';
import { DiscoverIpComponent } from './discover-ip/discover-ip.component';
import { ImportDevicesComponent } from './import-devices/import-devices.component';
import { ImportCollectedComponent } from './import-collected/import-collected.component';
import { ImportPerformanceComponent } from './import-performance/import-performance.component';

import { DataViewComponent } from './data-view/data-view.component';
import { SavedProjectsComponent } from './saved-projects/saved-projects.component';
import { ScheduledJobsComponent } from './scheduled-jobs/scheduled-jobs.component';
import { UploadAsupComponent } from './upload-asup/upload-asup.component';
import { ImtadviseComponent } from './imtadvise/imtadvise.component';

import { ViewUsersComponent } from './user-management/view-users/view-users.component';
import { EulaGuard } from './user-management/guards/eula/eula.guard';
import { Ec2IdGuard } from './user-management/guards/ec2-id/ec2-id.guard';
import { AuthGuard } from './user-management/guards/auth/auth.guard';

import { MainAppComponent } from '../main-app/main-app.component';
import { CredentialsComponent } from './credentials/credentials.component';
import { CanDeactivateGuard } from '../services/guard/can-deactivate.guard';
import { PurposesComponent } from './purposes/purposes.component';

const childRoutes: Routes = [
  {
    path: 'main',
    component: MainAppComponent,
    canActivate: [EulaGuard, Ec2IdGuard, AuthGuard],
    children: [
      {
        path: 'collection',
        component: CollectionHomeComponent,
        children: [
          { path: 'jobs', component: CollectionJobsComponent },
          { path: 'projects', component: CollectionProjectsComponent }
        ]
      },
      {
        path: 'purposes',
        component: PurposesComponent
      },
      {
        path: 'new-collection',
        component: NewCollectionComponent,
        children: [
          { path: 'performance/:keyword', component: PerformanceComponent },
          {
            path: 'device-based',
            component: DeviceBasedComponent,
            canDeactivate: [CanDeactivateGuard]
          },
          {
            path: 'device-based/:keyword',
            component: DeviceBasedComponent,
            canDeactivate: [CanDeactivateGuard]
          },
          {
            path: 'solution-based/:keyword',
            component: SolutionBasedComponent
          },
          { path: 'asup-based', component: AsupBasedComponent },
          {
            path: 'discover-ip',
            component: DiscoverIpComponent,
            canDeactivate: [CanDeactivateGuard]
          },
          {
            path: 'import-devices',
            component: ImportDevicesComponent,
            canDeactivate: [CanDeactivateGuard]
          },
          { path: 'import-collected', component: ImportCollectedComponent },
          { path: 'import-performance', component: ImportPerformanceComponent },
          { path: '', redirectTo: 'device-based', pathMatch: 'prefix' }
        ]
      },
      { path: 'data-view', component: DataViewComponent },
      { path: 'saved-projects', component: SavedProjectsComponent },
      { path: 'scheduled-jobs', component: ScheduledJobsComponent },
      { path: 'upload-asup', component: UploadAsupComponent },
      { path: 'imtadvise', component: ImtadviseComponent },
      { path: 'user-management', component: ViewUsersComponent },
      { path: 'credentials', component: CredentialsComponent }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(childRoutes)],
  declarations: [],
  exports: [RouterModule]
})
export class OneCollectRoutingModule {}
