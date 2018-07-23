const { expect } = require('chai');
var Draw = require("../DrawAnnots.js");
var ProxyTools = require("../../resource/ProxyTool.js")

describe('Draw annotations Component', function () {
  var context = ProxyTools.delayer({})
  var draw

  it('should initalize', async function () {
    draw = new Draw({}, context, true);
  });
  it('should accept points', async function () {
    draw.startDrawing()
    draw.extendFeature(0,0)
    draw.extendFeature(0,1)
    draw.extendFeature(1,1)
    draw.extendFeature(1,0)
  });
  it('should return a geojson', async function () {
    var geojson = draw.stopDrawing()
    expect(geojson).to.exist;
  });
});
