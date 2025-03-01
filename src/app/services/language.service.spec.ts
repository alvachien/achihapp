import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { LanguageService } from './language.service';
import { environment } from '../../environments/environment';
import { AuthServiceStub, TestDataBuilder } from '../../test';
import { AuthService } from './auth.service';

describe('LanguageService', () => {  
  let service: LanguageService;
  let httpTesting: HttpTestingController;
  const tdbuilder = new TestDataBuilder();
  const dataAPIURL: any = environment.ApiUrl + '/Languages';

  beforeAll(() => {
    tdbuilder.buildAppLanguageFromAPI();    
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useClass: AuthServiceStub
        }
      ]
    });
    service = TestBed.inject(LanguageService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that none of the tests make any extra HTTP requests.
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return expected languages (called once)', async () => {
    expect(service.Languages.length).withContext('should not buffered yet').toEqual(0);

    const alllang$ = service.fetchAllLanguages();    
    const alllangPromise = firstValueFrom(alllang$);
    
    // At this point, the request is pending, and we can assert it was made
    // via the `HttpTestingController`:
    const req = httpTesting.expectOne(dataAPIURL, 'Request to load the data');
    expect(req.request.method).toEqual('GET');

    // Respond with the mock languages
    req.flush({
      value: tdbuilder.appLanguagesFromAPI,
    });

    let langs = await alllangPromise;
    expect(langs.length).withContext('should return expected languages').toEqual(tdbuilder.appLanguagesFromAPI.length);
    expect(service.Languages.length).withContext('should have buffered').toEqual(langs.length);
  });

  it('should return expected languages (called twice)', async () => {
    expect(service.Languages.length).withContext('should not buffered yet').toEqual(0);

    const alllang$ = service.fetchAllLanguages();    
    const alllangPromise = firstValueFrom(alllang$);
    
    // At this point, the request is pending, and we can assert it was made
    // via the `HttpTestingController`:
    const req = httpTesting.expectOne(dataAPIURL, 'Request to load the data');
    expect(req.request.method).toEqual('GET');

    // Respond with the mock languages
    req.flush({
      value: tdbuilder.appLanguagesFromAPI,
    });

    let langs = await alllangPromise;
    expect(langs.length).withContext('should return expected languages').toEqual(tdbuilder.appLanguagesFromAPI.length);
    expect(service.Languages.length).withContext('should have buffered').toEqual(langs.length);

    // Second call
    const secondcall$ = service.fetchAllLanguages();
    
    // At this point, the request is pending, and we can assert it was made via the `HttpTestingController`:
    httpTesting.expectNone(dataAPIURL, 'Request to load the data');
    expect(service.Languages.length).withContext('should have buffered').toEqual(langs.length);
  });

  it('should return backend error', async () => {
    expect(service.Languages.length).withContext('should not buffered yet').toEqual(0);

    const alllang$ = service.fetchAllLanguages();    
    const alllangPromise = firstValueFrom(alllang$);
    
    // At this point, the request is pending, and we can assert it was made
    // via the `HttpTestingController`:
    const req = httpTesting.expectOne(dataAPIURL, 'Request to load the data');
    expect(req.request.method).toEqual('GET');

    // Error 
    req.flush('Failed!', {status: 500, statusText: 'Internal Server Error'});

    try {
      let langs = await alllangPromise;
      // We can then assert that the response was failed delivered by the `LanguageService`:
      // expect(langs).toEqual(DEFAULT_CONFIG);

      expect(service.Languages.length).withContext('should not buffered yet').toEqual(0);
    }
    catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).withContext('Expect error code').toContain('500');
    }
  });

  it('should return network error', async () => {
    expect(service.Languages.length).withContext('should not buffered yet').toEqual(0);

    const alllang$ = service.fetchAllLanguages();    
    const alllangPromise = firstValueFrom(alllang$);
    
    // At this point, the request is pending, and we can assert it was made
    // via the `HttpTestingController`:
    const req = httpTesting.expectOne(dataAPIURL, 'Request to load the data');
    expect(req.request.method).toEqual('GET');

    // Error
    req.error(new ProgressEvent('network error!'));

    try {
      let langs = await alllangPromise;
      // We can then assert that the response was failed delivered by the `LanguageService`:
      // expect(await configPromise).not.toEqual(DEFAULT_CONFIG);
      expect(service.Languages.length).withContext('should not buffered yet').toEqual(0);
    }
    catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).withContext('Expect error code').toContain('Error');
    }
  });  
});
