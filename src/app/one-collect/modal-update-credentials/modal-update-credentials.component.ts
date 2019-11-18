import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
declare var $: any;

import { TranslateService } from '../../services/translate/translate.service';

@Component({
  selector: 'oc-modal-update-credentials',
  templateUrl: './modal-update-credentials.component.html',
  styleUrls: ['./modal-update-credentials.component.css']
})
export class ModalUpdateCredentialsComponent implements OnInit {
  @Input() headers: any[] = [];
  @Input() headerState: any = {};
  @Input() distinctRows: any[] = [];
  // let default collectType by device-based unless over-written
  @Input() collectType: any = 'device-based';
  @Output() onUpdate = new EventEmitter<boolean>();

  selectAll: boolean = false;
  error: string = '';

  constructor(public translate: TranslateService) {}

  ngOnInit() {
    $('#modal-update-credentials').on('shown.bs.modal', event => {
      if (this.collectType == 'solution-based') {
        _.forEach(this.headers, (header, i) => {
          this.headerState[header.key] = true;
        });
      }
    });
  }

  update() {
    this.error = '';
    let selectedRows = _.filter(this.distinctRows, { selected: true });
    if (selectedRows.length) {
      this.onUpdate.emit(selectedRows);
      $('#modal-update-credentials').modal('hide');
    } else {
      this.error = this.translate.instant('Update_cre_modal_msg');
    }
  }

  changeInSelectAll() {
    _.forEach(this.distinctRows, (obj, i) => {
      if (this.selectAll) {
        obj['selected'] = true;
      } else {
        obj['selected'] = false;
      }
    });
  }
}
