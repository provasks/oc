import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { UserService } from 'src/app/services/user/user.service';
import { Subscription } from 'rxjs';
declare var $: any;

import { TranslateService } from '../../../services/translate/translate.service';
import { HelperService } from 'src/app/services/helper/helper.service';

@Component({
  selector: 'oc-modal-edit-user',
  templateUrl: './modal-edit-user.component.html',
  styleUrls: ['./modal-edit-user.component.css']
})
export class ModalEditUserComponent implements OnInit, OnDestroy {
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
    this.userSubscription = this.userService.editUser$.subscribe(user => {
      this.user = user;
      this.formData.username = user.username;
      this.formData.email = user.email;
      this.formData.role = user.role;
      this.helper.showModalPopup('#modal-edit-user');
    });
  }

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {
    this.formData = {
      username: '',
      email: ''
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
  /* Method to remove error message
  /*********************************************/
  onTextChange() {
    this.errorMessage = '';
  }

  /*********************************************/
  /* Method to dispatch edit user request
  /*********************************************/
  editUser() {
    let usernameReg = /^$|[^a-zA-Z0-9_]+/g;
    let usernameValid = !usernameReg.test(this.formData.username);
    let emailReg = /^$|^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let emailValid = emailReg.test(this.formData.email.toLowerCase());

    if (!this.formData.username) {
      this.errorMessage = this.translate.instant('Usermgmnt_user_req');
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
      user.id = this.user.id;
      user.old_username = this.user.username;
      this.apiService.updateUser(user).subscribe(data => {
        if (!data.status) {
          this.errorMessage = data.reason;
        } else {
          this.errorMessage = '';
          $('#modal-edit-user').modal('hide');
          $('#alert-edit-user').show();
          setTimeout(() => $('#alert-edit-user').hide(), 3000);
          this.userService.setUsers();
        }
      });
    }
  }
}
