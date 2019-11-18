import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscoverIpComponent } from './discover-ip.component';

describe('DiscoverIpComponent', () => {
  let component: DiscoverIpComponent;
  let fixture: ComponentFixture<DiscoverIpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DiscoverIpComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscoverIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
