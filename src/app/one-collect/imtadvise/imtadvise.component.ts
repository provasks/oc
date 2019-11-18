import { Component, OnInit, HostListener } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import * as _ from 'lodash';
declare var $: any;
import { TranslateService } from '../../services/translate/translate.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'oc-imtadvise',
  templateUrl: './imtadvise.component.html',
  styleUrls: ['./imtadvise.component.css']
})
export class ImtadviseComponent implements OnInit {
  jobData: any = [];
  inputHosts: any = [];
  flag_selected: boolean = false;
  firstTitle: any;
  checkedHostsData = [];
  secondTitle: any;
  hostDataState = [];
  noHostsFoundErrormessage: string;
  errorMessage: any;
  ImtError: string = '';
  jobName: string;
  hideImtAdviseScreen1: boolean = true;
  hideImtAdviseScreen2: boolean = true;
  inputOntaps: any = [];
  modeval: string = '';
  time: string = '';
  inputSwitchData = [];
  thirdTitle = '';
  excelValue: boolean;
  inputCollectionTargetValue: any;
  inputCollectionTargetSwitchValue: any;
  outputOntap: any;
  outputSwitch: any;
  outputHosts: any = [];
  recommendationData: any = [];
  viewDetailsCriteriaMessage: string;
  offlineMessage: string;
  offlineMessageSso: string;
  fileName: any;
  modeCommonMessage: string;
  HBAMsg: string;
  latestInputOntap: any = [];
  latestOutputOntap: any = [];
  hidelatestOntapDiv: boolean = true;
  noOntapFound: boolean;
  multipleRecordsMessage: string;
  selectAll: boolean;
  oldexcel: any;
  noexcel: any;
  client: any = environment.client;

  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private translate: TranslateService
  ) {
    // this.oldexcel = this.translate.instant('Old Excel');
    // this.ImtError = this.translate.instant('Excel not found')
  }

  ngOnInit() {
    if (!this.client.features.imtAdvise) return;
    this.flag_selected = false;
    $('.advisorTitle').hide();
    $('.jobName').hide();
    this.noOntapFound = true;
    if (this.dataService.getImtJob) {
      this.hideImtAdviseScreen1 = false;
      let job = this.dataService.getImtJob();
      this.getJobDetails(job);
      this.jobName = job.name;
    }
  }

  getJobDetails(job) {
    let hostData = job ? _.keys(job.components)[0] : false; //handled when job is undefined
    if (!hostData) {
      hostData = 'host';
    }
    this.ImtError = '';
    this.dataService.showLoader();
    this.apiService
      .getImtAdviseJobData(job.name, hostData, job.group)
      .subscribe(
        data => {
          if (data) {
            this.dataService.hideLoader();
            $('.advisorTitle').show();
            $('.jobName').show();
            this.modeCommonMessage = this.translate.instant('modecommonmsg');
            this.HBAMsg = this.translate.instant('hbamsg');
            this.multipleRecordsMessage = this.translate.instant(
              'multiplerecordmsg'
            );
            this.jobData = data;
            this.flag_selected = false;
            this.prepareOntapHostDataValues(this.jobData);
          }
        },
        error => {
          $('.advisorTitle').show();
          $('.jobName').show();
          this.dataService.hideLoader();
          this.ImtError = error.message;
          if (error.message == this.translate.instant('Excel not found')) {
            this.ImtError = this.translate.instant('Excel not found');
            this.noexcel = this.translate.instant('Excel not found');
          } else if (error.message == this.translate.instant('Old Excel')) {
            this.ImtError = this.translate.instant('Old Excel');
            this.oldexcel = this.translate.instant('Old Excel');
          }
        }
      );
  }

  viewDetails(selValue, type) {
    let payload = {};
    payload['type'] = type;
    payload['components'] = [];
    _.forEach(selValue, function(value, key) {
      var component = {};
      component['componentTypeId'] = value['componentTypeId'];
      switch (type) {
        case 'Existing':
          component['componentId'] = value['ExistingComponentId'];
          break;
        default:
          component['componentId'] = 'n/a';
      }
      payload['components'].push(component);
    });

    this.apiService.postViewDetailsData(payload).subscribe(
      data => {
        if (data) {
          this.dataService.hideLoader();
          var data = data;
          window.open(data);
        }
      },
      error => {
        this.dataService.hideLoader();
      }
    );
  }

  getSelectedOntapValues(ontapObj) {
    this.outputOntap = ontapObj;
  }

  getSelectedSwitchValues(switchObj) {
    this.outputSwitch = switchObj;
  }

  changeSelection(i, j, k) {
    this.hostDataState[i][j]['ComponentName'][0] = this.inputHosts[i][j][
      'ComponentName'
    ][k];
    $('#select-options-' + i + '-' + j).hide();
  }

  showSelectionOptions(i, j) {
    $('.select-options').hide();
    $('#select-options-' + i + '-' + j).show();
  }

  @HostListener('window:click', ['$event'])
  click = function(event) {
    if (!event.target) {
      return;
    }
    var tagname = event.target.tagName.toLowerCase();
    var classes = event.target.classList;
    if (
      !classes.contains('host-selected-item') &&
      !classes.contains('host-selected-item-content') &&
      !classes.contains('glyphicon-chevron-down')
    ) {
      $('.select-options').hide();
    }
  };

  prepareOntapHostDataValues(data) {
    let ontap_check = [];
    let title: any;
    _.forEach(data, (obj, index1) => {
      title = obj.title;
      if (title == 'ONTAP') {
        this.firstTitle = title;
        _.forEach(obj, (dataObj, index5) => {
          _.forEach(dataObj, (combinationObj, index6) => {
            let ontap = _.clone(combinationObj);
            if (ontap && ontap.hasOwnProperty('combination')) {
              this.inputOntaps.push(ontap['combination'][0]);
            }
          });
        });
      } else if (title == 'Switch') {
        this.secondTitle = title;
        _.forEach(obj, (dataObj, index5) => {
          _.forEach(dataObj, (combinationObj, index6) => {
            let switchValue = _.clone(combinationObj);
            if (switchValue && switchValue.hasOwnProperty('combination')) {
              this.inputSwitchData.push(switchValue['combination'][0]);
            }
          });
        });
      } else if (title == 'Host') {
        this.thirdTitle = title;
        var count = 0;
        _.forEach(obj, (dataArray, index3) => {
          _.forEach(dataArray, (combinationArray, index4) => {
            if (combinationArray.hasOwnProperty('combination')) {
              this.checkedHostsData[count] = false;
              this.inputHosts.push(combinationArray['combination']);
              count++;
            }
          });
        });
      } else if (title == 'mode') {
        this.modeval = obj['data'];
      } else if (title == 'time') {
        this.time = obj['data'];
      } else if (title == 'excel_flag') {
        if (obj['data'] == 1) {
          this.excelValue = true;
        } else {
          this.excelValue = false;
        }
      }
    });

    if (this.modeval == 'offline') {
      this.offlineMessage = this.translate.instant('offlinemsg');
      this.offlineMessageSso = this.translate.instant('offlinesso');
    }
    if (this.inputOntaps.length > 0) {
      this.outputOntap = this.inputOntaps[0];
    }

    if (this.inputSwitchData.length > 0) {
      this.outputSwitch = this.inputSwitchData[0];
    }

    for (var i = 0; i < this.inputHosts.length; i++) {
      var item = [];
      for (var j = 0; j < this.inputHosts[i].length; j++) {
        item[j] = {};
        item[j]['ComponentName'] = [];
        if (this.inputHosts[i][j]['ComponentName'].length) {
          var obj = this.inputHosts[i][j]['ComponentName'][0];
          item[j]['ComponentName'].push(obj);
        }
        if (this.inputHosts[i][j].hasOwnProperty('CollectionTarget')) {
          if (this.inputHosts[i][j]['CollectionTarget'].length) {
            var obj = this.inputHosts[i][j]['CollectionTarget'];
            item[j]['CollectionTarget'] = obj;
          }
        }
        item[j]['ComponentType'] = this.inputHosts[i][j]['ComponentType'];
        item[j]['ComponentTypeId'] = this.inputHosts[i][j]['ComponentTypeId'];
        item[j]['ParsedValue'] = this.inputHosts[i][j]['ParsedValue'];
      }
      this.hostDataState.push(item);
    }

    let noHostsFound = false;
    this.noOntapFound = true;
    this.hidelatestOntapDiv = true;
    if (this.inputOntaps.length == 0) {
      this.noOntapFound = false;
      this.getLatestOntapValues();
    }
    if (this.inputHosts.length == 0) {
      this.flag_selected = true;
      this.inputHosts = [];
      this.noHostsFoundErrormessage = this.translate.instant('nohostmsg');
      noHostsFound = true;
      $('#host-div').hide();
    }
  }

  getSelectedLatestOntapValues(latestOntapObj) {
    this.latestOutputOntap = latestOntapObj;
  }

  getLatestOntapValues() {
    this.dataService.showLoader();
    this.apiService.getLatestOntapData().subscribe(
      data => {
        if (data) {
          this.dataService.hideLoader();
          this.hidelatestOntapDiv = false;
          this.latestInputOntap = data;
          if (this.latestInputOntap.length > 0) {
            this.latestOutputOntap = this.latestInputOntap[0];
          }
        }
      },
      error => {
        this.dataService.hideLoader();
        this.errorMessage = error;
      }
    );
  }

  validateHostDataCheckBoxes(i, checkedValue) {
    if (checkedValue) {
      this.checkedHostsData[i] = true;
    } else {
      this.checkedHostsData[i] = false;
    }
    let checkBoxSelected = true;
    _.forEach(this.checkedHostsData, (item, index) => {
      if (checkBoxSelected) {
        if (item == true) {
          this.flag_selected = true;
          checkBoxSelected = false;
        } else {
          this.flag_selected = false;
          checkBoxSelected = true;
        }
      }
    });
  }

  getSelectedValues() {
    let selectedModel = {};
    this.outputHosts = [];
    if (this.outputOntap) {
      selectedModel['ontap'] = this.outputOntap;
    } else {
      selectedModel['ontap'] = this.latestOutputOntap;
    }
    _.forEach(this.checkedHostsData, (host, index) => {
      if (host == true) {
        this.outputHosts.push(this.hostDataState[index]);
      }
    });
    selectedModel['hosts'] = this.outputHosts;
    if (this.outputSwitch) {
      selectedModel['san_switch'] = this.outputSwitch;
    }
    this.dataService.showLoader();
    this.recommendationData = [];
    this.apiService.postSelectedAdviseData(selectedModel).subscribe(
      data => {
        if (data) {
          this.dataService.hideLoader();
          this.hideImtAdviseScreen1 = true;
          this.hideImtAdviseScreen2 = false;
          this.populateRecommendationData(data);
        }
      },
      error => {
        this.dataService.hideLoader();
      }
    );
  }

  populateRecommendationData(data) {
    this.recommendationData = data.data;
    this.modeval = data.mode;
    this.fileName = data.location;
  }

  displayMainAddOn() {
    this.hideImtAdviseScreen1 = false;
    this.hideImtAdviseScreen2 = true;
  }

  downloadView() {
    this.dataService.showLoader();
    this.apiService.downloadReportData(this.fileName).subscribe(
      data => {
        if (data) {
          this.dataService.hideLoader();
          let blob = data;
          let a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = this.fileName;
          document.body.appendChild(a);
          a.click();
        }
      },
      error => {
        this.dataService.hideLoader();
      }
    );
  }

  /*********************************************/
  /* Method to check or uncheck all rows
  /*********************************************/
  changeInSelectAll() {
    _.forEach(this.checkedHostsData, (host, i) => {
      if (this.selectAll) {
        this.checkedHostsData[i] = true;
        this.flag_selected = true;
      } else {
        this.checkedHostsData[i] = false;
        this.flag_selected = false;
      }
    });
  }
}
