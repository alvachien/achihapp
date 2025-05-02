import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { isUIEditable, UIMode } from 'actslib';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { finalize, forkJoin, ReplaySubject, takeUntil } from 'rxjs';
import { ConsoleLogTypeEnum, ControlCenter, getUIModeString, HomeMember, ModelUtility } from '../../../../model';
import { FinanceStorageService, HomeDefineStorageService } from '../../../../services';
import { popupDialog } from '../../../message-dialog';

interface ControlCenterDetailForm {
  id: FormControl<number | null>;
  name: FormControl<string | null>;
  comment: FormControl<string | null>;
  parent: FormControl<number | null>;
  owner: FormControl<string | null>;
}

@Component({
  selector: 'hih-control-center-detail',
  imports: [
    NzPageHeaderModule,
    NzSpinModule,
    NzBreadCrumbModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzSelectModule,
    TranslocoModule,
    RouterModule,
    NzModalModule,
  ],
  templateUrl: './control-center-detail.component.html',
  styleUrl: './control-center-detail.component.less'
})
export class ControlCenterDetailComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults: boolean;
  public routerID = -1; // Current object ID in routing
  public currentMode = '';
  public uiMode: UIMode = UIMode.Create;
  public existedCC: ControlCenter[] = [];
  public detailFormGroup: FormGroup<ControlCenterDetailForm>;
  public arMembers: HomeMember[] = [];

  get isFieldChangable(): boolean {
    return isUIEditable(this.uiMode);
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }

  private readonly odataService = inject(FinanceStorageService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly homeService = inject(HomeDefineStorageService);
  private readonly modalService = inject(NzModalService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering ControlCenterDetailComponent constructor...',
      ConsoleLogTypeEnum.debug
    );
    this.isLoadingResults = false;
    this.arMembers = (this.homeService.ChosedHome?.Members ?? []).slice();

    this.detailFormGroup = this.formBuilder.group<ControlCenterDetailForm>({
      id: this.formBuilder.control(null),
      name: this.formBuilder.control('', [Validators.required, Validators.maxLength(30)]),
      comment: this.formBuilder.control('', Validators.maxLength(45)),
      parent: this.formBuilder.control(null),
      owner: this.formBuilder.control(null)
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering ControlCenterDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    // Distinguish current mode
    this.activateRoute.url.subscribe((x) => {
      ModelUtility.writeConsoleLog(
        `AC_HIH_APP [Debug]: Entering ControlCenterDetailComponent ngOnInit activateRoute URL: ${x}`,
        ConsoleLogTypeEnum.debug
      );

      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          // Do nothing
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Update;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Display;
        }
        this.currentMode = getUIModeString(this.uiMode);
        switch (this.uiMode) {
          case UIMode.Update:
          case UIMode.Display: {
            this.isLoadingResults = true;

            forkJoin([this.odataService.fetchAllControlCenters(), this.odataService.readControlCenter(this.routerID)])
              .pipe(
                takeUntil(this._destroyed$!),
                finalize(() => (this.isLoadingResults = false))
              )
              .subscribe({
                next: (rsts) => {
                  this.existedCC = rsts[0];

                  this.detailFormGroup.setValue({
                    id: rsts[1].Id ?? null,
                    name: rsts[1].Name,
                    comment: rsts[1].Comment ?? '',
                    parent: rsts[1].ParentId ?? null,
                    owner: rsts[1].Owner ?? null
                  });
                  if (this.uiMode === UIMode.Display) {
                    this.detailFormGroup.disable();
                  } else {
                    this.detailFormGroup.enable();
                  }
                },
                error: (err) => {
                  ModelUtility.writeConsoleLog(
                    `AC_HIH_APP [Error]: Entering ControlCenterDetailComponent ngOninit, readControlCenter failed: ${err}`,
                    ConsoleLogTypeEnum.error
                  );

                  this.modalService.create({
                    nzTitle: translate('Common.Error'),
                    nzContent: err.toString(),
                    nzClosable: true,
                  });
                },
              });
            break;
          }

          case UIMode.Create:
          default: {
            this.isLoadingResults = true;
            this.odataService
              .fetchAllControlCenters()
              .pipe(
                takeUntil(this._destroyed$!),
                finalize(() => (this.isLoadingResults = false))
              )
              .subscribe({
                next: (cclist: ControlCenter[]) => {
                  ModelUtility.writeConsoleLog(
                    'AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnInit, fetchAllControlCenters...',
                    ConsoleLogTypeEnum.debug
                  );

                  // Load all control centers.
                  this.existedCC = cclist;
                },
                error: (err) => {
                  ModelUtility.writeConsoleLog(
                    `AC_HIH_UI [Error]: Entering ControlCenterDetailComponent ngOninit, fetchAllControlCenters failed: ${err}`,
                    ConsoleLogTypeEnum.error
                  );

                  this.modalService.create({
                    nzTitle: translate('Common.Error'),
                    nzContent: err.toString(),
                    nzClosable: true,
                  });
                },
              });
            break;
          }
        }
      }
    });
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onCheck() {
    const detailObject: ControlCenter = this._generateObject();
    if (
      !detailObject.onVerify({
        ControlCenters: this.existedCC,
      })
    ) {
      // Error dialog
      popupDialog(this.modalService, 'Common.Error', detailObject.VerifiedMsgs);
      return;
    }
  }

  public onSubmit(): void {
    if (!this.isFieldChangable || !this.detailFormGroup.valid) {
      return;
    }

    const detailObject: ControlCenter = this._generateObject();
    if (!detailObject.onVerify({ControlCenters: this.existedCC,})
    ) {
      // Error dialog
      popupDialog(this.modalService, 'Common.Error', detailObject.VerifiedMsgs);
      return;
    }

    if (this.uiMode === UIMode.Create) {
      this._createControlCenter(detailObject);
    } else if (this.uiMode === UIMode.Update) {
      // Check the dirty control
      const arcontent: any = {};
      arcontent.Name = this.detailFormGroup.value.name;
      arcontent.Comment = this.detailFormGroup.value.comment ?? '';
      arcontent.ParentId = this.detailFormGroup.value.parent ?? undefined;
      arcontent.Owner = this.detailFormGroup.value.owner ?? '';

      this._updateControlCenter(arcontent);
    }
  }

  private _generateObject(): ControlCenter {
    const detailObject: ControlCenter = new ControlCenter();    
    detailObject.HID = this.homeService.ChosedHome?.ID ?? 0;
    detailObject.Name = this.detailFormGroup.value.name ?? '';
    detailObject.Comment = this.detailFormGroup.value.comment ?? '';
    detailObject.ParentId = this.detailFormGroup.value.parent ?? undefined;
    detailObject.Owner = this.detailFormGroup.value.owner ?? '';
    return detailObject;
  }

  private _createControlCenter(detailObject: ControlCenter): void {
    this.odataService
      .createControlCenter(detailObject)
      .pipe(
        takeUntil(this._destroyed$!),
        finalize(() => {
          // Finalized
        })
      )
      .subscribe({
        next: (x: ControlCenter) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering ControlCenterDetailComponent, _createControlCenter`,
            ConsoleLogTypeEnum.debug
          );

          // Show the result dialog
          this.router.navigate(['/finance/controlcenter/display/', x.Id]);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering ControlCenterDetailComponent, _createControlCenter failed: ${err}`,
            ConsoleLogTypeEnum.error
          );
          // Show error message
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }

  private _updateControlCenter(changedContent: any): void {
    this.odataService
      .changeControlCenterByPatch(this.routerID, changedContent)
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: (x) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering ControlCenterDetailComponent, _updateControlCenter`,
            ConsoleLogTypeEnum.error
          );

          // Show the result dialog
          this.router.navigate(['/finance/controlcenter/display/', x.Id]);
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering ControlCenterDetailComponent, _updateControlCenter`,
            ConsoleLogTypeEnum.error
          );
          // Show error message
          this.modalService.error({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
  }
}
