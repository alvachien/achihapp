import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentNormalCreateComponent } from './document-normal-create.component';

describe('DocumentNormalCreateComponent', () => {
  let component: DocumentNormalCreateComponent;
  let fixture: ComponentFixture<DocumentNormalCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentNormalCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentNormalCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
