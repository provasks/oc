import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUpdateCredentialsComponent } from './modal-update-credentials.component';

describe('ModalUpdateCredentialsComponent', () => {
  let component: ModalUpdateCredentialsComponent;
  let fixture: ComponentFixture<ModalUpdateCredentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalUpdateCredentialsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalUpdateCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
