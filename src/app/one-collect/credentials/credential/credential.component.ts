import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CredentialService } from 'src/app/services/credential/credential.service';
import { Subscription } from 'rxjs';
import { Credential } from 'src/app/types/credential.type';
declare var $: any;
import * as _ from 'lodash';
import { TranslateService } from 'src/app/services/translate/translate.service';
import { DataService } from 'src/app/services/data/data.service';
import { ApiService } from 'src/app/services/api/api.service';
import { HelperService } from 'src/app/services/helper/helper.service';

@Component({
  selector: 'oc-credential',
  templateUrl: './credential.component.html',
  styleUrls: ['./credential.component.css']
})
export class CredentialComponent implements OnInit, OnDestroy {
  formData: Credential;
  allSelected: any;
  credentialSubscription: Subscription;
  addMode: boolean = true;
  errMessage: string = '';
  priorities: Array<string>;

  settingsPassPhrase = '';
  settingsSubscription: Subscription;

  @ViewChild('username', { static: false }) username: ElementRef;
  @ViewChild('port', { static: false }) port: ElementRef;
  @ViewChild('alias', { static: false }) alias: ElementRef;

  constructor(
    private credentialService: CredentialService,
    private translate: TranslateService,
    private dataService: DataService,
    private apiService: ApiService,
    private helper: HelperService
  ) {
    this.credentialSubscription = this.credentialService.openCredential$.subscribe(
      credential => {
        this.formData = credential;
        this.addMode = !this.formData.attributes.username.length;
        this.errMessage = ''; //remove the error message if any
        $('#modal-credential').modal({ backdrop: 'static', keyboard: false });
      }
    );
    // check if settings has changed for passPhrase to show input fields accordingly
    this.settingsSubscription = this.dataService.settingsChanged$.subscribe(
      preferences => {
        this.settingsPassPhrase = preferences['passPhrase'];
      }
    );
  }

  ngOnInit() {
    this.allSelected = this.credentialService.settings.allSelected;
    this.formData = _.cloneDeep(this.credentialService.defaultCredential);
    this.priorities = this.credentialService.settings.priorities;

    // get passPhrase from dataService
    this.apiService.getPreferences().subscribe(data => {
      let preferences = data['preference'];
      if (preferences) {
        preferences = JSON.parse(preferences)['basic'];
        this.settingsPassPhrase = preferences['passPhrase'];
      } else {
        this.settingsPassPhrase = '';
      }
    });
  }

  ngOnDestroy() {
    this.credentialSubscription.unsubscribe();
    this.settingsSubscription.unsubscribe();
  }

  toggleShowSubtypes(type: { showSubtypes: boolean }) {
    type.showSubtypes = !type.showSubtypes;
  }

  toggleTypeChecked(type: any) {
    this.credentialService.updateSubtypesInType(type); //update all subtypes for this type
    type.showSubtypes = type.selected; //expand or collapse the subtypes for this type
    this.allSelected = !(
      this.getAnyTypesUnchecked() || !this.getAllSubtypesChecked()
    );
  }

  updateTypeChecked(type) {
    type.selected = type.subtypes.some(subtype => subtype.selected === true);
    this.allSelected = this.getAllSubtypesChecked();
  }

  toggleAllChecked(selected) {
    _.forEach(this.formData.profiles, type => {
      type.selected = selected;
      this.toggleTypeChecked(type);
    });
  }

  getAllSubtypesChecked() {
    let flag = true;
    _.forEach(this.formData.profiles, type => {
      if (type.subtypes.some(subtype => subtype.selected === false)) {
        flag = false;
        return;
      }
    });
    return flag;
  }

  getAnyTypesUnchecked() {
    return this.formData.profiles.some(type => type.selected === false);
  }

  save() {
    try {
      this.validateData();
      this.errMessage = '';
      this.credentialService.submitCredential(_.cloneDeep(this.formData));
    } catch (e) {
      this.errMessage = e;
    }
  }

  validateData(): boolean {
    return this.validateAttributes() && this.validateProfile();
  }

  validateProfile(): boolean {
    if (!this.formData.profiles.some(e => e.selected === true)) {
      throw this.translate.instant('Credential_management_validation_profile');
    }
    return true;
  }

  validateAttributes(): boolean {
    if (!this.formData.attributes.alias) {
      this.alias.nativeElement.focus();
      throw `${this.translate.instant('Alias')} ${this.translate.instant(
        'Credential_management_validation_required'
      )}`;
    } else {
      const credentials = this.credentialService.reloadCredentials();
      if (
        this.addMode &&
        _.filter(
          credentials,
          credential =>
            credential.alias.toUpperCase() ===
            this.formData.attributes.alias.toUpperCase()
        ).length
      ) {
        this.alias.nativeElement.focus();
        const msg = `${this.translate.instant(
          'Credential_management_validation_alias_exists'
        )}`;
        throw msg.replace('alias_name', this.formData.attributes.alias);
      }
    }

    if (!this.formData.attributes.username) {
      this.username.nativeElement.focus();
      throw `${this.translate.instant('Username')} ${this.translate.instant(
        'Credential_management_validation_required'
      )}`;
    }
    const portReg = /^()([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$/g;
    if (
      !this.formData.attributes.port ||
      !portReg.test(this.formData.attributes.port.toString())
    ) {
      this.port.nativeElement.focus();
      throw `${this.translate.instant(
        'Credential_management_validation_port'
      )}`;
    }

    // check if passphrases match if not already set
    if (!this.settingsPassPhrase) {
      const validation = { passPhrase: '', errMessage: '' };
      // Passphrase validation
      this.helper.validatePassphrase(
        this.formData.attributes.passphrase,
        this.formData.attributes.confirmPassphrase,
        validation,
        true
      );
      if (!validation.passPhrase) {
        this.dataService.settingsSave(this.formData.attributes.passphrase);
      } else {
        throw `${this.translate.instant(validation.errMessage)}`;
      }
    }

    return true;
  }
}
