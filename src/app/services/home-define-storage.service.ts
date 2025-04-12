import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

import { CheckVersionResult, ConsoleLogTypeEnum, HomeDef, HomeDefJson, HomeKeyFigure, HomeMember, ModelUtility } from '../model';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HomeDefineStorageService {
  private _redirURL = '';

  // Buffer
  private _islistLoaded: boolean;
  private _listHomeDefList: HomeDef[];
  // API url.
  readonly apiUrl = environment.ApiUrl + `/HomeDefines`;

  get HomeDefs(): HomeDef[] {
    return this._listHomeDefList;
  }

  // Subject for the selected HomeDef
  curHomeSelected: BehaviorSubject<HomeDef | null> = new BehaviorSubject<HomeDef | null>(null);
  get ChosedHome(): HomeDef | null {
    return this.curHomeSelected.value;
  }
  set ChosedHome(hd: HomeDef | null) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering HomeDefService ChosedHome setter: ${hd}`,
      ConsoleLogTypeEnum.debug
    );

    if (hd) {
      this.curHomeSelected.next(hd);
    }
  }

  // Subject for current home member
  curHomeMember: BehaviorSubject<HomeMember | null> = new BehaviorSubject<HomeMember | null>(null);
  get CurrentMemberInChosedHome(): HomeMember | null {
    return this.curHomeMember.value;
  }
  set CurrentMemberInChosedHome(hm: HomeMember | null) {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering HomeDefService CurrentMemberInChosedHome setter: ${hm}`,
      ConsoleLogTypeEnum.debug
    );

    if (hm) {
      this.curHomeMember.next(hm);
    }
  }

  // Members in selected HomeDef
  get MembersInChosedHome(): HomeMember[] {
    return this.ChosedHome?.Members ?? [];
  }

  // Redirect URL
  get RedirectURL(): string {
    return this._redirURL;
  }
  set RedirectURL(url: string) {
    this._redirURL = url;
  }

  // Properties
  keyFigure: HomeKeyFigure | null = null;

  private readonly _http = inject(HttpClient);
  private readonly _authService = inject(AuthService);

  constructor() {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering HomeDefService constructor...`,
      ConsoleLogTypeEnum.debug
    );

    this._islistLoaded = false; // Performance improvement
    this._listHomeDefList = [];
  }

  /**
   * Read all home defs in the system which current user can view
   */
  public fetchAllHomeDef(forceReload?: boolean): Observable<HomeDef[]> {
    if (!this._islistLoaded || forceReload) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers
        .append('Content-Type', 'application/json')
        .append('Accept', 'application/json')
        .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
      let params: HttpParams = new HttpParams();
      params = params.append('$count', 'true');
      params = params.append('$expand', 'HomeMembers');

      return this._http
        .get(this.apiUrl, {
          headers,
          params,
        })
        .pipe(
          map((response: any) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Debug]: Entering HomeDefService, fetchAllHomeDef...`,
              ConsoleLogTypeEnum.debug
            );

            this._listHomeDefList = [];
            const rjs: any = response;

            if (rjs.value instanceof Array && rjs.value.length > 0) {
              for (const si of rjs.value) {
                const hd: HomeDef = new HomeDef();
                hd.parseJSONData(si);
                this._listHomeDefList.push(hd);
              }
            }

            this._islistLoaded = true;
            return this._listHomeDefList;
          }),
          catchError((error: HttpErrorResponse) => {
            ModelUtility.writeConsoleLog(
              `AC_HIH_UI [Error]: Entering HomeDefService, fetchAllHomeDef failed: ${error}`,
              ConsoleLogTypeEnum.error
            );

            this._islistLoaded = false;
            this._listHomeDefList = [];

            return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
          })
        );
    } else {
      return of(this._listHomeDefList);
    }
  }

  /**
   * Read a specified home defs
   */
  public readHomeDef(hid: number): Observable<HomeDef> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    let params: HttpParams = new HttpParams();
    params = params.append('$expand', 'HomeMembers');
    //params = params.append('$filter', `ID eq ${hid}`);

    return this._http.get(`${this.apiUrl}(${hid})`, {
      headers,
      params,
    })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering HomeDefService, readHomeDef.`,
            ConsoleLogTypeEnum.debug
          );

          const hd: HomeDef = new HomeDef();
          hd.parseJSONData(response as any);

          // Buffer it
          const nidx: number = this._listHomeDefList.findIndex((val: HomeDef) => {
            return val.ID === hd.ID;
          });
          if (nidx === -1) {
            this._listHomeDefList.push(hd);
          } else {
            this._listHomeDefList.splice(nidx, 1, hd);
          }

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering HomeDefService, readHomeDef, Failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Create a home def
   * @param objhd Home def to be created
   */
  public createHomeDef(objhd: HomeDef): Observable<HomeDef> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const data: HomeDefJson = objhd.generateJSONData(true);
    const jdata: any = JSON && JSON.stringify(data);
    return this._http
      .post(this.apiUrl, jdata, {
        headers,
      })
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering HomeDefService, createHomeDef, map.`,
            ConsoleLogTypeEnum.debug
          );

          const hd: HomeDef = new HomeDef();
          hd.parseJSONData(response as any);

          this._listHomeDefList.push(hd);

          return hd;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering HomeDefService createHomeDef failed: ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }

  /**
   * Change a home def
   * @param objhd Home def to be created
   */
  public changeHomeDef(objhd: HomeDef): Observable<HomeDef> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    const data: HomeDefJson = objhd.generateJSONData(false);
    const apipath = `${this.apiUrl}(${objhd.ID})`;
    const jdata: any = JSON && JSON.stringify(data);
    return this._http.put(apipath, jdata, { headers, }).pipe(
      map(() => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Debug]: Entering HomeDefService, changeHomeDef, map.`,
          ConsoleLogTypeEnum.debug
        );

        // Empty result from API : 204
        // const hd: HomeDef = new HomeDef();
        // hd.parseJSONData(response as any);

        // Buffer it
        const nidx: number = this._listHomeDefList.findIndex((val: HomeDef) => {
          return val.ID === objhd.ID;
        });
        if (nidx !== -1) {
          this._listHomeDefList.splice(nidx, 1, objhd);
        }

        return objhd;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Error]: Entering HomeDefService changeHomeDef failed: ${error}`,
          ConsoleLogTypeEnum.error
        );

        return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
      })
    );
  }

  /**
   * Get Key Figure
   */
  public getHomeKeyFigure(): Observable<any> {
    const apiurl: string = environment.ApiUrl + '/HomeKeyFigure';
    const curhid: number = this.ChosedHome?.ID ?? 0;
    const requestUrl: any = `${apiurl}?hid=${curhid}`;

    let headers: HttpHeaders = new HttpHeaders();
    headers = headers
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

    return this._http.get<any>(requestUrl, { headers }).pipe(
      map((x: HttpResponse<any>) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Debug]: Entering HomeDefService, getHomeKeyFigure, map.`,
          ConsoleLogTypeEnum.debug
        );

        this.keyFigure = new HomeKeyFigure();
        this.keyFigure.onSetData(x);
        return this.keyFigure;
      }),
      catchError((error: HttpErrorResponse) => {
        ModelUtility.writeConsoleLog(
          `AC_HIH_UI [Error]: Entering HomeDefService, getHomeKeyFigure, Failed: ${error}`,
          ConsoleLogTypeEnum.error
        );

        return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
      })
    );
  }

  /**
   * Check DB versoin
   */
  public checkDBVersion(): Observable<CheckVersionResult> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Content-Type', 'application/json').append('Accept', 'application/json');

    return this._http
      .post(
        environment.ApiUrl + '/DBVersions',
        {},
        {
          headers,
        }
      )
      .pipe(
        map((response: any) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Debug]: Entering HomeDefService, checkDBVersion.`,
            ConsoleLogTypeEnum.debug
          );

          return response as CheckVersionResult;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(
            `AC_HIH_UI [Error]: Entering HomeDefService, checkDBVersion, Failed ${error}`,
            ConsoleLogTypeEnum.error
          );

          return throwError(() => new Error(error.statusText + '; ' + error.error + '; ' + error.message));
        })
      );
  }
}
