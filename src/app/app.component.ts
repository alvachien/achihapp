import { Component, inject, NgZone, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { ThemeService } from './services/theme.service';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { en_US, NzI18nService, zh_CN } from 'ng-zorro-antd/i18n';
import { ConsoleLogTypeEnum, ModelUtility } from './model';
import { environment } from '../environments/environment';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterLink,
    RouterOutlet,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    NzDropDownModule,
    TranslocoModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent implements OnInit {
  isCollapsed = false;
  currentYear = '';
  isLoggedIn = false;
  public titleLogin?: string;
  public userDisplayAs?: string;
  private readonly themeService = inject(ThemeService);
  private readonly translocoService = inject(TranslocoService);
  private readonly i18n = inject(NzI18nService);
  private readonly authService = inject(AuthService);
  private readonly zone = inject(NgZone);

  constructor() {
    this.currentYear = new Date().getFullYear().toString(); 
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent ngOnInit', ConsoleLogTypeEnum.debug);

    this.authService.authContent.subscribe((x) => {
      ModelUtility.writeConsoleLog(
        'AC HIH UI [Debug]: Entering AppComponent authService.authContent subscribe',
        ConsoleLogTypeEnum.debug
      );
      this.zone.run(() => {
        this.isLoggedIn = x.isAuthorized;
        if (this.isLoggedIn) {
          this.titleLogin = x.getUserName();
        }
      });
    });      
  }

  toggleTheme(): void {
    this.themeService.toggleTheme().then();
  }
  switchLanguage(langkey: string) {
    if (langkey === 'en_US') {
      this.i18n.setLocale(en_US);
      this.translocoService.setActiveLang('en');
    } else {
      // Default
      this.i18n.setLocale(zh_CN);
      this.translocoService.setActiveLang('zh_CN');
    } 
  }
  public onLogon(): void {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent onLogon', ConsoleLogTypeEnum.debug);

    if (environment.LoginRequired) {
      this.authService.doLogin();
    }
  }
  public onLogout(): void {
    ModelUtility.writeConsoleLog('AC HIH UI [Debug]: Entering AppComponent onLogout', ConsoleLogTypeEnum.debug);

    if (environment.LoginRequired) {
      this.authService.doLogout();
    }
  }
  public onGoToUserDetail() : void {

  }
}
