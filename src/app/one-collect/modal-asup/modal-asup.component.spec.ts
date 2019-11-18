import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAsupComponent } from './modal-asup.component';

describe('ModalAsupComponent', () => {
  let component: ModalAsupComponent;
  let fixture: ComponentFixture<ModalAsupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalAsupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAsupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
