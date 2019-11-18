import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectOptionsComponent } from './collect-options.component';

describe('CollectOptionsComponent', () => {
  let component: CollectOptionsComponent;
  let fixture: ComponentFixture<CollectOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CollectOptionsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
