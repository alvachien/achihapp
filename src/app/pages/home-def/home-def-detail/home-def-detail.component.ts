import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzFormLabelComponent, NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { UIMode, isUIEditable } from 'actslib';

import {
  HomeDef,
  Currency,
  getUIModeString,
  HomeMember,
  ModelUtility,
  ConsoleLogTypeEnum,
  UIDisplayString,
  UIDisplayStringUtil,
  HomeMemberRelationEnum,
} from '../../../model';
import { AuthService, HomeDefineStorageService, FinanceStorageService } from '../../../services';
import { NzButtonModule } from 'ng-zorro-antd/button';

interface HomeDefDetailForm {
  id: FormControl<string | null>;
  name: FormControl<string | null>;
  detail: FormControl<string | null>;
  baseCurr: FormControl<string | null>;
  host: FormControl<string | null | undefined>;
}

@Component({
    selector: 'hih-home-def-detail',
    templateUrl: './home-def-detail.component.html',
    styleUrls: ['./home-def-detail.component.less'],
    imports: [
      NzPageHeaderModule,
      NzBreadCrumbModule,
      TranslocoModule,
      FormsModule,
      ReactiveFormsModule,
      NzFormModule,
      NzSelectModule,
      NzDividerModule,
      NzTableModule,
      NzInputModule,
      NzCheckboxModule,
      NzModalModule,
      NzButtonModule,
    ]
})
export class HomeDefDetailComponent implements OnInit, OnDestroy {
  /* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _destroyed$: ReplaySubject<boolean> | null = null;
  private routerID = -1; // Current object ID in routing

  public isLoadingResults: boolean;
  public currentMode: string | null = null;
  public uiMode: UIMode = UIMode.Create;
  public arCurrencies: Currency[] = [];
  public detailFormGroup: FormGroup<HomeDefDetailForm>;
  public listMembers: HomeMember[] = [];
  public listMemRel: UIDisplayString[] = [];

  private readonly authService = inject(AuthService);
  private readonly finService = inject(FinanceStorageService);
  private readonly storageService = inject(HomeDefineStorageService);
  private readonly router = inject(Router);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly modalService = inject(NzModalService);
  private readonly formBuilder = inject(FormBuilder);

  get IsCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get isFieldChangable(): boolean {
    return isUIEditable(this.uiMode);
  }
  get isSaveAllowed(): boolean {
    if (this.isFieldChangable) {
      return this.detailFormGroup.valid && this.isItemsValid;
    }
    return false;
  }
  get isDeleteItemAllowed(): boolean {
    if (this.isFieldChangable) {
      return true;
    }
    return false;
  }
  get isItemsValid(): boolean {
    if (this.listMembers.length > 0) {
      let bvalid = true;
      let selfitem = 0;
      this.listMembers.forEach((val: HomeMember) => {
        if (!val.isValid) {
          bvalid = false;
        }
        if (val.Relation === HomeMemberRelationEnum.Self) {
          ++selfitem;
        }
      });
      if (selfitem !== 1) {
        bvalid = false;
      }

      return bvalid;
    }
    return false;
  }
  get currentHomeDefObject(): HomeDef {
    const hdobj = new HomeDef();
    hdobj.Name = this.detailFormGroup.value.name ?? '';
    hdobj.BaseCurrency = this.detailFormGroup.value.baseCurr ?? '';
    this.listMembers.forEach((val) => {
      hdobj.Members.push(val);
    });

    return hdobj;
  }

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeDefDetailComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.listMemRel = UIDisplayStringUtil.getHomeMemberRelationEnumStrings();

    this.detailFormGroup = this.formBuilder.group<HomeDefDetailForm>({
      id: this.formBuilder.control({ value: null, disabled: true }),
      name: this.formBuilder.control('', Validators.required),
      detail: this.formBuilder.control(''),
      baseCurr: this.formBuilder.control('', Validators.required),
      host: this.formBuilder.control({
        value: this.authService.authSubject.getValue().getUserId(),
        disabled: true,
      }, Validators.required),
    });

    this.isLoadingResults = false;
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeDefDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);

    // Distinguish current mode
    this.activateRoute.url.subscribe((x) => {
      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.uiMode = UIMode.Create;
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Update;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.uiMode = UIMode.Display;
        }
        this.currentMode = getUIModeString(this.uiMode);
      }

      switch (this.uiMode) {
        case UIMode.Update:
        case UIMode.Display: {
          this.isLoadingResults = true;
          forkJoin([this.finService.fetchAllCurrencies(), this.storageService.readHomeDef(this.routerID)])
            .pipe(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              takeUntil(this._destroyed$!),
              finalize(() => this.isLoadingResults = false)
            )
            .subscribe({
              next: (rsts) => {
                this.arCurrencies = rsts[0];
                console.log(rsts[1]);

                this.detailFormGroup.patchValue({
                  id: rsts[1].ID.toString(),
                  name: rsts[1].Name,
                  baseCurr: rsts[1].BaseCurrency,
                  host: rsts[1].Host,
                  detail: rsts[1].Details,
                });
                this.detailFormGroup.markAsUntouched();
                this.detailFormGroup.markAsPristine();

                if (this.uiMode === UIMode.Display) {
                  this.detailFormGroup.disable();
                } else if (this.uiMode === UIMode.Update) {
                  this.detailFormGroup.enable();
                  this.detailFormGroup.controls.id.disable();
                }

                this.listMembers = rsts[1].Members.slice();
              },
              error: (err) => {
                // Show error dialog
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
          this.finService
            .fetchAllCurrencies()
            .pipe(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              takeUntil(this._destroyed$!),
              finalize(() => (this.isLoadingResults = false))
            )
            .subscribe({
              next: (curries: Currency[]) => {
                this.arCurrencies = curries;

                // Insert one home member by default
                this.listMembers = [];
                const nm = new HomeMember();
                nm.User = this.authService.authSubject.getValue().getUserId() ?? '';
                nm.Relation = HomeMemberRelationEnum.Self;
                nm.DisplayAs = nm.User;
                this.listMembers.push(nm);
              },
              error: (err) => {
                // Show error dialog
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
    });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeDefDetailComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onChange() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering HomeDefDetailComponent onChange...',
      ConsoleLogTypeEnum.debug
    );
  }

  getCurrencyWithSymbol(cr: Currency): string {
    return translate(cr.Name!) + ' - ' + cr.Symbol;
  }

  onSave() {
    // Save the data
    if (this.uiMode === UIMode.Create) {
      // Create mode
      const hdobj = new HomeDef();
      hdobj.Name = this.detailFormGroup.value.name ?? '';
      hdobj.BaseCurrency = this.detailFormGroup.value.baseCurr ?? '';
      hdobj.Host = this.detailFormGroup.value.host ?? '';
      hdobj.Details = this.detailFormGroup.value.detail ?? '';

      this.listMembers.forEach((val) => hdobj.Members.push(val));
      if (!hdobj.isValid) {
        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: 'Errors',
          nzClosable: true,
        });

        return;
      }

      this.storageService
        .createHomeDef(hdobj)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .pipe(takeUntil(this._destroyed$!))
        .subscribe({
          next: (val) => {
            // Shall create successfully.
            this.router.navigate(['/homedef/display/' + val.ID.toString()]);
          },
          error: (err) => {
            // Show error
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
    } else if (this.uiMode === UIMode.Update) {
      // Change mode
      const hdobj = new HomeDef();
      hdobj.ID = +this.routerID;
      hdobj.Name = this.detailFormGroup.value.name ?? '';
      hdobj.BaseCurrency = this.detailFormGroup.value.baseCurr ?? '';
      hdobj.Host = this.detailFormGroup.value.host ?? '';
      hdobj.Details = this.detailFormGroup.value.detail ?? '';

      this.listMembers.forEach((val) => hdobj.Members.push(val));
      if (!hdobj.isValid) {
        this.modalService.error({
          nzTitle: translate('Common.Error'),
          nzContent: 'Errors',
          nzClosable: true,
        });

        return;
      }

      this.storageService
        .changeHomeDef(hdobj)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .pipe(takeUntil(this._destroyed$!))
        .subscribe({
          next: () => {
            // Shall create successfully.
            this.router.navigate(['/homedef/display/' + hdobj.ID.toString()]);
          },
          error: (err) => {
            // Show error
            this.modalService.error({
              nzTitle: translate('Common.Error'),
              nzContent: err.toString(),
              nzClosable: true,
            });
          },
        });
    }
  }

  onCreateMember() {
    const nmem = new HomeMember();
    const memes = this.listMembers.slice();
    if (this.routerID) {
      nmem.HomeID = +this.routerID;
    }
    memes.push(nmem);
    this.listMembers = memes;
  }
  onDeleteMember(idx: number) {
    const memes = this.listMembers.slice();
    memes.splice(idx, 1);
    this.listMembers = memes;
  }
}
