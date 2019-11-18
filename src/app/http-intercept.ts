
import {tap} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/services/data/data.service';

import * as _ from 'lodash';

@Injectable()
export class HttpIntercept implements HttpInterceptor {
  /*********************************************/
  /* Class properties
  /*********************************************/
  // list of url-parts that require file upload content-type
  urlsFileUpload = [
    'createjobfromfile',
    'createperfjobfromfile',
    'validateasupfiles',
    '/onecollect/onecollectservice/validate/'
  ];

  // list of url-parts that need not display loader
  urlsPreventLoader = [
    'getjobslist',
    'getprojectslist',
    'getallprojects',
    'getjob',
    'getasupjobslist',
    'getcommands',
    '/onecollect/onecollectservice/getcommands/',
    '/onecollect/onecollectservice/device/validate',
    '/onecollect/onecollectservice/getdiscoveryprogress/'
  ];

  /*********************************************/
  /* Constructor method
  /*********************************************/
  constructor(private dataService: DataService) {}

  /*********************************************/
  /* Method to intercept requests
  /*********************************************/
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    request = request.clone({
      withCredentials: true
    });

    // Intercept Request
    let matchForLoader = false;
    _.forEach(this.urlsPreventLoader, url => {
      if (request.url.includes(url)) {
        matchForLoader = true;
        // exit loop after first match
        return false;
      }
    });
    if (!matchForLoader) {
      this.dataService.showLoader();
    }

    // check if url is a form data upload to set content-type appropriately
    let matchForContentType = false;
    _.forEach(this.urlsFileUpload, url => {
      if (request.url.includes(url)) {
        matchForContentType = true;
        // exit loop after first match
        return false;
      }
    });

    // Clone the request to add the new header
    let newRequest: any;
    if (matchForContentType) {
      newRequest = request.clone({
        //headers: request.headers.set('Content-Type', 'multipart/form-data'),
        params: new HttpParams().set('foobar', new Date().getTime().toString())
      });
    } else {
      newRequest = request.clone({
        headers: request.headers.set(
          'Content-Type',
          'application/x-www-form-urlencoded'
        ),
        params: new HttpParams().set('foobar', new Date().getTime().toString())
      });
    }

    // Intercept Response
    return next.handle(newRequest).pipe(tap(
      event => {
        if (event instanceof HttpResponse) {
          if (!matchForLoader) {
            this.dataService.hideLoader();
          }
        }
      },
      err => {
        if (err instanceof HttpErrorResponse) {
          if (!matchForLoader) {
            this.dataService.hideLoader();
          }
          // show HTTP error message modal only for status not equal to 400
          /*if(err.status!=400) {
            let notification = {
              title: "HTTP Error",
              message: err.message,
              color: 'red'
            };
            this.dataService.appNotification(notification);
          }*/
        }
      }
    ));
  }
}
