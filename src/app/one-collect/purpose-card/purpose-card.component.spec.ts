import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PurposeCardComponent } from './purpose-card.component';

describe('PurposeCardComponent', () => {
  let component: PurposeCardComponent;
  let fixture: ComponentFixture<PurposeCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PurposeCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PurposeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
