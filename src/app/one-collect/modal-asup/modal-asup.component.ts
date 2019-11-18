import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

@Component({
  selector: 'oc-modal-asup',
  templateUrl: './modal-asup.component.html',
  styleUrls: ['./modal-asup.component.css']
})
export class ModalAsupComponent implements OnInit {
  /*********************************************/
  /* Class properties
  /*********************************************/
  @Input() id: any;
  @Input() fields: any[] = [];
  @Input() modalRows: any[] = [];
  @Output() onSelectedRows = new EventEmitter<boolean>();
  countSelected: any;
  checkAll: boolean;

  /*********************************************/
  /* Constructor method
  /*********************************************/
  constructor() {}

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {}

  /*********************************************/
  /* Method to toggle selection of checkbox
  /*********************************************/
  toggleSelectRow(rowIdx) {
    this.modalRows[rowIdx]['selected'] = !this.modalRows[rowIdx]['selected'];
    this.countSelected = _.filter(this.modalRows, { selected: true }).length;
  }

  /*********************************************/
  /* Method to emit selected rows to parent
  /* component
  /*********************************************/
  addSelected() {
    let selectedRows = _.filter(this.modalRows, { selected: true });
    this.onSelectedRows.emit(selectedRows);
  }

  /*********************************************/
  /* Method to toggle checked state of row
  /*********************************************/
  toggleChecked() {
    this.checkAll = !this.checkAll;
    // change state for each row
    _.forEach(this.modalRows, row => {
      if (this.checkAll) {
        row['selected'] = true;
      } else {
        row['selected'] = false;
      }
    });
  }
}
