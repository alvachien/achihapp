import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AuthServiceStub, getTranslocoModule, TestDataBuilder } from '../test/';
import { provideRouter } from '@angular/router';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { icons } from './icons-provider';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AuthService } from './services/auth.service';

describe('AppComponent without login', () => {
  let testdatabuilder: TestDataBuilder;

  beforeAll(() => {
    testdatabuilder = new TestDataBuilder();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        getTranslocoModule(),
        AppComponent,
      ],
      providers: [
        provideRouter([]),
        provideNzIcons(icons), 
        provideNzI18n(en_US),
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useClass: AuthServiceStub
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the currentYear property`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.currentYear).toEqual(new Date().getFullYear().toString());
  });

  it('should have the isCollapsed property', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.componentInstance;
    expect(app.isCollapsed).toBeFalse();
  });

  it('should have the app title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('HIH');    
  });
  
  it('should work with Logon and Logout', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const app = fixture.componentInstance;
    expect(app.isLoggedIn).toBeFalsy();
    app.onLogon();

    expect(app.isLoggedIn).toBeTruthy();
    expect(app.titleLogin).toBeTruthy();

    testdatabuilder.buildCurrentUser();
    expect(app.titleLogin).toEqual(testdatabuilder.currentUser!.getUserName());
    app.onLogout();
    expect(app.isLoggedIn).toBeFalsy();
  });
});

