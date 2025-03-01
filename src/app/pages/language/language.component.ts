import { Component, inject } from '@angular/core';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { AppLanguage, ConsoleLogTypeEnum, ModelUtility } from '../../model';
import { finalize, ReplaySubject, takeUntil } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'hih-language',
  imports: [
    TranslocoModule,
    NzSpinModule,
    NzPageHeaderModule,
    NzTableModule,
    NzBreadCrumbModule,
    NzSwitchModule,
    NzModalModule,
    FormsModule,
  ],
  templateUrl: './language.component.html',
  styleUrl: './language.component.less',
})
export class LanguageComponent {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  public dataSource: AppLanguage[] = [];
  isLoadingResults: boolean;

  private readonly odataService = inject(LanguageService);
  private readonly modalService = inject(NzModalService);
  constructor() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering LanguageComponent constructor...`,
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = false;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering LanguageComponent OnInit...`, ConsoleLogTypeEnum.debug);

    this._destroyed$ = new ReplaySubject(1);

    this.isLoadingResults = true;
    this.odataService
      .fetchAllLanguages()
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (x: AppLanguage[]) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering LanguageComponent OnInit fetchAllLanguages...`,
            ConsoleLogTypeEnum.debug
          );

          this.dataSource = x;
        },
        error: (error: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering LanguageComponent OnInit fetchAllLanguages, failed ${error}...`,
            ConsoleLogTypeEnum.error
          );

          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: error.toString(),
            nzClosable: true,
          });
        },
      });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering LanguageComponent ngOnDestroy...`,
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }
}
