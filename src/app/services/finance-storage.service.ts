import { inject, Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { format } from 'date-fns';

import { DocumentType, AccountCategory, AssetCategory, ConsoleLogTypeEnum, Currency, ModelUtility, TranType, ControlCenter, Order, 
  Account, Document, AccountStatusEnum, financeAccountCategoryAdvancePayment, financeAccountCategoryAdvanceReceived, 
  AccountExtraAdvancePayment, GeneralFilterItem, BaseListModel, getFilterString, FinanceTmpDPDocFilter, TemplateDocADP,
  FinanceAssetValChgDocumentAPI, FinanceAssetSoldoutDocumentAPI, FinanceAssetBuyinDocumentAPI,
  DateDisplayFormat,
  FinanceTmpLoanDocFilter,
  TemplateDocLoan
} from '../model';
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
  private isConctrolCenterListLoaded = false;
  private listControlCenter: ControlCenter[] = [];
  private isOrderListLoaded = false;
  private listOrder: Order[] = [];
  private isAccountListLoaded = false;
  private listAccount: Account[] = [];

  readonly accountAPIUrl: string = environment.ApiUrl + '/FinanceAccounts';
  readonly controlCenterAPIUrl: string = environment.ApiUrl + '/FinanceControlCenters';
  readonly orderAPIUrl: string = environment.ApiUrl + '/FinanceOrders';
  readonly documentAPIUrl: string = environment.ApiUrl + '/FinanceDocuments';
  readonly docItemViewAPIUrl: string = environment.ApiUrl + '/FinanceDocumentItemViews';
  readonly planAPIUrl: string = environment.ApiUrl + '/FinancePlans';
  readonly reportAPIUrl: string = environment.ApiUrl + '/FinanceReports';

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
  get Accounts(): Account[] {
    return this.listAccount;
  }
  get ControlCenters(): ControlCenter[] {
    return this.listControlCenter;
  }
  get Orders(): Order[] {
    return this.listOrder;
  }

  private readonly http = inject(HttpClient);
  private readonly authService  = inject(AuthService);
  private readonly homeService = inject(HomeDefineStorageService);
  
  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering FinanceStorageService constructor...',
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
              `AC_HIH_APP [Debug]: Entering map in fetchAllCurrencies in FinanceStorageService`,
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
              `AC_HIH_APP [Error]: Failed in fetchAllCurrencies in FinanceStorageService: ${error}`,
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
              `AC_HIH_APP [Debug]: Entering map in fetchAllAccountCategories in FinanceStorageService`,
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
              `AC_HIH_APP [Error]: Failed in fetchAllAccountCategories in FinanceStorageService: ${error}`,
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
              `AC_HIH_APP [Debug]: Entering map in fetchAllDocTypes in FinanceStorageService.`,
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
              `AC_HIH_APP [Error]: Failed in fetchAllDocTypes in FinanceStorageService: ${error}`,
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
              `AC_HIH_APP [Debug]: Entering FinanceStorageService fetchAllTranTypes`,
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
              `AC_HIH_APP [Error]: Entering FinanceStorageService fetchAllTranTypes failed ${error}`,
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
              `AC_HIH_APP [Debug]: Entering map in fetchAllAssetCategories in FinanceStorageService`,
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
              `AC_HIH_APP [Error]: Failed in fetchAllAssetCategories in FinanceStorageService: ${error}`,
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


  /**
   * fetch all control centers, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   */
  public fetchAllControlCenters(forceReload?: boolean): Observable<ControlCenter[]> {
    if (!this.isConctrolCenterListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome?.ID ?? 0;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,ParentID,Comment');
      if (this.homeService.CurrentMemberInChosedHome?.IsChild ?? false) {
        params = params.append(
          '$filter',
          `HomeID eq ${hid} and Owner eq '${this.homeService.CurrentMemberInChosedHome?.User}'`
        );
      } else {
        params = params.append('$filter', `HomeID eq ${hid}`);
      }

      return (
        this.http
          .get<any>(this.controlCenterAPIUrl, {
            headers,
            params,
          })
          // .retry(3)
          .pipe(
            map((response: any) => {
              ModelUtility.writeConsoleLog(
                `AC_HIH_APP [Debug]: Entering FinanceStorageService, fetchAllControlCenters, map.`,
                ConsoleLogTypeEnum.debug
              );

              this.listControlCenter = [];
              const rjs: any = response;
              const amt = rjs['@odata.count'];
              if (rjs.value instanceof Array && rjs.value.length > 0) {
                for (const si of rjs.value) {
                  const rst: ControlCenter = new ControlCenter();
                  rst.onSetData(si);
                  this.listControlCenter.push(rst);
                }
              }

              this.isConctrolCenterListLoaded = true;
              return this.listControlCenter;
            }),
            catchError((error: HttpErrorResponse) => {
              ModelUtility.writeConsoleLog(
                `AC_HIH_APP [Error]: Failed in FinanceStorageService fetchAllControlCenters.`,
                ConsoleLogTypeEnum.error
              );

              this.isConctrolCenterListLoaded = false;
              this.listControlCenter = [];

              return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
            })
          )
      );
    } else {
      return of(this.ControlCenters);
    }
  }

  /**
   * Read control center, save/update the buffer
   * @param ccid ID of the control center
   */
  public readControlCenter(ccid: number): Observable<ControlCenter> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.controlCenterAPIUrl;
    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome?.ID ?? 0} and ID eq ${ccid}`);
    params = params.append('$select', `ID,Name,Comment,Owner,ParentID`);
    return this.http
      .get(apiurl, {
        headers,
        params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering FinanceStorageService readControlCenter`,
            ConsoleLogTypeEnum.debug
          );

          const resdata = response as any;
          const hd: ControlCenter = new ControlCenter();
          if (resdata.value && resdata.value instanceof Array && resdata.value[0]) {
            hd.onSetData(resdata.value[0] as any);
            // Update the buffer if necessary
            const idx: number = this.listControlCenter.findIndex((val: any) => {
              return val.Id === hd.Id;
            });
            if (idx !== -1) {
              this.listControlCenter.splice(idx, 1, hd);
            } else {
              this.listControlCenter.push(hd);
            }
          }

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService readControlCenter failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Create a control center
   * @param objDetail Instance of control center to create
   */
  public createControlCenter(objDetail: ControlCenter): Observable<ControlCenter> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = objDetail.writeJSONString();
    return this.http
      .post(this.controlCenterAPIUrl, jdata, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering FinanceStorageService createControlCenter',
            ConsoleLogTypeEnum.debug
          );

          const hd: ControlCenter = new ControlCenter();
          hd.onSetData(response as any);

          this.listControlCenter.push(hd);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService createControlCenter, failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Change a control center
   * @param objDetail Instance of control center to change
   */
  public changeControlCenter(objDetail: ControlCenter): Observable<ControlCenter> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl = `${this.controlCenterAPIUrl}(${objDetail.Id})`;

    const jdata: string = objDetail.writeJSONString();
    // let params: HttpParams = new HttpParams();
    // params = params.append('hid', this.homeService.ChosedHome.ID.toString());
    return this.http
      .put(apiurl, jdata, {
        headers,
        // params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering FinanceStorageService changeControlCenter',
            ConsoleLogTypeEnum.debug
          );

          const hd: ControlCenter = new ControlCenter();
          hd.onSetData(response as any);

          if (hd && hd.Id) {
            const idx: number = this.listControlCenter.findIndex((val: any) => {
              return val.Id === hd.Id;
            });
            if (idx !== -1) {
              this.listControlCenter.splice(idx, 1, hd);
            } else {
              this.listControlCenter.push(hd);
            }
          }

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService changeControlCenter failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Change a control center by PATCH
   * @param controlCenterID ID of control cetner
   * @param listOfChanges list of changes to be patched
   */
  public changeControlCenterByPatch(controlCenterID: number, listOfChanges: any): Observable<ControlCenter> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.controlCenterAPIUrl + '/' + controlCenterID.toString();

    return this.http
      .patch(apiurl, listOfChanges, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering FinanceStorageService changeControlCenterByPatch',
            ConsoleLogTypeEnum.debug
          );

          const hd: ControlCenter = new ControlCenter();
          hd.onSetData(response as any);

          if (hd && hd.Id) {
            const idx: number = this.listControlCenter.findIndex((val: any) => {
              return val.Id === hd.Id;
            });
            if (idx !== -1) {
              this.listControlCenter.splice(idx, 1, hd);
            } else {
              this.listControlCenter.push(hd);
            }
          }

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService changeControlCenterByPatch failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Delete a control center
   * @param objectId ID of control center to delete
   */
  public deleteControlCenter(objectId: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    return this.http
      .delete(this.controlCenterAPIUrl + `${objectId}`, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering FinanceStorageService deleteControlCenter',
            ConsoleLogTypeEnum.debug
          );

          const extidx = this.listControlCenter.findIndex((cc) => {
            return cc.Id === objectId;
          });
          if (extidx !== -1) {
            this.listControlCenter.splice(extidx, 1);
          }
          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService deleteControlCenter failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * fetch all orders, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   */
  public fetchAllOrders(forceReload?: boolean): Observable<Order[]> {
    if (!this.isOrderListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome?.ID ?? 0;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      // params = params.append('$select', 'ID,HomeID,Name,ParentID,Comment');
      params = params.append('$filter', `HomeID eq ${hid}`);
      params = params.append('$expand', `SRule`);

      return this.http.get(this.orderAPIUrl, { headers, params }).pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering FinanceStorageService fetchAllOrders`,
            ConsoleLogTypeEnum.debug
          );

          this.listOrder = [];
          const rjs: any = response;
          const amt = rjs['@odata.count'];
          if (rjs.value instanceof Array && rjs.value.length > 0) {
            for (const si of rjs.value) {
              const rst: Order = new Order();
              rst.onSetData(si);
              this.listOrder.push(rst);
            }
          }

          this.isOrderListLoaded = true;

          return this.listOrder;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService fetchAllOrders failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          this.isOrderListLoaded = false;

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
    } else {
      return of(this.Orders);
    }
  }

  /**
   * Read the order from API
   * @param ordid Id of Order
   */
  public readOrder(ordid: number): Observable<Order> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome?.ID ?? 0} and ID eq ${ordid}`);
    params = params.append('$expand', `SRule`);
    return this.http
      .get(this.orderAPIUrl, {
        headers,
        params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering FinanceStorageService readOrder`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Order = new Order();
          const repdata = response as any;
          if (repdata && repdata.value instanceof Array && repdata.value.length === 1) {
            hd.onSetData(repdata.value[0]);

            // Update the buffer if necessary
            const idx: number = this.listOrder.findIndex((val: any) => {
              return val.Id === hd.Id;
            });
            if (idx !== -1) {
              this.listOrder.splice(idx, 1, hd);
            } else {
              this.listOrder.push(hd);
            }
          }

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService readOrder failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Create an order
   * @param ord Order instance to create
   */
  public createOrder(objDetail: Order): Observable<Order> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = objDetail.writeJSONString();
    return this.http
      .post(this.orderAPIUrl, jdata, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering FinanceStorageService createOrder.',
            ConsoleLogTypeEnum.debug
          );

          const hd: Order = new Order();
          hd.onSetData(response as any);

          // Buffer it
          this.listOrder.push(hd);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService createOrder failed: ${error}.`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Change an order
   * @param ord Order instance to change
   */
  public changeOrder(objDetail: Order): Observable<Order> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl = `${this.orderAPIUrl}/${objDetail.Id}`;
    const jdata: string = objDetail.writeJSONString();
    return this.http
      .put(apiurl, jdata, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering FinanceStorageService changeOrder`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Order = new Order();
          hd.onSetData(response as any);

          if (hd && hd.Id) {
            const idx: number = this.listOrder.findIndex((val: any) => {
              return val.Id === hd.Id;
            });
            if (idx !== -1) {
              this.listOrder.splice(idx, 1, hd);
            } else {
              this.listOrder.push(hd);
            }
          }

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService changeOrder failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Change an order by PATCH
   * @param orderID ID of Order
   * @param listOfChanges list of changes
   */
  public changeOrderByPatch(orderID: number, listOfChanges: any): Observable<Order> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.orderAPIUrl + '/' + orderID.toString();
    return this.http
      .patch(apiurl, listOfChanges, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering FinanceStorageService changeOrderByPatch`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Order = new Order();
          hd.onSetData(response as any);

          if (hd && hd.Id) {
            const idx: number = this.listOrder.findIndex((val: any) => {
              return val.Id === hd.Id;
            });
            if (idx !== -1) {
              this.listOrder.splice(idx, 1, hd);
            } else {
              this.listOrder.push(hd);
            }
          }

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService changeOrderByPatch failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Delete an order
   * @param orderId Order ID to delete
   */
  public deleteOrder(orderId: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    return this.http
      .delete(this.orderAPIUrl + `(${orderId})`, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering FinanceStorageService deleteOrder succeed.',
            ConsoleLogTypeEnum.debug
          );

          // Buffer it
          const existidx = this.listOrder.findIndex((hd) => {
            return hd.Id === orderId;
          });
          if (existidx !== -1) {
            this.listOrder.splice(existidx, 1);
          }

          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService deleteOrder failed ${error}.`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * fetch all accounts, and save it to buffer
   * @param forceReload set to true to enforce reload all data
   */
  public fetchAllAccounts(forceReload?: boolean): Observable<Account[]> {
    if (!this.isAccountListLoaded || forceReload) {
      const hid = this.homeService.ChosedHome?.ID ?? 0;
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('$select', 'ID,HomeID,Name,CategoryID,Status,Comment');
      if (this.homeService.CurrentMemberInChosedHome?.IsChild ?? false) {
        params = params.append(
          '$filter',
          `HomeID eq ${hid} and Owner eq '${this.homeService.CurrentMemberInChosedHome?.User}'`
        );
      } else {
        params = params.append('$filter', `HomeID eq ${hid}`);
      }

      return this.http
        .get(this.accountAPIUrl, {
          headers,
          params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_APP [Debug]: Entering FinanceStorageService fetchAllAccounts.`,
              ConsoleLogTypeEnum.debug
            );

            this.listAccount = [];
            const rjs = response as any;
            const amt = rjs['@odata.count'];
            if (rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const rst: Account = new Account();
                rst.onSetData(si);
                this.listAccount.push(rst);
              }
            }

            this.isAccountListLoaded = true;
            return this.listAccount;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_APP [Error]: Entering FinanceStorageService fetchAllAccount failed ${error}.`,
              ConsoleLogTypeEnum.error
            );

            this.isAccountListLoaded = false;
            this.listAccount = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
    } else {
      return of(this.Accounts);
    }
  }

  /**
   * Read an account, and save/update the buffer
   * @param acntid ID of the account to read
   */
  public readAccount(acntid: number): Observable<Account> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome?.ID ?? 0} and ID eq ${acntid}`);
    params = params.append('$expand', `ExtraDP,ExtraAsset,ExtraLoan`);
    return this.http
      .get(this.accountAPIUrl, {
        headers,
        params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering FinanceStorageService readAccount`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Account = new Account();
          const repdata = response as any;
          if (repdata && repdata.value instanceof Array && repdata.value[0]) {
            hd.onSetData(repdata.value[0]);

            // Update the buffer if necessary
            const idx: number = this.listAccount.findIndex((val: any) => {
              return val.Id === hd.Id;
            });
            if (idx !== -1) {
              this.listAccount.splice(idx, 1, hd);
            } else {
              this.listAccount.push(hd);
            }
          }

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService readAccount failed: ${error}.`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Create an account
   * @param objAcnt Account to create
   */
  public createAccount(objAcnt: Account): Observable<Account> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = objAcnt.writeJSONString();
    return this.http
      .post(this.accountAPIUrl, jdata, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering FinanceStorageService createAccount succeed',
            ConsoleLogTypeEnum.debug
          );

          const hd: Account = new Account();
          hd.onSetData(response as any);
          this.listAccount.push(hd);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService createAccount failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Change an account
   * @param objAcnt Account to create
   */
  public changeAccount(objAcnt: Account): Observable<Account> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = objAcnt.writeJSONString();
    return this.http
      .put(this.accountAPIUrl + `(${objAcnt.Id})`, jdata, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering FinanceStorageService changeAccount succeed',
            ConsoleLogTypeEnum.debug
          );

          const hd: Account = new Account();
          hd.onSetData(response as any);

          if (hd && hd.Id) {
            // Update the existing item
            const acntidx = this.listAccount.findIndex((acnt) => {
              return acnt.Id === objAcnt.Id;
            });
            if (acntidx !== -1) {
              this.listAccount.splice(acntidx, 1, hd);
            } else {
              this.listAccount.push(hd);
            }
          }

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService changeAccount failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Change an account by PATCH
   * @param accountId Account ID
   * @param listOfChanges list of changes to be patched
   */
  public changeAccountByPatch(accountId: number, listOfChanges: any): Observable<Account> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    return this.http
      .patch(this.accountAPIUrl + `/${accountId}`, listOfChanges, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering FinanceStorageService changeAccountByPatch succeed',
            ConsoleLogTypeEnum.debug
          );

          const hd: Account = new Account();
          hd.onSetData(response as any);

          // Update the existing item
          if (hd && hd.Id) {
            const acntidx = this.listAccount.findIndex((acnt) => {
              return acnt.Id === accountId;
            });
            if (acntidx !== -1) {
              this.listAccount.splice(acntidx, 1, hd);
            } else {
              this.listAccount.push(hd);
            }
          }

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService changeAccountByPatch failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Delete an account
   * @param accoundId Id of account
   */
  public deleteAccount(accountId: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    return this.http
      .delete(this.accountAPIUrl + `(${accountId})`, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering FinanceStorageService deleteAccount succeed',
            ConsoleLogTypeEnum.debug
          );

          const extidx = this.listAccount.findIndex((val) => {
            return val.Id === accountId;
          });
          if (extidx !== -1) {
            this.listAccount.splice(extidx, 1);
          }

          return true;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService deleteAccount failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /* Close an account
   * @param accountId Id of account
   */
  public closeAccount(accountId: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
    const jdata = {
      HomeID: this.homeService.ChosedHome?.ID,
      AccountID: accountId,
    };
    return this.http
      .post(`${this.accountAPIUrl}/CloseAccount`, jdata, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering FinanceStorageService closeAccount succeed',
            ConsoleLogTypeEnum.debug
          );

          const isSucc = response.value as boolean;
          if (isSucc) {
            const extidx = this.listAccount.findIndex((val) => {
              return val.Id === accountId;
            });
            if (extidx !== -1) {
              this.listAccount[extidx].Status = AccountStatusEnum.Closed;
            }
          }

          return isSucc;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService closeAccount failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /** Settle an account with initial amount
   * @param accountId Id of account
   */
  public settleAccount(
    accountId: number,
    settledDate: Date,//moment.Moment,
    amount: number,
    ccid: number
  ): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
    const jdata = {
      HomeID: this.homeService.ChosedHome?.ID,
      AccountID: accountId,
      SettledDate: settledDate, //.format(momentDateFormat),
      InitialAmount: amount,
      ControlCenterID: ccid,
      Currency: this.homeService.ChosedHome?.BaseCurrency,
    };
    return this.http
      .post(`${this.accountAPIUrl}/SettleAccount`, jdata, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering FinanceStorageService settleAccount succeed',
            ConsoleLogTypeEnum.debug
          );

          const isSucc = response.value as boolean;

          return isSucc;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService settleAccount failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Read all documents
   * @param dtbgn Begin date
   * @param dtend End Date
   * @param top The maximum returned amount
   * @param skip Skip the amount
   */
  public fetchAllDocuments(
    filters: GeneralFilterItem[],
    top?: number,
    skip?: number,
    orderby?: { field: string; order: string }
  ): Observable<BaseListModel<Document>> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());
    const hid = this.homeService.ChosedHome?.ID ?? 0;
    let filterstr = `HomeID eq ${this.homeService.ChosedHome?.ID ?? 0}`;
    const subfilter = getFilterString(filters);
    if (subfilter) {
      filterstr += ` and ${subfilter}`;
    }

    let params: HttpParams = new HttpParams();
    params = params.append('$select', 'ID,HomeID,TranDate,DocType,TranCurr,Desp');
    params = params.append('$filter', filterstr);
    if (orderby) {
      params = params.append('$orderby', `${orderby.field} ${orderby.order}`);
    }
    params = params.append('$top', `${top}`);
    params = params.append('$skip', `${skip}`);
    params = params.append('$count', `true`);
    params = params.append('$expand', `Items`);

    return this.http.get(this.documentAPIUrl, { headers, params }).pipe(
      map((response: any) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_APP [Debug]: Entering FinanceStorageService fetchAllDocuments.`,
          ConsoleLogTypeEnum.debug
        );

        const listRst: Document[] = [];
        const rjs: any = response as any;
        const amt = rjs['@odata.count'];
        if (rjs.value instanceof Array && rjs.value.length > 0) {
          for (const si of rjs.value) {
            const rst: Document = new Document();
            rst.onSetData(si);
            listRst.push(rst);
          }
        }
        const rstObj: BaseListModel<Document> = new BaseListModel<Document>();
        rstObj.totalCount = amt;
        rstObj.contentList = listRst;

        return rstObj;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_APP [Error]: Entering FinanceStorageService, fetchAllDocuments failed ${error}`,
          ConsoleLogTypeEnum.error
        );

        return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
      })
    );
  }

  /**
   * Read one document
   * @param docid ID of document
   */
  public readDocument(docid: number): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    let params: HttpParams = new HttpParams();
    params = params.append('$filter', `HomeID eq ${this.homeService.ChosedHome?.ID ?? 0} and ID eq ${docid}`);
    params = params.append('$expand', `Items`);
    return this.http.get(this.documentAPIUrl, { headers, params }).pipe(
      map((response: any) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_APP [Debug]: Entering FinanceStorageService readDocument`,
          ConsoleLogTypeEnum.debug
        );

        const rjs: any = response as any;
        const rst: Document = new Document();
        if (rjs.value instanceof Array && rjs.value.length === 1) {
          rst.onSetData(rjs.value[0]);
        }

        return rst;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_APP [Error]: Entering FinanceStorageService readDocument, failed: ${error}`,
          ConsoleLogTypeEnum.error
        );

        return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
      })
    );
  }

  /**
   * Get ADP tmp docs: for document item overview page
   */
  public fetchAllDPTmpDocs(filter: FinanceTmpDPDocFilter): Observable<TemplateDocADP[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const hid = this.homeService.ChosedHome?.ID ?? 0;
    const filterstrs: string[] = [];
    filterstrs.push(`HomeID eq ${hid}`);
    if (filter.TransactionDateBegin && filter.TransactionDateEnd) {
      const dtbgnfmt = format(filter.TransactionDateBegin, DateDisplayFormat);
      const dtendfmt = format(filter.TransactionDateEnd, DateDisplayFormat);
      filterstrs.push(`TransactionDate ge ${dtbgnfmt}`);
      filterstrs.push(`TransactionDate le ${dtendfmt}`);
    }
    if (filter.IsPosted !== undefined) {
      filterstrs.push(filter.IsPosted ? 'ReferenceDocumentID ne null' : 'ReferenceDocumentID eq null');
    }
    if (filter.AccountID) {
      filterstrs.push(`AccountID eq ${filter.AccountID}`);
    }

    const apiurl: string = environment.ApiUrl + '/FinanceTmpDPDocuments';
    let params: HttpParams = new HttpParams();

    params = params.append('$filter', filterstrs.join(' and '));

    return this.http
      .get(apiurl, {
        headers,
        params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering FinanceStorageService fetchAllDPTmpDocs.`,
            ConsoleLogTypeEnum.debug
          );

          const docADP: TemplateDocADP[] = [];
          const rspdata = (response as any).value;
          if (rspdata instanceof Array && rspdata.length > 0) {
            rspdata.forEach((val: any) => {
              const adoc: TemplateDocADP = new TemplateDocADP();
              adoc.onSetData(val);
              docADP.push(adoc);
            });
          }

          return docADP;
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService, fetchAllDPTmpDocs failed ${errresp}`,
            ConsoleLogTypeEnum.error
          );

          const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
          return throwError(() => new Error(errmsg));
        })
      );
  }

  /**
   * Get Loan tmp docs count for specified account
   * @param accountid Account ID
   */
  public fetchLoanTmpDocCountForAccount(accountid: number): Observable<number> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const hid = this.homeService.ChosedHome?.ID ?? 0;
    const filterstrs: string[] = [];
    filterstrs.push(`HomeID eq ${hid}`);
    filterstrs.push(`AccountID eq ${accountid}`);

    const apiurl: string = environment.ApiUrl + '/FinanceTmpLoanDocuments';
    let params: HttpParams = new HttpParams();
    params = params.append('$filter', filterstrs.join(' and '));
    params = params.append('$count', `true`);

    return this.http
      .get(apiurl, {
        headers,
        params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering FinanceStorageService fetchLoanTmpDocCountForAccount.`,
            ConsoleLogTypeEnum.debug
          );

          return response[`@odata.count`];
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService, fetchLoanTmpDocCountForAccount failed ${errresp}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(`${errresp.status} (${errresp.statusText}) - ${errresp.error}`));
        })
      );
  }

  /**
   * Get Loan tmp docs: for document item overview page
   */
  public fetchAllLoanTmpDocs(filter: FinanceTmpLoanDocFilter): Observable<TemplateDocLoan[]> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const hid = this.homeService.ChosedHome?.ID ?? 0;
    const filterstrs: string[] = [];
    filterstrs.push(`HomeID eq ${hid}`);
    if (filter.TransactionDateBegin && filter.TransactionDateEnd) {
      const dtbgnfmt = format(filter.TransactionDateBegin, DateDisplayFormat);
      const dtendfmt = format(filter.TransactionDateEnd, DateDisplayFormat);
      filterstrs.push(`TransactionDate ge ${dtbgnfmt}`);
      filterstrs.push(`TransactionDate le ${dtendfmt}`);
    }
    if (filter.IsPosted !== undefined) {
      filterstrs.push(filter.IsPosted ? 'ReferenceDocumentID ne null' : 'ReferenceDocumentID eq null');
    }
    if (filter.AccountID) {
      filterstrs.push(`AccountID eq ${filter.AccountID}`);
    }
    if (filter.DocumentID) {
      filterstrs.push(`DocumentID eq ${filter.DocumentID}`);
    }
    if (filter.ControlCenterID) {
      filterstrs.push(`ControlCenterID eq ${filter.ControlCenterID}`);
    }
    if (filter.OrderID) {
      filterstrs.push(`ControlCenterID eq ${filter.OrderID}`);
    }

    const apiurl: string = environment.ApiUrl + '/FinanceTmpLoanDocuments';
    let params: HttpParams = new HttpParams();
    params = params.append('$filter', filterstrs.join(' and '));

    return this.http
      .get(apiurl, {
        headers,
        params,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering FinanceStorageService fetchAllLoanTmpDocs.`,
            ConsoleLogTypeEnum.debug
          );

          const docLoan: TemplateDocLoan[] = [];
          const rspdata = (response as any).value;
          if (rspdata instanceof Array && rspdata.length > 0) {
            rspdata.forEach((val: any) => {
              const ldoc: TemplateDocLoan = new TemplateDocLoan();
              ldoc.onSetData(val);
              docLoan.push(ldoc);
            });
          }

          return docLoan;
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService, fetchAllLoanTmpDocs failed ${errresp}`,
            ConsoleLogTypeEnum.error
          );

          const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
          return throwError(() => new Error(errmsg));
        })
      );
  }

  /**
   * Create a document
   * @param objDetail instance of document which to be created
   */
  public createDocument(objDetail: Document): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const jdata: string = objDetail.writeJSONString();
    return this.http
      .post(this.documentAPIUrl, jdata, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering FinanceStorageService, createDocument, map.`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as any);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService, createDocument failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Create document from DP template doc
   * @param tpDoc Template doc of DP
   */
  public createDocumentFromDPTemplate(tpDoc: TemplateDocADP): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = environment.ApiUrl + `/FinanceTmpDPDocuments/PostDocument`;

    return this.http
      .post(
        apiurl,
        {
          AccountID: tpDoc.AccountId,
          DocumentID: tpDoc.DocId,
          HomeID: this.homeService.ChosedHome?.ID ?? 0,
        },
        {
          headers,
        }
      )
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering FinanceStorageService, createDocumentFromDPTemplate`,
            ConsoleLogTypeEnum.debug
          );

          const ndoc: Document = new Document();
          ndoc.onSetData(response as any);
          return ndoc;
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService, createDocumentFromDPTemplate failed: ${errresp}`,
            ConsoleLogTypeEnum.error
          );

          const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
          return throwError(() => new Error(errmsg));
        })
      );
  }

  /**
   * Delete the document
   * @param docid ID fo the doc
   */
  public deleteDocument(docid: number): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '(' + docid.toString() + ')';
    return this.http
      .delete(apiurl, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering FinanceStorageService, deleteDocument, map.`,
            ConsoleLogTypeEnum.debug
          );

          return response as any;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService, deleteDocument failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Crate ADP document
   * @param docObj Instance of document
   * @param acntExtraObject Instance of AccountExtraAdvancePayment
   * @param isADP true for Advance payment, false for Advance received
   * @returns An observerable of Document
   */
  public createADPDocument(
    docObj: Document,
    acntExtraObject: AccountExtraAdvancePayment,
    isADP: boolean
  ): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + `/PostDPDocument`;

    const sobj: any = {};
    sobj.DocumentInfo = docObj.writeJSONObject(); // Document first
    const acntobj: Account = new Account();
    acntobj.HID = this.homeService.ChosedHome?.ID ?? 0;
    if (isADP) {
      acntobj.CategoryId = financeAccountCategoryAdvancePayment;
    } else {
      acntobj.CategoryId = financeAccountCategoryAdvanceReceived;
    }
    acntobj.Name = docObj.Desp;
    acntobj.Comment = docObj.Desp;
    acntobj.OwnerId = this.authService.authSubject.getValue().getUserId();
    for (const tmpitem of acntExtraObject.dpTmpDocs) {
      tmpitem.ControlCenterId = docObj.Items[0].ControlCenterId;
      tmpitem.OrderId = docObj.Items[0].OrderId ?? 0;
    }
    acntobj.ExtraInfo = acntExtraObject;
    sobj.AccountInfo = acntobj.writeJSONObject();

    return this.http
      .post(apiurl, sobj, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering Map of createADPDocument in FinanceStorageService: ' + response,
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as any);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Failed in createADPDocument in FinanceStorageService.`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Create Loan document
   * @param docObj Instance of document
   * @param acntObj Instance of Account (with Loan info)
   * @param isLegacyLoan Is a legacy loan
   * @returns An observable of Document
   */
  public createLoanDocument(
    docObj: Document,
    acntObj: Account,
    isLegacyLoan = false,
    legacyAmount = 0,
    legacyControlCenterID?: number,
    legacyOrderID?: number
  ): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '/PostLoanDocument';

    const sobj: any = {};
    sobj.DocumentInfo = docObj.writeJSONObject(); // Document first
    sobj.AccountInfo = acntObj.writeJSONObject();
    if (isLegacyLoan) {
      sobj.IsLegacy = isLegacyLoan;
      sobj.LegacyAmount = legacyAmount;
      if (legacyControlCenterID) {
        sobj.ControlCenterID = legacyControlCenterID;
      }
      if (legacyOrderID) {
        sobj.OrderID = legacyOrderID;
      }
    }

    return this.http
      .post(apiurl, sobj, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering Map of createLoanDocument in FinanceStorageService: ' + response,
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as any);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Failed in createLoanDocument in FinanceStorageService.`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Create repayment for Loan
   * @param doc Document information
   * @param tmpdocid Template Document ID
   */
  public createLoanRepayDoc(doc: Document, tmpdocid: number): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = environment.ApiUrl + `/FinanceTmpLoanDocuments/PostRepayDocument`;

    return this.http
      .post(
        apiurl,
        {
          DocumentInfo: doc.writeJSONObject(),
          LoanTemplateDocumentID: tmpdocid,
          HomeID: this.homeService.ChosedHome?.ID ?? 0,
        },
        {
          headers,
        }
      )
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering FinanceStorageService, createLoanRepayDoc`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as any);

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService createLoanRepayDoc, failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Create asset document
   * @param apidetail API Data for creation
   */
  public createAssetBuyinDocument(apidetail: FinanceAssetBuyinDocumentAPI): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '/PostAssetBuyDocument';
    const jobj = apidetail.writeJSONObject();
    const jdata: string = JSON && JSON.stringify(jobj);

    return this.http
      .post(apiurl, jdata, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering FinanceStorageService createAssetBuyinDocument succeed',
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as any);
          return hd;
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService createLoanRepayDoc failed`,
            ConsoleLogTypeEnum.error
          );

          const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
          return throwError(() => new Error(errmsg));
        })
      );
  }

  /**
   * Create Asset Soldout document via API
   * @param apidetail Instance of class FinanceAssetSoldoutDocumentAPI
   */
  public createAssetSoldoutDocument(apidetail: FinanceAssetSoldoutDocumentAPI): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '/PostAssetSellDocument';
    const jobj = apidetail.writeJSONObject();
    const jdata: string = JSON && JSON.stringify(jobj);

    return this.http
      .post(apiurl, jdata, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering Map of createAssetSoldoutDocument in FinanceStorageService: ' + response,
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as any);
          return hd;
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Failed in createLoanRepayDoc in FinanceStorageService.`,
            ConsoleLogTypeEnum.error
          );

          const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
          return throwError(() => new Error(errmsg));
        })
      );
  }

  /**
   * Create Asset Value Change document via API
   * @param apidetail Instance of class FinanceAssetValChgDocumentAPI
   */
  public createAssetValChgDocument(apidetail: FinanceAssetValChgDocumentAPI): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl: string = this.documentAPIUrl + '/PostAssetValueChangeDocument';
    const jinfo = apidetail.writeJSONObject();
    const jdata: string = JSON && JSON.stringify(jinfo);

    return this.http
      .post(apiurl, jdata, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering Map of createAssetValChgDocument in FinanceStorageService: ' + response,
            ConsoleLogTypeEnum.debug
          );

          const ndoc = new Document();
          ndoc.onSetData(response as any);
          return ndoc;
        }),
        catchError((errresp: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Failed in createLoanRepayDoc in FinanceStorageService.`,
            ConsoleLogTypeEnum.error
          );

          const errmsg = `${errresp.status} (${errresp.statusText}) - ${errresp.error}`;
          return throwError(() => new Error(errmsg));
        })
      );
  }

  /**
   * Is document changable
   * @params
   * @param docID Document ID
   * @returns Observable<bool>
   */
  public isDocumentChangable(docid: number): Observable<boolean> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const apiurl = `${this.documentAPIUrl}(${docid})/IsChangable()`;
    return this.http
      .get(apiurl, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering FinanceStorageService, isDocumentChangable, map.`,
            ConsoleLogTypeEnum.debug
          );

          return response.value as boolean;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService, isDocumentChangable failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Change a document
   * @param objDetail instance of document which to be created
   */
  public changeDocument(objDetail: Document): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const targetUrl = `${this.documentAPIUrl}/${objDetail.Id}`;
    const jdata: string = objDetail.writeJSONString();
    return this.http
      .put(targetUrl, jdata, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Debug]: Entering FinanceStorageService, changeDocument, map.`,
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as any);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService, changeDocument failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Change document's date
   */
  public changeDocumentDateViaPatch(docid: number, docdate: Date): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const objcontent = {
      TranDate: format(docdate, DateDisplayFormat) //docdate.format(momentDateFormat),
    };
    return this.http
      .patch(`${this.documentAPIUrl}/${docid}`, objcontent, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering FinanceStorageService changeDocumentDateViaPatch succeed',
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as any);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService changeDocumentDateViaPatch failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Change document's desp
   */
  public changeDocumentDespViaPatch(docid: number, docdesp: string): Observable<Document> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Prefer', 'return=representation')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const objcontent = {
      Desp: docdesp,
    };
    return this.http
      .patch(`${this.documentAPIUrl}/${docid}`, objcontent, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            'AC_HIH_APP [Debug]: Entering FinanceStorageService changeDocumentDespViaPatch succeed',
            ConsoleLogTypeEnum.debug
          );

          const hd: Document = new Document();
          hd.onSetData(response as any);
          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_APP [Error]: Entering FinanceStorageService changeDocumentDespViaPatch failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Mass Create documents
   * @param docs Normal documents to be created
   * @returns An observable of documents:
   *  The succeed one with documentId filled
   *  The failed one with documentId is null
   */
  public massCreateNormalDocument(
    items: Document[]
  ): Observable<{ PostedDocuments: Document[]; FailedDocuments: Document[] }> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

    const arsent: any[] = [];
    items.forEach((doc) => {
      arsent.push(this.createDocument(doc));
    });
    return forkJoin(arsent).pipe(
      map((alldocs: any[]) => {
        const rsts: {
          PostedDocuments: Document[];
          FailedDocuments: Document[];
        } = {
          PostedDocuments: [],
          FailedDocuments: [],
        };

        alldocs.forEach((rtn: any, index: number) => {
          if (rtn instanceof Document) {
            rsts.PostedDocuments.push(rtn as Document);
          } else {
            rsts.FailedDocuments.push(items[index]);
          }
        });

        return rsts;
      })
    );
  }
}
