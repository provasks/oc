import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalScheduleComponent } from './modal-schedule.component';

describe('ModalScheduleComponent', () => {
  let component: ModalScheduleComponent;
  let fixture: ComponentFixture<ModalScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalScheduleComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
