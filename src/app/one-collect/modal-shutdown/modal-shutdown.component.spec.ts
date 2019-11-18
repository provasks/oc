import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShutdownComponent } from './modal-shutdown.component';

describe('ModalShutdownComponent', () => {
  let component: ModalShutdownComponent;
  let fixture: ComponentFixture<ModalShutdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalShutdownComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShutdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
