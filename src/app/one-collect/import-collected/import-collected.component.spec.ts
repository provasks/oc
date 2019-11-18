import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportCollectedComponent } from './import-collected.component';

describe('ImportCollectedComponent', () => {
  let component: ImportCollectedComponent;
  let fixture: ComponentFixture<ImportCollectedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImportCollectedComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportCollectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
