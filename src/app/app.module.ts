import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { onAppInit } from './app-init-providers';

import { TranslateService } from './services/translate/translate.service';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { OneCollectModule } from './one-collect/one-collect.module';
import { WildcardRoutingModule } from './wildcard-routing.module';
import { TourModule } from './tour/tour.module';
import { PipesModule } from './pipes/pipes.module';

import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpIntercept } from './http-intercept';
import { RouterModule } from '@angular/router';

import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { HelperService } from 'src/app/services/helper/helper.service';
import { DatePipe } from '@angular/common';

import { ScrollPointDirective } from 'src/app/directives/scroll-point/scroll-point.directive';
import { ClickOutsideDirective } from 'src/app/directives/click-outside/click-outside.directive';

import { TourNgxBootstrapModule, TourService } from 'ngx-tour-ngx-bootstrap';
import { PopoverModule } from 'ngx-bootstrap';

import { AppComponent } from './app.component';
import { MainAppComponent } from './main-app/main-app.component';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';

export function setupTranslateFactory(service: TranslateService): Function {
  return (client: string = environment.client['name']) => service.use(client);
}

@NgModule({
  imports: [
    RouterModule,
    BrowserModule,
    HttpModule,
    HttpClientModule,
    CoreModule,
    TourModule,
    AppRoutingModule,
    OneCollectModule,
    WildcardRoutingModule,
    FormsModule,
    PipesModule.forRoot(),
    TourNgxBootstrapModule.forRoot(),
    PopoverModule.forRoot()
  ],
  declarations: [
    AppComponent,
    ScrollPointDirective,
    ClickOutsideDirective,
    MainAppComponent
  ],
  providers: [
    ApiService,
    DataService,
    HelperService,
    TourService,
    DatePipe,
    TranslateService,
    {
      provide: APP_INITIALIZER,
      useFactory: setupTranslateFactory,
      deps: [TranslateService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpIntercept,
      multi: true
    }
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: onAppInit,
    //   deps: [ApiService, DataService],
    //   multi: true
    // }
  ],
  bootstrap: [AppComponent],
  entryComponents: [],
  exports: [MainAppComponent]
})
export class AppModule {}
