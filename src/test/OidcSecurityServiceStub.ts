
import { AuthOptions } from 'angular-auth-oidc-client';
import { of } from 'rxjs';

export class OidcSecurityServiceStub {
  getToken() {
    return 'some_token_eVbnasdQ324';
  }

  checkAuth(url: string) {
    return of(url);
  }

  authorize(authOptions?: AuthOptions){
    if (authOptions) {
      return authOptions.urlHandler!('http://localhost');
    } else {
      return null;
    }
  }
}