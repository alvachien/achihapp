/***
 * UI Model
 *
 * UI Models with UI Framework dependent
 */

import { ValidatorFn, ValidationErrors, AbstractControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzTableSortOrder, NzTableSortFn, NzTableFilterList, NzTableFilterFn } from 'ng-zorro-antd/table';
import { ConsoleLogTypeEnum, DocumentHeader, DocumentItem, DocumentType, Document, financeDocTypeCurrencyExchange, ModelUtility } from '../model';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Validator for date range
 * @param group Instance of the form group
 */
export const dateRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const strdt = group.get('startDateControl')?.value as Date;
  if (!strdt) {
    return { invalidStartDate: true };
  }
  const enddt = group.get('endDateControl')?.value as Date;
  if (!enddt) {
    return { invalidEndDate: true };
  }
  // const startDate: moment.Moment = moment(strdt).startOf('day');
  // const endDate: moment.Moment = moment(enddt).startOf('day');
  // if (!endDate.isSameOrAfter(startDate)) {
  //   return { invalidDateRange: true };
  // }

  return null;
};

/**
 * Validator for cost object
 * @param group Instance of the form group
 */
export const costObjectValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const cc: any = group.value.controlCenter ?? undefined; //.get('ccControl')?.value;
  const order: any = group.value.order ?? undefined; //.get('orderControl')?.value;
  // console.debug(`Entering costObjectValidator with cc = ${cc} and order = ${order}`);
  // const cc: any = group.get('ccControl')?.value;
  // const order: any = group.get('orderControl')?.value;
  if (cc) {
    if (order) {
      return { costobjectoverassign: true };
    }
  } else {
    if (!order) {
      return { nocostobject: true };
    }
  }
  // console.debug(`Exiting costObjectValidator with successful`);

  return null;
};

/**
 * Validator for doc items
 * @param group Instance of the form group
 */
// export const itemExistenceValidator: ValidatorFn = (group: FormGroup): ValidationErrors | null => {
//   let items: any = group.get('itemControl').value;
//   if (items instanceof Array) {
//     if (items.length === 0) {
//       return { noitem: true };
//     }
//   } else {
//     return { invaliditems: true };
//   }

//   return null;
// };

/**
 * Column item definition interface for nz-table
 */
export interface UITableColumnItem<T> {
  name: string;

  // Sort
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<T> | null;
  sortDirections: NzTableSortOrder[];

  // Filter
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<T> | null;
  filterMultiple: boolean;
}

// Get document header from component DocumentHeaderComponent
//
export const getDocumentHeaderValue = (headerFormValue: any, baseCurr: string, insobj: Document): DocumentHeader => {
  ModelUtility.writeConsoleLog(
    'AC_HIH_APP [Debug]: Entering getDocumentHeaderValue...',
    ConsoleLogTypeEnum.debug
  );

  insobj.DocType = headerFormValue.docType ?? undefined;
  insobj.TranCurr = headerFormValue.currency ?? '';
  insobj.TranDate = headerFormValue.docDate ?? new Date();
  insobj.Desp = headerFormValue.desp ?? '';

  if (insobj.TranCurr !== baseCurr) {
    insobj.ExgRate = headerFormValue.exchangeRate ?? undefined;
    insobj.ExgRate_Plan = headerFormValue.exchangeRateIsPlan ?? undefined;
  } else {
    insobj.ExgRate = undefined;
    insobj.ExgRate_Plan = undefined;
  }
  if (insobj.DocType === financeDocTypeCurrencyExchange) {
    // insobj.TranCurr2 = headerForm.controls['secondCurrency'].value ?? '';
    // if (this.isForeignCurrency2) {
    //   insobj.ExgRate2 = headerForm.controls['secondExchangeRate'].value ?? undefined;
    //   insobj.ExgRate_Plan2 = headerForm.controls['secondExchangeRateIsPlan'].value ?? undefined;
    // } else {
    //   insobj.ExgRate2 = undefined;
    //   insobj.ExgRate_Plan2 = undefined;
    // }
  } else {
    insobj.TranCurr2 = undefined;
    insobj.ExgRate2 = undefined;
    insobj.ExgRate_Plan2 = undefined;
  }

  return insobj;
}

// Get document item from component DocumentItemComponent
export const getDocumentItemValue = (itemFormValue: any): DocumentItem => {
  const docitem: DocumentItem = new DocumentItem();
  docitem.AccountId = itemFormValue.account ?? undefined;
  docitem.TranType = itemFormValue.tranType ?? undefined;
  docitem.TranAmount = itemFormValue.tranAmount ?? undefined;
  docitem.Desp = itemFormValue.desp ?? undefined;
  docitem.ControlCenterId = itemFormValue.controlCenter ?? undefined;
  docitem.OrderId = itemFormValue.order ?? undefined;

  return docitem;
}
