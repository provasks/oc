import { Component, OnInit } from '@angular/core';
import { Settings } from 'src/app/content/settings';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'oc-modal-shutdown',
  templateUrl: './modal-shutdown.component.html',
  styleUrls: ['./modal-shutdown.component.css']
})
export class ModalShutdownComponent implements OnInit {
  settings: any = Settings;
  caLaunch: boolean = environment.caLaunch;
  constructor() {}

  ngOnInit() {}
}
