import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCommandsComponent } from './modal-commands.component';

describe('ModalCommandsComponent', () => {
  let component: ModalCommandsComponent;
  let fixture: ComponentFixture<ModalCommandsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ModalCommandsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCommandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
