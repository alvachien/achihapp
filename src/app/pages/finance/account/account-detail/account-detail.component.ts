import { AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { UIMode, UIDisplayString, isUIEditable } from 'actslib';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { ReplaySubject, forkJoin, takeUntil } from 'rxjs';

import { HomeMember, AccountCategory, AssetCategory, ControlCenter, Document, UIOrderForSelection, UIAccountForSelection, 
  TranType, financeAccountCategoryAsset, financeAccountCategoryAdvancePayment, financeAccountCategoryAdvanceReceived, 
  financeAccountCategoryBorrowFrom, financeAccountCategoryLendTo, ModelUtility, ConsoleLogTypeEnum, UIDisplayStringUtil, 
  financeAccountCategoryCash, AccountStatusEnum, getUIModeString, Account, AccountExtraAdvancePayment, AccountExtraLoan, 
  BuildupOrderForSelection, financeAccountCategoryInsurance, financeAccountCategoryDeposit, financeAccountCategoryCreditCard, 
  financeAccountCategoryAccountPayable, financeAccountCategoryAccountReceivable, financeAccountCategoryVirtual, financeDocTypeNormal,
  DocumentItem, financeTranTypeOpeningAsset, financeTranTypeOpeningLiability, AccountExtraAsset } from '../../../../model';
import { costObjectValidator } from '../../../../uimodel';
import { popupDialog } from '../../../message-dialog';
import { FinanceStorageService, HomeDefineStorageService } from '../../../../services';

interface AccountHeaderForm {
  id: FormControl<number | null>;
  name: FormControl<string | null>;
  category: FormControl<number | null>;
  comment: FormControl<string | null>;
  status: FormControl<number | null>;
  owner: FormControl<string | null>;
}

interface AccountAmountForm {
  date: FormControl<Date | null>;
  amount: FormControl<number | null>;
  controlCenter: FormControl<number | null>;
  order: FormControl<number | null>;
}

@Component({
  selector: 'hih-account-detail',
  imports: [
    NzPageHeaderModule,
    NzSpinModule,
    NzButtonModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzSelectModule,
    NzDividerModule,
    NzInputNumberModule,
    TranslocoModule,
    RouterModule,
    NzModalModule,
    NzCheckboxModule,
    NzDatePickerModule,
  ],
  templateUrl: './account-detail.component.html',
  styleUrl: './account-detail.component.less'
})
export class AccountDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  public routerID = -1; // Current object ID in routing
  public currentMode = '';
  public uiMode: UIMode = UIMode.Create;
  arStatusDisplayStrings: UIDisplayString[] = [];
  arMembers: HomeMember[] = [];
  arAccountCategories: AccountCategory[] = [];
  arAssetCategories: AssetCategory[] = [];
  // Header forum
  public headerFormGroup: FormGroup<AccountHeaderForm>;
  // Amount form
  public isInitAmountRequired = false;
  public amountFormGroup: FormGroup<AccountAmountForm>;
  private _arControlCenters: ControlCenter[] = [];
  private _arUIOrders: UIOrderForSelection[] = [];
  // Extra form group
  // public extraADPFormGroup: UntypedFormGroup;
  // public extraAssetFormGroup: UntypedFormGroup;
  // public extraLoanFormGroup: UntypedFormGroup;
  // Additional binding info.
  public tranAmount = 0;
  public controlCenterID?: number;
  public orderID?: number;
  public arUIAccount: UIAccountForSelection[] = [];
  public arTranTypes: TranType[] = [];
  public tranType?: number;

  // @ViewChild('extraADP', { static: false })
  // compExtraADP?: AccountExtraDownpaymentComponent;
  // @ViewChild('extraLoan', { static: false })
  // compExtraLoan?: AccountExtraLoanComponent;
  // @ViewChild('extraAsset', { static: false })
  // compExtraAsset?: AccountExtraAssetComponent;

  get isFieldChangable(): boolean {
    return isUIEditable(this.uiMode);
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get currentCategory(): number | null {
    return this.headerFormGroup.value.category ?? null;
  }
  get isAssetAccount(): boolean {
    if (this.currentCategory === financeAccountCategoryAsset) {
      return true;
    }

    return false;
  }
  get isADPAccount(): boolean {
    if (this.currentCategory === financeAccountCategoryAdvancePayment ||
      this.currentCategory === financeAccountCategoryAdvanceReceived) {
      return true;
    }

    return false;
  }
  get isLoanAccount(): boolean {
    if (this.currentCategory === financeAccountCategoryBorrowFrom ||
      this.currentCategory === financeAccountCategoryLendTo ) {
      return true;
    }

    return false;
  }
  get arControlCenters(): ControlCenter[] {
    return this._arControlCenters;
  }
  get arUIOrders(): UIOrderForSelection[] {
    return this._arUIOrders;
  }

  private readonly odataService = inject(FinanceStorageService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly homeSevice = inject(HomeDefineStorageService);
  private readonly modalService = inject(NzModalService);
  private readonly router = inject(Router);
  private readonly changeDetectRef = inject(ChangeDetectorRef);
  private readonly formBuilder = inject(FormBuilder);

  constructor() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_APP [Debug]: Entering AccountDetailComponent constructor`,
      ConsoleLogTypeEnum.debug
    );

    this.arStatusDisplayStrings = UIDisplayStringUtil.getAccountStatusStrings();
    this.arMembers = this.homeSevice.ChosedHome?.Members ?? [];

    this.headerFormGroup = this.formBuilder.group<AccountHeaderForm>({
      id: this.formBuilder.control(null),
      name: this.formBuilder.control('', [Validators.required, Validators.maxLength(30)]),
      category: this.formBuilder.control(financeAccountCategoryCash, [Validators.required]),
      comment: this.formBuilder.control('', Validators.maxLength(45)),
      status: this.formBuilder.control(AccountStatusEnum.Normal),
      owner: this.formBuilder.control(null)
    });
    this.amountFormGroup = this.formBuilder.group<AccountAmountForm>({
        date: this.formBuilder.control(new Date(), Validators.required),
        amount: this.formBuilder.control(null, Validators.required),
        controlCenter: this.formBuilder.control(null),
        order: this.formBuilder.control(null),
      },
      {
        validators: [costObjectValidator]
      }
    );
    this.amountFormGroup.disable(); // By default, it is disabled

    // this.extraADPFormGroup = new UntypedFormGroup({
    //   extADPControl: new UntypedFormControl(),
    // });
    // this.extraAssetFormGroup = new UntypedFormGroup({
    //   extAssetControl: new UntypedFormControl(),
    // });
    // this.extraLoanFormGroup = new UntypedFormGroup({
    //   extLoanControl: new UntypedFormControl(),
    // });
  }

  ngOnInit(): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_APP [Debug]: Entering AccountDetailComponent ngOnInit`,
      ConsoleLogTypeEnum.debug
    );
    this._destroyed$ = new ReplaySubject(1);
    this.headerFormGroup.controls['id'].disable();
  }

  ngAfterViewInit(): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_APP [Debug]: Entering AccountDetailComponent ngAfterViewInit`,
      ConsoleLogTypeEnum.debug
    );

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
        this.changeDetectRef.detectChanges();
      }

      switch (this.uiMode) {
        case UIMode.Update:
        case UIMode.Display: {
          forkJoin([
            this.odataService.fetchAllAccountCategories(),
            this.odataService.fetchAllAssetCategories(),
            this.odataService.fetchAllTranTypes(),
            this.odataService.readAccount(this.routerID),
          ])
            .pipe(takeUntil(this._destroyed$!))
            .subscribe({
              next: (rst: any[]) => {
                this.arAccountCategories = rst[0];
                this.arAssetCategories = rst[1];
                this.arTranTypes = rst[2];
                const acnt = rst[3] as Account;

                if (acnt.CategoryId === financeAccountCategoryAdvancePayment) {
                  this.odataService.fetchAllDPTmpDocs({ AccountID: this.routerID }).subscribe({
                    next: (val) => {
                      (acnt.ExtraInfo as AccountExtraAdvancePayment).dpTmpDocs = val;
                      this._displayAccountContent(acnt);

                      this.headerFormGroup.markAsPristine();
                      // this.extraADPFormGroup.markAsPristine();
                      // this.extraAssetFormGroup.markAsPristine();
                      // this.extraLoanFormGroup.markAsPristine();

                      if (this.uiMode === UIMode.Display) {
                        this.headerFormGroup.disable();
                        // this.extraADPFormGroup.disable();
                        // this.extraAssetFormGroup.disable();
                        // this.extraLoanFormGroup.disable();
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
                } else if (acnt.CategoryId === financeAccountCategoryBorrowFrom) {
                  this.odataService.fetchAllLoanTmpDocs({ AccountID: this.routerID }).subscribe({
                    next: (val) => {
                      (acnt.ExtraInfo as AccountExtraLoan).loanTmpDocs = val;
                      this._displayAccountContent(acnt);

                      this.headerFormGroup.markAsPristine();
                      // this.extraADPFormGroup.markAsPristine();
                      // this.extraAssetFormGroup.markAsPristine();
                      // this.extraLoanFormGroup.markAsPristine();

                      if (this.uiMode === UIMode.Display) {
                        this.headerFormGroup.disable();
                        // this.extraADPFormGroup.disable();
                        // this.extraAssetFormGroup.disable();
                        // this.extraLoanFormGroup.disable();
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
                } else if (acnt.CategoryId === financeAccountCategoryAsset) {
                  this._displayAccountContent(acnt);
                  this.headerFormGroup.markAsPristine();
                  // this.extraADPFormGroup.markAsPristine();
                  // this.extraAssetFormGroup.markAsPristine();
                  // this.extraLoanFormGroup.markAsPristine();

                  if (this.uiMode === UIMode.Display) {
                    this.headerFormGroup.disable();
                    // this.extraADPFormGroup.disable();
                    // this.extraAssetFormGroup.disable();
                    // this.extraLoanFormGroup.disable();
                  }
                } else {
                  this._displayAccountContent(acnt);
                  this.headerFormGroup.markAsPristine();
                  // this.extraADPFormGroup.markAsPristine();
                  // this.extraAssetFormGroup.markAsPristine();
                  // this.extraLoanFormGroup.markAsPristine();

                  if (this.uiMode === UIMode.Display) {
                    this.headerFormGroup.disable();
                    // this.extraADPFormGroup.disable();
                    // this.extraAssetFormGroup.disable();
                    // this.extraLoanFormGroup.disable();
                  }
                }
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_APP [Error]: Entering AccountDetailComponent ngOninit, readAccount failed: ${err}`,
                  ConsoleLogTypeEnum.error
                );

                this.uiMode = UIMode.Invalid;
                this.modalService.error({
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
          forkJoin([
            this.odataService.fetchAllAccountCategories(),
            this.odataService.fetchAllControlCenters(),
            this.odataService.fetchAllOrders(),
          ])
            .pipe(takeUntil(this._destroyed$!))
            .subscribe({
              next: (rst) => {
                this.arAccountCategories = rst[0];
                this._arControlCenters = rst[1];
                this._arUIOrders = BuildupOrderForSelection(rst[2]);
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_APP [Error]: Entering AccountDetailComponent ngOnInit, failed with activateRoute: ${err.toString()}`,
                  ConsoleLogTypeEnum.error
                );

                this.modalService.error({
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
      `AC_HIH_APP [Debug]: Entering AccountDetailComponent ngOnDestroy`,
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public isCategoryDisabled(ctgyid: number): boolean {
    if (
      this.uiMode === UIMode.Create &&
      (ctgyid === financeAccountCategoryAsset ||
        ctgyid === financeAccountCategoryBorrowFrom ||
        ctgyid === financeAccountCategoryLendTo ||
        ctgyid === financeAccountCategoryAdvancePayment ||
        ctgyid === financeAccountCategoryAdvanceReceived ||
        ctgyid === financeAccountCategoryInsurance)
    ) {
      return true;
    }

    return false;
  }
  get canEnterInitialAmount(): boolean {
    const ctgyid = this.currentCategory;
    if (this.uiMode === UIMode.Create &&
      (ctgyid === financeAccountCategoryCash ||
        ctgyid === financeAccountCategoryDeposit ||
        ctgyid === financeAccountCategoryCreditCard ||
        ctgyid === financeAccountCategoryAccountPayable ||
        ctgyid === financeAccountCategoryAccountReceivable ||
        ctgyid === financeAccountCategoryVirtual)
    ) {
      return true;
    }
    return false;
  }
  get isSaveEnabled(): boolean {
    if (!this.isFieldChangable) {
      return false;
    }
    if (!this.headerFormGroup.valid) {
      return false;
    }
    if (this.canEnterInitialAmount && this.isInitAmountRequired) {
      return this.amountFormGroup.valid;
    }
    return true;
  }
  onInitAmountRequired(value: string[]) {
    if (this.isInitAmountRequired) {
      this.amountFormGroup.enable();
    } else {
      this.amountFormGroup.disable();
    }
  }
  public onSave(): void {
    ModelUtility.writeConsoleLog(`AC_HIH_APP [Debug]: Entering AccountDetailComponent onSave`, ConsoleLogTypeEnum.debug);
    if (this.uiMode === UIMode.Create) {
      this.onCreateImpl();
    } else if (this.uiMode === UIMode.Update) {
      this.onUpdateImpl();
    }
  }
  private onCreateImpl() {
    const acntobj = this._generateAccount();
    if (!acntobj) {
      return;
    }

    if (
      !acntobj.onVerify({
        Categories: this.arAccountCategories,
      })
    ) {
      popupDialog(this.modalService, 'Common.Error', acntobj.VerifiedMsgs);
      return;
    }

    // Save it
    this.odataService
      .createAccount(acntobj)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: (val) => {
          const nacntid = val.Id;
          if (this.isInitAmountRequired) {
            // Create a document for initial amount.
            const doc: Document = new Document();
            doc.Desp = val.Name ?? '';
            doc.DocType = financeDocTypeNormal;
            doc.HID = this.homeSevice.ChosedHome?.ID;
            doc.TranCurr = this.homeSevice.ChosedHome?.BaseCurrency ?? '';
            doc.TranDate = this.amountFormGroup.value.date ?? new Date();
            const docitem: DocumentItem = new DocumentItem();
            docitem.AccountId = nacntid;
            docitem.Desp = doc.Desp;
            docitem.ItemId = 1;
            docitem.TranAmount = this.amountFormGroup.value.amount ?? 0;
            let assetflag = false;
            this.arAccountCategories.find((ctgy) => {
              if (ctgy.ID === val.CategoryId) {
                assetflag = ctgy.AssetFlag;
              }
            });
            if (assetflag) {
              docitem.TranType = financeTranTypeOpeningAsset;
            } else {
              docitem.TranType = financeTranTypeOpeningLiability;
            }
            docitem.ControlCenterId = this.amountFormGroup.value.controlCenter ?? undefined;
            docitem.OrderId = this.amountFormGroup.value.order ?? undefined;
            doc.Items.push(docitem);

            this.odataService.createDocument(doc).subscribe({
              next: (crtdoc) => {
                // Navigate to display mode
                this.router.navigate(['/finance/document/display', crtdoc.Id]);
              },
              error: (err2) => {
                this.modalService.error({
                  nzTitle: translate('Common.Error'),
                  nzContent: err2,
                  nzClosable: true,
                });
              },
            });
          } else {
            // Navigate to display mode
            this.router.navigate(['/finance/account/display', val.Id]);
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
  private onUpdateImpl() {
    const acntobj = this._generateAccount();
    if (!acntobj) {
      return;
    }

    if (!acntobj.onVerify({ Categories: this.arAccountCategories })) {
      popupDialog(this.modalService, 'Common.Error', acntobj.VerifiedMsgs);
      return;
    }

    // Check the dirty control
    const arcontent: any = {};
    // ctgyControl: new FormControl(undefined, [
    //   Validators.required,
    //   // this.categoryValidator,
    // ]),
    // cmtControl: new FormControl('', Validators.maxLength(45)),
    // statusControl: new FormControl(),
    // ownerControl: new FormControl(),

    if (this.headerFormGroup.controls['name'].dirty) {
      arcontent.Name = acntobj.Name;
    }
    if (this.headerFormGroup.controls['comment'].dirty) {
      arcontent.Comment = acntobj.Comment;
    }
    if (this.headerFormGroup.controls['status'].dirty) {
      arcontent.Status = AccountStatusEnum[acntobj.Status];
    }
    if (this.headerFormGroup.controls['owner'].dirty) {
      arcontent.OwnerId = acntobj.OwnerId;
    }

    // Save it
    this.odataService
      .changeAccountByPatch(acntobj.Id ?? 0, arcontent)
      .pipe(takeUntil(this._destroyed$!))
      .subscribe({
        next: (val) => {
          // Navigate to display mode
          this.router.navigate(['/finance/account/display', val.Id]);
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

  private _displayAccountContent(objAcnt: Account): void {
    // Step 0.
    this.headerFormGroup.setValue({
      id: objAcnt.Id ?? null,
      name: objAcnt.Name ?? '',
      category: objAcnt.CategoryId ?? null,
      owner: objAcnt.OwnerId ?? null,
      comment: objAcnt.Comment ?? null,
      status: objAcnt.Status
    });
    // Step 1.
    if (this.isADPAccount) {
      // this.extraADPFormGroup.get('extADPControl')?.setValue(objAcnt.ExtraInfo as AccountExtraAdvancePayment);
    } else if (this.isAssetAccount) {
      // this.extraAssetFormGroup.get('extAssetControl')?.setValue(objAcnt.ExtraInfo as AccountExtraAsset);
    } else if (this.isLoanAccount) {
      // this.extraLoanFormGroup.get('extLoanControl')?.setValue(objAcnt.ExtraInfo as AccountExtraLoan);
    }
  }

  private _generateAccount(): Account {
    const acntObj: Account = new Account();
    acntObj.HID = this.homeSevice.ChosedHome?.ID ?? 0;
    if (this.uiMode === UIMode.Update) {
      acntObj.Id = this.routerID;
    }
    acntObj.Name = this.headerFormGroup.value.name ?? '';
    acntObj.CategoryId = this.headerFormGroup.value.category ?? undefined;
    acntObj.OwnerId = this.headerFormGroup.value.owner ?? '';
    acntObj.Comment = this.headerFormGroup.value.comment ?? '';
    acntObj.Status = this.headerFormGroup.value.status ? this.headerFormGroup.value.status : AccountStatusEnum.Normal;

    if (this.isADPAccount) {
      // ADP
      // acntObj.ExtraInfo = this.extraADPFormGroup.get('extADPControl')?.value;
    } else if (this.isAssetAccount) {
      // Asset
      // acntObj.ExtraInfo = this.extraAssetFormGroup.get('extAssetControl')?.value;
    } else if (this.isLoanAccount) {
      // Loan
      // acntObj.ExtraInfo = this.extraLoanFormGroup.get('extLoanControl')?.value;
    }

    return acntObj;
  }
}

