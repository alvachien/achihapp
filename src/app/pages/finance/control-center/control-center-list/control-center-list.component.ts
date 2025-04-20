import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { finalize, ReplaySubject, takeUntil } from 'rxjs';

import { ConsoleLogTypeEnum, ControlCenter, ModelUtility } from '../../../../model';
import { FinanceStorageService, HomeDefineStorageService } from '../../../../services';

@Component({
  selector: 'hih-control-center-list',
  imports: [
    NzSpinModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzButtonModule,
    NzTableModule,
    NzPopconfirmModule,
    NzDividerModule,
    TranslocoModule,
    NzModalModule,
    RouterModule,
  ],
  templateUrl: './control-center-list.component.html',
  styleUrl: './control-center-list.component.less'
})
export class ControlCenterListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  dataSet: ControlCenter[] = [];

  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome?.IsChild ?? false;
  }

  private readonly odataService = inject(FinanceStorageService);
  private readonly router = inject(Router);
  private readonly homeService = inject(HomeDefineStorageService);
  private readonly modalService = inject(NzModalService);

  constructor() {
    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService
      .fetchAllControlCenters()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (value: ControlCenter[]) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnInit, fetchAllControlCenters...',
            ConsoleLogTypeEnum.debug
          );

          this.dataSet = value.slice();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering ControlCenterListComponent ngOnInit, fetchAllControlCenters failed ${err}`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterListComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onDisplay(rid: number): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterListComponent onDisplay...',
      ConsoleLogTypeEnum.debug
    );
    this.router.navigate(['/finance/controlcenter/display/' + rid.toString()]);
  }

  onEdit(rid: number): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterListComponent onEdit...',
      ConsoleLogTypeEnum.debug
    );
    this.router.navigate(['/finance/controlcenter/edit/' + rid.toString()]);
  }

  onDelete(rid: number) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterListComponent onDelete...',
      ConsoleLogTypeEnum.debug
    );

    this.odataService
      .deleteControlCenter(rid)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: () => {
          const extccs = this.dataSet.slice();
          const extidx = extccs.findIndex((val2) => {
            return val2.Id === rid;
          });
          if (extidx !== -1) {
            extccs.splice(extidx, 1);
            this.dataSet = extccs;
          }
        },
        error: (err) => {
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }
}
