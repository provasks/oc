import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OneCollectRoutingModule } from './one-collect-routing.module';
import { PipesModule } from '../pipes/pipes.module';
import { MyDateRangePickerModule } from 'mydaterangepicker';

import { CommonComponent } from './common/common.component';
import { GridComponent } from './grid/grid.component';
import { CollectionHomeComponent } from './collection-home/collection-home.component';
import { CollectionJobsComponent } from './collection-jobs/collection-jobs.component';
import { CollectionProjectsComponent } from './collection-projects/collection-projects.component';
import { PerformanceComponent } from './performance/performance.component';
import { ImportPerformanceComponent } from './import-performance/import-performance.component';
import { NewCollectionComponent } from './new-collection/new-collection.component';
import { DeviceBasedComponent } from './device-based/device-based.component';
import { SolutionBasedComponent } from './solution-based/solution-based.component';
import { AsupBasedComponent } from './asup-based/asup-based.component';
import { DiscoverIpComponent } from './discover-ip/discover-ip.component';
import { ImportDevicesComponent } from './import-devices/import-devices.component';
import { ImportCollectedComponent } from './import-collected/import-collected.component';
import { DataViewComponent } from './data-view/data-view.component';
import { SavedProjectsComponent } from './saved-projects/saved-projects.component';
import { ScheduledJobsComponent } from './scheduled-jobs/scheduled-jobs.component';
import { UploadAsupComponent } from './upload-asup/upload-asup.component';
import { ImtadviseComponent } from './imtadvise/imtadvise.component';

import { ModalCollectComponent } from './modal-collect/modal-collect.component';
import { ModalCollectAsupComponent } from './modal-collect-asup/modal-collect-asup.component';
import { ModalCommandsComponent } from './modal-commands/modal-commands.component';
import { ModalAsupComponent } from './modal-asup/modal-asup.component';
import { ModalSsoComponent } from './modal-sso/modal-sso.component';
import { ModalNotificationComponent } from './modal-notification/modal-notification.component';
import { ModalScheduleComponent } from './modal-schedule/modal-schedule.component';
import { ModalUploadAsupComponent } from './modal-upload-asup/modal-upload-asup.component';
import { ModalImportFailedComponent } from './modal-import-failed/modal-import-failed.component';
import { ModalUpdateCredentialsComponent } from './modal-update-credentials/modal-update-credentials.component';
import { ModalCollectPerformanceComponent } from './modal-collect-performance/modal-collect-performance.component';
import { ModalCloneJobComponent } from './modal-clone-job/modal-clone-job.component';
import { ModalTokenComponent } from './modal-token/modal-token.component';
import { ModalEulaComponent } from './modal-eula/modal-eula.component';
import { ModalShutdownComponent } from './modal-shutdown/modal-shutdown.component';

import { OnlyNumberDirective } from 'src/app/directives/only-number/only-number.directive';
import { NewlinePipe } from './imtadvise/newLinePipe';
import { AngularDateTimePickerModule } from '../angular2-datetimepicker/datepicker.module';

//import { MergedReportsComponent } from './merged-reports/merged-reports.component';
import { TourNgxBootstrapModule } from 'ngx-tour-ngx-bootstrap';
import { TourModule } from '../tour/tour.module';

import { ViewUsersComponent } from './user-management/view-users/view-users.component';
import { ModalCreateUserComponent } from './user-management/modal-create-user/modal-create-user.component';
import { ModalChangePasswordComponent } from './user-management/modal-change-password/modal-change-password.component';
import { ModalEditUserComponent } from './user-management/modal-edit-user/modal-edit-user.component';
import { LoginComponent } from './user-management/login/login.component';
import { EulaComponent } from './user-management/eula/eula.component';
import { Ec2IdComponent } from './user-management/ec2-id/ec2-id.component';
import { SetAdminPasswordComponent } from './user-management/set-admin-password/set-admin-password.component';
import { CredentialsComponent } from './credentials/credentials.component';
import { CredentialComponent } from './credentials/credential/credential.component';
import { PurposeCardComponent } from './purpose-card/purpose-card.component';
import { PurposesComponent } from './purposes/purposes.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    PipesModule.forRoot(),
    OneCollectRoutingModule,
    MyDateRangePickerModule,
    TourNgxBootstrapModule,
    TourModule,
    AngularDateTimePickerModule
  ],
  declarations: [
    OnlyNumberDirective,
    NewlinePipe,

    GridComponent,
    CommonComponent,
    CollectionHomeComponent,
    CollectionJobsComponent,
    CollectionProjectsComponent,
    DataViewComponent,
    SavedProjectsComponent,
    ScheduledJobsComponent,
    UploadAsupComponent,
    ImtadviseComponent,

    NewCollectionComponent,
    DeviceBasedComponent,
    SolutionBasedComponent,
    AsupBasedComponent,
    DiscoverIpComponent,
    ImportDevicesComponent,
    ImportCollectedComponent,
    PerformanceComponent,
    ImportPerformanceComponent,

    ModalCollectComponent,
    ModalCollectAsupComponent,
    ModalCollectPerformanceComponent,
    ModalCommandsComponent,
    ModalAsupComponent,
    ModalSsoComponent,
    ModalNotificationComponent,
    ModalScheduleComponent,
    ModalUploadAsupComponent,
    ModalImportFailedComponent,
    ModalUpdateCredentialsComponent,
    ModalTokenComponent,
    ModalCloneJobComponent,
    ModalShutdownComponent,
    ModalEulaComponent,
    //MergedReportsComponent,
    ViewUsersComponent,
    ModalCreateUserComponent,
    ModalChangePasswordComponent,
    ModalEditUserComponent,
    LoginComponent,
    EulaComponent,
    Ec2IdComponent,
    SetAdminPasswordComponent,
    CredentialsComponent,
    CredentialComponent,
    PurposeCardComponent,
    PurposesComponent
  ],
  exports: [
    ModalNotificationComponent,
    ModalShutdownComponent,
    ModalEulaComponent,
    ModalCreateUserComponent,
    ModalChangePasswordComponent,
    LoginComponent
  ]
  //schemas: [NO_ERRORS_SCHEMA]
})
export class OneCollectModule {}
