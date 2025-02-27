import { Component } from '@angular/core';
import { NzBackTopModule } from 'ng-zorro-antd/back-top';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';

@Component({
  selector: 'app-version',
  imports: [
    NzTimelineModule,
    NzBackTopModule,
    NzIconModule,
  ],
  templateUrl: './version.component.html',
  styleUrl: './version.component.less'
})
export class VersionComponent {

}
