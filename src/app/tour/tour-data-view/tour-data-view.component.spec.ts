import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TourDataViewComponent } from './tour-data-view.component';

describe('TourDataViewComponent', () => {
  let component: TourDataViewComponent;
  let fixture: ComponentFixture<TourDataViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TourDataViewComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TourDataViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
