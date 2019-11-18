import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDevicesComponent } from './import-devices.component';

describe('ImportDevicesComponent', () => {
  let component: ImportDevicesComponent;
  let fixture: ComponentFixture<ImportDevicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImportDevicesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
