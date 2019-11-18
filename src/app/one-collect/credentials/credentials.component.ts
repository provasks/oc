import { Component, OnInit, OnDestroy } from '@angular/core';
import { CredentialService } from 'src/app/services/credential/credential.service';
import { Credential } from 'src/app/types/credential.type';
import { GridComponent } from '../grid/grid.component';
import { TranslateService } from 'src/app/services/translate/translate.service';
import { HelperService } from 'src/app/services/helper/helper.service';
declare var $: any;

@Component({
  selector: 'oc-credentials',
  templateUrl: './credentials.component.html',
  styleUrls: ['./credentials.component.css']
})
export class CredentialsComponent implements OnInit, OnDestroy {
  grid: any;
  gridDo: any;
  showContent: boolean = true;
  credential: Credential;
  credentials: Array<any>;
  notification: any;
  settings: any;

  // tour properties
  tourStarted: boolean = false;

  constructor(
    private credentialService: CredentialService,
    private translate: TranslateService,
    private helper: HelperService
  ) {
    this.credentialService.credentialSubmitted.subscribe(() => {
      this.credentialService.reloadCredentials(this.showCredentials, this);
    });
    this.settings = this.helper.settings.autoDiscovery;
  }

  ngOnInit() {
    this.gridSetup();
    this.credentialService.reloadCredentials(this.showCredentials, this);
  }
  ngOnDestroy() {}

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
      tableId: 'credentials',
      tableStriped: false,
      actionsWidth: '90px',
      showBottomScroll: false
    });

    this.grid.headers = [
      {
        width: '200px',
        title: this.translate.instant('Alias'),
        key: 'alias'
      },
      {
        width: '170px',
        title: this.translate.instant('Priority'),
        key: 'priority'
      },
      {
        width: '200px',
        title: this.translate.instant('Savedproj_table_col5'),
        key: 'updated'
      }
    ];

    this.grid.initGrid();

    this.gridDo = (action, index, value?) => {
      this.credentials = this.grid.gridDo(
        action,
        this.credentials,
        index,
        value
      );
    };
  }

  showCredentials(credentials: any, scope): any {
    scope.credentials = credentials;
  }

  editCredential(alias: string) {
    this.credentialService.getCredential(alias);
  }

  newCredential() {
    this.credentialService.openCredential(
      this.credentialService.getDefaultCredential()
    );
  }

  deleteCredential(alias: string) {
    this.notification = {
      title: this.translate.instant('Credential_management_delete'),
      message: this.translate.instant('Credential_management_delete_warning'),
      param: alias,
      confirm: true
    };
    this.helper.showModalPopup('#remove-credential');
  }

  confirmDeleteCredential(event) {
    this.credentialService.deleteCredential(event);
  }
}
