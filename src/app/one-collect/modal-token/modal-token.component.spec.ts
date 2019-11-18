import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTokenComponent } from './modal-token.component';

describe('ModalTokenComponent', () => {
  let component: ModalTokenComponent;
  let fixture: ComponentFixture<ModalTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalTokenComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
