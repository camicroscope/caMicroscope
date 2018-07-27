const {expect} = require('chai');
var ProxyTools = require("../reqs/ProxyTool.js")
var delayer = ProxyTools.delayer;
var ViewportCalibratedCanvas = delayer;
var Layer = require("../Layer.js");


describe('Layer Component', function () {
  var layer;

  it('should initalize', async function () {
    layer = new Layer({})
  });
  /** -- SKIPPING to delayer depencency issue
  it('should create a visible layer', async function () {
    var test_layer = layer.getLayer("test");
    expect(layer.layers).to.have.property('test');
    expect(layer.delayers).to.have.property('test');
    expect(layer.visibleLayers.has("test")).to.be.true
  });
  **/
  it('should support hiding a layer', async function () {
    layer.hideLayer("test");
    expect(layer.visibleLayers.has("test")).to.be.false
  });
});
