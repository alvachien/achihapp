import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { DecimalPipe } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';

import { DocumentHeaderComponent } from '../document-header';
import { UIMode, isUIEditable } from 'actslib';
import { ReplaySubject, forkJoin, takeUntil, finalize } from 'rxjs';
import { ControlCenter, AccountCategory, TranType, UIAccountForSelection, UIOrderForSelection, Currency, 
  ModelUtility, ConsoleLogTypeEnum, getUIModeString, BuildupAccountForSelection, Account, Order, 
  BuildupOrderForSelectionEx, Document, DocumentItem, DocumentType,
  financeDocTypeNormal,
} from '../../../../model';
import { FinanceStorageService, HomeDefineStorageService } from '../../../../services';

interface DocumentDetailForm {
  id: FormControl<number | null>;
  header: FormControl<Document | null>;
}

@Component({
  selector: 'hih-document-detail',
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    DocumentHeaderComponent,
    NzInputModule,
    NzButtonModule,
    TranslocoModule,
    RouterModule,
    NzModalModule,
    DecimalPipe,
    NzTableModule,
  ],
  templateUrl: './document-detail.component.html',
  styleUrl: './document-detail.component.less'
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isLoadingResults = false;
  public routerID = -1; // Current object ID in routing
  public currentMode = '';
  public uiMode: UIMode = UIMode.Create;
  public currentDocument: Document;
  // Attributes
  baseCurrency: string;
  arControlCenters: ControlCenter[] = [];
  arAccountCategories: AccountCategory[] = [];
  arDocTypes: DocumentType[] = [];
  arTranType: TranType[] = [];
  arUIAccounts: UIAccountForSelection[] = [];
  arUIOrders: UIOrderForSelection[] = [];
  arCurrencies: Currency[] = [];
  // Form group
  docFormGroup: FormGroup;  

  get isFieldChangable(): boolean {
    return isUIEditable(this.uiMode);
  }

  private readonly homeService = inject(HomeDefineStorageService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly odataService = inject(FinanceStorageService);
  private readonly modalService = inject(NzModalService);
  private readonly router = inject(Router);
  private readonly cd = inject(ChangeDetectorRef);
  private readonly formBuilder = inject(FormBuilder);
  public getCurrencyName(curr: string): string {
    const curobj = this.arCurrencies.find((c) => {
      return c.Currency === curr;
    });
    return curobj ? translate(curobj.Name!) + `(${curr})` : curr;
  }
  public getDocTypeName(dtid: number) {
    const dtobj = this.arDocTypes.find((dt: any) => {
      return dt.Id === dtid;
    });
    return dtobj ? translate(dtobj.Name!) : dtid.toString();
  }
  public getAccountName(acntid: number): string {
    const acntObj = this.arUIAccounts.find((acnt) => {
      return acnt.Id === acntid;
    });
    return acntObj && acntObj.Name ? acntObj.Name : '';
  }
  public getControlCenterName(ccid: number): string {
    const ccObj = this.arControlCenters.find((cc) => {
      return cc.Id === ccid;
    });
    return ccObj ? ccObj.Name : '';
  }
  public getOrderName(ordid: number): string {
    const orderObj = this.arUIOrders.find((ord) => {
      return ord.Id === ordid;
    });
    return orderObj ? orderObj.Name : '';
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranType.find((tt) => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentDetailComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.currentDocument = new Document();
    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';
    // this.docHeader = {
    //   docType: financeDocTypeNormal as number,
    // };
    this.docFormGroup = this.formBuilder.group<DocumentDetailForm>({
      id: this.formBuilder.control(null),
      header: this.formBuilder.control(this.currentDocument, [Validators.required]),
    });
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );
    this._destroyed$ = new ReplaySubject(1);
    this.cd.detectChanges();

    this.activateRoute.url.subscribe((x) => {
      ModelUtility.writeConsoleLog(
        `AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit, activateRoute: ${x}`,
        ConsoleLogTypeEnum.debug
      );

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

          // Read the document
          forkJoin([
            this.odataService.fetchAllCurrencies(),
            this.odataService.fetchAllDocTypes(),
            this.odataService.fetchAllTranTypes(),
            this.odataService.fetchAllAccountCategories(),
            this.odataService.fetchAllAccounts(),
            this.odataService.fetchAllControlCenters(),
            this.odataService.fetchAllOrders(),
            this.odataService.readDocument(this.routerID),
          ])
            .pipe(
              takeUntil(this._destroyed$!),
              finalize(() => {
                this.isLoadingResults = false;
              })
            )
            .subscribe({
              next: (rsts) => {
                this.arCurrencies = rsts[0] as Currency[];
                this.arDocTypes = rsts[1] as DocumentType[];
                this.arTranType = rsts[2] as TranType[];
                this.arAccountCategories = rsts[3] as AccountCategory[];
                this.arUIAccounts = BuildupAccountForSelection(rsts[4] as Account[], rsts[3] as AccountCategory[]);
                this.arControlCenters = rsts[5] as ControlCenter[];
                this.currentDocument = rsts[7] as Document;
                const arorders = rsts[6] as Order[];
                this.arUIOrders = BuildupOrderForSelectionEx(arorders, this.currentDocument.TranDate);

                // Check the accounts in use
                const listAcntIDs = this.currentDocument.Items.map((item) => {
                  return item.AccountId;
                });
                const listNIDs: number[] = [];
                listAcntIDs.forEach((acntid) => {
                  if (this.arUIAccounts.findIndex((acnt) => acnt.Id === acntid) === -1) {
                    listNIDs.push(acntid!);
                  }
                });

                if (listNIDs.length > 0) {
                  const listRst: any = [];
                  listNIDs.forEach((nid) => {
                    listRst.push(this.odataService.readAccount(nid));
                  });

                  // Read the account
                  forkJoin(listRst)
                    .pipe(
                      takeUntil(this._destroyed$!),
                      finalize(() => {
                        this.onSetData();
                      })
                    )
                    .subscribe({
                      next: () => {
                        this.arUIAccounts = [];
                        this.arUIAccounts = BuildupAccountForSelection(
                          this.odataService.Accounts,
                          this.odataService.AccountCategories
                        );
                      },
                      error: (err) => {
                        this.uiMode = UIMode.Invalid;
                        this.modalService.create({
                          nzTitle: translate('Common.Error'),
                          nzContent: err.toString(),
                          nzClosable: true,
                        });
                      },
                    });
                } else {
                  this.onSetData();
                }
              },
              error: (err) => {
                ModelUtility.writeConsoleLog(
                  `AC_HIH_UI [Error]: Failed in DocumentDetailComponent ngOninit, forkJoin : ${err}`,
                  ConsoleLogTypeEnum.error
                );

                this.uiMode = UIMode.Invalid;
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
        default:
          break;
      }
    });
  }

  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  private onSetData() {
    this.docFormGroup.get('idControl')?.setValue(this.currentDocument.Id);
    this.docFormGroup.get('headerControl')?.setValue(this.currentDocument);
    this.docFormGroup.get('itemsControl')?.setValue(this.currentDocument.Items);

    if (this.uiMode === UIMode.Display) {
      this.docFormGroup.disable();
    } else {
      this.odataService.isDocumentChangable(this.routerID).subscribe({
        next: (val) => {
          if (val) {
            this.docFormGroup.enable();
            this.docFormGroup.get('idControl')?.disable();
          } else {
            const ref: NzModalRef = this.modalService.info({
              nzTitle: translate('Common.Error'),
              nzContent: translate('Finance.EditDocumentNotAllowed'),
              nzClosable: false,
            });
            setTimeout(() => {
              ref.close();
              ref.destroy();
            }, 1000);

            setTimeout(() => {
              this.uiMode = UIMode.Display;
              this.docFormGroup.disable();
            });
          }
        },
        error: (err) => {
          this.uiMode = UIMode.Display;
          this.docFormGroup.disable();
          this.modalService.create({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
    }
  }

  onSave(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentDetailComponent onSave...',
      ConsoleLogTypeEnum.debug
    );
    if (this.uiMode === UIMode.Update) {
      // Update mode.
      const detailObject = this.docFormGroup.get('headerControl')?.value as Document;
      detailObject.HID = this.currentDocument.HID;
      detailObject.Id = this.currentDocument.Id;
      detailObject.DocType = this.currentDocument.DocType;
      detailObject.Items = this.docFormGroup.get('itemsControl')?.value as DocumentItem[];
      detailObject.Items.forEach((item) => {
        item.DocId = detailObject.Id;
      });

      this.odataService.changeDocument(detailObject).subscribe({
        next: (val) => {
          const ref: NzModalRef = this.modalService.success({
            nzTitle: translate('Common.Success'),
            nzContent: translate('Finance.EditDocumentSuccessfully'),
          });
          setTimeout(() => {
            ref.close();
            ref.destroy();
          }, 1000);

          this.router.navigate(['/finance/document/display', val.Id]);
        },
        error: (err) => {
          console.error(err);
          this.modalService.create({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
    }
  }

  onChangeToEditMode(): void {
    if (this.routerID) {
      this.odataService.isDocumentChangable(this.routerID).subscribe({
        next: (val) => {
          if (val) {
            this.router.navigate(['/finance/document/edit/', this.routerID]);
          } else {
            const ref: NzModalRef = this.modalService.info({
              nzTitle: translate('Common.Error'),
              nzContent: translate('Finance.EditDocumentNotAllowed'),
              nzClosable: false,
            });
            setTimeout(() => {
              ref.close();
              ref.destroy();
            }, 1000);

            setTimeout(() => {
              this.uiMode = UIMode.Display;
              this.docFormGroup.disable();
            });
          }
        },
        error: (err) => {
          this.uiMode = UIMode.Display;
          this.docFormGroup.disable();
          this.modalService.create({
            nzTitle: translate('Common.Error'),
            nzContent: err.toString(),
            nzClosable: true,
          });
        },
      });
    }
  }
}
