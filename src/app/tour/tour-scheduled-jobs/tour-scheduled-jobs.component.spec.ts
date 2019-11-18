import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TourScheduledJobsComponent } from './tour-scheduled-jobs.component';

describe('TourScheduledJobsComponent', () => {
  let component: TourScheduledJobsComponent;
  let fixture: ComponentFixture<TourScheduledJobsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TourScheduledJobsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TourScheduledJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
