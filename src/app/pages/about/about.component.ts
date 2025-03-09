import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { environment } from '../../../environments/environment';
import { UIStatusService } from '../../services';
import { CheckVersionResult } from '../../model';

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
  releaseddate: string;
  private readonly uiSrv = inject(UIStatusService);

  get resultVersion(): CheckVersionResult | undefined{
    return this.uiSrv.versionResult;
  }

  constructor() {
    this.version = environment.CurrentVersion;
    this.releaseddate = environment.ReleasedDate;
  }
}
