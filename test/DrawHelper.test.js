const caDrawHelper = require('../common/DrawHelper');

// Mock the Path2D object
class MockPath2D {
  rect() {}
  arc() {}
  moveTo() {}
  lineTo() {}
  closePath() {}
}

// Mock CanvasRenderingContext2D
const mockContext = {
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  arc: jest.fn(),
};

// Mock canvas
const mockCanvas = {
  getContext: jest.fn().mockReturnValue(mockContext),
};

// Mock point
const startPoint = [0, 0];
const endPoint = [100, 100];

// Initialize DrawHelper
const drawHelper = new caDrawHelper();

describe('caDrawHelper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('drawLine', () => {
    test('should call appropriate canvas methods to draw line', () => {
      drawHelper.drawLine(mockContext, startPoint, endPoint);

      // Assert canvas method calls
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalledWith(0, 0);
      expect(mockContext.lineTo).toHaveBeenCalledWith(100, 100);
      expect(mockContext.closePath).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });
  });
});
