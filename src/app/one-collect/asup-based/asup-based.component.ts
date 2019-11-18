import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { HelperService } from 'src/app/services/helper/helper.service';
import { IMyDrpOptions, IMyDateRangeModel } from 'mydaterangepicker';
import { CommonComponent } from '../common/common.component';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';
declare var $: any;

import { TranslateService } from '../../services/translate/translate.service';

@Component({
  selector: 'oc-asup-based',
  templateUrl: './asup-based.component.html',
  styleUrls: ['./asup-based.component.css']
})
export class AsupBasedComponent extends CommonComponent
  implements OnInit, OnDestroy {
  /*********************************************/
  /* Class properties
  /*********************************************/
  showForm: boolean = false;
  typeCheckTgzTxt: any;
  uploadMsgTgzTxt: any;
  typeCheckTxtCsv: any;
  uploadMsgTxtCsv: any;

  modalData: any = {};
  dateRange: any;
  startDate: any;
  endDate: any;
  serial: any;
  hostname: any;
  asupId: any;
  onecollectId: any;
  searchType: any;
  pullData: boolean = true;
  fetchAllNodes: boolean;
  notification: any;
  checkAll: boolean;
  countSelected: number = 0;

  // file uploads
  asupFormData: FormData = new FormData();
  asupIdContent: any;

  rows: any[] = [];
  inSerialRows: any[] = [];
  inHostnameRows: any[] = [];
  inOnecollectRows: any[] = [];

  show: any = {
    serial: false,
    hostname: false,
    onecollect: false
  };

  caLaunch: boolean = environment.caLaunch;
  fileLabel: any;
  fileidLabel: any;
  client: any = environment.client;

  /*********************************************/
  /* Constructor method
  /*********************************************/
  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private helper: HelperService,
    private router: Router,
    public translate: TranslateService
  ) {
    super();

    // intialize notification modal
    this.notification = {
      title: '',
      message: '',
      color: 'red'
    };
  }

  fields: any[] = [
    {
      key: 'asupId',
      class: 'asup-id',
      title: this.translate.instant('ASUP_table_col2'),
      filterValue: ''
    },
    {
      key: 'jobId',
      class: 'job-id',
      title: this.translate.instant('ASUP_table_col3'),
      onlyIn: ['onecollect'],
      filterValue: ''
    },
    {
      key: 'title',
      class: 'title',
      title: this.translate.instant('ASUP_table_col4'),
      filterValue: ''
    },
    {
      key: 'date',
      class: 'date',
      title: this.translate.instant('ASUP_table_col5'),
      excludeIn: ['main'],
      filterValue: ''
    },
    {
      key: 'model',
      class: 'model',
      title: this.translate.instant('ASUP_table_col6'),
      filterValue: ''
    },
    {
      key: 'serial',
      class: 'serial',
      title: this.translate.instant('ASUP_table_col7'),
      excludeIn: ['main'],
      filterValue: ''
    },
    {
      key: 'systemId',
      class: 'system-id',
      title: this.translate.instant('ASUP_table_col8'),
      excludeIn: ['main'],
      filterValue: ''
    },
    {
      key: 'hostname',
      class: 'hostname',
      title: this.translate.instant('ASUP_table_col9'),
      filterValue: ''
    },
    {
      key: 'domain',
      class: 'domain',
      title: this.translate.instant('ASUP_table_col10'),
      excludeIn: ['main'],
      filterValue: ''
    },
    {
      key: 'release',
      class: 'release',
      title: this.translate.instant('ASUP_table_col11'),
      filterValue: ''
    },
    {
      key: 'type',
      class: 'type',
      title: this.translate.instant('ASUP_table_col12'),
      filterValue: ''
    },
    {
      key: 'clusterIdentifier',
      class: 'cluster-id',
      title: this.translate.instant('ASUP_table_col13'),
      excludeIn: ['main', 'serial', 'hostname', 'onecollect'],
      filterValue: ''
    }
  ];

  /*********************************************/
  /* Lifecycle hook OnInit
  /*********************************************/
  ngOnInit() {
    if (!this.client.features.asupCollection) return;
    this.fileLabel = this.fileidLabel = this.translate.instant(
      'Importfile_nofilechosen'
    );
    this.checkAsupNetwork();
    this.initDateRange();
  }

  /*********************************************/
  /* Lifecycle hook OnDestroy
  /*********************************************/
  ngOnDestroy() {}

  initDateRange() {
    // initialize dateRange
    let endDate = new Date();
    let beginDate = new Date();
    beginDate.setDate(endDate.getDate() - 90);
    this.dateRange = {
      beginDate: {
        year: beginDate.getFullYear(),
        month: beginDate.getMonth() + 1,
        day: beginDate.getDate()
      },
      endDate: {
        year: endDate.getFullYear(),
        month: endDate.getMonth() + 1,
        day: endDate.getDate()
      }
    };
  }

  /*********************************************/
  /* Property related to bootstrap-daterange
  /* picker
  /*********************************************/
  private myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd-mmm-yyyy',
    height: '25px',
    width: '240px',
    selectionTxtFontSize: '13px'
  };

  /*********************************************/
  /* Method from bootstrap-daterangepicker to
  /* handle change event
  /*********************************************/
  onDateRangeChanged($event) {}

  /*********************************************/
  /* Method to toggle checked state of row
  /*********************************************/
  toggleChecked() {
    this.checkAll = !this.checkAll;
    this.deselectAll();
    if (this.checkAll) {
      const rows = this.rows.filter(r => r.showRow);
      _.forEach(rows, row => (row.selected = true)); //select displayed rows only
    }
    // do fresh count of selected items
    this.doCountSelected();
  }

  /***************************
   * deselect all rows
   * *************************/
  deselectAll() {
    _.forEach(this.rows, row => {
      row.selected = false;
    });
  }

  /*********************************************/
  /* Method to maintain total count of all
  /* checked rows
  /*********************************************/
  doCountSelected() {
    this.countSelected = 0;
    _.forEach(this.rows, row => {
      if (row['selected']) {
        this.countSelected++;
      }
    });
  }

  /*********************************************/
  /* Methodd to check whether ASUP network
  /* connectivity is available
  /*********************************************/
  checkAsupNetwork() {
    this.apiService.getAsupStatus().subscribe(
      response => {
        // enable form inputs only if ASUP network is available
        let data = response['body'];
        if (typeof data !== 'object') {
          data = JSON.parse(data);
        }
        if (data['Network']) {
          this.showForm = true;
          return true;
        } else {
          this.showForm = false;
          return false;
        }
      },
      error => {
        this.showForm = false;
        return false;
      }
    );
  }

  /*********************************************/
  /* Method to permanently added last search
  /* results to rows property
  /*********************************************/
  setNewRows(selectedRows, type?) {
    // remove previously added rows if refreshing last
    // selected rows
    if (type == 'serial') {
      _.remove(this.rows, row => {
        return row['lastSerial'] == true;
      });
    } else if (type == 'hostname') {
      _.remove(this.rows, row => {
        return row['lastHostname'] == true;
      });
    } else if (type == 'onecollect') {
      _.remove(this.rows, row => {
        return row['lastOnecollect'] == true;
      });
    }
    // add newly selected rows
    this.addRows(selectedRows);
    // filter if needed
    if (this.showFilters) {
      this.filter();
    }
    // sort new rows
    if (this.sortField) {
      this.sort(this.sortField);
    }
    // update count of selected rows
    this.doCountSelected();
  }

  /*********************************************/
  /* Method to generate start date as string
  /*********************************************/
  getBeginDateStr() {
    if (!this.dateRange) {
      this.initDateRange();
    }
    return (
      this.dateRange['beginDate']['year'] +
      '-' +
      this.dateRange['beginDate']['month'] +
      '-' +
      this.dateRange['beginDate']['day']
    );
  }

  /*********************************************/
  /* Method to generate end date as string
  /*********************************************/
  getEndDateStr() {
    if (!this.dateRange) {
      this.initDateRange();
    }
    return (
      this.dateRange['endDate']['year'] +
      '-' +
      this.dateRange['endDate']['month'] +
      '-' +
      this.dateRange['endDate']['day']
    );
  }

  /*********************************************/
  /* Method to check if user session is
  /* available
  /*********************************************/
  checkLiveStatus(callback) {
    // check if user object is available in browser
    if (this.dataService.getUserData()) {
      // continue next level check if api server has session for user
      this.apiService.getLiveStatus().subscribe(response => {
        if (response.status == 200) {
          // process request for search data
          callback();
        } else {
          $('#sso-modal').modal({
            backdrop: 'static',
            keyboard: false
          });
          // set focus to confirm button so that user can press
          // enter key to delete instead of click by mouse
          $('#sso-modal').on('shown.bs.modal', event => {
            $('#sso-validate').focus();
          });
        }
      });
    } else {
      this.helper.showModalPopup('#sso-modal');
    }
  }

  /*********************************************/
  /* Method to called after SSO login to
  /* initiate search again
  /*********************************************/
  processRequest(validated) {
    if (validated) {
      if (this.searchType == 'serial') {
        this.searchSerial();
      } else if (this.searchType == 'hostname') {
        this.searchHostname();
      } else if (this.searchType == 'asupId') {
        this.searchAsupId();
      } else if (this.searchType == 'onecollectId') {
        this.searchOnecollectId();
      } else if (this.searchType == 'uploadAsupIds') {
        this.uploadAsupIds();
      } else if (this.searchType == 'uploadAsup') {
        this.uploadAsup();
      }
    }
  }

  /*********************************************/
  /* Method to initiate collect by setting data
  /* to be passed to server and show modal
  /* containing meta data
  /*********************************************/
  doCollect() {
    let result = this.validateAsupBasedSelection();
    // display modal for invalid status
    if (result.invalid) {
      this.notification = {
        title: this.translate.instant('ASUP_errormodal_title'),
        message: result.message,
        width: '300',
        color: 'red'
      };
      this.helper.showModalPopup('#notification-modal');
      return;
    }
    // continue processing if validation is fine
    this.getObj();
  }

  /*********************************************/
  /* Method to consolidate all data from table
  /*********************************************/
  getObj() {
    let clusterId = '';
    let arrRows = [];

    //CA code
    let asuppull = false;
    if (this.pullData) {
      asuppull = true;
    }

    // setObj callback after populating all rows
    let setObj = obj => {
      this.modalData.obj = obj;
      let userData = this.dataService.getUserData();
      _.assignIn(this.modalData.obj, userData);
      this.helper.showModalPopup('#modal-collect-asup');
    };
    // define default callback when passing all selected rows
    let selectedRowsCallback = () => {
      _.forEach(this.rows, row => {
        if (row['selected']) {
          let arrRow = [];
          // traverse all fields and add values to row array
          _.forEach(this.fields, field => {
            // check whether the field is present in row
            if (_.has(row, field.key)) {
              arrRow.push(row[field.key]);
            }
          });
          // add arrRow to arrRows
          arrRows.push(arrRow);
        }
      });
    };
    // case when fetachAllNodes is true
    if (this.fetchAllNodes) {
      // traverse array of rows for each type
      _.forEach(this.rows, row => {
        if (row['selected'] && row['type'] == 'Cluster-Mode') {
          clusterId = row['clusterIdentifier'];
        }
      });
      // fetch all rows associated with clusterId
      if (clusterId) {
        this.apiService
          .fetchAllAsupsBasedOnClusterId(clusterId)
          .subscribe(response => {
            if (response['asups']) {
              _.forEach(response['asups'], row => {
                arrRows.push(row);
              });
            }
            setObj({ asupids: arrRows, asuppull: asuppull });
          });
      } else {
        selectedRowsCallback();
        setObj({ asupids: arrRows, asuppull: asuppull });
      }
    } else {
      selectedRowsCallback();
      setObj({ asupids: arrRows, asuppull: asuppull });
    }
  }

  //CA Code
  collectNow() {
    let arrRows = [];
    let result = this.validateAsupBasedSelection();
    if (result.invalid) {
      // notify error

      this.notification = {
        title: this.translate.instant('ASUP_errormodal_title'),
        message: result.message,
        color: 'red'
      };
      // show the notification modal
      this.helper.showModalPopup('#notification-modal');
      return;
    }
    let data = {
      asupids: arrRows,
      queryName: '',
      commandList: '',
      jobId: ''
    };
    this.apiService.collectOnlyAsupIds(data).subscribe(response => {
      if (response.status == 200) {
        this.router.navigate(['/data-collection/']);
      }
    });
  }

  /*********************************************/
  /* Method to validate before performing fetch
  /* all nodes
  /*********************************************/
  validateAsupBasedSelection() {
    let types = [];
    let jobIds = [];
    let invalid = false;
    let totalSelectedRows = 0;
    let message = '';
    let caAsupSelected = false;
    let jobId = '';
    _.forEach(this.rows, row => {
      if (row['selected']) {
        if (jobIds.indexOf(jobId) == -1 || !jobId) {
          jobIds.push(jobId);
        }
        if (types.indexOf(row['type']) == -1) {
          types.push(row['type']);
          if (
            row['type'].toUpperCase().indexOf('CONFIGADVISOR') !== -1 ||
            row['type'].toUpperCase().indexOf('ONECOLLECT') !== -1 ||
            row['type'].toUpperCase().indexOf('7-MODE') !== -1
          ) {
            caAsupSelected = true;
          }
        }
        totalSelectedRows++;
      }
    });
    if (caAsupSelected && this.fetchAllNodes) {
      message = this.translate.instant('ASUP_fetchnode_msg1');
      invalid = true;
      return { invalid: invalid, message: message };
    }
    if (totalSelectedRows > 1 && this.fetchAllNodes) {
      message = this.translate.instant('ASUP_fetchnode_msg2');
      invalid = true;
      return { invalid: invalid, message: message };
    }
    if (types.length <= 1 && jobIds.length > 1) {
      // 4.7 AUSPS
      if (types[0].toUpperCase() == 'CONFIGADVISOR 4.X') {
        message = this.translate.instant('ASUP_fetchnode_msg3');
        invalid = true;
      } else {
        //ONTAP ASUPS
        jobIds = [''];
      }
    } else {
      if (types.length > 1) {
        message = this.translate.instant('ASUP_fetchnode_msg4');
        invalid = true;
      } else {
        if (jobIds.length > 1) {
          message = this.translate.instant('ASUP_fetchnode_msg5');
          invalid = true;
        }
      }
    }
    return { invalid: invalid, message: message };
  }

  /*********************************************/
  /* Method to add rows
  /*********************************************/
  addRows(rows) {
    _.forEach(rows, (row, i) => {
      this.rows.push(row);
    });
  }

  /*********************************************/
  /* Method to empty all rows
  /*********************************************/
  reset() {
    this.rows = [];
  }

  /*********************************************/
  /* Method to count total rows
  /*********************************************/
  totalRows() {
    return this.rows.length;
  }

  /*********************************************/
  /* Method to search serial number after
  /* checking connection to ASUP
  /*********************************************/
  searchSerialCallback = () => {
    let serial = this.helper.trim(this.serial);
    this.apiService
      .getAsupFromSerial(serial, this.getBeginDateStr(), this.getEndDateStr())
      .subscribe(data => {
        this.inSerialRows = [];
        _.forEach(data['result'], (row, i) => {
          if (!this.caLaunch) {
            let obj = {
              selected: false,
              showRow: true,
              lastSerial: true,
              asupId: row[0],
              title: row[2],
              date: row[3],
              model: row[4],
              serial: row[5],
              systemId: row[6],
              hostname: row[7],
              domain: row[8],
              release: row[9],
              type: row[10],
              clusterIdentifier: row[11]
            };
            this.inSerialRows.push(obj);
          } else {
            let obj = {
              selected: false,
              showRow: true,
              lastSerial: true,
              asupId: row[0],
              jobId: row[1],
              title: row[2],
              date: row[3],
              model: row[4],
              serial: row[5],
              systemId: row[6],
              hostname: row[7],
              domain: row[8],
              release: row[9],
              type: row[10],
              clusterIdentifier: row[11]
            };
            this.inSerialRows.push(obj);
          }
        });
        // if there are result rows then show selection modal
        if (this.inSerialRows.length) {
          this.show['serial'] = true;
          this.helper.showModalPopup('#serial-modal');
        } else {
          this.notification = {
            title: this.translate.instant('ASUP_errormodal_title'),
            message: this.translate.instant('ASUP_errormodal_msg1'),
            color: 'red'
          };
          // show the notification modal
          this.helper.showModalPopup('#notification-modal');
        }
      });
  };

  /*********************************************/
  /* Method to initiate search by serial number
  /*********************************************/
  searchSerial() {
    this.searchType = 'serial';
    this.show['serial'] = false;
    // change lastSerial property in rows
    _.forEach(this.rows, row => {
      if (_.has(row, 'lastSerial')) {
        row['lastSerial'] = false;
      }
    });
    // empty inSerialRows
    this.inSerialRows = [];
    // check whether logged in and process the callback
    this.checkLiveStatus(this.searchSerialCallback);
  }

  /*********************************************/
  /* Method to re-open last search results by
  /* serial number
  /*********************************************/
  showSerialModal() {
    this.helper.showModalPopup('#serial-modal');
  }

  /*********************************************/
  /* Method to search hostname after checking
  /* connection to ASUP
  /*********************************************/
  searchHostnameCallback = () => {
    let hostname = this.helper.trim(this.hostname);
    this.apiService
      .getAsupFromHostname(
        hostname,
        this.getBeginDateStr(),
        this.getEndDateStr()
      )
      .subscribe(data => {
        this.inHostnameRows = [];
        _.forEach(data['result'], (row, i) => {
          if (!this.caLaunch) {
            let obj = {
              selected: false,
              showRow: true,
              lastHostname: true,
              asupId: row[0],
              asupProxy: row[1],
              title: row[2],
              date: row[3],
              model: row[4],
              serial: row[5],
              systemId: row[6],
              hostname: row[7],
              domain: row[8],
              release: row[9],
              type: row[10],
              clusterIdentifier: row[11]
            };
            this.inHostnameRows.push(obj);
          } else {
            let obj = {
              selected: false,
              showRow: true,
              lastHostname: true,
              asupId: row[0],
              jobId: row[1],
              title: row[2],
              date: row[3],
              model: row[4],
              serial: row[5],
              systemId: row[6],
              hostname: row[7],
              domain: row[8],
              release: row[9],
              type: row[10],
              clusterIdentifier: row[11]
            };
            this.inHostnameRows.push(obj);
          }
        });
        // if there are result rows then show selection modal
        if (this.inHostnameRows.length) {
          this.show['hostname'] = true;
          this.helper.showModalPopup('#hostname-modal');
        } else {
          this.notification = {
            title: this.translate.instant('ASUP_errormodal_title'),
            message: this.translate.instant('ASUP_errormodal_msg2'),
            color: 'red'
          };
          // show the notification modal
          this.helper.showModalPopup('#notification-modal');
        }
      });
  };

  /*********************************************/
  /* Method to initiate search by hostname
  /*********************************************/
  searchHostname() {
    this.searchType = 'hostname';
    this.hostname = this.hostname.trim();
    this.show['hostname'] = false;
    // change lastSerial property in rows
    _.forEach(this.rows, row => {
      if (_.has(row, 'lastHostname')) {
        row['lastHostname'] = false;
      }
    });
    // empty inHostnameRows
    this.inHostnameRows = [];
    // check whether logged in and process the callback
    this.checkLiveStatus(this.searchHostnameCallback);
  }

  /*********************************************/
  /* Method to re-open last search results by
  /* hostname
  /*********************************************/
  showHostnameModal() {
    this.helper.showModalPopup('#hostname-modal');
  }

  /*********************************************/
  /* Method to search onecollectId after
  /* checking connection to ASUP
  /*********************************************/
  searchOnecollectCallback = () => {
    let onecollectId = this.helper.trim(this.onecollectId);
    this.apiService
      .getAsupFromOnecollectId(this.onecollectId)
      .subscribe(data => {
        this.inOnecollectRows = [];
        _.forEach(data['result'], (row, i) => {
          let obj = {
            selected: false,
            showRow: true,
            lastOnecollect: true,
            asupId: row[0],
            jobId: row[1],
            title: row[2],
            date: row[3],
            model: row[4],
            serial: row[5],
            systemId: row[6],
            hostname: row[7],
            domain: row[8],
            release: row[9],
            type: row[10],
            clusterIdentifier: row[11]
          };
          this.inOnecollectRows.push(obj);
        });
        // if there are result rows then show selection modal
        if (this.inOnecollectRows.length) {
          this.show['onecollect'] = true;
          this.helper.showModalPopup('#onecollect-modal');
        } else {
          if (!this.caLaunch) {
            this.notification = {
              title: this.translate.instant('ASUP_errormodal_title'),
              message: this.translate.instant('ASUP_errormodal_msg3'),
              color: 'red'
            };
          } else {
            this.notification = {
              title: this.translate.instant('ASUP_errormodal_title'),
              message: this.translate.instant('ASUP_errormodal_msg4'),
              color: 'red'
            };
          }
          // show the notification modal
          this.helper.showModalPopup('#notification-modal');
        }
      });
  };

  /*********************************************/
  /* Method to initiate search by OnecollectId
  /*********************************************/
  searchOnecollectId() {
    this.searchType = 'onecollectId';
    this.show['onecollect'] = false;
    // change lastOnecollect property in rows
    _.forEach(this.rows, row => {
      if (_.has(row, 'lastOnecollect')) {
        row['lastOnecollect'] = false;
      }
    });
    // empty inOnecollectRows
    this.inOnecollectRows = [];
    // check whether logged in and process the callback
    this.checkLiveStatus(this.searchOnecollectCallback);
  }

  /*********************************************/
  /* Method to re-open last search results by
  /* OnecollectId
  /*********************************************/
  showOnecollectModal() {
    this.helper.showModalPopup('#onecollect-modal');
  }

  /*********************************************/
  /* Method to search single ASUP Id after
  /* checking connectivity to ASUP network
  /*********************************************/
  searchAsupIdCallback = () => {
    let asupId = this.helper.trim(this.asupId);
    this.apiService.getAsupId(asupId).subscribe(data => {
      let key = _.keys(data)[0];
      let state = data[key][0];
      let row = data[key][1];
      if (state) {
        let obj = {
          selected: true,
          showRow: true,
          asupId: row[0],
          jobId: row[1],
          title: row[2],
          date: row[3],
          model: row[4],
          serial: row[5],
          systemId: row[6],
          hostname: row[7],
          domain: row[8],
          release: row[9],
          type: row[10],
          clusterIdentifier: row[11]
        };
        // add the row to main rows
        this.setNewRows([obj]);
        // notify added row
        this.notification = {
          title: this.translate.instant('ASUP_successmodal_title'),
          message: this.translate.instant('ASUP_successmodal_msg1'),
          color: 'green'
        };
      } else {
        // notify error
        this.notification = {
          title: this.translate.instant('ASUP_errormodal_title'),
          message: this.translate.instant('ASUP_errormsg_msg5'),
          color: 'red'
        };
      }
      // show the notification modal
      this.helper.showModalPopup('#notification-modal');
    });
  };

  /*********************************************/
  /* Method to initiate search by ASUP Id
  /*********************************************/
  searchAsupId() {
    //return if the asupId is added already
    if (this.rows.filter(r => r.asupId === this.asupId).length) return;

    //otherwise search and add
    this.searchType = 'asupId';
    if (this.caLaunch) {
      this.asupId = this.asupId.trim();
    }
    // check whether logged in and process the callback
    this.checkLiveStatus(this.searchAsupIdCallback);
  }

  /*********************************************/
  /* Method to search single  ASUP Id after
  /* checking connectivity to ASUP network
  /*********************************************/
  uploadAsupIdsCallback = () => {
    this.apiService.uploadAsupIds(this.asupIdContent).subscribe(
      response => {
        let data = response['body'];
        if (typeof data !== 'object') {
          data = JSON.parse(data);
        }
        this.uploadMsgTxtCsv = '';
        let keys = _.keys(data);
        let countData = 0;
        _.forEach(keys, key => {
          let state = data[key][0];
          let row = data[key][1];
          if (state) {
            countData++;
            let obj = {
              selected: true,
              showRow: true,
              asupId: row[0],
              jobId: row[1],
              title: row[2],
              date: row[3],
              model: row[4],
              serial: row[5],
              systemId: row[6],
              hostname: row[7],
              domain: row[8],
              release: row[9],
              type: row[10],
              clusterIdentifier: row[11]
            };
            // add the row to main rows
            this.setNewRows([obj]);
          }
        });
        if (countData) {
          // notify added row
          this.notification = {
            title: this.translate.instant('ASUP_successmodal_title'),
            message: this.translate.instant('ASUP_successmodal_msg1'),
            color: 'green'
          };
          this.checkAll = true;
          this.doCountSelected();
        } else {
          // notify error
          this.notification = {
            title: this.translate.instant('ASUP_errormodal_title'),
            message: this.translate.instant('ASUP_errormsg_msg5'),
            color: 'red'
          };
        }
        // show the notification modal
        this.helper.showModalPopup('#notification-modal');
      },
      // when response is error due to bad file
      error => {
        this.notification = {
          title: this.translate.instant('ASUP_errormodal_title'),
          message: error['statusText'],
          color: 'red'
        };
        // show the notification modal
        this.helper.showModalPopup('#notification-modal');
      }
    );
  };

  /*********************************************/
  /* Method to initiate search of single ASUP Id
  /*********************************************/
  uploadAsupIds() {
    this.checkLiveStatus(this.uploadAsupIdsCallback);
  }

  /*********************************************/
  /* Method to reset selected file for uploading
  /* ASUP Ids from file
  /*********************************************/
  resetUploadAsupIds(event) {
    event.target.value = '';
  }

  /*********************************************/
  /* Method to initiate file upload containing
  /* ASUP Ids
  /*********************************************/
  setFileUploadAsupIds(event) {
    this.searchType = 'uploadAsupIds';
    let files = event.target.files;
    if (files && files.length > 0) {
      let file = files.item(0);
      // validate file extension
      let regex = /\.[^.]+$/g;
      let extension = regex.exec(file.name)[0].toLowerCase();

      // get filelabel
      if (files.length == 1) {
        let filename = file.name
          .split('.')
          .slice(0, -1)
          .join('.');
        if (filename.length > 10) {
          this.fileidLabel = filename.slice(0, 10) + '...' + extension;
        } else {
          this.fileidLabel = file.name;
        }
      } else {
        this.fileidLabel =
          files.length + this.translate.instant('Importfile_files');
      }

      if (extension != '.txt' && extension != '.csv') {
        this.typeCheckTxtCsv = 'fail';
        this.uploadMsgTxtCsv = this.translate.instant('ASUP_upload_csvmsg1');
      } else {
        // upload file since it is CSV
        this.typeCheckTxtCsv = 'pass';
        this.uploadMsgTxtCsv = this.translate.instant('ASUP_upload_msg2');
        let reader: FileReader = new FileReader();
        reader.readAsText(file);
        reader.onload = e => {
          this.asupIdContent = { content: reader.result };
          this.uploadAsupIds();
        };
      }
    }
  }

  /*********************************************/
  /* Method to upload ASUP tgz or txt files
  /*********************************************/
  uploadAsupCallback = () => {
    // dispatch request to upload file
    this.apiService.uploadAsupTgz(this.asupFormData).subscribe(
      response => {
        let data = response['body'];
        if (typeof data !== 'object') {
          data = JSON.parse(data);
        }
        this.uploadMsgTgzTxt = '';
        if (data['status'] == 'Fail') {
          // show error modal on failure
          this.notification = {
            title: this.translate.instant('ASUP_errormodal_title'),
            message: data['reason'],
            color: 'red'
          };
          // show the notification modal
          this.helper.showModalPopup('#notification-modal');
        } else {
          // go to jobs page when success
          this.router.navigate(['/main/collection']);
        }
      },
      error => {
        this.notification = {
          title: this.translate.instant('ASUP_errormodal_title'),
          message: error['statusText'],
          color: 'red'
        };
        // show the notification modal
        this.helper.showModalPopup('#notification-modal');
      }
    );
  };

  /*********************************************/
  /* Method to initiate upload of ASUP tgz or
  /* txt file (no need to check ASUP
  /* connectivity)
  /*********************************************/
  uploadAsup() {
    this.uploadAsupCallback();
  }

  /*********************************************/
  /* Method to reset selected file for uploading
  /* ASUP tgz or txt file
  /*********************************************/
  resetUploadAsup(event) {
    event.target.value = '';
  }

  /*********************************************/
  /* Method to initiate upload of ASUP tgz or
  /* txt file
  /*********************************************/
  setFileUploadAsup(event) {
    this.searchType = 'uploadAsup';
    let files = event.target.files;
    if (files && files.length > 0) {
      let file = files.item(0);
      // validate file extensions
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

      if (extension != '.tgz' && extension != '.txt') {
        this.typeCheckTgzTxt = 'fail';
        this.uploadMsgTgzTxt = this.translate.instant('ASUP_upload_msg1');
      } else {
        // upload file using FormData
        this.typeCheckTgzTxt = 'pass';
        this.uploadMsgTgzTxt = this.translate.instant('ASUP_upload_msg2');
        this.asupFormData = new FormData();
        this.asupFormData.append('select_file', file, file.name);
        this.asupFormData.append('type', 'edit');
        this.uploadAsup();
      }
    }
  }

  /*********************************************/
  /* Method to sort custom fields in table
  /* (over-riding method from common component)
  /*********************************************/
  sort(field) {
    // define map of ui field name to json key
    let fieldMap = {
      asupId: 'asupId',
      jobId: 'jobId',
      title: 'title',
      model: 'model',
      hostname: 'hostname',
      release: 'release',
      type: 'type'
    };
    // run sort
    this.updateSortType(field);
    this.rows = this.doSort(field, fieldMap, this.rows);
  }

  /*********************************************/
  /* Method to filter rows based on search
  /* (over-riding method from common component)
  /*********************************************/
  matcher(key) {
    // find all rows matching all values for all fields
    _.forEach(this.rows, row => {
      // set row to show initially
      row['showRow'] = true;
      _.forEach(this.fields, (field, j) => {
        // for fields having a filter value
        if (field['filterValue']) {
          // get correct value from object key depth
          let value;
          if (_.includes(key, '.')) {
            let keys = key.split('.');
            _.forEach(keys, key => {
              if (!value) {
                value = row[key];
              } else {
                value = value[key];
              }
            });
          } else {
            value = row[field.key];
          }
          // create regular expression
          let exp = new RegExp(field['filterValue'], 'i');
          if (!exp.test(value)) {
            row['showRow'] = false;
            // break from fields loop when first
            // non-matching field is found
            return false;
          }
        }
      });
    });
  }
}
