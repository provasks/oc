import { filter } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DataService } from 'src/app/services/data/data.service';
import { UserService } from 'src/app/services/user/user.service';
import { Subscription } from 'rxjs';

import { TranslateService } from 'src/app/services/translate/translate.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
  selector: 'oc-nav-main',
  templateUrl: './nav-main.component.html',
  styleUrls: ['./nav-main.component.css']
})
export class NavMainComponent implements OnInit, OnDestroy {
  tab: any;
  activeUser: any;
  activeUserSubscription: Subscription;
  client: any = environment.client;

  constructor(
    public dataService: DataService,
    public userService: UserService,
    public router: Router,
    public translate: TranslateService
  ) {
    
    this.activeUserSubscription = this.userService.activeUser$.subscribe(
      user => (this.activeUser = user)
    );
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.setTab(event.url);
      });
  }

  ngOnInit() {
    setTimeout(() => this.setTab(this.router.url), 0);
    setTimeout(() => (this.activeUser = this.userService.getActiveUser()), 0);
    this.makeNavSticky();
  }

  ngOnDestroy() {
    if (this.activeUserSubscription) {
      this.activeUserSubscription.unsubscribe();
    }
  }

  makeNavSticky() {
    // source: https://stackoverflow.com/questions/1216114/how-can-i-make-a-div-stick-to-the-top-of-the-screen-once-its-been-scrolled-to
    function moveScroller() {
      var $scroller = $('#main-navigation');

      var move = function() {
        var st = $(window).scrollTop();
        var ot = 60;
        if (st > ot) {
          $scroller.css({
            position: 'fixed',
            top: '32px',
            left: '10px',
            right: '10px',
            'padding-top': '10px'
          });
        } else {
          $scroller.css({
            position: 'relative',
            top: '0',
            left: '0',
            right: '0',
            'padding-top': '0'
          });
        }
      };
      $(window).scroll(move);
      move();
    }
    $(function() {
      moveScroller();
    });
  }

  hideAddonTab() {
    let url = this.router.url;
    if (url != '/main/imtadvise') {
      $('#imtadvise').hide();
    }
  }

  setTab(url) {
    if (url.includes('collection')) {
      this.tab = 'data-collection';
    } else if (url.includes('data-view')) {
      this.tab = 'data-view';
    } else if (url.includes('saved-projects')) {
      this.tab = 'saved-projects';
    } else if (url.includes('scheduled-jobs')) {
      this.tab = 'scheduled-jobs';
    } else if (url.includes('upload-asup')) {
      this.tab = 'upload-asup';
    } else if (url.includes('user-management')) {
      this.tab = 'user-management';
    } else if (url.includes('imtadvise')) {
      this.tab = 'imtadvise';
    } else if (url.includes('credentials')) {
      this.tab = 'credentials';
    }
  }

  changeTab(val?) {
    if (val) {
      this.tab = val;
    }
    let url = this.router.url;
    if (this.tab != 'add-ons') {
      this.hideAddonTab();
    }
    if (this.tab == 'data-collection' && !url.includes('/collection')) {
      this.router.navigate(['/main/collection']);
    } else if (this.tab == 'data-view') {
      this.router.navigate(['/main/data-view']);
    } else if (this.tab == 'saved-projects') {
      this.router.navigate(['/main/saved-projects']);
    } else if (this.tab == 'scheduled-jobs') {
      this.router.navigate(['/main/scheduled-jobs']);
    } else if (this.tab == 'upload-asup') {
      this.router.navigate(['/main/upload-asup']);
    } else if (this.tab == 'user-management') {
      this.router.navigate(['/main/user-management']);
    } else if (this.tab == 'imtadvise') {
      this.router.navigate(['/main/imtadvise']);
    } else if (this.tab == 'credentials') {
      this.router.navigate(['/main/credentials']);
    }
  }
}
