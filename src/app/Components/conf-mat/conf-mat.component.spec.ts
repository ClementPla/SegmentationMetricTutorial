import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfMatComponent } from './conf-mat.component';

describe('ConfMatComponent', () => {
  let component: ConfMatComponent;
  let fixture: ComponentFixture<ConfMatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfMatComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfMatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
