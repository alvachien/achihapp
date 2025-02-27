import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { ThemeService } from './services/theme.service';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { en_US, NzI18nService, zh_CN } from 'ng-zorro-antd/i18n';

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
export class AppComponent {
  isCollapsed = false;
  currentYear = '';
  private readonly themeService = inject(ThemeService);
  private readonly translocoService = inject(TranslocoService);
  private readonly i18n = inject(NzI18nService);

  constructor() {
    this.currentYear = new Date().getFullYear().toString(); 
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
}
