import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService, HomeDefineStorageService, UIStatusService } from '../services';
import { environment } from '../../environments/environment';
import { ConsoleLogTypeEnum, ModelUtility } from '../model';

export const homeChosenGuard: CanActivateChildFn = (route, state) => {
  let authService = inject(AuthService);
  let homeService = inject(HomeDefineStorageService);
  let uiService = inject(UIStatusService);
  let router = inject(Router);

  const url: string = state.url;

  if (uiService.fatalError) {
    return false;
  }

  if (!environment.LoginRequired) {
    return true;
  }

  ModelUtility.writeConsoleLog(
    'AC_HIH_APP [Debug]: Entering HomeChoseGuardService canActivate',
    ConsoleLogTypeEnum.debug
  );

  if (authService.authSubject.getValue().isAuthorized) {
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering HomeChoseGuardService checkLogin: TRUE',
      ConsoleLogTypeEnum.debug
    );
  } else {
    // Navigate to the login page with extras
    ModelUtility.writeConsoleLog(
      'AC_HIH_APP [Debug]: Entering HomeChoseGuardService checkLogin: FALSE, redirecting',
      ConsoleLogTypeEnum.debug
    );

    authService.login();
    return false;
  }

  // Has logged in but no home chosen yet.
  homeService.RedirectURL = url;

  if (!homeService.ChosedHome) {
    // Navigate to other page
    router.navigate(['/homedef']);
    return false;
  }

  return true;
};
