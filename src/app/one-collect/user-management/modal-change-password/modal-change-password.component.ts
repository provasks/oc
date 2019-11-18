import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { UserService } from 'src/app/services/user/user.service';
import { Subscription } from 'rxjs';
declare var $: any;

import { TranslateService } from '../../../services/translate/translate.service';
import { HelperService } from 'src/app/services/helper/helper.service';

@Component({
  selector: 'oc-modal-change-password',
  templateUrl: './modal-change-password.component.html',
  styleUrls: ['./modal-change-password.component.css']
})
export class ModalChangePasswordComponent implements OnInit, OnDestroy {
  /*********************************************/
  /* Properties
  /*********************************************/
  user: any;
  formData: any;
  errorMessage: any = '';
  userSubscription: Subscription;

  /*********************************************/
  /* Constructor
  /*********************************************/
  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private translate: TranslateService,
    private helper: HelperService
  ) {
    this.userSubscription = this.userService.userChangePassword$.subscribe(
      user => {
        this.user = user;
        this.helper.showModalPopup('#modal-change-password');
      }
    );
  }

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {
    this.initFields();
    $('#modal-change-password').on('shown.bs.modal', event => {
      this.initFields();
    });
    this.attachModalEventListeners();
  }

  /*********************************************/
  /* Method to initialize input form fields
  /*********************************************/
  initFields() {
    this.formData = {
      username: '',
      password: '',
      confirmPassword: ''
    };
  }

  /*********************************************/
  /* Lifecycle hook OnDestroy
  /*********************************************/
  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  /*********************************************/
  /* Method to attach listeners to change text
  /* input focus to password field and attach
  /* listener for pressing enter key
  /*********************************************/
  attachModalEventListeners() {
    // keypress enter listener
    let pressEnter = e => {
      let code = e.keyCode ? e.keyCode : e.which;
      if (code == 13) {
        this.changePassword();
      }
    };
    // clear password fields whenever modal is opened again
    $('#modal-change-password').on('show.bs.modal', event => {
      this.formData.password = '';
      this.formData.confirmPassword = '';
    });
    // set focus to password field on modal shown
    // and attach keypress listener for enter key
    $('#modal-change-password').on('shown.bs.modal', event => {
      $('#input-change-password').focus();
      $('#modal-change-password').on('keypress', pressEnter);
    });
    // remove keypress listener when modal is closed
    $('#modal-change-password').on('hide.bs.modal', event => {
      $('#modal-change-password').off('keypress', pressEnter);
    });
  }

  /*********************************************/
  /* Method to remove error message
  /*********************************************/
  onTextChange() {
    this.errorMessage = '';
  }

  /*********************************************/
  /* Method to dispatch change password request
  /*********************************************/
  changePassword() {
    if (!this.formData.password || !this.formData.confirmPassword) {
      this.errorMessage = this.translate.instant('Usermgmnt_pwd_msg1');
    } else if (this.formData.password != this.formData.confirmPassword) {
      this.errorMessage = this.translate.instant('Usermgmnt_pwd_msg2');
    } else {
      this.errorMessage = '';
      this.formData.username = this.user.username;
      this.formData.id = this.user.id;
      this.apiService.changePassword(this.formData).subscribe(
        data => {
          if (data.status) {
            $('#modal-change-password').modal('hide');
            $('#alert-change-password').show();
            setTimeout(() => $('#alert-change-password').hide(), 3000);
          } else {
            this.errorMessage = data.reason;
          }
        },
        error => {
          this.errorMessage = this.translate.instant('Usermgmnt_pwd_msg3');
        }
      );
    }
  }
}
