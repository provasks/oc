import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNotificationComponent } from './modal-notification.component';

describe('ModalNotificationComponent', () => {
  let component: ModalNotificationComponent;
  let fixture: ComponentFixture<ModalNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalNotificationComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
