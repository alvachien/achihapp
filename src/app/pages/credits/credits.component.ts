import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';

@Component({
  selector: 'app-credits',
  imports: [
    TranslocoModule,
    NzListModule,
    NzButtonModule,
  ],
  templateUrl: './credits.component.html',
  styleUrl: './credits.component.less'
})
export class CreditsComponent {
  creditApp: any[] = [
    {
      name: 'Angular',
      url: 'https://angular.io',
      desp: 'One framework. Mobile & desktop. Angular is a development platform for building mobile and desktop web applications using TypeScript/JavaScript and other languages.',
    },
    {
      name: 'TypeScript',
      url: 'http://www.typescriptlang.org/',
      desp: 'JavaScript that scales. TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. Any browser. Any host. Any OS. Open source.',
    },
    {
      name: 'Ant Design',
      url: 'https://ng.ant.design',
      desp: 'Ant Design, a design language for background applications, is refined by Ant UED Team',
    },
    {
      name: 'ECharts',
      url: 'http://echarts.baidu.com/',
      desp: 'A powerful, interactive charting and visualization library for browser.',
    },
    {
      name: 'Transloco',
      url: 'https://transloco.netlify.com/',
      desp: 'The internationalization (i18n) library for Angular.',
    },
    {
      name: 'date-fns',
      url: 'https://date-fns.org/',
      desp: 'date-fns provides the most comprehensive, yet simple and consistent toolset for manipulating JavaScript dates in a browser & Node.js.',
    },
    {
      name: '.NET',
      url: 'https://dot.net',
      desp: 'Free. Cross-platform. Open source. A developer platform for building all your apps.',
    },
  ];
}
