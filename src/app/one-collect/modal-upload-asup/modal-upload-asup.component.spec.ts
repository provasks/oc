import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUploadAsupComponent } from './modal-upload-asup.component';

describe('ModalUploadAsupComponent', () => {
  let component: ModalUploadAsupComponent;
  let fixture: ComponentFixture<ModalUploadAsupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalUploadAsupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalUploadAsupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
