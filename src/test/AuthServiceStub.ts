import { BehaviorSubject, Observable } from "rxjs";
import { UserAuthInfo } from "../app/model";
import { TestDataBuilder } from "./test-data-builder";

export class AuthServiceStub {
  public authSubject: BehaviorSubject<UserAuthInfo> = new BehaviorSubject(new UserAuthInfo());
  public authContent: Observable<UserAuthInfo> = this.authSubject.asObservable();
  private isAuthenticated = false;

  public doLogin(): void {
    // Login - stub
    if (this.isAuthenticated) {
      const usrAuthInfo = this.authSubject.value;
      this.authSubject.next(usrAuthInfo)
    } else {
      const databuilder = new TestDataBuilder();
      databuilder.buildCurrentUser();
      const usrAuthInfo = this.authSubject.value;
      usrAuthInfo.setContent({
        userId: databuilder.currentUser!.getUserId(),
        userName: databuilder.currentUser!.getUserName(),
        accessToken: databuilder.currentUser!.getAccessToken(),
      });
      this.isAuthenticated = true;
      this.authSubject.next(usrAuthInfo);
    }
  }

  public doLogout(): void {
    // Logout - stub
    if (this.isAuthenticated) {
      this.isAuthenticated = false;
      const usrAuthInfo = this.authSubject.value;
      usrAuthInfo.cleanContent();
      this.authSubject.next(usrAuthInfo);
    }
  }

  public checkAuth() {
    if (this.isAuthenticated) {
      const usrAuthInfo = this.authSubject.value;
      this.authSubject.next(usrAuthInfo);
    } else {
      const usrAuthInfo = this.authSubject.value;
      usrAuthInfo.cleanContent();
      this.authSubject.next(usrAuthInfo);
    }
  }
}
