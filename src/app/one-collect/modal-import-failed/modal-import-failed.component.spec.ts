import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalImportFailedComponent } from './modal-import-failed.component';

describe('ModalImportFailedComponent', () => {
  let component: ModalImportFailedComponent;
  let fixture: ComponentFixture<ModalImportFailedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalImportFailedComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalImportFailedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
