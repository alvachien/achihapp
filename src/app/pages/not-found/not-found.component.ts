import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
  selector: 'app-not-found',
  imports: [
    NzButtonModule,
    NzResultModule,
    TranslocoModule,
    RouterModule,
  ],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.less'
})
export class NotFoundComponent {
  private readonly router = inject(Router);

  onBack() {
    this.router.navigate(['']);
  }
}
