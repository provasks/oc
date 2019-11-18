import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'oc-modal-upload-asup',
  templateUrl: './modal-upload-asup.component.html',
  styleUrls: ['./modal-upload-asup.component.css']
})
export class ModalUploadAsupComponent implements OnInit {
  @Input() metaData: any = {};
  @Output() onUploadConfirmed = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {
    this.metaData['caseId'] = '';
    this.metaData['opportunityId'] = '';
    this.metaData['comments'] = '';
  }
}
