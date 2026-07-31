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

  describe('drawMultiline', () => {
    test('should draw a line between each consecutive pair of points', () => {
      const points = [[0, 0], [10, 10], [20, 0]];
      drawHelper.drawMultiline(mockContext, points);

      expect(mockContext.moveTo).toHaveBeenCalledWith(0, 0);
      expect(mockContext.lineTo).toHaveBeenCalledWith(10, 10);
      expect(mockContext.moveTo).toHaveBeenCalledWith(10, 10);
      expect(mockContext.lineTo).toHaveBeenCalledWith(20, 0);
      expect(mockContext.stroke).toHaveBeenCalledTimes(2);
    });
  });

  describe('setStyle', () => {
    test('should apply the given style to the canvas context', () => {
      const style = {color: '#000000', lineJoin: 'round', lineCap: 'round', lineWidth: 2, isFill: false};
      const ctx = {};
      drawHelper.setStyle(ctx, style);

      expect(ctx.strokeStyle).toBe('#000000');
      expect(ctx.lineJoin).toBe('round');
      expect(ctx.lineCap).toBe('round');
      expect(ctx.lineWidth).toBe(2);
      expect(ctx.isFill).toBe(false);
    });

    test('should fall back to default style when none is given', () => {
      const ctx = {};
      drawHelper.setStyle(ctx, null);

      expect(ctx.strokeStyle).toBe('#fccde5');
      expect(ctx.isFill).toBe(true);
    });
  });
});
