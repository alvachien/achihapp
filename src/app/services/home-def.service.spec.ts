import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { HomeDefService } from './home-def.service';
import { AuthServiceStub, TestDataBuilder } from '../../test';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HomeDef, HomeMemberRelationEnum } from '../model';

describe('HomeDefService', () => {
  let service: HomeDefService;
  let httpTesting: HttpTestingController;
  const tdbuilder = new TestDataBuilder();
  const dataAPIURL = environment.ApiUrl + '/HomeDefines';
  const dbversionURL = environment.ApiUrl + '/DBVersions';

  beforeAll(() => {
  });

  describe('Without logon', () => {
    beforeEach(() => {
      const authServiceStub: Partial<AuthService> = {};
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          {
            provide: AuthService,
            useValue: authServiceStub
          }
        ]
      });
      service = TestBed.inject(HomeDefService);
      httpTesting = TestBed.inject(HttpTestingController);
    });
    afterEach(() => {
      // Verify that none of the tests make any extra HTTP requests.
      httpTesting.verify();
    });
  
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('redirect url', () => {
      expect(service.RedirectURL).toBeFalsy();
      service.RedirectURL = 'test-url';
      expect(service.RedirectURL).toBeTruthy();
    });

    it('DBVersion success case', async () => {
      const dbversion$ = service.checkDBVersion();
      const dbversionPromise = firstValueFrom(dbversion$);
  
      // At this point, the request is pending, and we can assert it was made
      // via the `HttpTestingController`:
      const req = httpTesting.expectOne(dbversionURL, 'Request to load the data');
      expect(req.request.method).toEqual('POST');
  
      // Respond with the mock languages
      req.flush({
        StorageVersion: '22',
        APIVersion: '2.2'
      });
  
      let dbversion = await dbversionPromise;
      expect(dbversion.APIVersion).withContext('should return expected API version').toEqual('2.2');
      expect(dbversion.StorageVersion).withContext('should have expected DB version').toEqual('22');
    });
  
    it('DBVersion failed case', async () => {
      const dbversion$ = service.checkDBVersion();
      const dbversionPromise = firstValueFrom(dbversion$);
  
      // At this point, the request is pending, and we can assert it was made via the `HttpTestingController`:
      const req = httpTesting.expectOne(dbversionURL, 'Request to load the data');
      expect(req.request.method).toEqual('POST');
  
      // Error 
      req.flush('Failed!', { status: 500, statusText: 'Internal Server Error' });
  
      try {
        let dbvrrst = await dbversionPromise;
        if (dbvrrst) {
          // Nothing
        }
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).withContext('Expect error code').toContain('500');
      }
    });
  });

  describe('With logon', () => {
    beforeEach(() => {
      tdbuilder.buildCurrentUser();
      const authServiceStub: Partial<AuthService> = {};
      authServiceStub.authSubject = new BehaviorSubject(tdbuilder.currentUser!);
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          {
            provide: AuthService,
            useValue: authServiceStub
          }
        ]
      });
      service = TestBed.inject(HomeDefService);
      httpTesting = TestBed.inject(HttpTestingController);
    });
    afterEach(() => {
      tdbuilder.clearCurrentUser();
      // Verify that none of the tests make any extra HTTP requests.
      httpTesting.verify();
    });

    it('fetchAllHomeDef success case', async () => {
      expect(service.HomeDefs.length).toEqual(0);

      // First call
      const fetchhomes$ = service.fetchAllHomeDef();
      const fetchhomesPromise = firstValueFrom(fetchhomes$);
  
      // At this point, the request is pending, and we can assert it was made via the `HttpTestingController`:
      const req = httpTesting.expectOne(req => {
        return req.url.startsWith(dataAPIURL)
      }, 'Request to load the data');
      expect(req.request.method).toEqual('GET');
  
      // Success
      req.flush({
        value: [
          {
            Members: [],
            ID: 11,
            Name: 'test',
            Details: 'test.',
            Host: 'aaa',
            BaseCurrency: 'CNY',
            CreatedBy: 'aaa',
            CreatedAt: '2017-10-01',
          },
        ],
        '@odata.count': 1,
      });
  
      try {
        let homedef = await fetchhomesPromise;
        expect(homedef).toBeTruthy();

        expect(homedef.length).toEqual(1);
        expect(homedef[0].ID).toEqual(11);
        expect(homedef[0].Name).toEqual('test');

        expect(service.HomeDefs.length).toEqual(1);
        expect(service.HomeDefs[0].ID).toEqual(11);
        expect(service.HomeDefs[0].Name).toEqual('test');
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      // Second call - no call but got the full data
      const secondfetchhomes$ = service.fetchAllHomeDef();
      const secondfetchhomesPromise = firstValueFrom(secondfetchhomes$);

      // At this point, the request is pending, and we can assert it was made via the `HttpTestingController`:
      httpTesting.expectNone(req => { return req.url.startsWith(dataAPIURL) }, 'Request to load the data');
  
      try {
        let homedef = await secondfetchhomesPromise;
        expect(homedef).toBeTruthy();

        expect(homedef.length).toEqual(1);
        expect(homedef[0].ID).toEqual(11);
        expect(homedef[0].Name).toEqual('test');

        expect(service.HomeDefs.length).toEqual(1);
        expect(service.HomeDefs[0].ID).toEqual(11);
        expect(service.HomeDefs[0].Name).toEqual('test');
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      // Third call with refresh
      const thirdfetchhomes$ = service.fetchAllHomeDef(true);
      const thirdfetchhomesPromise = firstValueFrom(thirdfetchhomes$);

      // At this point, the request is pending, and we can assert it was made via the `HttpTestingController`:
      const thirdreq = httpTesting.expectOne(req => {
        return req.url.startsWith(dataAPIURL)
      }, 'Request to load the data');
      expect(req.request.method).toEqual('GET');
  
      thirdreq.flush({
        value: [
          {
            HomeMembers: [],
            ID: 11,
            Name: 'test',
            Details: 'test.',
            Host: 'aaa',
            BaseCurrency: 'CNY',
            CreatedBy: 'aaa',
            CreatedAt: '2017-10-01',
          },
          {
            HomeMembers: [
              {
                HomeID: 12,
                User: 'aaa2',
                DisplayAs: 'AAA 2',
                Relation: HomeMemberRelationEnum.Self,
                IsChild: false
              }
            ],
            ID: 12,
            Name: 'test2',
            Details: 'test2.',
            Host: 'aaa2',
            BaseCurrency: 'CNY',
            CreatedBy: 'aaa2',
            CreatedAt: '2019-10-01',
          },
        ],
        '@odata.count': 2,
      });

      try {
        let homedef = await thirdfetchhomesPromise;
        expect(homedef).toBeTruthy();

        expect(homedef.length).toEqual(2);
        expect(homedef.findIndex((val) => val.ID === 11)).not.toEqual(-1);
        expect(homedef.findIndex((val) => val.ID === 12)).not.toEqual(-1);

        expect(service.HomeDefs.length).toEqual(2);
        expect(service.HomeDefs.findIndex((val) => val.ID === 11)).not.toEqual(-1);
        expect(service.HomeDefs.findIndex((val) => val.ID === 12)).not.toEqual(-1);

        // Current selected home
        service.ChosedHome = service.HomeDefs[1];
        expect(service.ChosedHome).not.toBeNull();
        let mems = service.MembersInChosedHome;
        expect(mems.length).toEqual(1);
        service.CurrentMemberInChosedHome = service.ChosedHome.Members[0];
        expect(service.CurrentMemberInChosedHome).not.toBeNull();
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('fetchAllHomeDef failed case', async () => {
      expect(service.HomeDefs.length).toEqual(0);

      // First call
      const fetchhomes$ = service.fetchAllHomeDef();
      const fetchhomesPromise = firstValueFrom(fetchhomes$);
  
      // At this point, the request is pending, and we can assert it was made via the `HttpTestingController`:
      const req = httpTesting.expectOne(req => {
        return req.url.startsWith(dataAPIURL)
      }, 'Request to load the data');
      expect(req.request.method).toEqual('GET');
  
      // Error 
      req.flush('Failed!', { status: 500, statusText: 'Internal Server Error' });
  
      try {
        let homedef = await fetchhomesPromise;
        if (homedef) {
        }
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).withContext('Expect error code').toContain('500');
      }
    });

    it('readHomeDef success case', async () => {
      expect(service.HomeDefs.length).toEqual(0);

      // First call
      const readhome$ = service.readHomeDef(12);
      const readhomePromise = firstValueFrom(readhome$);
  
      // At this point, the request is pending, and we can assert it was made via the `HttpTestingController`:
      const req1 = httpTesting.expectOne(req => {
        return req.url.startsWith(dataAPIURL) && req.urlWithParams.includes('$filter')
      }, 'Request to load the data');
      expect(req1.request.method).toEqual('GET');
  
      // Success
      req1.flush({
        Members: [],
        ID: 12,
        Name: 'test',
        Details: 'test.',
        Host: 'aaa',
        BaseCurrency: 'CNY',
        CreatedBy: 'aaa',
        CreatedAt: '2017-10-01',
      });
  
      try {
        let homedef = await readhomePromise;
        expect(homedef).toBeTruthy();

        expect(homedef.ID).toEqual(12);
        expect(homedef.Name).toEqual('test');
        expect(homedef.Members.length).toEqual(0);

        expect(service.HomeDefs.length).toEqual(1);
        expect(service.HomeDefs[0].ID).toEqual(12);
        expect(service.HomeDefs[0].Name).toEqual('test');
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      // Second call but return different name
      const readhome2$ = service.readHomeDef(12);
      const readhome2Promise = firstValueFrom(readhome2$);
  
      // At this point, the request is pending, and we can assert it was made via the `HttpTestingController`:
      const req2 = httpTesting.expectOne(req => {
        return req.url.startsWith(dataAPIURL) && req.urlWithParams.includes('$filter')
      }, 'Request to load the data');
      expect(req2.request.method).toEqual('GET');
  
      // Success
      req2.flush({
        Members: [],
        ID: 12,
        Name: 'test2',
        Details: 'test.',
        Host: 'aaa',
        BaseCurrency: 'CNY',
        CreatedBy: 'aaa',
        CreatedAt: '2017-10-01',
      });
  
      try {
        let homedef = await readhome2Promise;
        expect(homedef).toBeTruthy();

        expect(homedef.ID).toEqual(12);
        expect(homedef.Name).toEqual('test2');
        expect(homedef.Members.length).toEqual(0);

        expect(service.HomeDefs.length).toEqual(1);
        expect(service.HomeDefs[0].ID).toEqual(12);
        expect(service.HomeDefs[0].Name).toEqual('test2');
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      // Thrid call for different one
      const readhome3$ = service.readHomeDef(13);
      const readhome3Promise = firstValueFrom(readhome3$);
  
      // At this point, the request is pending, and we can assert it was made via the `HttpTestingController`:
      const req3 = httpTesting.expectOne(req => {
        return req.url.startsWith(dataAPIURL) && req.urlWithParams.includes('$filter')
      }, 'Request to load the data');
      expect(req2.request.method).toEqual('GET');
  
      // Success
      req3.flush({
        Members: [],
        ID: 13,
        Name: 'test3',
        Details: 'test.',
        Host: 'aaa',
        BaseCurrency: 'CNY',
        Createdby: 'aaa',
        Createdat: '2017-10-01',
      });
  
      try {
        let homedef = await readhome3Promise;
        expect(homedef).toBeTruthy();

        expect(homedef.ID).toEqual(13);
        expect(homedef.Name).toEqual('test3');
        expect(homedef.Members.length).toEqual(0);

        expect(service.HomeDefs.length).toEqual(2);
        expect(service.HomeDefs.findIndex((val) => val.ID === 12)).not.toEqual(-1);
        expect(service.HomeDefs.findIndex((val) => val.ID === 13)).not.toEqual(-1);
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('readHomeDef failed case', async () => {
      expect(service.HomeDefs.length).toEqual(0);

      // First call
      const readhome$ = service.readHomeDef(12);
      const readhomePromise = firstValueFrom(readhome$);
  
      // At this point, the request is pending, and we can assert it was made via the `HttpTestingController`:
      const req1 = httpTesting.expectOne(req => {
        return req.url.startsWith(dataAPIURL) && req.urlWithParams.includes('$filter')
      }, 'Request to load the data');
      expect(req1.request.method).toEqual('GET');

      // Error 
      req1.flush('Failed!', { status: 500, statusText: 'Internal Server Error' });
  
      try {
        let homedef = await readhomePromise;
        if (homedef) {
        }
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).withContext('Expect error code').toContain('500');
      }
    });

    it('createHomeDef and changeHomeDef success case', async ()=> {
      expect(service.HomeDefs.length).toEqual(0);
      const newhd = new HomeDef();
      newhd.ID = 15;
      newhd.Name = 'New';
      newhd.Host = 'aaa';
      newhd.Details = 'test.';
      newhd.BaseCurrency = 'CNY';

      // Create
      const createhome$ = service.createHomeDef(newhd);
      const createhomePromise = firstValueFrom(createhome$);
  
      // At this point, the request is pending, and we can assert it was made via the `HttpTestingController`:
      const req1 = httpTesting.expectOne(req => {
        return req.url.startsWith(dataAPIURL)
      }, 'Request to load the data');
      expect(req1.request.method).toEqual('POST');
  
      // Success
      req1.flush({
        Members: [],
        ID: newhd.ID,
        Name: newhd.Name,
        Details: newhd.Details,
        Host: newhd.Host,
        BaseCurrency: newhd.BaseCurrency,
        CreatedBy: 'aaa',
        CreatedAt: '2017-10-01',
      });
  
      try {
        let homedef = await createhomePromise;
        expect(homedef).toBeTruthy();

        expect(homedef.ID).toEqual(newhd.ID);
        expect(homedef.Name).toEqual(newhd.Name);
        expect(homedef.BaseCurrency).toEqual(newhd.BaseCurrency);
        expect(homedef.Details).toEqual(newhd.Details);
        expect(homedef.Host).toEqual(newhd.Host);
        expect(homedef.Members.length).toEqual(0);

        expect(service.HomeDefs.length).toEqual(1);
        expect(service.HomeDefs[0].ID).toEqual(newhd.ID);
        expect(service.HomeDefs[0].Name).toEqual(newhd.Name);
        expect(service.HomeDefs[0].BaseCurrency).toEqual(newhd.BaseCurrency);
        expect(service.HomeDefs[0].Details).toEqual(newhd.Details);
        expect(service.HomeDefs[0].Host).toEqual(newhd.Host);
        expect(service.HomeDefs[0].Members.length).toEqual(0);
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      // Change the home
      newhd.Name = 'Change';
      const changehome$ = service.changeHomeDef(newhd);
      const changehomePromise = firstValueFrom(changehome$);
  
      // At this point, the request is pending, and we can assert it was made via the `HttpTestingController`:
      const req2 = httpTesting.expectOne(req => {
        return req.url.startsWith(dataAPIURL)
      }, 'Request to load the data');
      expect(req2.request.method).toEqual('PUT');
  
      // Success
      req2.flush({
        Members: [],
        ID: newhd.ID,
        Name: newhd.Name,
        Details: newhd.Details,
        Host: newhd.Host,
        BaseCurrency: newhd.BaseCurrency,
        CreatedBy: 'aaa',
        CreatedAt: '2017-10-01',
      });
  
      try {
        let homedef = await changehomePromise;
        expect(homedef).toBeTruthy();

        expect(homedef.ID).toEqual(newhd.ID);
        expect(homedef.Name).toEqual(newhd.Name);
        expect(homedef.BaseCurrency).toEqual(newhd.BaseCurrency);
        expect(homedef.Details).toEqual(newhd.Details);
        expect(homedef.Host).toEqual(newhd.Host);
        expect(homedef.Members.length).toEqual(0);

        expect(service.HomeDefs.length).toEqual(1);
        expect(service.HomeDefs[0].ID).toEqual(newhd.ID);
        expect(service.HomeDefs[0].Name).toEqual(newhd.Name);
        expect(service.HomeDefs[0].BaseCurrency).toEqual(newhd.BaseCurrency);
        expect(service.HomeDefs[0].Details).toEqual(newhd.Details);
        expect(service.HomeDefs[0].Host).toEqual(newhd.Host);
        expect(service.HomeDefs[0].Members.length).toEqual(0);
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

});
