import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzResultModule } from 'ng-zorro-antd/result';
import { UIStatusService } from '../../services';

@Component({
  selector: 'hih-fatal-error',
  imports: [
    NzResultModule,
    NzButtonModule,
    TranslocoModule
  ],
  templateUrl: './fatal-error.component.html',
  styleUrl: './fatal-error.component.less',  
})
export class FatalErrorComponent {
  errorContext = '';

  private readonly uiStatus = inject(UIStatusService);
  
  constructor() {
    if (this.uiStatus.latestError) {
      this.errorContext = this.uiStatus.latestError;
    }
  }
}
