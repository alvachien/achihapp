import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { finalize, ReplaySubject, takeUntil } from 'rxjs';
import { ConsoleLogTypeEnum, Currency, ModelUtility } from '../../../model';
import { FinanceStorageService } from '../../../services';

@Component({
  selector: 'hih-currencies',
  imports: [
    NzSpinModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzTableModule,
    NzModalModule,
    TranslocoModule,
  ],
  templateUrl: './currencies.component.html',
  styleUrl: './currencies.component.less'
})
export class CurrenciesComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  public dataSource: Currency[] = [];
  isLoadingResults: boolean;
  
  private readonly currService = inject(FinanceStorageService);
  private readonly modalService = inject(NzModalService);

  constructor() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering CurrencyComponent constructor...`,
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering CurrencyComponent OnInit...`, ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = false;
    this.currService
      .fetchAllCurrencies()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering CurrencyComponent OnInit fetchAllCurrencies...`,
            ConsoleLogTypeEnum.debug
          );
          if (x) {
            this.dataSource = x;
          }
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering CurrencyComponent OnInit fetchAllCurrencies, failed ${err}...`,
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

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering CurrencyComponent ngOnDestroy...`,
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
