import { inject, Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { DocumentType, AccountCategory, AssetCategory, ConsoleLogTypeEnum, Currency, ModelUtility, TranType } from '../model';
import { AuthService } from './auth.service';
import { HomeDefineStorageService } from './home-define-storage.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FinanceStorageService {
  private isCurrencylistLoaded = false;
  private listCurrency: Currency[] = [];
  private isAcntCtgyListLoaded = false;
  private listAccountCategory: AccountCategory[] = [];
  private isDocTypeListLoaded = false;
  private listDocType: DocumentType[] = [];
  private isTranTypeListLoaded = false;
  private listTranType: TranType[] = [];
  private isAsstCtgyListLoaded = false;
  private listAssetCategory: AssetCategory[] = [];

  // Buffer in current page.
  get Currencies(): Currency[] {
    return this.listCurrency;
  }
  get AccountCategories(): AccountCategory[] {
    return this.listAccountCategory;
  }

  get DocumentTypes(): DocumentType[] {
    return this.listDocType;
  }

  get TranTypes(): TranType[] {
    return this.listTranType;
  }

  get AssetCategories(): AssetCategory[] {
    return this.listAssetCategory;
  }

  private readonly http = inject(HttpClient);
  private readonly authService  = inject(AuthService);
  private readonly homeService = inject(HomeDefineStorageService);
  
  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering FinanceOdataService constructor...',
      ConsoleLogTypeEnum.debug
    );
  }

  /**
   * fetch all currencies, and save it to buffer
   * @param forceReload set to true to enforce reload all currencies
   */
  public fetchAllCurrencies(forceReload?: boolean): Observable<Currency[]> {
    if (!this.isCurrencylistLoaded || forceReload) {
      const currencyAPIUrl: string = environment.ApiUrl + '/Currencies';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');

      return this.http
        .get(currencyAPIUrl, {
          headers,
          params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllCurrencies in FinanceOdataService`,
              ConsoleLogTypeEnum.debug
            );

            this.listCurrency = [];
            const rjs: any = response;
            const amt = rjs['@odata.count'];
            if (rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: Currency = new Currency();
                rst.onSetData(si);
                this.listCurrency.push(rst);
              }
            }

            this.isCurrencylistLoaded = true;
            return this.listCurrency;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Failed in fetchAllCurrencies in FinanceOdataService: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this.isCurrencylistLoaded = false;
            this.listCurrency = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
    } else {
      return of(this.Currencies);
    }
  }

  /**
   * fetch all account categories, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   */
  public fetchAllAccountCategories(forceReload?: boolean): Observable<AccountCategory[]> {
    if (!this.isAcntCtgyListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome?.ID ?? 0;
      const apiurl: string = environment.ApiUrl + `/FinanceAccountCategories`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,AssetFlag,Comment');
      params = params.append('$filter', `HomeID eq ${hid} or HomeID eq null`);

      return this.http
        .get(apiurl, {
          headers,
          params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllAccountCategories in FinanceOdataService`,
              ConsoleLogTypeEnum.debug
            );

            this.listAccountCategory = [];

            const rjs = response as any;
            // const amt = rjs['@odata.count'];
            if (rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: AccountCategory = new AccountCategory();
                rst.onSetData(si);
                this.listAccountCategory.push(rst);
              }
            }

            this.isAcntCtgyListLoaded = true;

            return this.listAccountCategory;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Failed in fetchAllAccountCategories in FinanceOdataService: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this.isAcntCtgyListLoaded = false;
            this.listAccountCategory = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
    } else {
      return of(this.AccountCategories);
    }
  }

  /**
   * fetch all document types, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   */
  public fetchAllDocTypes(forceReload?: boolean): Observable<DocumentType[]> {
    if (!this.isDocTypeListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome?.ID ?? 0;
      const apiurl: string = environment.ApiUrl + `/FinanceDocumentTypes`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,Comment');
      params = params.append('$filter', `HomeID eq ${hid} or HomeID eq null`);

      return this.http
        .get(apiurl, {
          headers,
          params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllDocTypes in FinanceOdataService.`,
              ConsoleLogTypeEnum.debug
            );

            this.listDocType = [];

            const rjs = response as any;
            // const amt = rjs['@odata.count'];
            if (rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: DocumentType = new DocumentType();
                rst.onSetData(si);
                this.listDocType.push(rst);
              }
            }

            this.isDocTypeListLoaded = true;

            return this.listDocType;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Failed in fetchAllDocTypes in FinanceOdataService: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this.isDocTypeListLoaded = false;
            this.listDocType = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
    } else {
      return of(this.DocumentTypes);
    }
  }

  /**
   * fetch all transaction types, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   */
  public fetchAllTranTypes(forceReload?: boolean): Observable<TranType[]> {
    if (!this.isTranTypeListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome?.ID ?? 0;
      const apiurl: string = environment.ApiUrl + `/FinanceTransactionTypes`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,Expense,ParID,Comment');
      params = params.append('$filter', `HomeID eq ${hid} or HomeID eq null`);

      return this.http
        .get(apiurl, {
          headers,
          params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering FinanceOdataService fetchAllTranTypes`,
              ConsoleLogTypeEnum.debug
            );

            this.listTranType = [];

            const rjs = response as any;
            // const amt = rjs['@odata.count'];
            if (rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: TranType = new TranType();
                rst.onSetData(si);
                this.listTranType.push(rst);
              }
            }

            // Prepare for the hierarchy
            this.buildTranTypeHierarchy(this.listTranType);

            // Sort it
            this.listTranType.sort((a: any, b: any) => {
              if (a.Expense) {
                if (b.Expense) {
                  // Both are expense
                  return a.FullDisplayText.localeCompare(b.FullDisplayText);
                } else {
                  return 1;
                }
              } else {
                if (b.Expense) {
                  return -1;
                } else {
                  // Both are income
                  return a.FullDisplayText.localeCompare(b.FullDisplayText);
                }
              }
            });

            this.isTranTypeListLoaded = true;

            return this.listTranType;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering FinanceOdataService fetchAllTranTypes failed ${error}`,
              ConsoleLogTypeEnum.error
            );

            this.isTranTypeListLoaded = false;
            this.listTranType = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
    } else {
      return of(this.TranTypes);
    }
  }

  /**
   * fetch all asset categories, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   */
  public fetchAllAssetCategories(forceReload?: boolean): Observable<AssetCategory[]> {
    if (!this.isAsstCtgyListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome?.ID ?? 0;
      const apiurl: string = environment.ApiUrl + `/FinanceAssetCategories`;

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,Desp');
      params = params.append('$filter', `HomeID eq ${hid} or HomeID eq null`);

      return this.http
        .get(apiurl, {
          headers,
          params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering map in fetchAllAssetCategories in FinanceOdataService`,
              ConsoleLogTypeEnum.debug
            );

            this.listAssetCategory = [];
            const rjs = response as any;
            // const amt = rjs['@odata.count'];
            if (rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: AssetCategory = new AssetCategory();
                rst.onSetData(si);
                this.listAssetCategory.push(rst);
              }
            }
            this.isAsstCtgyListLoaded = true;

            return this.listAssetCategory;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Failed in fetchAllAssetCategories in FinanceOdataService: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this.isAsstCtgyListLoaded = false;
            this.listAssetCategory = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
    } else {
      return of(this.AssetCategories);
    }
  }

  // Private methods
  private buildTranTypeHierarchy(listTranType: TranType[]): void {
    listTranType.forEach((value: any) => {
      if (!value.ParId) {
        value.HierLevel = 0;
        value.FullDisplayText = value.Name;

        this.buildTranTypeHierarchyImpl(value, listTranType, 1);
      }
    });
  }

  private buildTranTypeHierarchyImpl(par: TranType, listTranType: TranType[], curLvl: number): void {
    listTranType.forEach((value: any) => {
      if (value.ParId === par.Id) {
        value.HierLevel = curLvl;
        value.FullDisplayText = par.FullDisplayText + '.' + value.Name;

        this.buildTranTypeHierarchyImpl(value, listTranType, value.HierLevel + 1);
      }
    });
  }
}
