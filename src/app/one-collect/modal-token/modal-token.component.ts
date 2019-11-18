import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { HelperService } from 'src/app/services/helper/helper.service';
import { Settings } from 'src/app/content/settings';
declare var $: any;

import { environment } from 'src/environments/environment';
import { TranslateService } from '../../services/translate/translate.service';

@Component({
  selector: 'oc-modal-token',
  templateUrl: './modal-token.component.html',
  styleUrls: ['./modal-token.component.css']
})
export class ModalTokenComponent implements OnInit, AfterViewInit {
  settings: any = Settings;
  tokenMsg: any;
  tokenValid: any = '';
  @Input() tokenData: any = {};
  @Output() onTokenConfirmed = new EventEmitter<boolean>();
  @Output() onCancel = new EventEmitter<boolean>();

  caLaunch: boolean = environment.caLaunch;

  constructor(
    public apiService: ApiService,
    public helper: HelperService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.tokenData['token'] = '';
  }

  ngAfterViewInit() {
    $('#modal-token').on('show.bs.modal', event => {
      // clear input values
      this.tokenValid = '';
      this.tokenMsg = '';
      this.tokenData['token'] = '';
    });
  }

  validateToken() {
    this.tokenValid = '';
    this.tokenMsg = '';
    let token = { token: this.helper.trim(this.tokenData['token']) };
    this.apiService.validateSpmToken(token).subscribe(
      response => {
        let data = response['body'];
        if (typeof data !== 'object') {
          data = JSON.parse(data);
        }
        if (data['status_code'] == 200) {
          this.tokenValid = 'true';
          this.tokenMsg = this.translate.instant('Token_modal_success');
          this.onTokenConfirmed.emit(true);
          setTimeout(() => {
            $('#modal-token').modal('hide');
          }, 1000);
        } else {
          this.tokenValid = 'false';
          let contents = data['contents'];
          if (typeof contents !== 'object') {
            contents = JSON.parse(contents);
          }
          this.tokenMsg = contents['errorDescription'];
        }
      },
      error => {
        this.tokenValid = 'false';
        this.tokenMsg = error['statusText'];
      }
    );
  }

  cancelValidation() {
    this.onCancel.emit(true);
    $('#modal-token').modal('hide');
  }
}
