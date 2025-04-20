import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlCenterDetailComponent } from './control-center-detail.component';

describe('ControlCenterDetailComponent', () => {
  let component: ControlCenterDetailComponent;
  let fixture: ComponentFixture<ControlCenterDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlCenterDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlCenterDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
