import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable ,  Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { UserService } from 'src/app/services/user/user.service';

@Injectable({
  providedIn: 'root'
})
export class Ec2IdGuard implements CanActivate {
  appMeta: any;

  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    let promise = new Promise<any>((resolve, reject) => {
      let appMeta = this.dataService.getAppMeta();
      if (appMeta) {
        resolve(appMeta);
      } else {
        this.apiService.getAppMeta().subscribe(appMeta => resolve(appMeta));
      }
    });
    return promise.then(
      appMeta => {
        this.dataService.setAppMeta(appMeta);
        if (
          appMeta.build_type == 'CLOUD' &&
          appMeta.cloud_type == 'AMI' &&
          !appMeta.ec2_id_verified
        ) {
          if (!this.userService.initEc2IdVerified) {
            this.router.navigate(['/ec2-id'], {
              queryParams: { returnUrl: state.url }
            });
            return false;
          } else {
            return true;
          }
        }
        return true;
      },
      error => {
        this.router.navigate(['/ec2-id'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
    );
  }
}
