import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadAsupComponent } from './upload-asup.component';

describe('UploadAsupComponent', () => {
  let component: UploadAsupComponent;
  let fixture: ComponentFixture<UploadAsupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UploadAsupComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadAsupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
