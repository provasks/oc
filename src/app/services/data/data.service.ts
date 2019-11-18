import { Injectable } from '@angular/core';
import { Observable ,  Subject } from 'rxjs';
import * as _ from 'lodash';

@Injectable()
export class DataService {
  /*********************************************/
  /* Class properties
  /*********************************************/
  loader: any = {};
  showLoaderSubject: any;
  hideLoaderSubject: any;

  job: any;
  dataView: any = {};

  userData: any;
  preferences: any;
  imtJob: any;
  hasPerf: boolean = false;
  isDirtyOrValidating: boolean = false;

  //CA Variables
  private jobSubject = new Subject<any>();
  private configCompJobSubject = new Subject<any>();
  locale: any;
  useCredentials: boolean = false;
  /*********************************************/
  /* Constructor method
  /*********************************************/
  constructor() {
    this.job = null;
    this.dataView['job'] = null;
    this.dataView['component'] = null;
    this.loader.show = false;
    this.showLoaderSubject = new Subject();
    this.hideLoaderSubject = new Subject();
    this.showLoaderSubject.subscribe({
      next: () => {
        this.loader.show = true;
      }
    });
    this.hideLoaderSubject.subscribe({
      next: () => {
        this.loader.show = false;
      }
    });
  }

  checkJSON(data) {
    if (typeof data !== 'object') {
      data = JSON.parse(data);
    }
    return data;
  }

  /*********************************************/
  /* Method to show loader
  /*********************************************/
  showLoader() {
    this.showLoaderSubject.next();
  }

  /*********************************************/
  /* Method to hide loader
  /*********************************************/
  hideLoader() {
    this.hideLoaderSubject.next();
  }

  /*********************************************/
  /* Method to set job while loading project
  /* from saved projects tab
  /*********************************************/
  setJob(job) {
    this.job = job;
  }

  /*********************************************/
  /* Method to return saved job
  /*********************************************/
  getJob() {
    return this.job;
  }

  /*********************************************/
  /* Method to set job and component in Data
  /* Collection tab to view it in Data View tab
  /*********************************************/
  setDataView(job = null, component = null) {
    this.dataView['job'] = job;
    this.dataView['component'] = component;
  }

  /*********************************************/
  /* Method to return dataView object
  /*********************************************/
  getDataView() {
    return this.dataView;
  }

  /*********************************************/
  /* Items related to populating modal collect
  /* fields when loading saved job
  /*********************************************/
  modalCollectSource = new Subject<any>();
  modalCollect$ = this.modalCollectSource.asObservable();
  setModalCollect(job: any) {
    this.modalCollectSource.next(job);
  }

  /*********************************************/
  /* Items related to notifying components
  /* that OneCollect Settings were changed
  /* to update modal-collect passPhrase
  /*********************************************/
  settingsChangedSource = new Subject<any>();
  settingsChanged$ = this.settingsChangedSource.asObservable();
  settingsChanged(preferences: any) {
    this.settingsChangedSource.next(preferences);
  }

  /*********************************************/
  /* Items related to notifying components that
  /* OneCollect Settings were saved
  /*********************************************/
  settingsSaveSource = new Subject<any>();
  settingsSave$ = this.settingsSaveSource.asObservable();
  settingsSave(passPhrase: string) {
    this.settingsSaveSource.next(passPhrase);
  }

  /*********************************************/
  /* Items related to notifying components that
  /* settings modal needs to be reset
  /*********************************************/
  settingsResetSource = new Subject<any>();
  settingsReset$ = this.settingsResetSource.asObservable();
  settingsReset() {
    this.settingsResetSource.next();
  }

  /*********************************************/
  /* Items related to notifying components that
  /* job has been scheduled
  /*********************************************/
  schedulerSource = new Subject<any>();
  scheduler$ = this.schedulerSource.asObservable();
  scheduler(project: any) {
    this.schedulerSource.next(project);
  }

  /*********************************************/
  /* Items related to app-wider notification
  /*********************************************/
  appNotificationSource = new Subject<any>();
  appNotification$ = this.appNotificationSource.asObservable();
  appNotification(notification: any) {
    this.appNotificationSource.next(notification);
  }

  /*********************************************/
  /* Items related to performance modal settings
  /*********************************************/
  perfModalSource = new Subject<any>();
  perfModal$ = this.perfModalSource.asObservable();
  perfModal(row) {
    this.perfModalSource.next(row);
  }

  /*********************************************/
  /* Method to set SSO user data for ASUP based
  /* collection
  /*********************************************/
  setUserData(data) {
    this.userData = data;
  }

  /*********************************************/
  /* Method to return SSO user data for ASUP
  /* based collection
  /*********************************************/
  getUserData() {
    return this.userData;
  }

  /*********************************************/
  /* Method to set IMT Job
  /*********************************************/
  setImtJob(job) {
    this.imtJob = job;
  }

  /*********************************************/
  /* Method to return IMT Job
  /*********************************************/
  getImtJob() {
    return this.imtJob;
  }

  /*********************************************/
  /* Method to set whether performance profile
  /* is available
  /*********************************************/
  setHasPerf(hasPerf) {
    this.hasPerf = hasPerf;
  }

  /*********************************************/
  /* Method to return whether performance
  /* profile is available
  /*********************************************/
  getHasPerf() {
    return this.hasPerf;
  }

  /*********************************************/
  /* Items related notifying which component's
  /* tour needs to start
  /*********************************************/
  tourStartSource = new Subject<any>();
  tourStart$ = this.tourStartSource.asObservable();
  tourStart() {
    this.tourStartSource.next();
  }

  tourStartJob$ = new Subject<any>();

  //Added by CA

  modalCustomReportSelect = new Subject<any>();
  modalCustomReport$ = this.modalCustomReportSelect.asObservable();
  setCustomReport(selection: any) {
    this.modalCustomReportSelect.next(selection);
  }

  modalCustomOCSelect = new Subject<any>();
  modalCustomOC$ = this.modalCustomOCSelect.asObservable();
  setCustomOC(selection: any) {
    this.modalCustomOCSelect.next(selection);
  }

  enableOneCollect: boolean = false;

  getEnableOneCollect() {
    return this.enableOneCollect;
  }

  setEnableOneCollect(enableOneCollect) {
    this.enableOneCollect = enableOneCollect;
  }

  modalCustomVisualizationSelect = new Subject<any>();
  modalCustomVisualization$ = this.modalCustomVisualizationSelect.asObservable();
  setCustomVisualization(selection: any) {
    this.modalCustomVisualizationSelect.next(selection);
  }

  enableVisualization: boolean;

  getEnableVisualization() {
    return this.enableVisualization;
  }
  setEnableVisualization(enableVisualization) {
    this.enableVisualization = enableVisualization;
  }

  // get settings afresh
  settingsSource = new Subject<any>();
  settings$ = this.settingsSource.asObservable();
  displayLatestSettings() {
    this.settingsSource.next();
  }
  /*********************************************/
  /* Items related notifying which component's
  /* tour needs to start
  /*********************************************/
  tourImageStartSource = new Subject<any>();
  tourImageStart$ = this.tourImageStartSource.asObservable();
  tourImageStart() {
    this.tourImageStartSource.next();
  }

  /*********************************************/
  /* Items related to hasPerf
  /*********************************************/
  notifyHasPerfSource = new Subject<any>();
  notifyHasPerf$ = this.notifyHasPerfSource.asObservable();
  notifyHasPerf(state) {
    this.notifyHasPerfSource.next(state);
  }

  /*********************************************/
  /* Items related to hasPerf
  /*********************************************/
  appMeta: any;
  appMetaSource = new Subject<any>();
  appMeta$ = this.appMetaSource.asObservable();
  setAppMeta(appMeta) {
    this.appMeta = appMeta;
    this.appMetaSource.next(appMeta);
  }
  getAppMeta() {
    return this.appMeta;
  }

  // CA selected Jobs
  selectedJobs(jobs: object) {
    this.jobSubject.next(jobs);
  }

  getSelectedJobs(): Observable<any> {
    return this.jobSubject.asObservable();
  }

  sendConfigCompareJobs(configJobs: object) {
    this.configCompJobSubject.next(configJobs);
  }

  getConfigCompareJobs(): Observable<any> {
    return this.configCompJobSubject.asObservable();
  }
  /*********************************************/
  /* Items related to hasPerf
  /*********************************************/
  showTopBarSource = new Subject<any>();
  showTopBar$ = this.showTopBarSource.asObservable();
  setTopBar = status => this.showTopBarSource.next(status);

  /*********************************************/
  /* Items related to i18n
  /*********************************************/
  setLocale(locale) {
    this.locale = locale;
  }

  getLocale() {
    return this.locale;
  }
}
