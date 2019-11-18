import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TourDiscoverIpComponent } from './tour-discover-ip.component';

describe('TourDiscoverIpComponent', () => {
  let component: TourDiscoverIpComponent;
  let fixture: ComponentFixture<TourDiscoverIpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TourDiscoverIpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TourDiscoverIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
