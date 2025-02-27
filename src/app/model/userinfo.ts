
/**
 * User detail
 */
export class UserDetail {
  public UserId = '';
  public DisplayAs = '';
  public Email = '';
  public Others = '';

  public onSetData(data: any): void {
    this.UserId = data.userID;
    this.DisplayAs = data.displayAs;
    this.Email = data.email;
    this.Others = data.others;
  }

  public onGetData(): any {
    const data: any = {};
    data.userID = this.UserId;
    data.displayAs = this.DisplayAs;
    data.email = this.Email;
    data.others = this.Others;

    return data;
  }
}

/**
 * User Auth Info
 */
export class UserAuthInfo {
  private userName?: string;
  private userId?: string;
  private userMailbox?: string;
  private accessToken?: string;

  public isAuthorized = false;

  public setContent(user: { userId?: string; userName?: string; accessToken?: string }): void {
    if (user) {
      this.isAuthorized = true;

      this.userName = user.userName;
      this.userId = user.userId;
      // this.userMailbox = user.profile['mail'];
      this.accessToken = user.accessToken;
    } else {
      this.cleanContent();
    }
  }

  public cleanContent(): void {
    this.isAuthorized = false;
    this.userName = undefined;
    this.userId = undefined;
    this.userMailbox = undefined;
    this.accessToken = undefined;
  }

  public getUserName(): string | undefined {
    return this.userName;
  }
  public getUserId(): string | undefined {
    return this.userId;
  }
  public getAccessToken(): string | undefined {
    return this.accessToken;
  }
  public getUserMailbox(): string | undefined {
    return this.userMailbox;
  }
}
