import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassificationPageComponent } from './classification-page.component';

describe('ClassificationPageComponent', () => {
  let component: ClassificationPageComponent;
  let fixture: ComponentFixture<ClassificationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassificationPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassificationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
