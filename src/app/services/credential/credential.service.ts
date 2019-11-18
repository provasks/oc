import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ApiService } from '../api/api.service';
import * as _ from 'lodash';
import { HelperService } from '../helper/helper.service';
import { Credential } from '../../types/credential.type';
import { EventEmitter } from '@angular/core';
import { TranslateService } from '../translate/translate.service';
declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class CredentialService {
  profiles: any;
  settings: any;
  defaultCredential: Credential;
  credential: Credential;
  credentials: Array<Credential>;
  credentialSubmitted: EventEmitter<string> = new EventEmitter();

  /**
   * Constructor
   * @param apiService
   * @param helper
   */
  constructor(
    private apiService: ApiService,
    private helper: HelperService,
    private translate: TranslateService
  ) {
    this.settings = this.helper.settings['credentialManagement'];
    this.defaultCredential = {
      attributes: {
        username: '',
        password: '',
        port: this.settings.defaultPort,
        sudoPassword: '',
        alias: '',
        priority: this.settings.defaultPriority,
        passphrase: '',
        confirmPassphrase: ''
      },
      profiles: []
    };
    this.setDefaultCredential();
  }

  /*********************************************/
  /* open credential subject
  /*********************************************/
  credentialSource = new Subject<any>();
  openCredential$ = this.credentialSource.asObservable();
  openCredential(credential: any) {
    this.credentialSource.next(credential);
  }

  /*********************************************/
  /* Method to fetch basic devices data before
  /* generating any rows
  /*********************************************/
  setDefaultCredential() {
    // fetch device types
    this.apiService.getDeviceTypes().subscribe(respDeviceTypes => {
      const deviceTypes = _.sortBy(respDeviceTypes, 'title');
      // fetch device details for each type
      this.apiService
        .getDeviceDetails(deviceTypes)
        .subscribe(respDeviceDetails => {
          this.credential = this.defaultCredential;
          const deviceDetails = respDeviceDetails;
          _.forEach(deviceTypes, (type, i) => {
            const subtypes = _.toArray(deviceDetails[i].subtypes);
            type.subtypes = _.sortBy(subtypes, 'title'); // Sort ascending by title
            type.selected = this.settings.allSelected; // Select based on all selection
            this.updateSubtypesInType(type);
            type.showSubtypes = this.settings.showSubtypes;
          });

          this.defaultCredential.profiles = deviceTypes;
        });
    });
  }

  /**********************************************
   * Select or deselect all subtypes under a type
   **********************************************/
  updateSubtypesInType(type: any) {
    type.subtypes.forEach(subtype => {
      subtype.selected = type.selected; //select all subtypes
    });
  }

  /**********************************************
   * Returns a clone of default Credential
   **********************************************/
  getDefaultCredential() {
    return _.cloneDeep(this.defaultCredential);
  }

  /**********************************************************
   * Responsible to fetch all credentials, sort
   * those descending by updated time. if no callback found,
   * It will returns the existing all credentials
   *********************************************************/
  reloadCredentials(callback?, scope?): any[] {
    if (!callback) return this.credentials;
    this.apiService.reloadCredentials().subscribe(credentials => {
      this.credentials = _.orderBy(credentials, ['updated'], ['desc']);
      this.addShowRow(this.credentials);
      callback(this.credentials, scope);
    });
    return this.credentials;
  }

  /**********************************************
   * Helps to display each credential in the grid
   **********************************************/
  addShowRow(credentials: Credential[]) {
    _.forEach(credentials, (credential, i) => {
      credential.showRow = true;
    });
  }

  /**********************************************
   * Helps to add or update credential
   **********************************************/
  submitCredential(credential: Credential) {
    const data = this.getRequestData(credential);
    this.apiService.setCredential(data).subscribe(
      () => {
        $('#modal-credential').modal('hide');
        this.credentialSubmitted.emit('success');
      },
      error => {
        throw error;
      }
    );
  }

  /**************************************************************
   * Prepare the request data.
   * Basically it will pickup the selected subtypes under a type
   * and dump the subtypes into an array for the same type
   **************************************************************/
  getRequestData(credential: Credential) {
    let data = { attributes: {}, profiles: {} };
    data.attributes = credential.attributes;
    const types = credential.profiles
      .filter(type => type.selected === true)
      .forEach(
        type =>
          (data.profiles[type.title] = type.subtypes //data.profiles is the target
            .filter(subtype => subtype.selected === true)
            .map(st => st.title))
      );
    delete data['attributes']['profiles'];
    return data;
  }

  /*******************************************************************
   * Based on the suppied Alias it will call the api to get the detail
   * of the device credential.
   * As the format of device credential does not match with the default
   * credential, the parameters of the device credential will be applied on the
   * default credential
   ******************************************************************/
  getCredential(alias: string) {
    const defaultCredential = this.getDefaultCredential();
    this.apiService.getCredential(alias).subscribe(deviceCredential => {
      defaultCredential.attributes = deviceCredential.attributes;
      _.forOwn(deviceCredential.profiles, (devSubtypes, devType) => {
        _.forEach(defaultCredential.profiles, defType => {
          if (defType.title === devType) {
            defType.selected = true;
            _.forEach(devSubtypes, devSubtype => {
              _.forEach(defType.subtypes, defSubtype => {
                if (defSubtype.title === devSubtype) {
                  defSubtype.selected = true;
                }
              });
            });
          }
        });
      });
      this.openCredential(defaultCredential);
    });
  }

  /**********************************************
   * Helps to delete a credential
   **********************************************/
  deleteCredential(alias: string) {
    this.apiService.deleteCredential(alias).subscribe(
      () => {
        this.credentialSubmitted.emit('success');
      },
      error => {
        throw error;
      }
    );
  }
}
