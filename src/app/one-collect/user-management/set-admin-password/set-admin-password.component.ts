import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { UserService } from 'src/app/services/user/user.service';
import { Subscription } from 'rxjs';
declare var $: any;

import { TranslateService } from '../../../services/translate/translate.service';

@Component({
  selector: 'oc-set-admin-password',
  templateUrl: './set-admin-password.component.html',
  styleUrls: ['./set-admin-password.component.css']
})
export class SetAdminPasswordComponent
  implements OnInit, OnDestroy, AfterViewInit {
  appMeta: any;
  formData: any;
  errorMessage: string = '';
  returnUrl: string;

  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.formData = {
      username: 'admin',
      password: '',
      confirmPassword: '',
      email: ''
    };
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    let appMeta = this.route.snapshot.data.appMeta;
    this.appMeta = appMeta;
    if (!(appMeta.hosted && !appMeta.admin_pass_set)) {
      this.router.navigate([this.returnUrl]);
    }
  }

  ngOnDestroy() {
    // detach listener for enter key press
    $('#set-admin-password-box').off('keypress', this.pressEnter);
  }

  ngAfterViewInit() {
    // attach listener for enter key press
    setTimeout(() => $('#admin-password').focus(), 250);
    setTimeout(
      () => $('#set-admin-password-box').on('keypress', this.pressEnter),
      250
    );
  }

  pressEnter = e => {
    let code = e.keyCode ? e.keyCode : e.which;
    if (code == 13) {
      this.login();
    }
  };

  onTextChange() {
    this.errorMessage = '';
  }

  login() {
    let emailReg = /^$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let emailValid = emailReg.test(this.formData.email.toLowerCase());

    if (!this.formData.username) {
      this.errorMessage = this.translate.instant('Usermgmnt_user_req');
    } else if (!this.formData.password) {
      this.errorMessage = this.translate.instant('Usermgmnt_pwd_req');
    } else if (!this.formData.confirmPassword) {
      this.errorMessage = this.translate.instant(
        'Usermgmnt_admin_confirmpwd_req'
      );
    } else if (this.formData.password != this.formData.confirmPassword) {
      this.errorMessage = this.translate.instant('Usermgmnt_pwd_msg2');
    } else if (!emailValid) {
      this.errorMessage = this.translate.instant('Usermgmnt_user_msg2');
    } else {
      this.errorMessage = '';
      // check if EC2 instance verification has initiated the admin password setting
      let appMeta = this.appMeta;
      if (
        appMeta.build_type == 'CLOUD' &&
        appMeta.cloud_type == 'AMI' &&
        !appMeta.ec2_id_verified
      ) {
        if (this.userService.initEc2IdVerified) {
          this.formData.instanceId = this.userService.instanceId;
          this.apiService
            .setInstanceIdVerified(this.formData)
            .subscribe(data => {
              if (data.status) {
                this.dataService.appMeta.ec2_id_verified = true;
                this.dataService.appMeta.admin_pass_set = true;
                this.router.navigate([this.returnUrl]);
              } else {
                this.errorMessage = data.reason;
              }
            });
        } else {
          this.router.navigate([this.returnUrl]);
        }
      } else {
        // set admin password alone since EC2 instance need not be verified
        this.apiService.setAdminPassword(this.formData).subscribe(data => {
          if (data.status) {
            this.dataService.appMeta.admin_pass_set = true;
            this.router.navigate([this.returnUrl]);
          } else {
            this.errorMessage = data.reason;
          }
        });
      }
    }
  }
}
