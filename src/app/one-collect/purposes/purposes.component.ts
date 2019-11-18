import { Component, OnInit } from '@angular/core';
import { Settings } from 'src/app/content/settings';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'oc-purposes',
  templateUrl: './purposes.component.html',
  styleUrls: ['./purposes.component.css']
})
export class PurposesComponent implements OnInit {
  objectives: any[];
  client: any = environment.client;

  constructor() {}

  ngOnInit() {
    this.objectives = Settings.Objectives;
  }
}
