import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditsComponent } from './credits.component';
import { getTranslocoModule } from '../../../test/';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { icons } from '../../icons-provider';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('CreditsComponent', () => {
  let component: CreditsComponent;
  let fixture: ComponentFixture<CreditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        getTranslocoModule(),
        CreditsComponent
      ],
      providers: [
        provideRouter([]),
        provideNzIcons(icons), 
        provideNzI18n(en_US),
        provideNoopAnimations(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
