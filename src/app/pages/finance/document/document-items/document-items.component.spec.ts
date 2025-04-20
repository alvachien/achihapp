import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentItemsComponent } from './document-items.component';

describe('DocumentItemsComponent', () => {
  let component: DocumentItemsComponent;
  let fixture: ComponentFixture<DocumentItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
