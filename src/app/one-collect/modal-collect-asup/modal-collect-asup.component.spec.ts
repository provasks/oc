import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCollectAsupComponent } from './modal-collect-asup.component';

describe('ModalCollectAsupComponent', () => {
  let component: ModalCollectAsupComponent;
  let fixture: ComponentFixture<ModalCollectAsupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalCollectAsupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCollectAsupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
