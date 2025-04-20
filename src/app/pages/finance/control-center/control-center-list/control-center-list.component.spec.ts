import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlCenterListComponent } from './control-center-list.component';

describe('ControlCenterListComponent', () => {
  let component: ControlCenterListComponent;
  let fixture: ComponentFixture<ControlCenterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlCenterListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlCenterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
