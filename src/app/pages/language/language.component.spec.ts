import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { LanguageComponent } from './language.component';
import { getTranslocoModule, TestDataBuilder, asyncData } from '../../../test/';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { icons } from '../../icons-provider';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { LanguageService } from '../../services/language.service';

describe('LanguageComponent', () => {
  let component: LanguageComponent;
  let fixture: ComponentFixture<LanguageComponent>;
  let databuilder: TestDataBuilder;
  let langServiceSpy: jasmine.SpyObj<LanguageService>;

  beforeAll(() => {
    databuilder = new TestDataBuilder();
    databuilder.buildAppLanguage();
  });
  
  beforeEach(waitForAsync(() => {
    const spy = jasmine.createSpyObj('LanguageService', ['fetchAllLanguages']);

    TestBed.configureTestingModule({
      imports: [
        getTranslocoModule(),
        LanguageComponent
      ],
      providers: [
        provideRouter([]),
        provideNzIcons(icons), 
        provideNzI18n(en_US),
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: LanguageService,
          useValue: spy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();

    langServiceSpy = TestBed.inject(LanguageService) as jasmine.SpyObj<LanguageService>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    beforeEach(() => {
      langServiceSpy.fetchAllLanguages.and.returnValue(asyncData(databuilder.appLanguages));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSource.length).toEqual(0);
    });

    it('should show data after OnInit', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();

      expect(component.dataSource.length).toBeGreaterThan(0);
      expect(component.dataSource.length).toEqual(databuilder.appLanguages.length);

      flush();
    }));
  });
});
