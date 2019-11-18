import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import * as _ from 'lodash';

import { TranslateService } from '../../services/translate/translate.service';

@Component({
  selector: 'oc-import-performance',
  templateUrl: './import-performance.component.html',
  styleUrls: ['./import-performance.component.css']
})
export class ImportPerformanceComponent implements OnInit {
  typeCheck: any;
  uploadMsg: any;
  fileLabel: any;

  constructor(
    private apiService: ApiService,
    private router: Router,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.fileLabel = this.translate.instant('Importfile_nofilechosen');
  }

  resetFileUpload(event) {
    event.target.value = '';
  }

  uploadFile(event) {
    let files = event.target.files;
    if (files && files.length > 0) {
      // check if selected file has correct file type
      let badType = false;
      let file = files[0];
      // get file extension
      let regex = /\.[^.]+$/g;
      let extension = regex.exec(file.name)[0].toLowerCase();

      // get filelabel
      if (files.length == 1) {
        let filename = file.name
          .split('.')
          .slice(0, -1)
          .join('.');
        if (filename.length > 10) {
          this.fileLabel = filename.slice(0, 10) + '...' + extension;
        } else {
          this.fileLabel = file.name;
        }
      } else {
        this.fileLabel =
          files.length + this.translate.instant('Importfile_files');
      }

      if (extension != '.zip' && extension != '.tar') {
        this.typeCheck = 'fail';
        this.uploadMsg = this.translate.instant('Importfile_upload_msg2');
        badType = true;
      }

      // create upload requests for each file if all types are correct
      if (!badType) {
        let file = files[0];
        this.typeCheck = 'pass';
        this.uploadMsg = this.translate.instant('ASUP_upload_msg2');
        // get form data and push to array
        let formData: FormData = new FormData();
        formData.append('select_file', file, file.name);
        formData.append('type', `edit0`);

        // create requests for each file serially
        this.apiService.uploadPerfCollectedFile(formData).subscribe(
          response => {
            let data = response['body'];
            if (typeof data !== 'object') {
              data = JSON.parse(data);
            }
            if (data['status'] != 'Pass') {
              this.typeCheck = 'fail';
              this.uploadMsg = data['reason'];
            } else {
              this.router.navigate(['/main/collection']);
            }
          },
          error => {
            this.typeCheck = 'fail';
            this.uploadMsg = error['statusText'];
          }
        );
      }
    }
  }
}
