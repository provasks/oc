import { Component, OnInit, OnDestroy, AfterViewChecked } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { UserService } from 'src/app/services/user/user.service';
import { TranslateService } from 'src/app/services/translate/translate.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Settings } from 'src/app/content/settings';
import * as _ from 'lodash';
import { HelperService } from 'src/app/services/helper/helper.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'oc-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.css']
})
export class MainHeaderComponent
  implements OnInit, OnDestroy, AfterViewChecked {
  settings: any = Settings;
  notificationReport: any;
  notificationChange: any;
  newNotification: boolean = false;
  notifyShutdown: any = {};
  activeUser: any;
  users: any;
  appMeta: any;
  userLoggedIn: boolean = false;
  green_count: any;
  notificationMsg: any;
  notification_data: any[] = [];
  notification_data2: any[] = [];
  versionChange: any;
  plugin_updates: any;
  translate_dict: any;
  errorMsg: any;
  fileLabel: any;
  typeCheck: any;
  uploadMsg: any;
  notification_upload_failed: any;
  notification_upload_format: any;
  notification_uploading_msg: any;
  notification_latestversion: any;
  notification_notinstalled: any;
  notification_upgrade: any;
  locale: any;
  appMetaSubscription: Subscription;
  usersSubscription: Subscription;
  userLoggedInSubscription: Subscription;
  userAlreadyLoggedInSubscription: Subscription;
  client = environment.client;

  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private userService: UserService,
    private translate: TranslateService,
    private router: Router,
    private helper: HelperService
  ) {
    this.userLoggedInSubscription = this.userService.userLoggedIn$.subscribe(
      status => {
        this.setActiveUser();
        this.userLoggedIn = status;
        this.displayNotificationModal();
      }
    );
    this.userAlreadyLoggedInSubscription = this.userService.userAlreadyLoggedIn$.subscribe(
      status => {
        this.userLoggedIn = status;
      }
    );
    this.appMetaSubscription = this.dataService.appMeta$.subscribe(
      appMeta => (this.appMeta = appMeta)
    );
    this.notification_upload_format =
      translate.data['Notification_modal_upload_format'];
    this.notification_uploading_msg =
      translate.data['Notification_modal_uploading_msg'];
    this.notification_upload_failed =
      translate.data['Notification_modal_upload_failed'];
    this.notification_upgrade = translate.instant('Notification_upgrade');
    this.notification_latestversion = translate.instant(
      'Notification_latestversion'
    );
    this.notification_notinstalled = translate.instant(
      'Notification_notinstalled'
    );

    this.translate_dict = translate.data;
  }

  ngAfterViewChecked() {}

  ngOnInit() {
    this.locale = this.dataService.getLocale();
    this.setActiveUser();
    this.notifyShutdown = {
      title: 'Confirm Shutdown',
      message: `<b>Do you really want to shutdown ${this.translate.instant(
        'OC_title'
      )}?</b>
                <br><small>Note: If you shutdown the server, need to restart
                server manually to use ${this.translate.instant(
                  'OC_title'
                )} again.</small>`,
      width: '300',
      color: '#333',
      confirm: true
    };
    let appMeta = this.dataService.appMeta;
    if (appMeta) {
      if (!appMeta.hosted) {
        this.displayNotificationModal();
      }
    } else {
      this.apiService.getAppMeta().subscribe(appMeta => {
        this.dataService.setAppMeta(appMeta);
        if (!appMeta.hosted) {
          this.displayNotificationModal();
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
    if (this.userLoggedInSubscription) {
      this.userLoggedInSubscription.unsubscribe();
    }
    if (this.appMetaSubscription) {
      this.appMetaSubscription.unsubscribe();
    }
  }

  showTopHatNav() {
    let appMeta = this.appMeta;
    let userLoggedIn = this.userLoggedIn;
    // when no meta available hide nav
    if (!appMeta) {
      return false;
    }
    // when not hosted show nav
    if (!appMeta.hosted) {
      return true;
    }
    // when hosted and logged in show nav
    if (appMeta.hosted && userLoggedIn) {
      return true;
    }
    // for all other cases hide nav
    return false;
  }

  setActiveUser() {
    // fetch active user to show user management features
    this.apiService.getLoggedUser().subscribe(user => {
      this.activeUser = user;
      this.userService.setActiveUser(user);
      if (user.is_superuser) {
        if (this.usersSubscription) {
          this.usersSubscription.unsubscribe();
        }
        this.usersSubscription = this.userService.users$.subscribe(
          users => (this.users = users)
        );
        this.userService.setUsers();
      }
    });
  }

  showSettingsModal() {
    this.dataService.settingsReset();
    this.helper.showModalPopup('#settings-modal');
  }

  //Notification
  displayNotificationModal() {
    let value: any;
    this.green_count = 0;
    let change: any;
    this.notificationMsg = null;
    let upgrade = '';
    let latest = '';
    let not_installed = '';
    this.notification_data2 = [];
    this.apiService.getNotification().subscribe(notification => {
      this.notification_data = [];
      this.notificationMsg = notification['report'];
      change = notification['change'];
      if (change == 'true') {
        this.versionChange = true;
        this.helper.showModalPopup('#ca-notification-modal');
      }
      this.plugin_updates = notification['plugin_updates'];
      $('#update-toast').show();
      setTimeout(() => {
        $('#update-toast').hide();
      }, 2500);
      this.plugin_table(this.plugin_updates);
    });
  }

  //Expand and collapse row
  getrow(plugin_count) {
    _.forEach(this.notification_data, (value, key) => {
      if (value['plugin_count'] == plugin_count) {
        if (value['arrow'] == false) {
          value['showrow'] = true;
          value['arrow'] = true;
        } else {
          value['showrow'] = false;
          value['arrow'] = false;
        }
      }
    });
  }

  //Plugin table data
  plugin_table(plugin_updates) {
    this.green_count = 0;
    _.forEach(plugin_updates, (plugin_obj, name) => {
      if (plugin_obj['status'] == this.translate_dict['Notification_upgrade']) {
        this.notification_data.push({
          plugin_count: plugin_obj['plugin_count'],
          name: name,
          old_version: plugin_obj['old_version'],
          new_version: plugin_obj['new_version'],
          plugin_update_data: plugin_obj['plugin_update_data'],
          status: plugin_obj['status'],
          showrow: false,
          arrow: false
        });
      } else if (
        plugin_obj['status'] ==
        this.translate_dict['Notification_latestversion']
      ) {
        this.green_count += 1;
        this.notification_data.push({
          plugin_count: plugin_obj['plugin_count'],
          name: name,
          old_version: plugin_obj['old_version'],
          new_version: plugin_obj['new_version'],
          plugin_update_data: plugin_obj['plugin_update_data'],
          status: plugin_obj['status'],
          showrow: false,
          arrow: false
        });
      } else if (
        plugin_obj['status'] == this.translate_dict['Notification_notinstalled']
      ) {
        this.notification_data.push({
          plugin_count: plugin_obj['plugin_count'],
          name: name,
          old_version: 'Not installed',
          new_version: plugin_obj['new_version'],
          plugin_update_data: plugin_obj['plugin_update_data'],
          status: plugin_obj['status'],
          showrow: false,
          arrow: false
        });
      }
      if (this.green_count == Object.keys(plugin_updates).length) {
        this.versionChange = false;
      }
    });
  }

  //Update button
  updatepluginfolder(plugin_name) {
    // console.log(plugin_name);
    this.apiService.getupdatedplugin(this.locale, plugin_name).subscribe(
      data => {
        this.notification_data = [];
        this.apiService.getNotification().subscribe(notification => {
          this.plugin_updates = notification['plugin_updates'];
          this.plugin_table(this.plugin_updates);
          $('#update-success').show();
          setTimeout(() => {
            $('#update-success').hide();
          }, 2500);
        });
      },
      error => {
        this.errorMsg = JSON.parse(error._body)['message'].split('] ')[1];
        $('#update-error').show();
        setTimeout(() => {
          $('#update-error').hide();
        }, 2500);
      }
    );
  }

  resetFolder(event) {
    event.target.value = '';
  }

  //Browse folder
  selectfolder(event) {
    let files = event.target.files;
    if (files && files.length > 0) {
      let badType = false;
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let regex = /\.[^.]+$/g;
        let extension = regex.exec(file.name)[0].toLowerCase();

        // get filelabel
        if (files.length == 1) {
          let filename = file.name
            .split('.')
            .slice(0, -1)
            .join('.');
          if (filename.length > 10) {
            this.fileLabel = filename.slice(0, 10) + '...' + extension;
          } else {
            this.fileLabel = file.name;
          }
        } else {
          this.fileLabel =
            files.length + this.translate.instant('Importfile_files');
        }

        if (extension != '.zip') {
          this.typeCheck = 'fail';
          this.uploadMsg = this.notification_upload_format;
          badType = true;
        }
      }

      if (!badType) {
        let forms = [];
        for (let i = 0; i < files.length; i++) {
          let file = files[i];
          this.typeCheck = 'pass';
          this.uploadMsg = this.notification_uploading_msg;
          let formData: FormData = new FormData();
          formData.append('select_file', file, file.name);
          formData.append('type', `edit${i}`);
          forms.push(formData);
        }
        let timeDelay = 500;
        _.forEach(forms, (formData, i) => {
          setTimeout(() => {
            this.apiService.getzippedfolder(this.locale, formData).subscribe(
              result => {
                if (JSON.parse(result._body)['status'] != 'success') {
                  this.typeCheck = 'fail';
                  this.uploadMsg = JSON.parse(result._body)['message'];
                } else {
                  this.notification_data = [];
                  this.apiService.getNotification().subscribe(notification => {
                    this.plugin_updates = notification['plugin_updates'];
                    this.plugin_table(this.plugin_updates);
                    this.typeCheck = 'pass';
                    this.uploadMsg = JSON.parse(result._body)['message'];
                  });
                }
              },
              error => {
                this.uploadMsg = this.notification_upload_failed;
              }
            );
          }, timeDelay);
          timeDelay += 500;
        });
      }
    }
  }

  //  displayNotificationModal() {
  //    this.apiService.getNotification().subscribe(notification => {
  //      this.notificationReport = notification.report;
  //      if (notification.change == 'true') {
  //        this.newNotification = true;
  //        $('#oc-app-notification-modal').modal({
  //     backdrop: 'static',
  //     keyboard: false
  //   });
  //      }
  //    });
  //  }

  startTour() {
    this.dataService.tourStart();
  }

  confirmShutdown() {
    $('#confirm-shutdown').modal({
      backdrop: 'static',
      keyboard: false
    });
  }

  shutDown(event) {
    $('#modal-shutdown').modal({
      backdrop: 'static',
      keyboard: false
    });
    this.apiService.shutDown().subscribe(data => {
      // do something after shutdown
    });
  }

  initCreateUser() {
    if (this.users.length < 10) {
      this.helper.showModalPopup('#modal-create-user');
    } else {
      this.helper.showModalPopup('#create-user-notification');
    }
  }

  initChangePassword() {
    this.userService.userChangePassword(this.activeUser);
  }

  logoutUser() {
    this.apiService.logoutUser().subscribe(data => {
      if (data.status) {
        this.userService.userLoggedIn(false);
        let appMeta = _.assign(this.appMeta, { session: false });
        this.dataService.setAppMeta(appMeta);
        this.router.navigate(['/login']);
      }
    });
  }
}
