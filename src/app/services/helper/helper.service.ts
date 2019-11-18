import { Injectable } from '@angular/core';
import { Settings } from 'src/app/content/settings';
import { ApiService } from '../api/api.service';
import { TranslateService } from '../translate/translate.service';
import { Netmask } from 'netmask';

import * as _ from 'lodash';
declare var $: any;

@Injectable()
export class HelperService {
  getDefaultKey(keyword: string) {
    let defaultObject = {};
    this.settings.Objectives.forEach(o => {
      o.purposes.forEach(p => {
        if (p.keyword === keyword) {
          defaultObject['id'] = o.id;
          defaultObject['key'] = p['valueOf'];
          return;
        }
      });
    });
    return defaultObject;

    // const purpose = this.settings.Objectives.map(o => o.purposes) //return all purposes
    //   .reduce((t, a) => t.concat(a)) //merge purposes
    //   .filter(a => a.keyword === keyword); //filter the keyword
    // return purpose.length ? purpose[0]['valueOf'] : undefined;
  }
  settings: any = Settings;
  /*********************************************/
  /* Constructor method
  /*********************************************/
  constructor(
    private apiService: ApiService,
    private translateService: TranslateService
  ) {}

  /*********************************************/
  /* Method to trim extra white spaces from
  /* string
  /*********************************************/
  trim(str) {
    if (typeof str == 'string') {
      str = str.replace(/^\s+/, '');
      for (var i = str.length - 1; i >= 0; i--) {
        if (/\S/.test(str.charAt(i))) {
          str = str.substring(0, i + 1);
          break;
        }
      }
    }
    return str;
  }

  removeAllWhitespaces(text: string) {
    return text.replace(/\s+/g, '');
  }
  /**
   * check and returns if the text search includes in text.
   * the search will be case-insensitive
   * @param text : Full string
   * @param search : search string
   * @param inSensitive: flag variable for case insensitive. default is true
   */
  isContains(text: string, search: string, inSensitive: boolean = true) {
    const regex = inSensitive ? new RegExp(search, 'i') : new RegExp(search);
    return regex.test(text);
  }

  isPerfArchive(component: any, property: string): Boolean {
    let flag = false;
    for (let key in component) {
      if (
        this.isContains(component[key][property], this.settings.perfArchive)
      ) {
        flag = true;
        break;
      }
    }
    return flag;
  }
  /**
   * Returns true if the subType of the job is PerfArchive
   * otherwise false
   * @param job : job
   */
  setPerfArchive(job: any, property: string = 'component_category') {
    job.isPerfArchive = false;
    let component: any;
    if (property === 'component_category') {
      this.apiService.getJobLog(job.name).subscribe(data => {
        component = JSON.parse(data.components == '' ? '{}' : data.components);
        job.isPerfArchive = this.isPerfArchive(component, property);
      });
    } else {
      job.isPerfArchive = this.isPerfArchive(component, property);
    }
  }

  translateTourData(tourContent) {
    _.forEach(tourContent, (entry, i) => {
      entry.title = this.translateService.instant(entry.title);
      entry.content = this.translateService.instant(entry.content);
      // console.log(entry.title);
    });
    return tourContent;
  }

  confirm(message?: string): boolean {
    const m = $('#modal-confirmation').modal({
      backdrop: 'static',
      keyboard: false
    });
    return confirm(message || 'Are you ok?');
  }

  /**
   * should validate the passphrase and confirm passphrase
   * and updates the validation object with error message
   * @param passphrase
   * @param confirmPassphrase
   * @param emptyCheckRequired
   */
  validatePassphrase(
    passphrase: string,
    confirmPassphrase: string,
    validation: any,
    emptyCheckRequired?: boolean
  ) {
    validation.errMessage = '';
    validation.passPhrase = false;
    if (emptyCheckRequired) {
      if (!passphrase) {
        validation.errMessage = 'passphrase_error_required';
        validation.passPhrase = true;
        return;
      }
      if (!confirmPassphrase) {
        validation.errMessage = 'confirm_passphrase_error_required';
        validation.passPhrase = true;
        return;
      }
    }
    if (passphrase !== confirmPassphrase) {
      validation.errMessage = 'Setting_passphrase_error';
      validation.passPhrase = true;
    }
  }

  /*********************************************************
   * The time-zone offset is the difference, in minutes,
   * between UTC and local time.
   *********************************************************/
  getTimezone(): any {
    return new Date().getTimezoneOffset();
  }

  getDynamicKeys(obj) {
    const array = [];
    _.forOwn(obj, (value, key) => {
      array.push(key);
    });
    return array;
  }

  existsInAll(arr = [], attr: string | number, value: any) {
    return arr.every(e => e[attr] === value);
  }
  existsInAny(arr = [], attr: string | number, value: any) {
    return arr.some(e => e[attr] === value);
  }
  hasDuplicate(arr = [], prop?: string | number) {
    const notEmpty = arr.filter(c => (prop ? c[prop] : c !== ''));
    const unique = {};
    _.forEach(notEmpty, c => {
      unique[prop ? c[prop] : c] = prop ? c[prop] : c;
    });
    return _.toArray(unique).length !== notEmpty.length;
  }

  /*********************************************/
  /* Method to return date-time formatted string
  /*********************************************/
  getDateTimeString(datetime) {
    datetime = new Date(datetime);
    let months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    let monthIndex = datetime.getMonth();
    let month = months[monthIndex];
    let date = datetime.getDate();
    let year = datetime.getFullYear();
    let hours = datetime.getHours();
    let minutes = datetime.getMinutes();
    let seconds = datetime.getSeconds();
    let hour = (hours + 24 - 2) % 24;
    let mid = 'am';
    if (hour == 0) {
      hour = 12;
    } else if (hour > 12) {
      hour = hour % 12;
      mid = 'pm';
    }
    let str = `${month} ${date}, ${year}, ${hour}:${minutes} ${mid}`;
    return str;
  }

  getDuplicates(arr) {
    const duplicates = arr.filter(
      (value, index, array) => array.indexOf(value) !== index
    );
    return _.toArray(new Set(duplicates));
  }

  extractPropertyValues(arr, prop?) {
    return arr.map(c => (prop ? c[prop] : c));
  }

  showModalPopup(popupId: string) {
    $(popupId.includes('#') ? popupId : '#' + popupId).modal({
      backdrop: 'static',
      keyboard: false
    });
  }

  getHostCount(subnets: string[]) {
    const ips = [];
    subnets.forEach(s => {
      const block = new Netmask(s);
      block.forEach(ip => {
        ips.push(ip);
      });
    });
    const hosts = new Set(ips);
    return hosts.size;
  }
  toCamelcase(text: string) {
    return text.replace(
      /\w\S*/g,
      txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
}
