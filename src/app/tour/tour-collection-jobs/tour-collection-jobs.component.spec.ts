import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TourCollectionJobsComponent } from './tour-collection-jobs.component';

describe('TourCollectionJobsComponent', () => {
  let component: TourCollectionJobsComponent;
  let fixture: ComponentFixture<TourCollectionJobsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TourCollectionJobsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TourCollectionJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
