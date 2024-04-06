const {smartpen, mathtoolSmartpen} = require('../common/smartpen/autoalign');

describe('smartpen class', () => {
  let spen;

  beforeEach(() => {
    spen = new smartpen();
  });

  test('init method initializes properties correctly', () => {
    expect(spen.canvas).toBeUndefined();
    expect(spen.context).toBeUndefined();
    expect(spen.data).toBeInstanceOf(Map);
    expect(spen.threshold).toEqual(90);
    expect(spen.smoothness).toEqual(4 * 4);
    expect(spen.radius).toEqual(30);
    expect(spen.mode).toEqual(0);
    expect(spen.menuon).toBeFalsy();
    expect(spen.undo).toBeUndefined();
  });
});

describe('mathtoolSmartpen class', () => {
  let mtool;

  beforeEach(() => {
    mtool = new mathtoolSmartpen();
  });

  test('gaussianInterpolate method interpolates points correctly', () => {
    const arr = [
      [0, 0],
      [2, 2],
      [4, 4],
      [6, 6],
    ];
    const interpolated = mtool.gaussianInterpolate(arr, 1, {x: 1, y: 1});
  });
});
