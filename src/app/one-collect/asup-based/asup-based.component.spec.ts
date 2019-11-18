import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsupBasedComponent } from './asup-based.component';

describe('AsupBasedComponent', () => {
  let component: AsupBasedComponent;
  let fixture: ComponentFixture<AsupBasedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AsupBasedComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsupBasedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
