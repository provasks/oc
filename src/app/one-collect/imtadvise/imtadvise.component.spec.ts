import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImtadviseComponent } from './imtadvise.component';

describe('ImtadviseComponent', () => {
  let component: ImtadviseComponent;
  let fixture: ComponentFixture<ImtadviseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImtadviseComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImtadviseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
