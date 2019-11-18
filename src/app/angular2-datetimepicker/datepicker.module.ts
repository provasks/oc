import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePicker } from './datepicker.component';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from './clickOutside';
import { PipesModule } from '../pipes/pipes.module';

@NgModule({
  imports: [CommonModule, FormsModule, PipesModule.forRoot()],
  declarations: [DatePicker, ClickOutsideDirective],
  exports: [DatePicker, FormsModule, ClickOutsideDirective]
})
export class AngularDateTimePickerModule {}
