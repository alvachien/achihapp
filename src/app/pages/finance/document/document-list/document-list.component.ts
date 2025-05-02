import { DecimalPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { ReplaySubject, forkJoin, takeUntil, finalize } from 'rxjs';
import { format, addMonths, } from 'date-fns';

import { GeneralFilterItem, Currency, Account, UIAccountForSelection, AccountCategory, DocumentType, 
  ControlCenter, Order, UIOrderForSelection, TranType, ITableFilterValues, ModelUtility, ConsoleLogTypeEnum, 
  BuildupAccountForSelection, BuildupOrderForSelection, GeneralFilterOperatorEnum, 
  GeneralFilterValueType, BaseListModel, DateDisplayFormat, Document,
} from '../../../../model';
import { FinanceStorageService, HomeDefineStorageService } from '../../../../services';

@Component({
  selector: 'hih-document-list',
  imports: [
    NzSpinModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzInputModule,
    NzDividerModule,
    NzDropDownModule,
    NzTableModule,
    NzDatePickerModule,
    NzPopconfirmModule,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslocoModule,
    NzButtonModule,
    NzMenuModule,
    NzDropDownModule,
    NzModalModule,
    RouterModule,
  ],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.less'
})
export class DocumentListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean> | null = null;
  private _filterDocItem: GeneralFilterItem[] = [];
  private _isInitialized = false;
  isLoadingResults = false;
  shortcutDocID?: number;

  mapOfExpandData: { [key: string]: boolean } = {};
  public arCurrencies: Currency[] = [];
  public arDocTypes: DocumentType[] = [];
  public arAccounts: Account[] = [];
  public arUIAccounts: UIAccountForSelection[] = [];
  public arAccountCategories: AccountCategory[] = [];
  public arControlCenters: ControlCenter[] = [];
  public arOrders: Order[] = [];
  public arUIOrders: UIOrderForSelection[] = [];
  public arTranTypes: TranType[] = [];
  public selectedRange: any[] = [];
  // Table
  pageIndex = 1;
  pageSize = 20;
  listOfDocs: Document[] = [];
  totalDocumentCount = 1;
  listCurrencyFilters: ITableFilterValues[] = [];
  listDocTypeFilters: ITableFilterValues[] = [];

  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome?.IsChild ?? false;
  }

  private readonly odataService = inject(FinanceStorageService);
  private readonly router = inject(Router);
  private readonly modalService = inject(NzModalService);
  private readonly homeService = inject(HomeDefineStorageService);
  private readonly viewContainerRef = inject(ViewContainerRef);

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentListComponent constructor...',
      ConsoleLogTypeEnum.debug
    );
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentListComponent ngOnInit...',
      ConsoleLogTypeEnum.debug
    );

    this._destroyed$ = new ReplaySubject(1);
    this._isInitialized = true;

    this.selectedRange = [addMonths(new Date(), -1), new Date()];

    this.isLoadingResults = true;
    const arseqs = [
      this.odataService.fetchAllDocTypes(),
      this.odataService.fetchAllCurrencies(),
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders(),
    ];
    forkJoin(arseqs)
      .pipe(
        takeUntil(this._destroyed$),
        finalize(() => {
          this.isLoadingResults = false;
        })
      )
      .subscribe({
        next: (val: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering DocumentListComponent ngOnInit, forkJoin...',
            ConsoleLogTypeEnum.debug
          );

          this.arDocTypes = val[0];
          this.arCurrencies = val[1];
          this.arAccountCategories = val[2];
          this.arTranTypes = val[3];
          this.arAccounts = val[4];
          this.arControlCenters = val[5];
          this.arOrders = val[6];
          this.arUIAccounts = BuildupAccountForSelection(this.arAccounts, this.arAccountCategories);
          this.arUIOrders = BuildupOrderForSelection(this.arOrders);

          let arfilters: any[] = [];
          this.arCurrencies.forEach((cur) => {
            arfilters.push({
              value: cur.Currency,
              text: translate(cur.Name!),
            });
          });
          this.listCurrencyFilters = arfilters.slice();

          arfilters = [];
          this.arDocTypes.forEach((dt: any) => {
            arfilters.push({
              value: dt.Id,
              text: translate(dt.Name!),
            });
          });
          this.listDocTypeFilters = arfilters.slice();
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering DocumentListComponent ngOnInit, forkJoin failed ${err}`,
            ConsoleLogTypeEnum.error
          );

          // Error
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
      'AC_HIH_APP [Debug]: Entering DocumentListComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

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
    const acntObj = this.arAccounts.find((acnt) => {
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
    const orderObj = this.arOrders.find((ord) => {
      return ord.Id === ordid;
    });
    return orderObj ? orderObj.Name : '';
  }
  public getTranTypeName(ttid: number): string {
    const tranTypeObj = this.arTranTypes.find((tt) => {
      return tt.Id === ttid;
    });

    return tranTypeObj ? tranTypeObj.Name : '';
  }

  onQueryParamsChange(params: NzTableQueryParams) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentListComponent onQueryParamsChange...',
      ConsoleLogTypeEnum.debug
    );

    const { pageSize, pageIndex, sort } = params;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    const currentSort = sort.find((item) => item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = (currentSort && currentSort.value) || null;
    let fieldName = '';
    switch (sortField) {
      case 'curr':
        fieldName = 'Currency';
        break;
      case 'date':
        fieldName = 'TranDate';
        break;
      case 'doctype':
        fieldName = 'DocType';
        break;
      case 'desp':
        fieldName = 'Desp';
        break;
      default:
        break;
    }
    let fieldOrder = '';
    switch (sortOrder) {
      case 'ascend':
        fieldOrder = 'asc';
        break;
      case 'descend':
        fieldOrder = 'desc';
        break;
      default:
        break;
    }

    if (this._isInitialized) {
      this.fetchData(fieldName && fieldOrder ? { field: fieldName, order: fieldOrder, } : undefined);
    }
  }

  fetchData(orderby?: { field: string; order: string }): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentListComponent fetchData...',
      ConsoleLogTypeEnum.debug
    );

    this.isLoadingResults = true;
    const bgn = this.selectedRange.length > 0 ? this.selectedRange[0] : new Date();
    const end = this.selectedRange.length > 1 ? this.selectedRange[1] : new Date();

    this._filterDocItem = [];
    this._filterDocItem.push({
      fieldName: 'TranDate',
      operator: GeneralFilterOperatorEnum.Between,
      lowValue: format(bgn, DateDisplayFormat),
      highValue: format(end, DateDisplayFormat),
      valueType: GeneralFilterValueType.number,
    });

    if (this.homeService.CurrentMemberInChosedHome!.IsChild) {
      this._filterDocItem.push({
        fieldName: 'Createdby',
        operator: GeneralFilterOperatorEnum.Equal,
        lowValue: `${this.homeService.CurrentMemberInChosedHome!.User}`,
        highValue: ``,
        valueType: GeneralFilterValueType.string,
      });
    }

    this.odataService
      .fetchAllDocuments(
        this._filterDocItem,
        this.pageSize,
        this.pageIndex >= 1 ? (this.pageIndex - 1) * this.pageSize : 0,
        orderby
      )
      .pipe(
        takeUntil(this._destroyed$!),
        finalize(() => (this.isLoadingResults = false))
      )
      .subscribe({
        next: (revdata: BaseListModel<Document>) => {
          if (revdata) {
            if (revdata.totalCount) {
              this.totalDocumentCount = +revdata.totalCount;
            } else {
              this.totalDocumentCount = 0;
            }

            this.listOfDocs = revdata.contentList.slice();
          } else {
            this.totalDocumentCount = 0;
            this.listOfDocs = [];
          }
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering DocumentListComponent fetchData, fetchAllDocuments failed ${err}...`,
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

  public onRangeChange(event: any): void {
    this.fetchData();
  }
  public onCreateNormalDocument(): void {
    this.router.navigate(['/finance/document/createnormal']);
  }
  public onCreateTransferDocument(): void {
    this.router.navigate(['/finance/document/createtransfer']);
  }
  public onCreateADPDocument(): void {
    this.router.navigate(['/finance/document/createadp']);
  }
  public onCreateADRDocument(): void {
    this.router.navigate(['/finance/document/createadr']);
  }
  public onCreateExgDocument(): void {
    this.router.navigate(['/finance/document/createexg']);
  }
  public onCreateAssetBuyInDocument(): void {
    this.router.navigate(['/finance/document/createassetbuy']);
  }
  public onCreateAssetSoldOutDocument(): void {
    this.router.navigate(['/finance/document/createassetsold']);
  }
  public onCreateBorrowFromDocument(): void {
    this.router.navigate(['/finance/document/createbrwfrm']);
  }
  public onCreateLendToDocument(): void {
    this.router.navigate(['/finance/document/createlendto']);
  }
  public onCreateAssetValChgDocument(): void {
    this.router.navigate(['/finance/document/createassetvalchg']);
  }
  public onCreateRepayDocument(): void {
    this.router.navigate(['/finance/document/createloanrepay']);
  }
  public onDisplayDocument(doc: Document): void {
    this.onDisplay(doc.Id!);
  }
  public onMassCreateNormalDocument(): void {
    this.router.navigate(['/finance/document/masscreatenormal']);
  }
  public onMassCreateRecurredDocument(): void {
    this.router.navigate(['/finance/document/masscreaterecurred']);
  }
  public onDisplay(docid: number): void {
    this.router.navigate(['/finance/document/display/', docid]);
  }
  public onEdit(docid: number): void {
    this.router.navigate(['/finance/document/edit/', docid]);
  }
  public onDelete(docid: number): void {
    this.odataService.deleteDocument(docid).subscribe({
      next: () => {
        // Show dialog.
        const ref: NzModalRef = this.modalService.success({
          nzTitle: translate('Common.Success'),
          nzContent: translate('Finance.DeleteDocumentSuccessfully'),
        });
        setTimeout(() => {
          ref.close();
          ref.destroy();
        }, 1000);

        // Need refresh
        this.fetchData();
      },
      error: (err: any) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_APP [Error]: Entering DocumentListComponent onDelete, failed ${err}...`,
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
  public onChangeDate(docid: number, docdate: Date): void {
    // // Change the account name
    // const modal = this.modalService.create({
    //   nzTitle: translate('Finance.ChangeDate'),
    //   nzContent: DocumentChangeDateDialogComponent,
    //   nzViewContainerRef: this.viewContainerRef,
    //   nzData: {
    //     documentid: docid,
    //     documentdate: docdate.toDate(),
    //   },
    //   // nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
    // });
    // modal.afterClose.subscribe(() => {
    //   this.fetchData();
    // });
  }
  public onChangeDesp(docid: number, docdesp: string): void {
    // // Change the account name
    // const modal = this.modalService.create({
    //   nzTitle: translate('Finance.ChangeDate'),
    //   nzContent: DocumentChangeDespDialogComponent,
    //   nzViewContainerRef: this.viewContainerRef,
    //   nzData: {
    //     documentid: docid,
    //     documentdesp: docdesp,
    //   },
    //   // nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000)),
    // });
    // modal.afterClose.subscribe(() => {
    //   this.fetchData();
    // });
  }
  public onOpenShortCutDocID(): void {
    if (this.shortcutDocID) {
      this.onDisplay(this.shortcutDocID!);
    }
  }
}
