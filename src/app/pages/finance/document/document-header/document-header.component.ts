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
import { TranslocoModule } from '@jsverse/transloco';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { RouterModule } from '@angular/router';
import { UIMode } from 'actslib';

import {
  Document,
  Currency,
  financeDocTypeCurrencyExchange,
  financeDocTypeNormal,
  ModelUtility,
  ConsoleLogTypeEnum,
  DocumentType,
} from '../../../../model';

@Component({
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
  private _onTouched?: () => void = undefined;
  private _onChange?: (val: any) => void = undefined;
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
  get value(): Document {
    const insobj: Document = new Document();
    insobj.DocType = this.headerForm.value.docType ?? undefined;
    insobj.TranCurr = this.headerForm.value.currency ?? '';
    insobj.TranDate = this.headerForm.value.docDate ?? new Date();
    insobj.Desp = this.headerForm.value.desp ?? '';

    if (this.isForeignCurrency) {
      insobj.ExgRate = this.headerForm.get('exgControl')?.value;
      insobj.ExgRate_Plan = this.headerForm.get('exgpControl')?.value;
    } else {
      insobj.ExgRate = undefined;
      insobj.ExgRate_Plan = undefined;
    }
    if (this.isCurrencyExchangeDocument) {
      insobj.TranCurr2 = this.headerForm.get('curr2Control')?.value;
      if (this.isForeignCurrency2) {
        insobj.ExgRate2 = this.headerForm.get('exg2Control')?.value;
        insobj.ExgRate_Plan2 = this.headerForm.get('exgp2Control')?.value;
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
    return this.headerForm.value.currency ?? '';
  }
  get isForeignCurrency(): boolean {
    return this.headerForm.value.currency ? this.headerForm.value.currency !== this.baseCurrency : false;
  }
  get tranCurrency2(): string {
    return this.headerForm.value.secondCurrency ?? '';
  }
  get isForeignCurrency2(): boolean {
    return this.headerForm.value.secondCurrency ? this.headerForm.value.secondCurrency !== this.baseCurrency : false;
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

  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentHeaderComponent constructor...',
      ConsoleLogTypeEnum.debug
    );

    this.headerForm = this.formBuilder.group({
      docType: this.formBuilder.control({ value: this.docType ?? null, disabled: true }, [Validators.required]),
      docDate: this.formBuilder.control(new Date(), [Validators.required]),
      desp: this.formBuilder.control('', [Validators.required, Validators.maxLength(44)]),
      currency: this.formBuilder.control(null, [Validators.required]),
      exchangeRate: this.formBuilder.control(null, [this.exchangeRateMissingValidator]),
      exchangeRateIsPlan: this.formBuilder.control(null),
      secondCurrency: this.formBuilder.control(null, [
        this.curr2MissingValidator,
        this.currencyMustDiffForExchgValidator,
      ]),
      secondExchangeRate: this.formBuilder.control(null, [this.exchangeRate2MissingValidator]),
      secondExchangeRateInPlan: this.formBuilder.control(null),
    });
  }

  @HostListener('change') onChange(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentHeaderComponent onChange...',
      ConsoleLogTypeEnum.debug
    );
    if (this._onChange) {
      this._onChange(this.value);
    }
  }
  @HostListener('blur') onTouched(): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentHeaderComponent onTouched...',
      ConsoleLogTypeEnum.debug
    );
    if (this._onTouched) {
      this._onTouched();
    }
  }

  writeValue(val: Document): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentHeaderComponent writeValue...',
      ConsoleLogTypeEnum.debug
    );

    if (val) {
      this.headerForm.setValue({
        docType: val.DocType ? val.DocType : (this.docType ?? null),
        docDate: val.TranDate ?? null,
        desp: val.Desp,
        currency: val.TranCurr,
        exchangeRate: val.ExgRate ?? null,
        exchangeRateIsPlan: val.ExgRate_Plan ?? null,
        secondCurrency: val.TranCurr2 ?? null,
        secondExchangeRate: val.ExgRate2 ?? null,
        secondExchangeRateInPlan: val.ExgRate_Plan2 ?? null,
      });
    }
  }

  registerOnChange(fn: any): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentHeaderComponent registerOnChange...',
      ConsoleLogTypeEnum.debug
    );
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentHeaderComponent registerOnTouched...',
      ConsoleLogTypeEnum.debug
    );
    this._onTouched = fn;
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
      this.headerForm.get('docTypeControl')?.disable(); // doc. type cannot be edit
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

    this.headerForm.updateValueAndValidity();
    if (this.headerForm.valid) {
      // Beside the basic form valid, it need more checks
      return null;
    } else {
      return this.headerForm.errors;
    }
  }

  onCurrencyChange(event: any): void {
    if (event) {
      if (event.Currency) {
        this.currencyChanged.emit((event as Currency).Currency!);
      } else {
        this.currencyChanged.emit(event);
      }

      this.onChange();
    }
  }

  onCurrency2Change(event: any): void {
    if (event) {
      if (event.Currency) {
        this.currency2Changed.emit((event as Currency).Currency!);
      } else {
        this.currency2Changed.emit(event);
      }

      this.onChange();
    }
  }

  private exchangeRateMissingValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (this.isForeignCurrency) {
      if (!this.headerForm.get('exgControl')?.value) {
        return { required: true };
      }
    }

    return null;
  };

  private exchangeRate2MissingValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (this.isCurrencyExchangeDocument && this.isForeignCurrency2) {
      if (!this.headerForm.get('exg2Control')?.value) {
        return { required: true };
      }
    }

    return null;
  };

  private curr2MissingValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (this.isCurrencyExchangeDocument) {
      if (!this.headerForm.get('curr2Control')?.value) {
        return { required: true };
      }
    }

    return null;
  };

  private currencyMustDiffForExchgValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    if (this.isCurrencyExchangeDocument) {
      if (
        this.headerForm.get('curr2Control')?.value &&
        this.headerForm.get('currControl')?.value &&
        this.headerForm.get('curr2Control')?.value === this.headerForm.get('currControl')?.value
      ) {
        return { currencyMustDiff: true };
      }
    }

    return null;
  };
}
