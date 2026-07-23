const {normalizeMctLocation} = require('../common/MultiChannelMods');

describe('normalizeMctLocation', () => {
  it('strips the /images/ prefix every slide location is stamped with', () => {
    expect(normalizeMctLocation('/images/foo.ome.tif')).toBe('foo.ome.tif');
  });

  it('strips the prefix for locations with subdirectories (extracted zip contents)', () => {
    expect(normalizeMctLocation('/images/exemplar-001_3/sample.ome.tiff')).toBe(
        'exemplar-001_3/sample.ome.tiff');
  });

  it('leaves an already-relative location unchanged', () => {
    expect(normalizeMctLocation('foo.ome.tif')).toBe('foo.ome.tif');
  });

  it('does not touch an unrelated absolute path', () => {
    // not expected in practice (every slide location is under /images/), but
    // normalizeMctLocation should never mangle something it doesn't recognize
    expect(normalizeMctLocation('/other/foo.tif')).toBe('/other/foo.tif');
  });
});
