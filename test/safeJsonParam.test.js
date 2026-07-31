const safeParseJsonParam = require('../common/safeJsonParam');

describe('safeParseJsonParam', () => {
  test('returns the fallback for null/empty input', () => {
    expect(safeParseJsonParam(null, {})).toEqual({});
    expect(safeParseJsonParam('', [])).toEqual([]);
  });

  test('returns the fallback for malformed JSON instead of throwing', () => {
    expect(() => safeParseJsonParam('{not valid json', {})).not.toThrow();
    expect(safeParseJsonParam('{not valid json', {isDefault: true})).toEqual({isDefault: true});
  });

  test('parses valid JSON matching the expected shape', () => {
    expect(safeParseJsonParam('{"a":1}', {}, (v) => typeof v === 'object' && !Array.isArray(v)))
        .toEqual({a: 1});
    expect(safeParseJsonParam('[1,2,3]', [], Array.isArray)).toEqual([1, 2, 3]);
  });

  test('falls back when the parsed value does not match the expected shape', () => {
    // an object passed where an array ('l') was expected
    expect(safeParseJsonParam('{"a":1}', [], Array.isArray)).toEqual([]);
    // an array passed where an object ('q') was expected
    expect(safeParseJsonParam('[1,2,3]', {}, (v) => v !== null && typeof v === 'object' && !Array.isArray(v)))
        .toEqual({});
  });
});
