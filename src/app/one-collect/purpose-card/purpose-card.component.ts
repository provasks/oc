import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/services/helper/helper.service';
import { TranslateService } from 'src/app/services/translate/translate.service';

@Component({
  selector: 'oc-purpose-card',
  templateUrl: './purpose-card.component.html',
  styleUrls: ['./purpose-card.component.css']
})
export class PurposeCardComponent implements OnInit {
  @Input() objective: any;
  constructor(
    private router: Router,
    private helper: HelperService,
    public translate: TranslateService
  ) {}

  ngOnInit() {}

  // onPurposeClick(objective) {
  //   sessionStorage.setItem('objective', JSON.stringify(objective));
  //   this.router.navigate([
  //     '/main/new-collection/' + objective.purposes[0]['component']
  //   ]);

  //   // routerLink="/main/new-collection/{{ objective.purposes[0]['component'] }}"
  // }

  // getImage(image) {
  //   return (
  //     'assets/custom/images/' +
  //     this.helper.removeSpaces(name).toLowerCase() +
  //     '.png'
  //   );
  // }
}
