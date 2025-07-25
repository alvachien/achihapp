import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserManager } from 'oidc-client-ts';

import { UserAuthInfo, ModelUtility, ConsoleLogTypeEnum } from '../model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public authSubject: BehaviorSubject<UserAuthInfo> = new BehaviorSubject(new UserAuthInfo());
  public authContent: Observable<UserAuthInfo> = this.authSubject.asObservable();
  userManager: UserManager;

  constructor() {
    console.log('AC_HIH_APP [Debug]: Entering AuthService constructor...');

    const settings = {
      authority: environment.IDServerUrl,
      client_id: 'achihui.js',
      redirect_uri: `${environment.AppHost}/signin-callback`,
      silent_redirect_uri: `${environment.AppHost}/silent-callback.html`,
      post_logout_redirect_uri: `${environment.AppHost}`,
      response_type: 'code',
      scope: 'openid profile email api.hih offline_access',
    };
    this.userManager = new UserManager(settings);
  }

  getUser(): Promise<User | null> {
    return this.userManager.getUser();
  }

  login(): Promise<void> {
    ModelUtility.writeConsoleLog('AC_HIH_APP [Debug]: Entering AuthService login...', ConsoleLogTypeEnum.debug);
    return this.userManager.signinRedirect();
  }

  renewToken(): Promise<User | null> {
    return this.userManager.signinSilent();
  }

  logout(): Promise<void> {
    ModelUtility.writeConsoleLog('AC_HIH_APP [Debug]: Entering AuthService logout...', ConsoleLogTypeEnum.debug);
    return this.userManager.signoutRedirect();
  }
}
