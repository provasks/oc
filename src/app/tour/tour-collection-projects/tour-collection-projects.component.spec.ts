import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TourCollectionProjectsComponent } from './tour-collection-projects.component';

describe('TourCollectionProjectsComponent', () => {
  let component: TourCollectionProjectsComponent;
  let fixture: ComponentFixture<TourCollectionProjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TourCollectionProjectsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TourCollectionProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
