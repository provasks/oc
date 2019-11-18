import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import * as _ from 'lodash';

import { TranslateService } from '../../services/translate/translate.service';

@Component({
  selector: 'oc-import-collected',
  templateUrl: './import-collected.component.html',
  styleUrls: ['./import-collected.component.css']
})
export class ImportCollectedComponent implements OnInit {
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
      // check if all selected files have correct file types
      let badType = false;
      for (let i = 0; i < files.length; i++) {
        let file = files[i];
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

        if (
          extension != '.xml' &&
          extension != '.gz' &&
          extension != '.xml.gz' &&
          extension != '.zip' &&
          extension != '.tar' &&
          extension != '.tar.gz' &&
          extension != '.tgz'
        ) {
          this.typeCheck = 'fail';
          this.uploadMsg = this.translate.instant('Importfile_upload_msg1');
          badType = true;
        }
      }

      // create upload requests for each file if all types are correct
      if (!badType) {
        let forms = [];
        for (let i = 0; i < files.length; i++) {
          let file = files[i];
          this.typeCheck = 'pass';
          this.uploadMsg = this.translate.instant('ASUP_upload_msg2');
          // get form data and push to array
          let formData: FormData = new FormData();
          formData.append('select_file', file, file.name);
          formData.append('type', `edit${i}`);
          forms.push(formData);
        }
        // create requests for each file serially
        let allPass = true;
        let timeDelay = 500;
        _.forEach(forms, (formData, i) => {
          setTimeout(() => {
            this.apiService
              .uploadCollectedFilesSerially(formData)
              .subscribe(result => {
                if (result.status != 'Pass') {
                  this.typeCheck = 'fail';
                  this.uploadMsg = result['reason'];
                  allPass = false;
                }
                if (i == forms.length - 1) {
                  if (allPass) {
                    this.router.navigate(['/main/collection']);
                  }
                }
              });
          }, timeDelay);
          // increment timeDelay
          timeDelay += 500;
        });
      }
    }
  }
}
