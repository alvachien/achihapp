import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getTranslocoModule } from '../../../test/';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { icons } from '../../icons-provider';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { FatalErrorComponent } from './fatal-error.component';

describe('FatalErrorComponent', () => {
  let component: FatalErrorComponent;
  let fixture: ComponentFixture<FatalErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        getTranslocoModule(),
        FatalErrorComponent
      ],
      providers: [
        provideRouter([]),
        provideNzIcons(icons), 
        provideNzI18n(en_US),
        provideNoopAnimations(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FatalErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
