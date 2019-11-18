import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from './safe-html/safe-html.pipe';
import { CapitalizePipe } from './capitalize/capitalize.pipe';
import { DatexPipe } from './datex/datex.pipe';
import { TranslatePipe } from './translate/translate.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [SafeHtmlPipe, CapitalizePipe, DatexPipe, TranslatePipe],
  exports: [SafeHtmlPipe, CapitalizePipe, DatexPipe, TranslatePipe]
})
export class PipesModule {
  static forRoot() {
    return {
      ngModule: PipesModule,
      providers: []
    };
  }
}
