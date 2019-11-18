import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import * as _ from 'lodash';
declare var $: any;

import { TranslateService } from '../../services/translate/translate.service';

@Component({
  selector: 'oc-modal-clone-job',
  templateUrl: './modal-clone-job.component.html',
  styleUrls: ['./modal-clone-job.component.css']
})
export class ModalCloneJobComponent implements OnInit, AfterViewInit {
  @Input() projectName: any;
  @Output() cloneCompleted = new EventEmitter<boolean>();
  newProjectName: any = '';
  errorMessage: string = '';

  constructor(
    public apiService: ApiService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    $('#modal-clone-job').on('shown.bs.modal', event => {
      $('#clone-project-name').val('');
      $('#clone-project-name').focus();
    });
  }

  ngAfterViewInit() {
    let pressEnter = e => {
      let code = e.keyCode ? e.keyCode : e.which;
      if (code == 13) {
        this.clone();
      }
    };
    // set focus to confirm button so that user can press
    // enter key to delete instead of click by mouse
    $('#modal-clone-job').on('shown.bs.modal', event => {
      // set focus to username input
      $('#clone-project-name').focus();
      // attach keypress event handler
      $('#modal-clone-job').on('keypress', pressEnter);
    });
    // unbind keypress event handler
    $('#modal-clone-job').on('hide.bs.modal', event => {
      $('#modal-clone-job').off('keypress', pressEnter);
    });
  }

  clone() {
    if (/^$|[^a-zA-Z0-9_]+/g.test(this.newProjectName)) {
      this.errorMessage = this.translate.instant('Clone_error_msg');
    } else if (this.newProjectName.length > 20) {
      this.errorMessage = this.translate.instant(
        'Collection_modal_length_validationerr'
      );
    } else {
      this.apiService
        .cloneProject(this.projectName, this.newProjectName)
        .subscribe(data => {
          if (data.status) {
            this.cloneCompleted.emit();
            $('#modal-clone-job').modal('hide');
          } else {
            this.errorMessage = data.reason;
          }
        });
    }
  }

  onTextChange() {
    this.errorMessage = '';
  }
}
