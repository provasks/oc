import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[OnlyNumber]'
})
export class OnlyNumberDirective {
  constructor(private el: ElementRef) {}

  @Input() OnlyNumber: string;

  @HostListener('keydown', ['$event']) onKeyDown(event) {
    let e = <KeyboardEvent>event;
    if (this.OnlyNumber) {
      if (
        [46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
        // Allow: Ctrl+C
        (e.keyCode == 67 && e.ctrlKey === true) ||
        // Allow: Ctrl+V
        (e.keyCode == 86 && e.ctrlKey === true) ||
        // Allow: Ctrl+X
        (e.keyCode == 88 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)
      ) {
        // let it happen, don't do anything
        return;
      }

      // Allow Cmd+V or Ctrl+V for all browser
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.keyCode === 86 /** for chrome */ ||
        e.keyCode === 224 /** for Mozilla */ ||
          e.keyCode === 91) /** for Safari */
      ) {
      }
      // Ensure that it is a number and stop the keypress
      else if (
        (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
        (e.keyCode < 96 || e.keyCode > 105)
      ) {
        e.preventDefault();
      }
      // check that it is within range of allowed hours
      /*let hour = this.el.nativeElement.value;
      if( hour>=0 && hour<=24) {
        return;
      }
      else {
        e.preventDefault();
      }*/
    }
  }
}
