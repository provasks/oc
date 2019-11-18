import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'oc-modal-import-failed',
  templateUrl: './modal-import-failed.component.html',
  styleUrls: ['./modal-import-failed.component.css']
})
export class ModalImportFailedComponent implements OnInit {
  @Input() headers: any[] = [];
  @Input() failedComponents: any[] = [];

  constructor() {}

  ngOnInit() {}
}
