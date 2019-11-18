import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { Subject } from 'rxjs';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(public apiService: ApiService) {}

  /*********************************************/
  /* Active User / Logged In User
  /*********************************************/
  activeUser: any;
  users: any;
  session: boolean = false;
  instanceId: string = '';
  initEc2IdVerified: boolean = false;

  activeUserSource = new Subject<any>();
  activeUser$ = this.activeUserSource.asObservable();

  setSession(state) {
    this.session = state;
  }

  getSession() {
    return this.session;
  }

  setActiveUser(user) {
    this.activeUser = user;
    this.activeUserSource.next(user);
  }

  getActiveUser() {
    return this.activeUser;
  }

  /*********************************************/
  /* All Users List
  /*********************************************/
  usersSource = new Subject<any>();
  users$ = this.usersSource.asObservable();

  setUsers() {
    this.apiService.getUsers().subscribe(users => {
      _.forEach(users, user => {
        if (typeof user === 'object') {
          user['showRow'] = true;
          this.setRole(user);
        }
      });
      this.users = users;
      this.usersSource.next(users);
    });
  }

  setRole(user) {
    if (user.is_superuser && user.username == 'admin') {
      user.role = 'super-admin';
    } else if (user.is_superuser) {
      user.role = 'admin';
    } else {
      user.role = 'user';
    }
  }

  getUsers() {
    return this.users;
  }

  /*********************************************/
  /* Password change subject
  /*********************************************/
  userChangePasswordSource = new Subject<any>();
  userChangePassword$ = this.userChangePasswordSource.asObservable();
  userChangePassword(user) {
    this.userChangePasswordSource.next(user);
  }

  /*********************************************/
  /* Edit user subject
  /*********************************************/
  editUserSource = new Subject<any>();
  editUser$ = this.editUserSource.asObservable();
  editUser(user) {
    this.editUserSource.next(user);
  }

  /*********************************************/
  /* Active user subject
  /*********************************************/
  userLoggedInSource = new Subject<any>();
  userLoggedIn$ = this.userLoggedInSource.asObservable();
  userLoggedIn(status) {
    this.userLoggedInSource.next(status);
  }

  userAlreadyLoggedInSource = new Subject<any>();
  userAlreadyLoggedIn$ = this.userAlreadyLoggedInSource.asObservable();
  userAlreadyLoggedIn(status) {
    this.userAlreadyLoggedInSource.next(status);
  }
}
