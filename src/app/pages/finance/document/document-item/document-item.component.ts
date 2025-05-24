import { Component, forwardRef, HostListener, inject, Input, input, OnChanges, SimpleChanges, } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, FormsModule, NG_VALIDATORS, NG_VALUE_ACCESSOR, 
  ReactiveFormsModule, ValidationErrors, Validator, Validators } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { ConsoleLogTypeEnum, ControlCenter, DocumentItem, ModelUtility, TranType, UIAccountForSelection, UIOrderForSelection } from '../../../../model';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { costObjectValidator } from '../../../../uimodel';
import { UIMode } from 'actslib';

@Component({
  selector: 'hih-document-item',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,    
    NzAutocompleteModule,
    TranslocoModule,
    NzGridModule,
    NzInputNumberModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentItemComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DocumentItemComponent),
      multi: true
    }
  ],
  templateUrl: './document-item.component.html',
  styleUrl: './document-item.component.less'
})
export class DocumentItemComponent implements ControlValueAccessor, Validator {
  itemFormGroup: FormGroup;
  arUIAccounts = input.required<UIAccountForSelection[]>();
  arTranType = input.required<TranType[]>();
  arControlCenters = input.required<ControlCenter[]>();
  arUIOrders = input.required<UIOrderForSelection[]>();
  docCurrency = input.required<string>();
  private _uiMode: UIMode = UIMode.Update;
  private readonly formBuilder = inject(FormBuilder);

  private _onChange = (value: DocumentItem | null) => {};
  private _onTouched = () => {};

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
  get isFieldChangable(): boolean {
    return this.currentUIMode === UIMode.Update || this.currentUIMode === UIMode.Create;
  }

  constructor() {
    this.itemFormGroup = this.formBuilder.group({
      account: this.formBuilder.control<number | null>(null, [Validators.required]),
      tranType: this.formBuilder.control<number | null>(null, [Validators.required]),
      tranAmount: this.formBuilder.control<number | null>(0, [Validators.required]),
      desp: this.formBuilder.control<string | null>('', [Validators.required]),
      controlCenter: this.formBuilder.control<number | null>(null),
      order: this.formBuilder.control<number | null>(null),      
    }, { validators: costObjectValidator });
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
    this.itemFormGroup.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }  

  setDisabledState(isDisabled: boolean): void {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentItemComponent setDisabledState...',
      ConsoleLogTypeEnum.debug
    );
    if (isDisabled) {
      this.itemFormGroup.disable();
      this._uiMode = UIMode.Display;
    } else {
      this.itemFormGroup.enable();
      this._uiMode = UIMode.Update;
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering DocumentItemComponent validate.',
      ConsoleLogTypeEnum.debug
    );

    // Not editable, then just return
    if (!this.isFieldChangable) {
      return null;
    }

    //this.itemFormGroup.updateValueAndValidity();    
    if (this.itemFormGroup.valid) {
      // Beside the basic form valid, it need more checks
      return null;
    } else {
      // Error on controls
      let ctrlerrs = Object.values(this.itemFormGroup.controls)
        .filter(c => c.errors)
        .map(c => c.errors);
      if (ctrlerrs && ctrlerrs.length > 0) {
        return ctrlerrs;
      }
      // Error of the validator
      if (this.itemFormGroup.errors) {
        return this.itemFormGroup.errors;
      }
      
      return null;
    }
  }

  writeValue(value: DocumentItem): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_APP [Debug]: Entering DocumentItemComponent writeValue: ${value}`,
      ConsoleLogTypeEnum.debug
    );
    if (value) {
      this.itemFormGroup.patchValue({
        account: value.AccountId,
        tranType: value.TranType,
        tranAmount: value.TranAmount,
        desp: value.Desp,
        controlCenter: value.ControlCenterId ?? null,
        order: value.OrderId ?? null
      }, { emitEvent: false });
    }
  }
  get value(): DocumentItem {
    ModelUtility.writeConsoleLog(
      `AC_HIH_APP [Debug]: Entering DocumentItemComponent value getter`,
      ConsoleLogTypeEnum.debug
    );

    const rtnobj = new DocumentItem();
    rtnobj.AccountId = this.itemFormGroup.get('account')?.value ?? undefined;
    rtnobj.TranType = this.itemFormGroup.get('tranType')?.value ?? undefined;
    rtnobj.TranAmount = this.itemFormGroup.get('tranAmount')?.value ?? undefined;
    rtnobj.Desp = this.itemFormGroup.get('desp')?.value ?? undefined;
    rtnobj.ControlCenterId = this.itemFormGroup.get('controlCenter')?.value ?? undefined;
    rtnobj.OrderId = this.itemFormGroup.get('order')?.value ?? undefined;
    return rtnobj;
  }
}
