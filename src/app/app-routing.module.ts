import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, UrlSegment } from '@angular/router';

import { LoginComponent } from './one-collect/user-management/login/login.component';
import { EulaComponent } from './one-collect/user-management/eula/eula.component';
import { Ec2IdComponent } from './one-collect/user-management/ec2-id/ec2-id.component';
import { SetAdminPasswordComponent } from './one-collect/user-management/set-admin-password/set-admin-password.component';
import { MainAppComponent } from './main-app/main-app.component';
import { EulaGuard } from './one-collect/user-management/guards/eula/eula.guard';
import { Ec2IdGuard } from './one-collect/user-management/guards/ec2-id/ec2-id.guard';
import { SetAdminPasswordGuard } from './one-collect/user-management/guards/set-admin-password/set-admin-password.guard';
import { AppMetaResolveService } from 'src/app/services/app-meta-resolve/app-meta-resolve.service';
import { environment } from 'src/environments/environment';

const appRoutes: Routes = [
  {
    path: 'eula',
    component: EulaComponent,
    resolve: { appMeta: AppMetaResolveService }
  },
  {
    path: 'ec2-id',
    component: Ec2IdComponent,
    canActivate: [EulaGuard],
    resolve: { appMeta: AppMetaResolveService }
  },
  {
    path: 'admin-password',
    component: SetAdminPasswordComponent,
    canActivate: [EulaGuard, Ec2IdGuard],
    resolve: { appMeta: AppMetaResolveService }
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [EulaGuard, Ec2IdGuard, SetAdminPasswordGuard],
    resolve: { appMeta: AppMetaResolveService }
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes, {
      // enableTracing: environment.enableRouteTracing
      enableTracing: false
    })
  ],
  declarations: [],
  exports: [RouterModule]
})
export class AppRoutingModule {}
