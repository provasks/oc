import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { UserService } from 'src/app/services/user/user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GridComponent } from '../../grid/grid.component';
import * as _ from 'lodash';
declare var $: any;

import { TranslateService } from '../../../services/translate/translate.service';
import { HelperService } from 'src/app/services/helper/helper.service';

@Component({
  selector: 'oc-view-users',
  templateUrl: './view-users.component.html',
  styleUrls: ['./view-users.component.css']
})
export class ViewUsersComponent implements OnInit, OnDestroy {
  /*********************************************/
  /* Properties
  /*********************************************/
  grid: any;
  gridDo: any;
  users: any[] = [];
  user: any;
  userIdx: any;
  showContent: boolean = false;
  notification: any;

  usersSubscription: Subscription;

  // tour properties
  tourStarted: boolean = false;

  /*********************************************/
  /* Constructor
  /*********************************************/
  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private router: Router,
    private translate: TranslateService,
    private helper: HelperService
  ) {
    this.usersSubscription = this.userService.users$.subscribe(users => {
      this.users = users;
      this.showContent = true;
    });
  }

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {
    this.gridSetup();
    this.users = this.userService.getUsers();
    this.showContent = true;
  }

  /*********************************************/
  /* Lifecycle hook OnDestroy
  /*********************************************/
  ngOnDestroy() {
    if (this.grid.processClick) {
      document
        .getElementsByTagName('body')[0]
        .removeEventListener('click', this.grid.processClick);
    }
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }

  /*********************************************/
  /* Method to initialize component tour
  /*********************************************/
  toggleTour(state) {
    this.tourStarted = state;
  }

  /*********************************************/
  /* Method to bootstrap grid
  /*********************************************/
  gridSetup() {
    this.grid = new GridComponent();

    this.grid.mergeMeta({
      tableId: 'view-users',
      tableStriped: false,
      actionsWidth: '90px',
      showBottomScroll: false
    });

    this.grid.headers = [
      {
        width: '200px',
        title: this.translate.instant('Usermgmnt_table_col2'),
        key: 'username'
      },
      {
        width: '200px',
        title: this.translate.instant('Usermgmnt_table_col3'),
        key: 'email'
      },
      {
        width: '170px',
        title: this.translate.instant('Usermgmnt_table_col4'),
        key: 'role'
      },
      {
        width: '180px',
        title: this.translate.instant('Usermgmnt_table_col5'),
        key: 'last_login',
        filter: false
      }
    ];

    this.grid.initGrid();

    this.gridDo = (action, index, value?) => {
      this.users = this.grid.gridDo(action, this.users, index, value);
    };
  }

  /*********************************************/
  /* Method to initialize user creation
  /*********************************************/
  initCreateUser() {
    if (this.users.length < 10) {
      this.helper.showModalPopup('#modal-create-user');
    } else {
      this.helper.showModalPopup('#create-user-notification');
    }
  }

  /*********************************************/
  /* Method to delete user
  /*********************************************/
  initDeleteUser(idx) {
    let username = this.users[idx].username;
    this.userIdx = idx;
    this.notification = {
      title: this.translate.instant('Usermgmnt_del_modal'),
      message:
        this.translate.instant('Usermgmnt_del_modal_msg1') +
        `${username}` +
        this.translate.instant('Usermgmnt_span'),
      confirm: true
    };
    this.helper.showModalPopup('#remove-user');
    // set focus to confirm button so that user can press
    // enter key to delete instead of click by mouse
    $('#remove-user').on('shown.bs.modal', event => {
      $('#remove-user .confirm').focus();
    });
  }

  /*********************************************/
  /* Callback when deletion of user is confirmed
  /*********************************************/
  confirmDeleteUser(event) {
    let idx = this.userIdx;
    // do nothing if there is no UserId that has been set for deletion
    if (idx != 0 && !idx) {
      return;
    }
    let id = this.users[idx].id;
    // proceed to delete otherwise
    this.apiService.deleteUser(id).subscribe(
      data => {
        $('#alert-user-deleted').show();
        setTimeout(() => $('#alert-user-deleted').hide(), 3000);
        this.userService.setUsers();
      },
      error => {
        // handle error
      }
    );
  }

  /*********************************************/
  /* Method to initialize edit user
  /*********************************************/
  initEditUser(idx) {
    this.user = this.users[idx];
    this.userService.editUser(this.user);
  }

  /*********************************************/
  /* Method to initialize password change
  /*********************************************/
  initChangePassword(idx) {
    this.user = this.users[idx];
    this.userService.userChangePassword(this.user);
  }
}
