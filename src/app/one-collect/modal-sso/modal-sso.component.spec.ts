import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSsoComponent } from './modal-sso.component';

describe('ModalSsoComponent', () => {
  let component: ModalSsoComponent;
  let fixture: ComponentFixture<ModalSsoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalSsoComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSsoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
