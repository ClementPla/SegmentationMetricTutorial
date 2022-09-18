import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemporalComponent } from './temporal.component';

describe('TemporalComponent', () => {
  let component: TemporalComponent;
  let fixture: ComponentFixture<TemporalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemporalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemporalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
