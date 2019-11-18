import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MainHeaderComponent } from './main-header/main-header.component';
import { MainFooterComponent } from './main-footer/main-footer.component';
import { NavMainComponent } from './nav-main/nav-main.component';
import { ModalSettingsComponent } from './modal-settings/modal-settings.component';
import { OneCollectModule } from '../one-collect/one-collect.module';

import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PipesModule,
    OneCollectModule
  ],
  declarations: [
    MainHeaderComponent,
    MainFooterComponent,
    NavMainComponent,
    ModalSettingsComponent
  ],
  exports: [
    MainHeaderComponent,
    MainFooterComponent,
    NavMainComponent,
    ModalSettingsComponent
  ]
})
export class CoreModule {}
