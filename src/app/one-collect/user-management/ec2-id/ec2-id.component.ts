import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { DataService } from 'src/app/services/data/data.service';
import { UserService } from 'src/app/services/user/user.service';
import { Subscription } from 'rxjs';
declare var $: any;

@Component({
  selector: 'oc-ec2-id',
  templateUrl: './ec2-id.component.html',
  styleUrls: ['./ec2-id.component.css']
})
export class Ec2IdComponent implements OnInit, OnDestroy, AfterViewInit {
  instanceId: string = '';
  errorMessage: string = '';
  returnUrl: string;

  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    let appMeta = this.route.snapshot.data.appMeta;
    if (appMeta.build_type == 'CLOUD' && appMeta.cloud_type == 'AMI') {
      if (appMeta.ec2_id_verified || this.userService.initEc2IdVerified) {
        this.router.navigate([this.returnUrl]);
      }
    } else {
      this.router.navigate([this.returnUrl]);
    }
  }

  ngOnDestroy() {
    // detach listener for enter key press
    $('#ec2-id-box').off('keypress', this.pressEnter);
  }

  ngAfterViewInit() {
    // attach listener for enter key press
    setTimeout(() => $('#ec2-instance-id').focus(), 250);
    setTimeout(() => $('#ec2-id-box').on('keypress', this.pressEnter), 250);
  }

  pressEnter = e => {
    let code = e.keyCode ? e.keyCode : e.which;
    if (code == 13) {
      this.verify();
    }
  };

  onTextChange() {
    this.errorMessage = '';
  }

  verify() {
    if (!this.instanceId) {
      this.errorMessage = 'Instance ID is required';
    } else {
      this.errorMessage = '';
      let formData = { instanceId: this.instanceId };
      this.apiService.verifyInstanceId(formData).subscribe(data => {
        if (data.status) {
          this.userService.instanceId = this.instanceId;
          this.userService.initEc2IdVerified = true;
          this.router.navigate([this.returnUrl]);
        } else {
          this.errorMessage = data.reason;
        }
      });
    }
  }
}
