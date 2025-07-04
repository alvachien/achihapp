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

    // authority: environment.IDServerUrl,

    // redirectUrl: environment.AppHost, // window.location.origin,
    // postLogoutRedirectUri: environment.AppHost,

    // clientId: 'achihui.js',
    // scope: 'openid profile api.hih offline_access', // 'openid profile ' + your scopes
    // // scope: 'please-enter-scopes', // 'openid profile offline_access ' + your scopes
    // responseType: 'code',

    // silentRenew: true,
    // useRefreshToken: true,
    // renewTimeBeforeTokenExpiresInSeconds: 30,

    const settings = {
      authority: environment.IDServerUrl,
      client_id: 'achihui.js',
      redirect_uri: `${environment.AppHost}/signin-callback`,
      silent_redirect_uri: `${environment.AppHost}/silent-callback.html`,
      post_logout_redirect_uri: `${environment.AppHost}`,
      response_type: 'code',
      scope: 'openid profile api.hih offline_access',
    };
    this.userManager = new UserManager(settings);
  }

  getUser(): Promise<User | null> {
    return this.userManager.getUser();
  }

  login(): Promise<void> {
    return this.userManager.signinRedirect();
  }

  renewToken(): Promise<User | null> {
    return this.userManager.signinSilent();
  }

  logout(): Promise<void> {
    return this.userManager.signoutRedirect();
  }
  // private readonly authService = inject(OidcSecurityService);
  // private readonly eventService = inject(PublicEventsService);

  public doLogin(): void {
    // ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService logon...', ConsoleLogTypeEnum.debug);
    // console.log('AC_HIH_APP [Debug]: Entering AuthService logon...');
    // this.authService.authorize();
  }
  public doLogout(): void {
    // ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering AuthService doLogout...', ConsoleLogTypeEnum.debug);
    // this.authService.logoffAndRevokeTokens().subscribe(() => {
    //   const usrAuthInfo = this.authSubject.value;
    //   usrAuthInfo.cleanContent();
    //   this.authSubject.next(usrAuthInfo);
    // });
  }

  public checkAuth() {
    // this.authService.checkAuth().subscribe(({ isAuthenticated, userData, accessToken }) => {
    //   ModelUtility.writeConsoleLog(
    //     `AC_HIH_UI [Debug]: Entering AuthService checkAuth callback with 'IsAuthenticated' = ${isAuthenticated}.`,
    //     ConsoleLogTypeEnum.debug
    //   );
    //   console.log(`AC_HIH_UI [Debug]: Entering AuthService checkAuth callback with 'IsAuthenticated' = ${isAuthenticated}.`);
    //   if (isAuthenticated) {
    //     const usrAuthInfo = this.authSubject.value;
    //     usrAuthInfo.setContent({
    //       userId: userData.sub,
    //       userName: userData.name,
    //       accessToken: accessToken,
    //     });
    //     this.authSubject.next(usrAuthInfo);
    //   } else {
    //     const usrAuthInfo = this.authSubject.value;
    //     usrAuthInfo.cleanContent();
    //     this.authSubject.next(usrAuthInfo);
    //   }
    //   });
  }
}
