import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { UserService } from 'src/app/services/user/user.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
declare var $: any;

import { environment } from 'src/environments/environment';
import { TranslateService } from '../../../services/translate/translate.service';
import { HelperService } from 'src/app/services/helper/helper.service';

@Component({
  selector: 'oc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  formData: any;
  errorMessage: string = '';
  returnUrl: string;
  appMeta: any;

  showContactAdmin: boolean = false;
  showAdminReset: boolean = false;

  caLaunch: boolean = environment.caLaunch;

  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private helper: HelperService
  ) {}

  ngOnInit() {
    this.formData = {
      username: 'admin',
      password: ''
    };
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.appMeta = this.route.snapshot.data.appMeta;
    if (!(this.appMeta.hosted && !this.appMeta.session)) {
      this.router.navigate([this.returnUrl]);
    }
  }

  ngOnDestroy() {
    // detach listener for enter key press
    $('#login-box').off('keypress', this.pressEnter);
  }

  ngAfterViewInit() {
    // attach listener for enter key press
    setTimeout(() => $('#login-username').focus(), 250);
    setTimeout(() => $('#login-box').on('keypress', this.pressEnter), 250);
  }

  pressEnter = e => {
    let code = e.keyCode ? e.keyCode : e.which;
    if (code == 13) {
      this.login();
    }
  };

  onTextChange() {
    this.errorMessage = '';
    this.showAdminReset = false;
    this.showContactAdmin = false;
  }

  login() {
    if (!this.formData.username) {
      this.errorMessage = this.translate.instant('Usermgmnt_user_req');
    } else if (!this.formData.password) {
      this.errorMessage = this.translate.instant('Usermgmnt_pwd_req');
    } else {
      this.errorMessage = '';
      this.apiService.loginUser(this.formData).subscribe(data => {
        if (data.status) {
          this.userService.setSession(true);
          let appMeta = _.assign(this.appMeta, { session: true });
          this.dataService.setAppMeta(appMeta);
          this.userService.userLoggedIn(true);
          this.router.navigate([this.returnUrl]);
          this.firstLaunch();
        } else {
          this.errorMessage = data.reason;
        }
      });
    }
  }

  changeText() {
    if (this.formData.username == 'admin') {
      this.showAdminReset = true;
      this.showContactAdmin = false;
    } else {
      this.showAdminReset = false;
      this.showContactAdmin = true;
    }
  }

  firstLaunch() {
    this.apiService.getLaunchPageCount().subscribe(data => {
      let count = data['count'];
      if (count == 0) {
        this.helper.showModalPopup('#settings-modal');
      }
      this.apiService.updateLaunchPageCount().subscribe();
    });
  }
}
