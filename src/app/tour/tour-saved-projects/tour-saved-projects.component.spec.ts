import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TourSavedProjectsComponent } from './tour-saved-projects.component';

describe('TourSavedProjectsComponent', () => {
  let component: TourSavedProjectsComponent;
  let fixture: ComponentFixture<TourSavedProjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TourSavedProjectsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TourSavedProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
