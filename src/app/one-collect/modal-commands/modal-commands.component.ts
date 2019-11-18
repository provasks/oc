import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';
declare var $: any;

@Component({
  selector: 'oc-modal-commands',
  templateUrl: './modal-commands.component.html',
  styleUrls: ['./modal-commands.component.css']
})
export class ModalCommandsComponent implements OnInit {
  caLaunch: boolean = environment.caLaunch;
  @Input() commands: any[];
  @Input() type: string;
  @Input() subtype: string;
  commandsBackup: any;
  validation: boolean;

  toggleAll: any;

  constructor() {}

  ngOnInit() {
    this.toggleAll = false;
    this.commands = [];
    this.type = '';
    this.subtype = '';
    this.storeInitalCommands();
  }

  storeInitalCommands() {
    $('#commands-modal').on('shown.bs.modal', () => {
      this.commandsBackup = _.cloneDeep(this.commands);
    });
  }

  changeToggleAll() {
    this.toggleAll = !this.toggleAll;
    _.forEach(this.commands, command => {
      if (this.toggleAll) {
        command['selected'] = true;
      } else if (command['type'] != 'substitution') {
        command['selected'] = false;
      }
    });
  }

  validate() {
    let atLeastOneSelected = false;
    this.validation = false;
    _.forEach(this.commands, command => {
      if (command['selected']) {
        atLeastOneSelected = true;
        return false;
      }
    });
    return atLeastOneSelected;
  }

  saveModal() {
    let atLeastOneSelected = this.validate();
    if (atLeastOneSelected) {
      $('#commands-modal').modal('hide');
    } else {
      this.validation = true;
    }
  }

  closeModal() {
    // reset commands with backup
    this.commands = _.cloneDeep(this.commandsBackup);
    // run regular saveModal with original values
    this.saveModal();
  }
}
