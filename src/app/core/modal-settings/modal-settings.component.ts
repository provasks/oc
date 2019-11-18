import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { UserService } from 'src/app/services/user/user.service';
import { Subscription } from 'rxjs';
import { Settings } from 'src/app/content/settings';
import * as _ from 'lodash';
declare var $: any;

import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HelperService } from 'src/app/services/helper/helper.service';

@Component({
  selector: 'oc-modal-settings',
  templateUrl: './modal-settings.component.html',
  styleUrls: ['./modal-settings.component.css']
})
export class ModalSettingsComponent implements OnInit, OnDestroy {
  settings: any = Settings;
  options: any = {};
  settingsSaveSubscription: Subscription;
  settingsResetSubscription: Subscription;
  loggedInSubscription: Subscription;
  confirmationMsg: any;
  confirmationStatus: boolean;
  validation: any = {};

  //**CA varibles**//
  caLaunch: boolean = environment.caLaunch;
  verificationOptions: any = {};
  reportOptions: any = {};
  subscription: Subscription;
  verification: any = {};
  disableAsupUI: boolean = true;
  secure: any;
  showPluginUpdateButton: boolean = false;
  superuser: any;
  
  client = environment.client;

  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private userService: UserService,
    private helper: HelperService,
    private router: Router
  ) {
    // subscribe to save in modal-collect to update passPhrase in settings
    this.settingsSaveSubscription = dataService.settingsSave$.subscribe(
      passPhrase => {
        this.options.passPhrase = passPhrase;
        this.options.confirm_passPhrase = passPhrase;
        this.saveWithoutValidation();
      }
    );
    // subscribe to reset of modal when cancelled and opened again
    this.settingsResetSubscription = dataService.settingsReset$.subscribe(
      () => {
        this.initFields();
      }
    );
    this.loggedInSubscription = userService.userLoggedIn$.subscribe(data => {
      if (data) {
        //Provas: stop initializing and launching if logged out
        this.initFields();
        this.firstLaunch();
      }
    });
  }

  ngOnDestroy() {
    this.settingsSaveSubscription.unsubscribe();
    this.settingsResetSubscription.unsubscribe();
    this.loggedInSubscription.unsubscribe();
  }

  ngOnInit() {
    $('[data-toggle="tooltip"]').tooltip();

    let modalInitData = () => {
      this.apiService.getLoggedUser().subscribe(data => {
        let active_user = data['username'];
        let superuser = data['is_superuser'];
        if (superuser) {
          this.showPluginUpdateButton = true;
        } else {
          this.showPluginUpdateButton = false;
        }
      });
      this.displayLatestSettings();
    };

    $('#settings-modal').on('shown.bs.modal', event => {
      modalInitData();
    });

    $('[data-toggle="tooltip"]').tooltip();

    // subscribe to change settings click event
    this.dataService.settings$.subscribe(() => {
      modalInitData();
    });
    this.resetValidation();

    let appMeta = this.dataService.appMeta;
    if (appMeta) {
      if (!appMeta.hosted) {
        this.initFields();
        this.firstLaunch();
      }
    } else {
      this.apiService.getAppMeta().subscribe(appMeta => {
        this.dataService.setAppMeta(appMeta);
        if (!appMeta.hosted) {
          this.initFields();
          this.firstLaunch();
        }
      });
    }
  }

  firstLaunch() {
    this.apiService.getLaunchPageCount().subscribe(data => {
      let count = data['count'];
      if (count == 0) {
        this.helper.showModalPopup('#settings-modal');
        // show "start tour" link highlighted
        //this.tourInstructionStarted = true;
      }
      this.apiService.updateLaunchPageCount().subscribe();
    });
  }

  initFields() {
    this.resetValidation();
    // load preference data from api
    this.apiService.getPreferences().subscribe(data => {
      let preferences = data['preference'];
      if (preferences == null || preferences == '{}') {
        this.setDefaultValues();
      } else {
        this.setFieldValues(preferences);
      }
    });
    if (this.caLaunch) {
      this.verificationOptions.firstname = '';
      this.verificationOptions.lastname = '';
      this.verificationOptions.email = '';
    }
  }

  setFieldValues(preferences) {
    preferences = JSON.parse(preferences)['basic'];
    if (this.caLaunch) {
      // User verification
      if (_.has(preferences, 'preference')) {
        if (JSON.parse(preferences.preference)['verification']) {
          this.verification = JSON.parse(preferences.preference)[
            'verification'
          ];
          this.verificationOptions.firstname = this.verification.firstname;
          this.verificationOptions.lastname = this.verification.lastname;
          this.verificationOptions.email = this.verification.email;
        }
      }
      if (_.has(preferences, 'enablePluginUpdate')) {
        this.options.enablePluginUpdate = preferences.enablePluginUpdate;
      } else {
        this.options.enablePluginUpdate = false;
      }
    }

    // default values
    if (_.has(preferences, 'enableASUP')) {
      this.options.enableASUP = preferences.enableASUP;
    } else {
      this.options.enableASUP = true;
    }
    if (_.has(preferences, 'telemetry')) {
      this.options.telemetry = preferences.telemetry;
    } else {
      this.options.telemetry = true;
    }
    if (_.has(preferences, 'configureProxy')) {
      this.options.configureProxy = preferences.configureProxy;
    } else {
      this.options.configureProxy = false;
    }
    if (_.has(preferences, 'advance_emailNotification')) {
      this.options.advance_emailNotification =
        preferences.advance_emailNotification;
    } else {
      this.options.advance_emailNotification = false;
    }
    if (_.has(preferences, 'ScheduledEmailNotification')) {
      this.options.ScheduledEmailNotification =
        preferences.ScheduledEmailNotification;
    } else {
      this.options.ScheduledEmailNotification = false;
    }
    // ASUP proxy properties
    this.options.proxy = preferences.proxy ? preferences.proxy : '';
    this.options.port = preferences.port ? preferences.port : '';
    this.options.username = preferences.username ? preferences.username : '';
    this.options.password = preferences.password ? preferences.password : '';
    // Email properties
    this.options.smtp_host = preferences.smtp_host ? preferences.smtp_host : '';
    this.options.smtp_port = preferences.smtp_port
      ? preferences.smtp_port
      : '25';
    this.options.smtp_username = preferences.smtp_username
      ? preferences.smtp_username
      : '';
    this.options.smtp_password = preferences.smtp_password
      ? preferences.smtp_password
      : '';
    this.options.notification_email = preferences.notification_email
      ? preferences.notification_email
      : '';
    if (this.caLaunch) {
      this.options.enableOneCollect = preferences.enableOneCollect;
      // set enable onecollect status in dataservice
      this.dataService.setEnableOneCollect(preferences.enableOneCollect);
      this.dataService.setCustomOC(preferences.enableOneCollect);
      //Report Customization Settings
      this.options.disableReportCustomization =
        preferences.disableReportCustomization;
      this.subscription = this.dataService.modalCustomReport$.subscribe(
        customrepvalue => {
          this.options.disableReportCustomization = customrepvalue;
        }
      );
      this.options.enableVisualization = preferences.enableVisualization;
      // set enable Visualization in dataservice
      this.dataService.setEnableVisualization(preferences.enableVisualization);
    }
    // Telnet and Auto-validation
    if (_.has(preferences, 'telnet')) {
      this.options.telnet = preferences.telnet;
    } else {
      this.options.telnet = false;
    }
    // when passphrase is set then disable input field
    if (preferences.passPhrase) {
      this.options.passPhraseAlreadySet = true;
      this.options.passPhrase = preferences.passPhrase;
      this.options.confirm_passPhrase = preferences.passPhrase;
    } else {
      this.options.passPhraseAlreadySet = false;
      this.options.passPhrase = '';
      this.options.confirm_passPhrase = '';
    }
    //this.options.confirm_passPhrase = preferences.confirm_passPhrase;
    if (_.has(preferences, 'auto_validation')) {
      this.options.auto_validation = preferences.auto_validation;
    } else {
      this.options.auto_validation = true;
    }
  }

  setDefaultValues() {
    this.options.enableASUP = true;
    this.options.telemetry = true;
    this.options.configureProxy = false;
    this.options.advance_emailNotification = false;
    this.options.ScheduledEmailNotification = false;
    // ASUP proxy properties
    this.options.proxy = '';
    this.options.port = '';
    this.options.username = '';
    this.options.password = '';
    // Email properties
    this.options.smtp_host = '';
    this.options.smtp_port = '25';
    this.options.smtp_username = '';
    this.options.smtp_password = '';
    this.options.notification_email = '';
    this.options.telnet = true;
    this.options.passPhrase = '';
    this.options.confirm_passPhrase = '';
    this.options.auto_validation = true;
    if (this.caLaunch) {
      this.options.enablePluginASUP = false;
      this.options.enableOneCollect = false;
      this.options.disableReportCustomization = false;
      this.options.enableVisualization = false;
      this.options.telnet = false;
    } else {
      this.options.telnet = true;
    }
    this.options.passPhraseAlreadySet = false;
  }

  save() {
    // validate IP range
    let error = this.validateFields();
    if (!error) {
      let data = {};
      data['basic'] = this.options;
      if (!this.caLaunch) {
        this.apiService.postPreferences(data).subscribe();
      }
      // dispatch event to effect modal-collect passPhrase
      this.dataService.settingsChanged(this.options);

      if (this.caLaunch) {
        //Verificationsettings
        this.verificationOptions.firstname = this.verification.firstname;
        this.verificationOptions.lastname = this.verification.lastname;
        this.verificationOptions.email = this.verification.email;
        data['verification'] = this.verificationOptions;
        try {
          if (
            !this.verification.firstname ||
            !this.verification.lastname ||
            this.verification.email
          ) {
            this.apiService
              .setVerification(this.verificationOptions)
              .subscribe(verresponse => {
                console.log(verresponse);
              });
          }
        } catch (e) {
          console.log('Verification error');
        }

        //enable Onecollect
        this.dataService.setCustomOC(this.options.enableOneCollect);
        this.dataService.setEnableOneCollect(this.options.enableOneCollect);
        this.dataService.setEnableVisualization(
          this.options.enableVisualization
        );
        this.apiService.getPreferences().subscribe(preferences => {
          if (preferences.preference != '') {
            if (JSON.parse(preferences.preference)['report']) {
              //Report preference is set
              let reportSettings;
              reportSettings = JSON.parse(preferences.preference)['report'];
              data['report'] = reportSettings;
              this.apiService.postPreferences(data).subscribe(response => {
                this.closeModal();
              });
            } else {
              //Report preference is not set
              this.apiService.postPreferences(data).subscribe(response => {
                this.closeModal();
              });
            }
          } else {
            //No preference is set
            this.apiService.postPreferences(data).subscribe(response => {
              this.closeModal();
            });
          }
        });
      }
      // close modal
      $('#settings-modal').modal('hide');
    }
  }

  //**CA CODE**//
  closeModal() {
    //Re-route to solution-based if in device based and disable onecollect setting
    if (!this.options.enableOneCollect) {
      let url = this.router.url;
      if (url.indexOf('/new-collection/device-based') >= 0) {
        this.router.navigate(['/new-collection/solution-based']);
      } else if (url.indexOf('/new-collection/asup-based') >= 0) {
        this.router.navigate(['/new-collection/solution-based']);
      } else if (url.indexOf('/new-collection/discover-ip') >= 0) {
        this.router.navigate(['/new-collection/solution-based']);
      } else if (url.indexOf('/new-collection/import-devices') >= 0) {
        this.router.navigate(['/new-collection/solution-based']);
      }
      // close modal
      $('#settings-modal').modal('hide');
    }
  }

  //**CA CODE**//
  navigateToDashboardPage() {
    location.reload();
    this.router.navigate(['/']);
  }

  //**CA CODE**//
  displayLatestSettings() {
    // load preference data from api
    this.apiService.getPreferences().subscribe(preferences => {
      console.log(preferences);
      // User verification
      if (JSON.parse(preferences.preference)['verification']) {
        this.verification = JSON.parse(preferences.preference)['verification'];
        this.verificationOptions.firstname = this.verification.firstname;
        this.verificationOptions.lastname = this.verification.lastname;
        this.verificationOptions.email = this.verification.email;
      }
      preferences = JSON.parse(preferences.preference)['basic'];
      // default values
      this.options.enablePluginUpdate = preferences.enablePluginUpdate;
      this.options.enableASUP = preferences.enableASUP;
      this.options.configureProxy = preferences.configureProxy;
      this.options.advance_emailNotification =
        preferences.advance_emailNotification;
      this.options.ScheduledEmailNotification =
        preferences.ScheduledEmailNotification;
      // ASUP proxy properties
      this.options.proxy = preferences.proxy;
      this.options.port = preferences.port;
      this.options.username = preferences.username;
      this.options.password = preferences.password;
      // Email properties
      this.options.smtp_host = preferences.smtp_host;
      this.options.smtp_port = preferences.smtp_port;
      this.options.smtp_username = preferences.smtp_username;
      this.options.smtp_password = preferences.smtp_password;
      this.options.notification_email = preferences.notification_email;
      // Telnet and Auto-validation
      this.options.telnet = preferences.telnet;
      //Enable OneCollect settings
      this.options.enableOneCollect = preferences.enableOneCollect;
      //Report Customization Settings
      this.options.disableReportCustomization =
        preferences.disableReportCustomization;
      this.subscription = this.dataService.modalCustomReport$.subscribe(
        customrepvalue => {
          this.options.disableReportCustomization = customrepvalue;
        }
      );
      //Enable Visualization and device details
      this.options.enableVisualization = preferences.enableVisualization;
      // set enable Visualization in dataservice
      this.dataService.setEnableVisualization(preferences.enableVisualization);

      // when passphrase is set then disable input field
      if (preferences.passPhrase) {
        this.options.passPhraseAlreadySet = true;
        this.options.passPhrase = preferences.passPhrase;
        this.options.confirm_passPhrase = preferences.passPhrase;
      } else {
        this.options.passPhraseAlreadySet = false;
        this.options.passPhrase = '';
        this.options.confirm_passPhrase = '';
      }
      // this.options.passPhrase = preferences.passPhrase;
      // this.options.confirm_passPhrase = preferences.passPhrase;
      if (_.has(preferences, 'auto_validation')) {
        this.options.auto_validation = preferences.auto_validation;
      } else {
        this.options.auto_validation = true;
      }
    });
    this.verificationOptions.firstname = '';
    this.verificationOptions.lastname = '';
    this.verificationOptions.email = '';

    this.apiService.getLoggedUser().subscribe(data => {
      this.secure = data['secure'];
      if (this.secure == true) {
        this.disableAsupUI = false;
        this.options.telnet = true;
      } else {
        this.disableAsupUI = true;
        this.options.telnet = false;
      }
    });
    this.helper.showModalPopup('#settings-modal');
  }

  saveWithoutValidation() {
    let data = {};
    data['basic'] = this.options;
    this.apiService.postPreferences(data).subscribe();
    // dispatch event to effect modal-collect passPhrase
    this.dataService.settingsChanged(this.options);
    this.options.passPhraseAlreadySet = true;
  }

  changeInEmailNotification() {
    if (!this.options.advance_emailNotification) {
      this.options.ScheduledEmailNotification = false;
    }
  }

  resetValidation() {
    this.validation['smtp_host'] = false;
    this.validation['notification_email'] = false;
    this.validation['passPhrase'] = false;
    this.validation['user_email'] = false;
  }

  validateFields() {
    // clear previous validations
    this.resetValidation();
    if (this.verification.email) {
      this.validateUserEmail();
    }
    // validation only on email notification checked
    if (this.options.advance_emailNotification) {
      if (!this.options.smtp_host) {
        this.validation['smtp_host'] = true;
      }
      if (!this.options.notification_email) {
        this.validation['notification_email'] = true;
      }
    }
    // Passphrase validation
    if (!this.options.passPhraseAlreadySet) {
      this.helper.validatePassphrase(
        this.options.passPhrase,
        this.options.confirm_passPhrase,
        this.validation
      );
    }

    // check all validations
    let error = false;
    _.forEach(this.validation, (value, key) => {
      if (value) {
        error = true;
      }
    });
    return error;
  }
  //**CA CODE**//
  //Validate user email
  validateUserEmail() {
    let regexp = new RegExp(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    let searchfind = regexp.test(this.verification.email);
    if (!searchfind) {
      this.validation['user_email'] = true;
    }
  }
}
