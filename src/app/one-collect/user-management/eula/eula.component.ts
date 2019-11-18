import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { UserService } from 'src/app/services/user/user.service';
declare var $: any;

@Component({
  selector: 'oc-eula',
  templateUrl: './eula.component.html',
  styleUrls: ['./eula.component.css']
})
export class EulaComponent implements OnInit {
  appMeta: any;
  eulaChecked: any = false;
  errorMessage: string = '';
  returnUrl: string;

  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    let appMeta = this.route.snapshot.data.appMeta;
    if (
      !(
        appMeta.build_type == 'CLOUD' &&
        appMeta.cloud_type == 'DOCKER' &&
        !appMeta.eula_accepted
      )
    ) {
      this.router.navigate([this.returnUrl]);
    }
  }

  agree() {
    let checked = this.eulaChecked ? 'true' : 'false';
    let formData = { eula_checked: checked };
    this.apiService.setEulaChecked(formData).subscribe(data => {
      if (data.status) {
        this.dataService.appMeta.eula_accepted = true;
        this.router.navigate([this.returnUrl]);
      } else {
        this.errorMessage = data.reason;
      }
    });
  }
}
