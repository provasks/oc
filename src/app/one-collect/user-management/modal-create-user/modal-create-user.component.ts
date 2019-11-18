import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { UserService } from 'src/app/services/user/user.service';
declare var $: any;

import { TranslateService } from '../../../services/translate/translate.service';

@Component({
  selector: 'oc-modal-create-user',
  templateUrl: './modal-create-user.component.html',
  styleUrls: ['./modal-create-user.component.css']
})
export class ModalCreateUserComponent implements OnInit {
  /*********************************************/
  /* Properties
  /*********************************************/
  notification: any;
  formData: any;
  errorMessage: string = '';

  /*********************************************/
  /* Constructor
  /*********************************************/
  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private translate: TranslateService
  ) {}

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {
    this.initFields();
    this.notification = {
      title: this.translate.instant('Usermgmnt_user_info'),
      message: this.translate.instant('Usermgmnt_user_infomsg')
    };
    $('#modal-create-user').on('shown.bs.modal', event => {
      this.initFields();
      $('#create-username').focus();
    });
  }

  /*********************************************/
  /* Method to initialize input form fields
  /*********************************************/
  initFields() {
    this.formData = {
      username: '',
      password: '',
      confirmPassword: '',
      email: '',
      role: 'user'
    };
  }

  /*********************************************/
  /* Method to check fields to enable submit
  /*********************************************/
  checkFields() {
    if (
      this.formData.username &&
      this.formData.password &&
      this.formData.confirmPassword
    ) {
      return true;
    } else {
      return false;
    }
  }

  /*********************************************/
  /* Method to remove error message
  /*********************************************/
  onTextChange() {
    this.errorMessage = '';
  }

  /*********************************************/
  /* Method to dispatch create user request
  /*********************************************/
  createUser() {
    let usernameReg = /^$|[^a-zA-Z0-9_]+/g;
    let usernameValid = !usernameReg.test(this.formData.username);
    let emailReg = /^$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let emailValid = emailReg.test(this.formData.email.toLowerCase());

    if (this.formData.password != this.formData.confirmPassword) {
      this.errorMessage = this.translate.instant('Usermgmnt_pwd_msg2');
    } else if (!usernameValid) {
      this.errorMessage = this.translate.instant('Usermgmnt_user_msg1');
    } else if (!emailValid) {
      this.errorMessage = this.translate.instant('Usermgmnt_user_msg2');
    } else {
      this.errorMessage = '';
      let user = this.formData;
      if (user.role == 'admin') {
        user.is_superuser = 'true';
      } else {
        user.is_superuser = 'false';
      }
      this.apiService.createUser(user).subscribe(data => {
        if (!data.status) {
          this.errorMessage = data.reason;
        } else {
          this.errorMessage = '';
          $('#modal-create-user').modal('hide');
          $('#alert-user-created').show();
          setTimeout(() => $('#alert-user-created').hide(), 3000);
          this.userService.setUsers();
        }
      });
    }
  }
}
