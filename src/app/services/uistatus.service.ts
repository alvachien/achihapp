import { Injectable } from '@angular/core';
import { CheckVersionResult } from '../model';

@Injectable({
  providedIn: 'root'
})
export class UIStatusService {

  constructor() { }

  // Last error set
  private _latestError: string | null = null;
  get latestError(): string | null {
    return this._latestError;
  }
  set latestError(le: string | null) {
    this._latestError = le;
  }
  // Fatal error
  private _fatalError = false;
  get fatalError(): boolean {
    return this._fatalError;
  }
  set fatalError(err: boolean) {
    this._fatalError = err;
  }

  // Version info.
  private _versionInfo?: CheckVersionResult;
  get versionResult(): CheckVersionResult | undefined {
    return this._versionInfo;
  }
  set versionResult(rst: CheckVersionResult | undefined) {
    this._versionInfo = rst;
  }

}
