import { AppLanguage, AppLanguageJson, UserAuthInfo } from "../app/model";

export class TestDataBuilder {
  private _appLanguagesFromAPI: AppLanguageJson[] = [];
  private _appLanguages: AppLanguage[] = [];
  private _currUser?: UserAuthInfo;
  private readonly userID1: string = 'abcdefg';
  private readonly userID1Sub: string = '12345abcdefg';

  get appLanguagesFromAPI(): any[] {
    if (this._appLanguagesFromAPI) {
      return this._appLanguagesFromAPI;
    }
    return [];
  }
  get appLanguages(): AppLanguage[] {
    if (this._appLanguages) {
      return this._appLanguages;
    }
    return [];
  }
  get currentUser(): UserAuthInfo | undefined {
    return this._currUser;
  }

  public buildAppLanguageFromAPI(): void {
    this._appLanguagesFromAPI = [];
    const alan: AppLanguageJson = {
      Lcid: 9,
      EnglishName: 'English',
      AppFlag: true,
      NativeName: 'English',
      ISOName: 'en',
    };
    this._appLanguagesFromAPI.push(alan);
    const alan2: AppLanguageJson = {
      Lcid: 4,
      EnglishName: 'Chinese (Simplified)',
      AppFlag: true,
      NativeName: '简体中文',
      ISOName: 'zh-Hans',
    };
    this._appLanguagesFromAPI.push(alan2);
  }
  public buildAppLanguage(): void {
    this._appLanguages = [];
    let alan: AppLanguage = new AppLanguage();
    alan.EnglishName = 'English';
    alan.IsoName = 'en';
    alan.AppFlag = true;
    alan.Lcid = 9;
    alan.NativeName = 'English';
    this._appLanguages.push(alan);
    alan = new AppLanguage();
    alan.Lcid = 4;
    alan.IsoName = 'zh-Hans';
    alan.EnglishName = 'Chinese (Simplified';
    alan.NativeName = '简体中文';
    alan.AppFlag = true;
    this._appLanguages.push(alan);
  }
  public buildCurrentUser(): void {
    if (!this._currUser) {
      this._currUser = new UserAuthInfo();
      const usr: any = {
        userName: this.userID1,
        userId: this.userID1Sub,
        accessToken: 'access_token',
      };
  
      this._currUser.setContent(usr);  
    }
  }

}
