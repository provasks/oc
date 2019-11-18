import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateUserComponent } from './modal-create-user.component';

describe('ModalCreateUserComponent', () => {
  let component: ModalCreateUserComponent;
  let fixture: ComponentFixture<ModalCreateUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalCreateUserComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCreateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
