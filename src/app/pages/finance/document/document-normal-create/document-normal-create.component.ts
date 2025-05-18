import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { DocumentHeaderComponent } from '../document-header';
import { DocumentItemComponent } from '../document-item/document-item.component';
import { TranslocoModule } from '@jsverse/transloco';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { Account, AccountCategory, BuildupAccountForSelection, BuildupOrderForSelectionEx, ConsoleLogTypeEnum, ControlCenter, 
  Currency, DocumentHeader, DocumentType, financeDocTypeNormal, ModelUtility, Order, TranType, 
  UIAccountForSelection, UIOrderForSelection, Document, DocumentItem, } from '../../../../model';
import { UIMode } from 'actslib';
import { FinanceStorageService, HomeDefineStorageService } from '../../../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { forkJoin, takeUntil, finalize, ReplaySubject } from 'rxjs';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { popupDialog } from '../../../message-dialog';

@Component({
  selector: 'hih-document-normal-create',
  imports: [
    NzPageHeaderModule,
    NzBreadCrumbModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    DocumentHeaderComponent,
    DocumentItemComponent,
    TranslocoModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
  ],
  templateUrl: './document-normal-create.component.html',
  styleUrl: './document-normal-create.component.less'
})
export class DocumentNormalCreateComponent implements OnInit, OnDestroy {
  currentMode = 'Common.Create';
  isFieldChangable = true;
  uiMode: UIMode = UIMode.Create;
  docFormGroup: FormGroup;
  docHeader: DocumentHeader;
  docItems: DocumentItem[] = [];
  listOfControl: Array<{ id: number; controlInstance: string }> = [];
  isLoadingResults = false;
  docCurrency: string;
  // Attributes
  baseCurrency: string;
  arControlCenters: ControlCenter[] = [];
  arAccountCategories: AccountCategory[] = [];
  arDocTypes: DocumentType[] = [];
  arTranType: TranType[] = [];
  arUIAccounts: UIAccountForSelection[] = [];
  arAccounts: Account[] = [];
  arOrders: Order[] =[];
  arUIOrders: UIOrderForSelection[] = [];
  arCurrencies: Currency[] = [];
  private _destroyed$: ReplaySubject<boolean> | null = null;
  isDocPosting = false;
  docIdCreated?: number;
  docPostingFailed = '';

  private readonly formBuilder = inject(FormBuilder);
  private readonly homeService = inject(HomeDefineStorageService);
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly odataService = inject(FinanceStorageService);
  private readonly modalService = inject(NzModalService);
  private readonly router = inject(Router);

  constructor() {
    this.docHeader = new DocumentHeader();
    this.baseCurrency = this.homeService.ChosedHome?.BaseCurrency ?? '';
    this.docCurrency = this.baseCurrency;

    this.docFormGroup = this.formBuilder.group({
      id: this.formBuilder.control(null),
      header: this.formBuilder.control(this.docHeader, [Validators.required]),
      items: this.formBuilder.array([])
    });
  }
  get items() {
    return this.docFormGroup.get('items') as FormArray;
  }

  ngOnInit(): void {
    this._destroyed$ = new ReplaySubject(1);

    forkJoin([
      this.odataService.fetchAllCurrencies(),
      this.odataService.fetchAllDocTypes(),
      this.odataService.fetchAllTranTypes(),
      this.odataService.fetchAllAccountCategories(),
      this.odataService.fetchAllAccounts(),
      this.odataService.fetchAllControlCenters(),
      this.odataService.fetchAllOrders()
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
          this.arAccounts = rsts[4] as Account[];
          this.arUIAccounts = BuildupAccountForSelection(this.arAccounts, rsts[3] as AccountCategory[]);
          this.arControlCenters = rsts[5] as ControlCenter[];
          this.arOrders = rsts[6] as Order[];
          this.arUIOrders = BuildupOrderForSelectionEx(this.arOrders, new Date());

          this.docHeader.TranCurr = this.baseCurrency;
          this.docHeader.DocType = financeDocTypeNormal;
        },
        error: err => {
          console.error(err);
        }
      });
  }
  
  ngOnDestroy(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug
    );

    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  onCurrencyChanged(event: any) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onCurrencyChanged: ${event}...`,
      ConsoleLogTypeEnum.debug
    );

    this.docCurrency = event;
  }

  get isSaveAllowed(): boolean {
    if(this.isFieldChangable) {
      this.docFormGroup.updateValueAndValidity({ onlySelf: false });
      this.items.controls.forEach(control => {
        control.updateValueAndValidity({ onlySelf: false, emitEvent: true });
        
        // // 要是控件属于FormGroup或者FormArray类型，就递归调用此方法
        // if (control instanceof FormGroup || control instanceof FormArray) {
        //   this.updateFormArrayValidity(control as FormArray);
        // }
      });

      if (this.docFormGroup.valid) {
        // Check items
        if (this.docItems.length > 0) {

        }

        return true;
      }
    }
    return false;
  }

  onSave(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onSave...',
      ConsoleLogTypeEnum.debug
    );

    // Save the doc
    const detailObject: Document = this._generateDocObject();
    if (
      !detailObject.onVerify({
        ControlCenters: this.arControlCenters,
        Orders: this.arOrders,
        Accounts: this.arAccounts,
        DocumentTypes: this.arDocTypes,
        TransactionTypes: this.arTranType,
        Currencies: this.arCurrencies,
        BaseCurrency: this.homeService.ChosedHome?.BaseCurrency ?? '',
      })
    ) {
      ModelUtility.writeConsoleLog(
        'AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onSave, onVerify failed...',
        ConsoleLogTypeEnum.debug
      );

      popupDialog(this.modalService, 'Common.Error', detailObject.VerifiedMsgs);
      this.isDocPosting = false;

      return;
    }

    // Now call to the service
    this.odataService
      .createDocument(detailObject)
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        takeUntil(this._destroyed$!),
        finalize(() => {
          this.isDocPosting = false;
        })
      )
      .subscribe({
        next: (doc) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_UI [Debug]: Entering DocumentNormalCreateComponent onSave createDocument...',
            ConsoleLogTypeEnum.debug
          );
          this.docIdCreated = doc.Id;
          this.docPostingFailed = '';
        },
        error: (err) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering DocumentNormalCreateComponent onSave createDocument: ${err}`,
            ConsoleLogTypeEnum.error
          );
          this.docIdCreated = undefined;
          this.docPostingFailed = err;
        },
      });
  }

  onDisplayCreatedDoc(): void {
    if (this.docIdCreated !== null) {
      this.router.navigate(['/finance/document/display/' + this.docIdCreated?.toString()]);
    }
  }

  onReset(): void {
    this.router.navigate(['/finance/document/createnormal']);
  }

  getItemControlName(i: number) {
    return `item-${i+1}`;
  }

  addItem(e?: MouseEvent): void {
    e?.preventDefault();
    
    this.items.push(this.formBuilder.control(null, Validators.required));

    // const id = this.listOfControl.length > 0 ? this.listOfControl[this.listOfControl.length - 1].id + 1 : 0;
    // const control = {
    //   id,
    //   controlInstance: `item-${id}`
    // };
    // const index = this.listOfControl.push(control);
    // //console.log(this.listOfControl[this.listOfControl.length - 1]);
    // this.docFormGroup.addControl(
    //   this.listOfControl[index - 1].controlInstance,
    //   this.formBuilder.control(null, Validators.required)
    // );
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  // removeField(i: { id: number; controlInstance: string }, e: MouseEvent): void {
  //   e.preventDefault();

  //   if (this.listOfControl.length > 1) {
  //     const index = this.listOfControl.indexOf(i);
  //     this.listOfControl.splice(index, 1);
  //     //console.log(this.listOfControl);
  //     this.docFormGroup.removeControl(i.controlInstance);
  //   }
  // }  

  private _generateDocObject(): Document {
    const detailObject: Document = new Document();
    const docheader = this.docFormGroup.value.header as DocumentHeader;
    detailObject.HID = this.homeService.ChosedHome?.ID ?? 0;
    detailObject.DocType = docheader.DocType;
    detailObject.Desp = docheader.Desp;
    detailObject.TranCurr = docheader.TranCurr;
    detailObject.TranDate = docheader.TranDate;
    // detailObject.DocType = this.curDocType;
    // detailObject.Items = this.itemsForm.get('itemControl')?.value as DocumentItem[];

    return detailObject;
  }
}
