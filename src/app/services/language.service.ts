import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AppLanguage, ConsoleLogTypeEnum, ModelUtility } from '../model';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  // Buffer
  private _islistLoaded: boolean;
  private _listData: AppLanguage[];
  get Languages(): AppLanguage[] {
    return this._listData;
  }

  private readonly _http = inject(HttpClient);
  
  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering LanguageOdataService constructor...',
      ConsoleLogTypeEnum.debug
    );

    this._islistLoaded = false; // Performance improvement
    this._listData = [];
  }

  public fetchAllLanguages(): Observable<AppLanguage[]> {
    if (!this._islistLoaded) {
      const apiurl: string = environment.ApiUrl + '/Languages';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json').append('Accept', 'application/json');

      return this._http
        .get(apiurl, {
          headers,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              'AC_HIH_UI [Debug]: Entering LanguageOdataService fetchAllLanguages',
              ConsoleLogTypeEnum.debug
            );

            const rjs: any = response as any;
            this._listData = [];

            if (rjs.value && rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const hd: AppLanguage = new AppLanguage();
                hd.onSetData(si);
                this._listData.push(hd);
              }
            }
            this._islistLoaded = true;

            return this._listData;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering LanguageOdataService fetchAllLanguages failed: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this._islistLoaded = false;
            this._listData = [];

            return throwError(() => new Error(`${error.status}(${error.statusText}); ${error.error}; ${error.message}`));
          })
        );
    } else {
      return of(this._listData);
    }
  }
}
