import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Ec2IdComponent } from './ec2-id.component';

describe('Ec2IdComponent', () => {
  let component: Ec2IdComponent;
  let fixture: ComponentFixture<Ec2IdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Ec2IdComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Ec2IdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
