import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';
import en from '../assets/i18n/en.json';
import zh_CN from '../assets/i18n/zh_CN.json';

export function getTranslocoModule(options: TranslocoTestingOptions = {}) {
  return TranslocoTestingModule.forRoot({
    langs: { en, zh_CN },
    translocoConfig: {
      availableLangs: ['en', 'zh_CN'],
      defaultLang: 'en',
    },
    preloadLangs: true,
    ...options,
  });
}
