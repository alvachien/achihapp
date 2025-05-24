import { Component, forwardRef, HostListener, Input, Output, EventEmitter, inject } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormsModule,
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { translate, TranslocoModule } from '@jsverse/transloco';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { RouterModule } from '@angular/router';
import { UIMode } from 'actslib';

import {
  DocumentHeader,
  Currency,
  financeDocTypeCurrencyExchange,
  financeDocTypeNormal,
  ModelUtility,
  ConsoleLogTypeEnum,
  DocumentType,
} from '../../../../model';

@Component({
  standalone: true,
  selector: 'hih-fin-document-header',
  templateUrl: './document-header.component.html',
  styleUrls: ['./document-header.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentHeaderComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DocumentHeaderComponent),
      multi: true,
    },
  ],
  imports: [
    NzFormModule,
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzSelectModule,
    NzInputNumberModule,
    NzDatePickerModule,
    TranslocoModule,
    NzModalModule,
    RouterModule,
  ]
})
export class DocumentHeaderComponent implements ControlValueAccessor, Validator {
  private _isChangable = true; // Default is changable
  private _doctype?: number;
  private _uiMode: UIMode = UIMode.Invalid;

  private _arCurrencies: Currency[] = [];
  private _arDocTypes: DocumentType[] = [];
  private _baseCurr = '';

  @Input()
  set arDocTypes(doctypes: DocumentType[]) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_APP [Debug]: Entering DocumentHeaderComponent arDocTypes setter: ${doctypes ? 'NOT NULL and length is ' + doctypes.length : 'NULL'}`,
      ConsoleLogTypeEnum.debug
    );
    if (doctypes && doctypes.length > 0) {
      this._arDocTypes = doctypes;
    }
  }
  get arDocTypes(): DocumentType[] {
    return this._arDocTypes;
  }
  @Input()
  set arCurrencies(currs: Currency[]) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_APP [Debug]: Entering DocumentHeaderComponent arCurrencies setter: ${currs ? 'NOT NULL and length is ' + currs.length : 'NULL'}`,
      ConsoleLogTypeEnum.debug
    );
    if (currs && currs.length > 0) {
      this._arCurrencies = currs;
    }
  }
  get arCurrencies(): Currency[] {
    return this._arCurrencies;
  }
  @Input()
  get currentUIMode(): UIMode {
    return this._uiMode;
  }
  set currentUIMode(mode: UIMode) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_APP [Debug]: Entering DocumentHeaderComponent currentUIMode setter`,
      ConsoleLogTypeEnum.debug
    );
    if (this._uiMode !== mode) {
      this._uiMode = mode;
      if (this._uiMode === UIMode.Display || this._uiMode === UIMode.Invalid) {
        this.setDisabledState(true);
      } else if (this._uiMode === UIMode.Create || this._uiMode === UIMode.Update) {
        this.setDisabledState(false);
      }
    }
  }
  @Input()
  get docType(): number | undefined {
    return this._doctype;
  }
  set docType(dt: number | undefined) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_APP [Debug]: Entering DocumentHeaderComponent docType setter: ${dt}`,
      ConsoleLogTypeEnum.debug
    );

    this._doctype = dt;
    if (this.headerForm) {
      this.headerForm.value.docType = dt;
    }
  }
  @Input()
  get baseCurrency(): string {
    return this._baseCurr;
  }
  set baseCurrency(curr: string) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_APP [Debug]: Entering DocumentHeaderComponent baseCurrency setter: ${curr}`,
      ConsoleLogTypeEnum.debug
    );
    if (curr) {
      this._baseCurr = curr;
      if (this.headerForm && this.isCurrencyEditable && !this.headerForm.value.currency) {
        ModelUtility.writeConsoleLog(
          `AC_HIH_APP [Debug]: Entering DocumentHeaderComponent baseCurrency setter, set form control: ${curr}`,
          ConsoleLogTypeEnum.debug
        );
        this.headerForm.value.currency = this._baseCurr;
      }
    }
  }
  @Output()
  currencyChanged: EventEmitter<string> = new EventEmitter();
  @Output()
  currency2Changed: EventEmitter<string> = new EventEmitter();

  public headerForm: FormGroup; //<DocumentHeaderForm>;

  getCurrencyWithLabel(cr: Currency): string {
    return cr ? translate(cr.Name!) + ' - ' + cr.Symbol : '';
  }
  get isTranDateEditable(): boolean {
    return (
      this._isChangable &&
      (this.currentUIMode === UIMode.Create ||
        (this.currentUIMode === UIMode.Update && this.docType === financeDocTypeNormal))
    );
  }
  get isCurrencyExchangeDocument(): boolean {
    return this.docType === financeDocTypeCurrencyExchange;
  }
  get value(): DocumentHeader {
    console.debug('Entering get value() of DocumentHeaderComponent');

    const insobj: DocumentHeader = new DocumentHeader();
    insobj.DocType = this.headerForm.controls['docType'].value ?? undefined;
    insobj.TranCurr = this.headerForm.controls['currency'].value ?? '';
    insobj.TranDate = this.headerForm.controls['docDate'].value ?? new Date();
    insobj.Desp = this.headerForm.controls['desp'].value ?? '';

    if (this.isForeignCurrency) {
      insobj.ExgRate = this.headerForm.controls['exchangeRate'].value ?? undefined;
      insobj.ExgRate_Plan = this.headerForm.controls['exchangeRateIsPlan'].value ?? undefined;
    } else {
      insobj.ExgRate = undefined;
      insobj.ExgRate_Plan = undefined;
    }
    if (this.isCurrencyExchangeDocument) {
      insobj.TranCurr2 = this.headerForm.controls['secondCurrency'].value ?? '';
      if (this.isForeignCurrency2) {
        insobj.ExgRate2 = this.headerForm.controls['secondExchangeRate'].value ?? undefined;
        insobj.ExgRate_Plan2 = this.headerForm.controls['secondExchangeRateIsPlan'].value ?? undefined;
      } else {
        insobj.ExgRate2 = undefined;
        insobj.ExgRate_Plan2 = undefined;
      }
    } else {
      insobj.TranCurr2 = undefined;
      insobj.ExgRate2 = undefined;
      insobj.ExgRate_Plan2 = undefined;
    }
    return insobj;
  }
  get isFieldChangable(): boolean {
    return this._isChangable && (this.currentUIMode === UIMode.Update || this.currentUIMode === UIMode.Create);
  }
  get tranCurrency(): string {
    return this.headerForm.controls['currency'].value ?? '';
  }
  get isForeignCurrency(): boolean {
    return this.headerForm.controls['currency']?.value ? this.headerForm.controls['currency'].value !== this.baseCurrency : false;
  }
  get tranCurrency2(): string {
    return this.headerForm.value.secondCurrency ?? '';
  }
  get isForeignCurrency2(): boolean {
    return this.headerForm.controls['secondCurrency'].value ? this.headerForm.controls['secondCurrency'].value !== this.baseCurrency : false;
  }
  get isCurrencyEditable(): boolean {
    return (
      this._isChangable &&
      (this.currentUIMode === UIMode.Create ||
        (this.currentUIMode === UIMode.Update && this.docType === financeDocTypeNormal))
    );
  }
  get isExchangeRateEditable(): boolean {
    return this.isCurrencyEditable;
  }
  get isCurrency2Editable(): boolean {
    return (
      this._isChangable &&
      (this.currentUIMode === UIMode.Create ||
        (this.currentUIMode === UIMode.Update && this.docType === financeDocTypeNormal))
    );
  }
  get isExchangeRate2Editable(): boolean {
    return this.isCurrency2Editable;
  }

  private readonly formBuilder = inject(FormBuilder);
  private _onChange = (value: any) => {};
  private _onTouched = () => {};

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentHeaderComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.headerForm = this.formBuilder.group({
      docType: this.formBuilder.control<number | null>({ value: this.docType ?? null, disabled: true }, [Validators.required]),
      docDate: this.formBuilder.control<Date | null>(new Date(), [Validators.required]),
      desp: this.formBuilder.control<string>('', [Validators.required, Validators.maxLength(44)]),
      currency: this.formBuilder.control<string>('', [Validators.required]),
      exchangeRate: this.formBuilder.control<number | null>(null, [DocumentHeaderComponent.exchangeRateMissingValidator('currency', this.baseCurrency)]),
      exchangeRateIsPlan: this.formBuilder.control<boolean | null>(null),
      secondCurrency: this.formBuilder.control<string | null>(null, [
        this.curr2MissingValidator,
        this.currencyMustDiffForExchgValidator,
      ]),
      secondExchangeRate: this.formBuilder.control<number | null>(null, [this.exchangeRate2MissingValidator]),
      secondExchangeRateIsPlan: this.formBuilder.control<boolean | null>(null),
    });
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
    this.headerForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  writeValue(val: DocumentHeader): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentHeaderComponent writeValue...',
      ConsoleLogTypeEnum.debug
    );

    if (val) {
      this.headerForm.patchValue({
        docType: val.DocType ? val.DocType : (this.docType ?? null),
        docDate: val.TranDate ?? null,
        desp: val.Desp,
        currency: val.TranCurr,
        exchangeRate: val.ExgRate ?? null,
        exchangeRateIsPlan: val.ExgRate_Plan ?? null,
        secondCurrency: val.TranCurr2 ?? null,
        secondExchangeRate: val.ExgRate2 ?? null,
        secondExchangeRateIsPlan: val.ExgRate_Plan2 ?? null,
      }, {
        onlySelf: true,
        emitEvent: false
      });
    }
  }

  setDisabledState(isDisabled: boolean): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentHeaderComponent setDisabledState...',
      ConsoleLogTypeEnum.debug
    );
    if (isDisabled) {
      this.headerForm.disable();
      this._isChangable = false;
    } else {
      this.headerForm.enable();
      this.headerForm.controls['docType'].disable(); // doc. type cannot be edit
      this._isChangable = true;
    }
  }

  validate(c: AbstractControl): ValidationErrors | null {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentHeaderComponent validate.',
      ConsoleLogTypeEnum.debug
    );

    // Not editable, then just return
    if (!this.isFieldChangable) {
      return null;
    }

    if (this.headerForm.valid) {
      // Beside the basic form valid, it need more checks
      return null;
    } else {
      return Object.values(this.headerForm.controls)
        .filter(c => c.errors)
        .map(c => c.errors);
    }
  }

  onCurrencyChange(event: any): void {
    if (event) {
      if (event.Currency) {
        this.currencyChanged.emit((event as Currency).Currency!);
      } else {
        this.currencyChanged.emit(event);
      }
    }
  }

  onCurrency2Change(event: any): void {
    if (event) {
      if (event.Currency) {
        this.currency2Changed.emit((event as Currency).Currency!);
      } else {
        this.currency2Changed.emit(event);
      }
    }
  }

  public static exchangeRateMissingValidator(dependentControlName: string, basecurr: string, errorKey: string = 'validationError', errorMessage: string = 'validation failed'): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const formGroup = control.parent;
      if (!formGroup) return null;
      
      const dependentControl = formGroup.get(dependentControlName);
      if (!dependentControl || !dependentControl.value) return null;

      if (basecurr && basecurr !== dependentControl.value) {
        const isExist =  control.value ? true : false;
        if (!isExist) {
          return {['MissingExchangeRate']: 'Missing Exchange Rate when using currency other than base currency'}
        }  
      }

      return null;
    };
  }

  private exchangeRate2MissingValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (this.isCurrencyExchangeDocument && this.isForeignCurrency2) {
      if (!this.headerForm.value.secondExchangeRate) {
        return { required: true };
      }
    }

    return null;
  };

  private curr2MissingValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (this.isCurrencyExchangeDocument) {
      if (!this.headerForm.value.secondCurrency) {
        return { required: true };
      }
    }

    return null;
  };

  private currencyMustDiffForExchgValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (this.isCurrencyExchangeDocument) {
      if (
        this.headerForm.value.secondCurrency  &&
        this.headerForm.value.tranCurrency &&
        this.headerForm.value.secondCurrency === this.headerForm.value.tranCurrency
      ) {
        return { currencyMustDiff: true };
      }
    }

    return null;
  };
}
