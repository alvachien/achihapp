//
// Unit test for common.ts
//

import {
  isOverviewDateInScope,
  OverviewScopeEnum,
  MultipleNamesObject,
  AppLanguage,
  AppLanguageJson,
  getOverviewScopeRange,
  Tag,
  TagTypeEnum,
  TagCount,
} from './common';

describe('isOverviewDateInScope', () => {
  let dt: Date;
  beforeEach(() => {
    dt = new Date(); // Now
  });

  it('shall work', () => {
    const inscope = isOverviewDateInScope(dt, OverviewScopeEnum.All);
    expect(inscope).toBeTrue();
  });
});

describe('MultipleNamesObject', () => {
  let testobj: MultipleNamesObject;

  beforeEach(() => {
    testobj = new MultipleNamesObject();
  });

  it('onInit', () => {
    testobj.ChineseName = 'aaa';
    expect(testobj.ChineseName.length).toBeGreaterThan(0);

    testobj.onInit();
    expect(testobj.ChineseName.length).toEqual(0);
  });

  it('onVerify', () => {
    testobj.ChineseName = 'aaa';
    let vrst = testobj.onVerify();
    expect(vrst).toBeTrue();

    testobj.onInit();
    vrst = testobj.onVerify();
    expect(vrst).toBeFalse();

    testobj.NativeName = 'aaa';
    vrst = testobj.onVerify();
    expect(vrst).toBeTrue();
  });

  it('writeObject shall work', () => {
    testobj.ChineseName = 'aaa';
    testobj.NativeName = 'bbb';
    const writeobj = testobj.writeJSONObject();
    expect(writeobj).toBeTruthy();
    expect(writeobj.ChineseName).toEqual(testobj.ChineseName);
    expect(writeobj.NativeName).toEqual(testobj.NativeName);
    expect(writeobj.NativeIsChinese).toBeFalse();

    const testobj2: MultipleNamesObject = new MultipleNamesObject();
    testobj2.onSetData(writeobj);
    expect(testobj2.ChineseName).toEqual(testobj.ChineseName);
    expect(testobj2.NativeName).toEqual(testobj.NativeName);
  });
});

describe('AppLanguage', () => {
  let testobj: AppLanguage;

  beforeEach(() => {
    testobj = new AppLanguage();
  });

  it('onSetData shall work', () => {
    const jdata: AppLanguageJson = {
      Lcid: 1,
      ISOName: 'Lang1',
      NativeName: 'Language 1',
      EnglishName: 'Language_1',
    };
    testobj.onSetData(jdata);
    expect(jdata.ISOName).toEqual(testobj.IsoName);
    expect(jdata.Lcid).toEqual(testobj.Lcid);
    expect(jdata.NativeName).toEqual(testobj.NativeName);
    expect(jdata.EnglishName).toEqual(testobj.EnglishName);
    expect(testobj.AppFlag).toBeFalsy();
  });
});

describe('Tag', () => {
  let objTag: Tag;

  beforeEach(() => {
    objTag = new Tag();
  });

  it('init', () => {
    expect(objTag).toBeTruthy();
  });

  it('onSetData', () => {
    objTag.onSetData({
      tagType: 10,
      tagID: 123,
      tagSubID: 456,
      term: 'abc',
    });
    expect(objTag.LinkTarget).toEqual('/finance/document/display/123');
    expect(objTag.TagType).toEqual(TagTypeEnum.FinanceDocumentItem);
    expect(objTag.TagID).toEqual(123);
    expect(objTag.TagSubID).toEqual(456);
    expect(objTag.Term).toEqual('abc');
  });
});

describe('TagCount', () => {
  let tcount: TagCount;

  beforeEach(() => {
    tcount = new TagCount();
  });

  it('init', () => {
    expect(tcount).toBeTruthy();
  });

  it('onSetData', () => {
    tcount.onSetData({
      term: 'abc',
      termCount: 10,
    });

    expect(tcount.Term).toBe('abc');
    expect(tcount.TermCount).toEqual(10);
  });
});

describe('getOverviewScopeRange', () => {
  const seldate = new Date(2025, 1, 27)

  beforeEach(() => {
    // Empty.
  });

  it('CurrentMonth', () => {
    const rst = getOverviewScopeRange(OverviewScopeEnum.CurrentMonth, seldate);
    expect(rst.BeginDate.getDate()).toEqual(1);
    expect(rst.BeginDate.getMonth()).toEqual(1);
    expect(rst.BeginDate.getFullYear()).toEqual(2025);
    expect(rst.EndDate.getDate()).toEqual(28);
    expect(rst.EndDate.getMonth()).toEqual(1);
    expect(rst.EndDate.getFullYear()).toEqual(2025);
  });
  it('CurrentYear', () => {
    const rst = getOverviewScopeRange(OverviewScopeEnum.CurrentYear, seldate);
    expect(rst.BeginDate.getDate()).toEqual(1);
    expect(rst.BeginDate.getMonth()).toEqual(0);
    expect(rst.BeginDate.getFullYear()).toEqual(2025);
    expect(rst.EndDate.getDate()).toEqual(31);
    expect(rst.EndDate.getMonth()).toEqual(11);
    expect(rst.EndDate.getFullYear()).toEqual(2025);
  });
  it('CurrentQuarter', () => {
    const rst = getOverviewScopeRange(OverviewScopeEnum.CurrentQuarter, seldate);
    expect(rst.BeginDate.getDate()).toEqual(1);
    expect(rst.BeginDate.getMonth()).toEqual(0);
    expect(rst.BeginDate.getFullYear()).toEqual(2025);
    expect(rst.EndDate.getDate()).toEqual(31);
    expect(rst.EndDate.getMonth()).toEqual(2);
    expect(rst.EndDate.getFullYear()).toEqual(2025);
  });
  it('PreviousMonth', () => {
    const rst = getOverviewScopeRange(OverviewScopeEnum.PreviousMonth, seldate);
    expect(rst.BeginDate.getDate()).toEqual(1);
    expect(rst.BeginDate.getMonth()).toEqual(0);
    expect(rst.BeginDate.getFullYear()).toEqual(2025);
    expect(rst.EndDate.getDate()).toEqual(31);
    expect(rst.EndDate.getMonth()).toEqual(0);
    expect(rst.EndDate.getFullYear()).toEqual(2025);
  });
  it('PreviousYear', () => {
    const rst = getOverviewScopeRange(OverviewScopeEnum.PreviousYear, seldate);
    expect(rst.BeginDate.getDate()).toEqual(1);
    expect(rst.BeginDate.getMonth()).toEqual(0);
    expect(rst.BeginDate.getFullYear()).toEqual(2024);
    expect(rst.EndDate.getDate()).toEqual(31);
    expect(rst.EndDate.getMonth()).toEqual(11);
    expect(rst.EndDate.getFullYear()).toEqual(2024);
  });
  it('PreviousQuarter', () => {
    const rst = getOverviewScopeRange(OverviewScopeEnum.PreviousQuarter, seldate);
    expect(rst.BeginDate.getDate()).toEqual(1);
    expect(rst.BeginDate.getMonth()).toEqual(9);
    expect(rst.BeginDate.getFullYear()).toEqual(2024);
    expect(rst.EndDate.getDate()).toEqual(31);
    expect(rst.EndDate.getMonth()).toEqual(11);
    expect(rst.EndDate.getFullYear()).toEqual(2024);
  });  
  it('CurrentWeek', () => {
    const rst = getOverviewScopeRange(OverviewScopeEnum.CurrentWeek, seldate);
    // Sunday - Saturday
    expect(rst.BeginDate.getDate()).toEqual(23);
    expect(rst.BeginDate.getMonth()).toEqual(1);
    expect(rst.BeginDate.getFullYear()).toEqual(2025);
    expect(rst.EndDate.getDate()).toEqual(1);
    expect(rst.EndDate.getMonth()).toEqual(2);
    expect(rst.EndDate.getFullYear()).toEqual(2025);
  });
});
