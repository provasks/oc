import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionJobsComponent } from './collection-jobs.component';

describe('CollectionJobsComponent', () => {
  let component: CollectionJobsComponent;
  let fixture: ComponentFixture<CollectionJobsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CollectionJobsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
