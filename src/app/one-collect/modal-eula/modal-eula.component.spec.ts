import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEulaComponent } from './modal-eula.component';

describe('ModalEulaComponent', () => {
  let component: ModalEulaComponent;
  let fixture: ComponentFixture<ModalEulaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalEulaComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
