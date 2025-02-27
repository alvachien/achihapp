import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-about',
  imports: [
    NzTypographyModule,
    TranslocoModule,
    NzDividerModule
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.less'
})
export class AboutComponent {
  version: string;
  constructor() {
    this.version = environment.CurrentVersion;
  }
}
