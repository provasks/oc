import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionProjectsComponent } from './collection-projects.component';

describe('CollectionProjectsUnifiedComponent', () => {
  let component: CollectionProjectsComponent;
  let fixture: ComponentFixture<CollectionProjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CollectionProjectsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
