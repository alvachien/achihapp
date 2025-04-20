import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountHierarchyComponent } from './account-hierarchy.component';

describe('AccountHierarchyComponent', () => {
  let component: AccountHierarchyComponent;
  let fixture: ComponentFixture<AccountHierarchyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountHierarchyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
