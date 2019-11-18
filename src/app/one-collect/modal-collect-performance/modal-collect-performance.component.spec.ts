import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCollectPerformanceComponent } from './modal-collect-performance.component';

describe('ModalCollectPerformanceComponent', () => {
  let component: ModalCollectPerformanceComponent;
  let fixture: ComponentFixture<ModalCollectPerformanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalCollectPerformanceComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCollectPerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
