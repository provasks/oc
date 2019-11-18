import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

import { TranslateService } from '../../services/translate/translate.service';

@Component({
  selector: 'oc-modal-notification',
  templateUrl: './modal-notification.component.html',
  styleUrls: ['./modal-notification.component.css']
})
export class ModalNotificationComponent implements OnInit {
  note: any;
  modalId: any;

  constructor(public translate: TranslateService) {}

  // intercept input property change with setter method
  @Input()
  set notification(notification: any) {
    if (!notification) {
      this.note = {};
    } else {
      this.note = notification;
    }
    if (!_.has(this.note, 'title')) {
      this.note['title'] = this.translate.instant('Notification');
    }
    if (!_.has(this.note, 'message')) {
      this.note['message'] = '';
    }
    if (!_.has(this.note, 'color')) {
      this.note['color'] = '#333';
    }
    if (!_.has(this.note, 'width')) {
      this.note['width'] = '300';
    }
    if (!_.has(this.note, 'confirm')) {
      this.note['confirm'] = false;
    }
  }

  get notification(): any {
    return this.note;
  }

  // input for setting modal-id for referencing via jQuery
  // provides a default id if none is specified
  @Input()
  set id(id: any) {
    this.modalId = id ? id : 'notification-modal';
  }

  get id(): any {
    return this.modalId;
  }

  // output decorator to emit confirm clicked event
  @Output() onConfirmed = new EventEmitter<any>();
  @Output() onCancelled = new EventEmitter<any>();
  @Output() onContinue = new EventEmitter<any>();

  confirmed() {
    this.onConfirmed.emit(this.note.param || true);
  }

  cancelled() {
    this.onCancelled.emit(true);
  }
  continue() {
    if (this.note.callback)
      this.onContinue.emit(this.note.callback.call(this.note.scope));
    else this.onContinue.emit(true);
  }

  ngOnInit() {}
}
