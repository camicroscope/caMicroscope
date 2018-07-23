const { expect } = require('chai');
var Render = require("../RenderAnnots.js")
var ProxyTools = require("../../resource/ProxyTool.js")

describe('Render annotations Component', function () {

  it('should render a given geojson', async function () {
    var context = ProxyTools.delayer({})
    var id = "test"
    var feature = {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [100.0, 0.0], [101.0, 0.0], [101.0, 1.0],
            [100.0, 1.0], [100.0, 0.0]
          ]
        ]
      }
    }
    Render.renderFeature(id, feature, context)

    expect(context.__queue).to.exist;
  });
});
