import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
declare var $: any;

@Component({
  selector: 'oc-modal-eula',
  templateUrl: './modal-eula.component.html',
  styleUrls: ['./modal-eula.component.css']
})
export class ModalEulaComponent implements OnInit {
  eulaChecked: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getBuildType().subscribe(data => {
      if (data.build_type == 'CLOUD' && data.cloud_type == 'DOCKER') {
        $('#modal-eula').modal({
          backdrop: 'static',
          keyboard: false
        });
      }
    });
  }

  agree() {
    $('#modal-eula').modal('hide');
  }

  disagree() {
    $('#modal-eula').modal('hide');

    $('#modal-shutdown').modal({
      backdrop: 'static',
      keyboard: false
    });

    this.apiService.shutDown().subscribe(data => {
      // do something after shutdown
    });
  }
}
