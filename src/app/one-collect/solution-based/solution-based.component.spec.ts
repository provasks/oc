import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionBasedComponent } from './solution-based.component';

describe('SolutionBasedComponent', () => {
  let component: SolutionBasedComponent;
  let fixture: ComponentFixture<SolutionBasedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SolutionBasedComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionBasedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
