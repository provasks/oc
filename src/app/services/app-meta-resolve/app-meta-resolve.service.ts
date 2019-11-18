import { Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';

@Injectable({
  providedIn: 'root'
})
export class AppMetaResolveService implements Resolve<any> {
  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    let appMeta = this.dataService.getAppMeta();
    if (appMeta) {
      return appMeta;
    } else {
      return this.apiService.getAppMeta();
    }
  }
}
