import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Settings } from '../../content/settings';
import { environment } from 'src/environments/environment';

// import { DataService as CaDataService} from 'src/caapp/services/data.service';

@Injectable()
export class TranslateService {
  private _currentLang: string;
  data: any = {};
  _clientName: any;
  client: any = environment.client;

  public get currentLang() {
    return this._currentLang;
  }

  // inject our translations
  constructor(private http: HttpClient) {
    var lang = navigator.language.substring(0, 2);
    this._currentLang = Settings.languages.includes(lang) ? lang : 'en';
    // if (this.client.isOEM) {
    //   this._currentLang = Settings.languages.includes(lang) ? lang : 'zh';
    // } else {
    //   this._currentLang = Settings.languages.includes(lang) ? lang : 'en';
    // }
  }

  public use(client): Promise<{}> {
    this._clientName = client;
    const defaultPath = `assets/${Settings.defaultTranslation}/${this._currentLang}.json`;
    const defaultData = this.getTranslations(defaultPath);
    const clientPath = `assets/custom/i18n/${this._currentLang}.json`;
    const clientData = this.getTranslations(clientPath);
    console.log(`Netapp translation path: ${defaultPath}`);
    console.log(`Vendor translation path: ${clientPath}`);

    return new Promise<{}>((resolve, reject) => {
      Promise.all([defaultData, clientData]).then(values => {
        this.data = Object.assign({}, values[0], values[1]);
        console.log(`Netapp translation data: ${defaultData}`);
        console.log(`Vendor translation data: ${clientData}`);
        console.log('merged translation:', this.data);
        resolve(this.data);
      });
    });
  }

  private translate(key: string): string {
    return this.data[key] || key;
  }

  public instant(key: string) {
    // call translation
    return this.translate(key);
  }

  getTranslations(path: string) {
    return new Promise((resolve, reject) => {
      this.http.get<{}>(path).subscribe(
        data => {
          resolve(data);
        },
        error => {
          console.log(`Error in ${path} file`);
        }
      );
    });
  }
}
