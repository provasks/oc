import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCloneJobComponent } from './modal-clone-job.component';

describe('ModalCloneJobComponent', () => {
  let component: ModalCloneJobComponent;
  let fixture: ComponentFixture<ModalCloneJobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalCloneJobComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCloneJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
