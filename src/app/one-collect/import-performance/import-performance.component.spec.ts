import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportPerformanceComponent } from './import-performance.component';

describe('ImportPerformanceComponent', () => {
  let component: ImportPerformanceComponent;
  let fixture: ComponentFixture<ImportPerformanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImportPerformanceComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
