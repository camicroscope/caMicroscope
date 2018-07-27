const { expect } = require('chai');
var Draw = require("../DrawAnnots.js");
var ProxyTools = require("../reqs/ProxyTool.js")

describe('Draw annotations Component', function () {
  var context = ProxyTools.delayer({})
  var draw
  var geojson

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
    geojson = draw.stopDrawing()
    expect(geojson).to.have.property('geometry');
    expect(geojson).to.have.property('type');
    expect(geojson.geometry).to.have.property('type');
    expect(geojson.geometry).to.have.property('coordinates');
  });
  it('should return the right geojson coordinates', async function() {
    expect(geojson.geometry.coordinates[0]).to.deep.equal([[[0,0],[0,1],[1,1],[1,0],[0,0]]])
  });
});
