import { PassedInitialConfig } from 'angular-auth-oidc-client';
import { environment } from '../../environments/environment';

export const authConfig: PassedInitialConfig = {
  config: {
    authority: environment.IDServerUrl,

    redirectUrl: environment.AppHost, // window.location.origin,
    postLogoutRedirectUri: environment.AppHost,

    clientId: 'achihapp',
    scope: 'openid profile api.hih offline_access', // 'openid profile ' + your scopes
    // scope: 'please-enter-scopes', // 'openid profile offline_access ' + your scopes
    responseType: 'code',

    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 30,
  }
}
