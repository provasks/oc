import {
  forkJoin as observableForkJoin,
  throwError as observableThrowError,
  Observable
} from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
  Http,
  Headers,
  URLSearchParams,
  RequestOptions,
  ResponseContentType
} from '@angular/http';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { DataService } from 'src/app/services/data/data.service';

import { environment } from 'src/environments/environment';
import * as _ from 'lodash';
import { TranslateService } from '../translate/translate.service';

@Injectable()
export class ApiService {
  /*********************************************/
  /* Class properties
  /*********************************************/
  baseUrl: string = environment.baseUrl;
  caLaunch: boolean = environment.caLaunch;

  /*********************************************/
  /* Constructor method
  /*********************************************/
  constructor(
    private http: Http,
    private httpClient: HttpClient,
    private dataService: DataService,
    private translate: TranslateService
  ) {}

  /*************************************************************
   * This Method will collect data from three api and return the
   * responses all together.
   * 1. Jobs Count
   * 2. Saved Project records and
   * 3. Scheduled Jobs records
   *************************************************************/
  getRecordsInfo(cb: any) {
    const allJobsCount = new Promise((resolve, reject) => {
      this.getJobsCount().subscribe(response => {
        resolve(response);
      });
    });

    const saveProjects = new Promise((resolve, reject) => {
      this.getSavedProjects().subscribe(response => {
        resolve(response);
      });
    });

    const scheduledJobs = new Promise((resolve, reject) => {
      this.getScheduleList().subscribe(response => {
        resolve(response);
      });
    });

    Promise.all([allJobsCount, saveProjects, scheduledJobs]).then(values => {
      cb(values);
    });
  }

  /*********************************************/
  /* Method to convert data to JSON if not
  /* already in JSON format
  /*********************************************/
  checkJSON(data) {
    if (typeof data !== 'object') {
      data = JSON.parse(data);
    }
    return data;
  }

  /*********************************************/
  /* Method to include custom headers to request
  /*********************************************/
  getOptions(param = 'foobar') {
    let headers = new Headers();
    let params = new URLSearchParams();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    params.set(param, new Date().getTime().toString());
    let options = new RequestOptions({ headers: headers, params: params });
    return options;
  }

  /*********************************************/
  /* Method to include custom url params
  /*********************************************/
  getParams(param = 'foobar') {
    return {
      params: new HttpParams().set(param, new Date().getTime().toString())
    };
  }

  /*********************************************/
  /* Method to shutdown OneCollect
  /*********************************************/
  shutDown() {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/shutdownoc/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getBuildType() {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/getbuildtype/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  /*********************************************/
  // Page Count for Initial Launch
  /*********************************************/
  getLaunchPageCount() {
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/getpagecount/admin/launch/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  updateLaunchPageCount() {
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/updatepagecount/admin/launch/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  /*********************************************/
  // Update Plugins
  /*********************************************/

  getupdatedplugin(locale, plugin_name) {
    let lang = 'lang';
    let params = new URLSearchParams();
    params.set(lang, locale);
    let options = new RequestOptions({ params: params });
    return this.http
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/getupdatedplugin/${plugin_name}/`,
        options
      )
      .pipe(map(response => response.json()));
  }

  getzippedfolder(locale, formData) {
    // let headers = new Headers();
    // headers.append('Content-Type', 'multipart/form-data');
    const headers = new Headers();

    headers.set('Content-Type', 'multipart/form-data');
    let options = new RequestOptions({ headers: headers });
    return this.http
      .post(
        this.baseUrl +
          `/onecollect/onecollectservice/getzippedfolder/${locale}/`,
        formData
      )
      .pipe(
        map((response: any) => this.checkJSON(response)),
        catchError(err => {
          console.log(err);

          return observableThrowError(err);
        })
      );
  }

  /*********************************************/
  // Jobs List for Data Collection
  /*********************************************/
  getJobsList(start, interval) {
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/getjobslist/admin/start/${start}/interval/${interval}/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getProjectsList() {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/getallprojects/admin/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getJobsForProject(project, start, interval) {
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/getjobsforprojectpaginate/${project}/admin/start/${start}/interval/${interval}/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getJobLog(jobName) {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/getjob/${jobName}/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getJobsCount() {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/getjobscount/admin/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getProjectsCount() {
    return this.httpClient
      .get(
        this.baseUrl + `/onecollect/onecollectservice/getprojectscount/admin/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getJobsCountForProject(project) {
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/getjobscountforproject/${project}/admin/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  deleteJob(jobName) {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/delete/${jobName}/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  playJob(jobName) {
    let userData = this.dataService.getUserData();
    if (!userData) {
      userData = { details: 'cancel' };
    }
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/play/${jobName}/`,
        userData
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  stopCollecting(jobName) {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/terminate/${jobName}/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  /*********************************************/
  // IMT Advise endpoints
  /*********************************************/
  getImtAdviseJobData(jobName, hostName, groupName) {
    let locale = this.dataService.getLocale();
    let options = this.getOptions();
    let url = '';
    if (!groupName) {
      url = `/imtadvisor/imtservice/oc/${locale}/${jobName}/${hostName}/`;
    } else {
      url = `/imtadvisor/imtservice/oc/${locale}/${jobName}/${hostName}/${groupName}/`;
    }
    return this.http.get(this.baseUrl + url, options).pipe(
      map(response => {
        response = this.checkJSON(response);
        if (response.status == 0) {
          return observableThrowError(
            new Error(this.translate.instant('Server is Down'))
          );
        } else if (response.status != 200) {
          return observableThrowError(new Error(response.json()));
        } else {
          return response.json();
        }
      }),
      catchError(this.handleError)
    );
  }

  getLatestOntapData() {
    let options = this.getOptions();
    let url = this.baseUrl + `/imtadvisor/imtservice/ontap_list/`;
    return this.http.get(url, options).pipe(
      map(response => {
        response = this.checkJSON(response);
        if (response.status == 0) {
          return observableThrowError(
            new Error(this.translate.instant('Server is Down'))
          );
        } else if (response.status != 200) {
          return observableThrowError(new Error(response.json()));
        } else {
          return response.json();
        }
      }),
      catchError(this.handleError)
    );
  }

  downloadReportData(fileName) {
    //let options = this.getOptions();
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return this.http
      .get(this.baseUrl + `/advisor/static/report/${fileName}`, {
        headers: headers,
        responseType: ResponseContentType.Blob
      })
      .pipe(
        map((res: any) => {
          return new Blob([res._body], { type: 'application/vnd.ms-excel' });
        }),
        catchError(this.handleError)
      );
  }

  postSelectedAdviseData(data) {
    let locale = this.dataService.getLocale();
    let options = this.getOptions();
    return this.http
      .post(
        this.baseUrl + `/imtadvisor/imtservice/oc1/offline/${locale}/`,
        data,
        options
      )
      .pipe(
        map(response => {
          response = this.checkJSON(response);
          if (response.status == 0) {
            return observableThrowError(
              new Error(this.translate.instant('Server is Down'))
            );
          } else if (response.status != 200) {
            return observableThrowError(new Error(response.json()));
          } else {
            return response.json();
          }
        }),
        catchError(this.handleError)
      );
  }

  postViewDetailsData(data) {
    let options = this.getOptions();
    return this.http
      .post(this.baseUrl + `/imtadvisor/imtservice/view/`, data, options)
      .pipe(
        map(response => {
          response = this.checkJSON(response);
          if (response.status == 0) {
            return observableThrowError(
              new Error(this.translate.instant('Server is Down'))
            );
          } else if (response.status != 200) {
            return observableThrowError(new Error(response.json()));
          } else {
            return response.json();
          }
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: Response) {
    if (error.status == 0) {
      return observableThrowError('Internal Server Error');
    }
    if (error.status != 200) {
      if (error.status == 404) {
        return observableThrowError('No Records Found');
      }
      return observableThrowError(new Error(error.statusText));
    }
    return observableThrowError(error.json() || 'Inernal Server error');
  }

  /*export job view data files to excel*/
  downloadJobViewReportData(fileName) {
    let data = { file_path: fileName };
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return this.http
      .post(this.baseUrl + `/onecollect/parse/job/`, data, {
        headers: headers,
        responseType: ResponseContentType.Blob
      })
      .pipe(
        map((res: any) => {
          return new Blob([res._body], { type: 'application/vnd.ms-excel' });
        }),
        catchError(this.handleError)
      );
  }

  /*********************************************/
  // Device Based Collection
  /*********************************************/
  getDeviceTypes() {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/getdevicetypes/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getDeviceDetails(deviceTypes) {
    let deviceDetails$ = [];
    for (let deviceType of deviceTypes) {
      let device_id = deviceType.device_id;
      deviceDetails$.push(
        this.httpClient
          .get(
            this.baseUrl +
              `/onecollect/onecollectservice/device/${device_id}/getdetails/`
          )
          .pipe(map((response: any) => this.checkJSON(response)))
      );
    }
    return observableForkJoin(...deviceDetails$);
  }

  postDeviceValidate(data) {
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/device/validate`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getDeviceSummary(data) {
    return this.httpClient
      .post(this.baseUrl + `/onecollect/onecollectservice/device/summary`, data)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getCommands(type, commandset, persona) {
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/getcommands/profile/${type}/commandset/${commandset}/persona/${persona}/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  // get all commands for all components
  getAllSolutionCommands(components, type, persona) {
    let commands$ = [];
    for (let component of components) {
      let commandset = component['commandset_id'];
      commands$.push(
        this.httpClient
          .get(
            this.baseUrl +
              `/onecollect/onecollectservice/getcommands/profile/${type}/commandset/${commandset}/persona/${persona}/`
          )
          .pipe(map((response: any) => this.checkJSON(response)))
      );
    }
    return observableForkJoin(...commands$);
  }

  postSaveAndCollectDevice(data) {
    return this.httpClient
      .post(this.baseUrl + `/onecollect/onecollectservice/device/collect`, data)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  postCollectOnly(data) {
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/device/collectonly`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getGroups() {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/getgroups`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  /*********************************************/
  // Solution Based Collection
  /*********************************************/
  getProfiles() {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/getprofiles/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getSubProfiles(profile) {
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/profile/${profile}/getsubprofiles/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getProfileDetails(profile) {
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/device/${profile}/getdetails/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getProfileForm(profile, subProfile, next) {
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/profile/${profile}/subprofile/${subProfile}/next/${next}/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getSerialPorts() {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/searchserialports/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  postProfileValidate(profile, subProfile, data) {
    return this.httpClient
      .post(
        this.baseUrl +
          `/onecollect/onecollectservice/profile/${profile}/subprofile/${subProfile}`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  postCollectSolution(profile, subProfile, data) {
    return this.httpClient
      .post(
        this.baseUrl +
          `/onecollect/onecollectservice/profile/${profile}/subprofile/${subProfile}/collectonly`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  postSaveAndCollectSolution(profile, subProfile, data) {
    return this.httpClient
      .post(
        this.baseUrl +
          `/onecollect/onecollectservice/profile/${profile}/subprofile/${subProfile}/collect`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  /*********************************************/
  // Saved Projects
  /*********************************************/
  // getSavedProjects(start: number = 1, interval: number = 20) {
  //   if (!this.caLaunch) {
  //     return this.httpClient
  //       .get(
  //         this.baseUrl +
  //           `/onecollect/onecollectservice/getpaginatedprojectslist/start/${start}/interval/${interval}/`
  //       )
  //       .map((response: any) => response);
  //   } else {
  //     return this.httpClient
  //       .get(
  //         this.baseUrl +
  //           `/onecollect/onecollectservice/getpaginatedprojectslist/start/${start}/interval/${interval}/`
  //       )
  //       .map((response: any) => this.checkJSON(response));
  //   }
  // }

  getSavedProjects() {
    if (!this.caLaunch) {
      return this.httpClient
        .get(this.baseUrl + `/onecollect/onecollectservice/getprojects/admin/`)
        .pipe(map((response: any) => response));
    } else {
      return this.httpClient
        .get(this.baseUrl + `/onecollect/onecollectservice/getprojects/admin/`)
        .pipe(map((response: any) => this.checkJSON(response)));
    }
  }

  saveDeviceBasedProject(data) {
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/device/saveproject`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  saveSolutionBasedProject(data, profile, subprofile) {
    return this.httpClient
      .post(
        this.baseUrl +
          `/onecollect/onecollectservice/profile/${profile}/subprofile/${subprofile}/saveproject`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  deleteSavedProject(jobName) {
    return this.httpClient
      .get(
        this.baseUrl + `/onecollect/onecollectservice/deleteproject/${jobName}/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  cloneProject(projectName, newProjectName) {
    let locale = this.dataService.getLocale();
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/cloneproject/${projectName}/${newProjectName}/${locale}/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  /*********************************************/
  // Scheduling
  /*********************************************/
  getScheduleList() {
    return this.httpClient
      .get(
        this.baseUrl + `/onecollect/onecollectservice/getschedulelist/admin/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  saveScheduleProject(jobName, data) {
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/schedule/${jobName}/`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  deleteScheduledProject(scheduleId) {
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/deleteschedule/${scheduleId}/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  /*********************************************/
  // Settings
  /*********************************************/
  getPreferences() {
    let options = this.getOptions('buster');
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/getpref/admin/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  postPreferences(data) {
    return this.httpClient
      .post(this.baseUrl + `/onecollect/onecollectservice/setpref/admin/`, data)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  /*********************************************/
  // Data View
  /*********************************************/
  // get basic headers for each file associated with a component
  getComponentTypes(file) {
    let data = { file_path: file };
    return this.httpClient
      .post(this.baseUrl + `/onecollect/onecollectservice/parse/`, data, {
        observe: 'response'
      })
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  // get data associated with each header of given file for a component
  getComponentTypeData(file, type) {
    let data = { file_path: file, section: type };
    return this.httpClient
      .post(this.baseUrl + `/onecollect/onecollectservice/parse/section/`, data)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  // get commands lisit for component
  getComponentCommands(file) {
    let data = { file: file };
    return this.httpClient
      .post(this.baseUrl + `/onecollect/onecollectservice/getcommands/`, data)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  // get all commands for all components
  getAllComponentCommands(components) {
    let commands$ = [];
    for (let component of components) {
      let file = component.file_path;
      let data = { file: file };
      commands$.push(
        this.httpClient
          .post(
            this.baseUrl + `/onecollect/onecollectservice/getcommands/`,
            data
          )
          .pipe(map((response: any) => this.checkJSON(response)))
      );
    }
    return observableForkJoin(...commands$);
  }

  // get command data for each component
  getComponentCommandData(file, target, command) {
    let data = { file: file, target: target, command: command };
    return this.httpClient
      .post(this.baseUrl + `/onecollect/onecollectservice/getcommand/`, data, {
        observe: 'response'
      })
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  /*********************************************/
  // Import CSV Containing Devices Credentials
  /*********************************************/
  getCsvJson(data) {
    return this.httpClient
      .post(this.baseUrl + `/onecollect/onecollectservice/getjsondata/`, data, {
        observe: 'response'
      })
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  /*********************************************/
  // Auto Discovery
  /*********************************************/
  getIpJson(ipRange, time, cs: string = '', useCredentials = false) {
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/discover/${time}/?community_strings=${cs}&use_credentials=${useCredentials}&subnets=${ipRange}`,
        { observe: 'response' }
      )
      .pipe(map((response: any) => this.checkJSON(response)));
    // return this.httpClient
    //   .get(
    //     this.baseUrl +
    //       `/onecollect/onecollectservice/discover/${ipRange}/${time}/?community_strings=${cs}&use_credentials=${useCredentials}`,
    //     { observe: 'response' }
    //   )
    //   .pipe(map((response: any) => this.checkJSON(response)));
  }

  getDiscoveryProgress(time: string) {
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/getdiscoveryprogress/${time}/`,
        { observe: 'response' }
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  exportDiscoveredExcel(json) {
    let data = { json: json };
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return this.http
      .post(this.baseUrl + `/onecollect/onecollectservice/exportxls/`, data, {
        headers: headers,
        responseType: ResponseContentType.Blob
      })
      .pipe(
        map((res: any) => {
          return new Blob([res._body], { type: 'application/vnd.ms-excel' });
        }),
        catchError(this.handleError)
      );
  }

  /*********************************************/
  // Import gzip Collected File
  /*********************************************/
  uploadCollectedFile(formData) {
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/createjobfromfile/`,
        formData
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  uploadCollectedFiles(forms) {
    let upload$ = [];
    _.forEach(forms, formData => {
      upload$.push(
        this.httpClient
          .post(
            this.baseUrl + `/onecollect/onecollectservice/createjobfromfile/`,
            formData
          )
          .pipe(map((response: any) => this.checkJSON(response)))
      );
    });
    return observableForkJoin(...upload$);
  }

  uploadCollectedFilesSerially(formData) {
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/createjobfromfile/`,
        formData
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  uploadPerfCollectedFile(formData) {
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/createperfjobfromfile/`,
        formData,
        { observe: 'response' }
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  /*********************************************/
  // ASUP Based Collection
  /*********************************************/
  getAsupStatus() {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/checkasupnetwork/`, {
        observe: 'response'
      })
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  checkInternet() {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/checkinternet/`, {
        observe: 'response'
      })
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  ssoLogin(data) {
    return this.httpClient
      .post(this.baseUrl + `/onecollect/onecollectservice/login/`, data)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getLiveStatus() {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/islive/`, {
        observe: 'response'
      })
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  uploadAsupTgz(formData) {
    let userData = this.dataService.getUserData();
    formData.append('model', JSON.stringify(userData));
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/validateasupfiles/`,
        formData,
        { observe: 'response' }
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  uploadAsupIds(data) {
    let userData = this.dataService.getUserData();
    _.assignIn(data, userData);
    return this.httpClient
      .post(this.baseUrl + `/onecollect/onecollectservice/loadasupids/`, data, {
        observe: 'response'
      })
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getAsupFromSerial(serial, beginDate, endDate) {
    let data = this.dataService.getUserData();
    return this.httpClient
      .post(
        this.baseUrl +
          `/onecollect/onecollectservice/searchserial/${serial}/${beginDate}/${endDate}/`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getAsupFromHostname(hostname, beginDate, endDate) {
    let data = this.dataService.getUserData();
    return this.httpClient
      .post(
        this.baseUrl +
          `/onecollect/onecollectservice/searchhostname/${hostname}/${beginDate}/${endDate}/`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getAsupFromOnecollectId(onecollectId) {
    let data = this.dataService.getUserData();
    return this.httpClient
      .post(
        this.baseUrl +
          `/onecollect/onecollectservice/searchjobid/${onecollectId}/`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getAsupId(asupId) {
    let data = this.dataService.getUserData();
    return this.httpClient
      .post(
        this.baseUrl +
          `/onecollect/onecollectservice/validateasupid/${asupId}/`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  collectOnlyAsupIds(data) {
    let userData = this.dataService.getUserData();
    _.assignIn(data, userData);
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/collectonlyasupids/`,
        data,
        { observe: 'response' }
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  /*********************************************/
  // ASUP Based Collection
  /*********************************************/
  getAsupJobsList(start, interval) {
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/getasupjobslist/admin/start/${start}/interval/${interval}/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getAsupPageCount() {
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/getpagecount/admin/asuupload/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  uploadToAsup(data) {
    let userData = this.dataService.getUserData();
    _.assignIn(data, userData);
    return this.httpClient
      .post(this.baseUrl + `/onecollect/onecollectservice/uploadasup/`, data, {
        observe: 'response'
      })
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  uploadToPerfAsup(data) {
    let userData = this.dataService.getUserData();
    _.assignIn(data, userData);
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/uploadperfasup/`,
        data,
        { observe: 'response' }
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  uploadFileToAsup(formData) {
    let userData = this.dataService.getUserData();
    formData.append('model', JSON.stringify(userData));
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/validate/`,
        formData,
        { observe: 'response' }
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  fetchAllAsupsBasedOnClusterId(clusterId) {
    let data = this.dataService.getUserData();
    return this.httpClient
      .post(
        this.baseUrl +
          `/onecollect/onecollectservice/fetchclusterid/${clusterId}/`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  /*********************************************/
  // Display notification
  /*********************************************/
  getNotification() {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/getnotification/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  /*********************************************/
  // Performance Collection
  /*********************************************/
  hasPerfProfile() {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/hasperf/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getPerfDeviceTypes() {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/getperfdevicetypes/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getPerfDeviceDetails(deviceTypes) {
    let deviceDetails$ = [];
    for (let deviceType of deviceTypes) {
      let device_id = deviceType.device_id;
      deviceDetails$.push(
        this.httpClient
          .get(
            this.baseUrl +
              `/onecollect/onecollectservice/perfdevice/${device_id}/getdetails/`
          )
          .pipe(map((response: any) => this.checkJSON(response)))
      );
    }
    return observableForkJoin(...deviceDetails$);
  }

  validateSpmToken(token) {
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/istokenvalid/`,
        token,
        { observe: 'response' }
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  postSaveAndCollectPerfDevice(data) {
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/device/perfcollect/`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  isTokenAvailableAndValid(projectName) {
    let data = { project_name: projectName };
    return this.httpClient
      .post(
        this.baseUrl +
          `/onecollect/onecollectservice/istokenavailableandvalid/`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  /*********************************************/
  // User Management
  /*********************************************/
  getLoggedUser() {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/getloggeduser/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getUsers() {
    let locale = this.dataService.getLocale();
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/getusers/${locale}/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  createUser(user) {
    let locale = this.dataService.getLocale();
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/register/${locale}/`,
        user
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  changePassword(user) {
    let locale = this.dataService.getLocale();
    return this.httpClient
      .post(
        this.baseUrl +
          `/onecollect/onecollectservice/changepassword/${locale}/`,
        user
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  deleteUser(id) {
    let locale = this.dataService.getLocale();
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/deleteuser/${id}/${locale}/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  updateUser(user) {
    let locale = this.dataService.getLocale();
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/updateuser/${locale}/`,
        user
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  loginUser(user) {
    let locale = this.dataService.getLocale();
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/login_user/${locale}/`,
        user
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  logoutUser() {
    let locale = this.dataService.getLocale();
    return this.httpClient
      .get(
        this.baseUrl + `/onecollect/onecollectservice/logout_user/${locale}/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  getAppMeta() {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/get_app_meta/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  setEulaChecked(data) {
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/set_eula_checked/`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  verifyInstanceId(data) {
    return this.httpClient
      .post(
        this.baseUrl + `/onecollect/onecollectservice/verify_instance_id/`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  setInstanceIdVerified(data) {
    return this.httpClient
      .post(
        this.baseUrl +
          `/onecollect/onecollectservice/set_instance_id_verified/`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  setAdminPassword(data) {
    let locale = this.dataService.getLocale();
    return this.httpClient
      .post(
        this.baseUrl +
          `/onecollect/onecollectservice/set_admin_password/${locale}/`,
        data
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  //CA Code
  getalljobs() {
    return this.httpClient.get(
      this.baseUrl + `/onecollect/onecollectservice/getjobs/admin/`
    );
  }

  /*********************************************/
  // CA Services
  /*********************************************/
  setVerification(verificationData) {
    let headers = new Headers();
    let params = new URLSearchParams();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    params.set('foobar', new Date().getTime().toString());
    let options = new RequestOptions({ headers: headers, params: params });
    return this.http
      .post(
        this.baseUrl + `/verification_credentials/`,
        verificationData,
        options
      )
      .pipe(map(response => response));
  }

  getCommandViewerJobLog(jobName) {
    return this.httpClient
      .get(this.baseUrl + `/getcommandviewerjob/${jobName}/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }
  // get commands lisit for component
  ca_getComponentCommands(file, jobName) {
    let locale = this.dataService.getLocale();
    let data = { locale: locale };
    return this.httpClient
      .post(this.baseUrl + `/getcommands/${file}/${jobName}/`, data)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  // get all commands for all components
  ca_getAllComponentCommands(components, jobName) {
    let locale = this.dataService.getLocale();
    let data = { locale: locale };
    let commands$ = [];

    for (let component of components) {
      let file = component.file_path;
      commands$.push(
        this.httpClient
          .post(this.baseUrl + `/getcommands/${file}/${jobName}/`, data)
          .pipe(map((response: any) => this.checkJSON(response)))
      );
    }
    return observableForkJoin(...commands$);
  }

  // get command data for each component
  ca_getComponentCommandData(file, target, command, jobName) {
    let locale = this.dataService.getLocale();
    let data = { command: command, locale: locale };
    return this.httpClient
      .post(this.baseUrl + `/getcommand/${file}/${target}/${jobName}/`, data)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  /*******************************
   * Credential Management
   ******************************/
  getCredential(alias: string) {
    return this.httpClient
      .get(
        this.baseUrl + `/onecollect/onecollectservice/credential/get/${alias}/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  reloadCredentials(): any {
    return this.httpClient
      .get(this.baseUrl + `/onecollect/onecollectservice/credential/getlist/`)
      .pipe(map((response: any) => this.checkJSON(response)));
  }

  setCredential(credential: any) {
    return this.httpClient
      .post(
        this.baseUrl +
          `/onecollect/onecollectservice/credential/set/${
            credential.attributes.alias
          }/`,
        credential
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }
  deleteCredential(alias: string) {
    return this.httpClient
      .get(
        this.baseUrl +
          `/onecollect/onecollectservice/credential/delete/${alias}/`
      )
      .pipe(map((response: any) => this.checkJSON(response)));
  }
}
