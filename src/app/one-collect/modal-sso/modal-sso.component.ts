import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { HelperService } from 'src/app/services/helper/helper.service';
import { Subscription } from 'rxjs';
import { Settings } from 'src/app/content/settings';
import * as _ from 'lodash';
declare var $: any;

import { environment } from 'src/environments/environment';
import { TranslateService } from '../../services/translate/translate.service';

@Component({
  selector: 'oc-modal-sso',
  templateUrl: './modal-sso.component.html',
  styleUrls: ['./modal-sso.component.css']
})
export class ModalSsoComponent implements OnInit, AfterViewInit {
  settings: any = Settings;
  @Output() onValidated = new EventEmitter<boolean>();
  @Output() onCancel = new EventEmitter<boolean>();

  username: any;
  password: any;
  result: boolean;
  message: any;
  caLaunch: boolean = environment.caLaunch;

  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private helperService: HelperService,
    public translate: TranslateService
  ) {}

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {}

  /*********************************************/
  /* Lifecycle hook AfterViewInit
  /*********************************************/
  ngAfterViewInit() {
    let pressEnter = e => {
      let code = e.keyCode ? e.keyCode : e.which;
      if (code == 13) {
        this.validate();
      }
    };
    // set focus to confirm button so that user can press
    // enter key to delete instead of click by mouse
    $('#sso-modal').on('shown.bs.modal', event => {
      // set focus to username input
      $('#sso-username').focus();
      // attach keypress event handler
      $('#sso-modal').on('keypress', pressEnter);
    });
    // unbind keypress event handler
    $('#sso-modal').on('hide.bs.modal', event => {
      $('#sso-modal').off('keypress', pressEnter);
    });
  }

  cancel() {
    this.onCancel.emit(true);
  }

  validate() {
    if (!this.username || !this.password) {
      return;
    }
    let username = this.helperService.trim(this.username);
    let password = this.helperService.trim(this.password);
    let data = { username: username, password: password };
    this.apiService.ssoLogin(data).subscribe(result => {
      // check if user is not logged in
      if (result['logged'] == 'false') {
        this.result = false;
        if (result['detail']) {
          this.message = result['detail'];
        } else {
          this.message = this.translate.instant('SSO_modal_acc_failed');
        }
      } else {
        // user is logged in
        this.result = true;
        this.message = this.translate.instant('SSO_modal_login_success');
        // store user details in dataService
        let details = { details: _.cloneDeep(result['detail']) };
        this.dataService.setUserData(details);
        $('#sso-modal').modal('hide');
        // send validated event to parent component
        this.onValidated.emit(true);
      }
    });
  }
}
