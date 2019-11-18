import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCollectionComponent } from './new-collection.component';

describe('NewCollectionComponent', () => {
  let component: NewCollectionComponent;
  let fixture: ComponentFixture<NewCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NewCollectionComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
