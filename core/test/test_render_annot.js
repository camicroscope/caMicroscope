const {expect} = require('chai');
var Render = require("../RenderAnnots.js")
var ProxyTools = require("../reqs/ProxyTool.js")

describe('Render annotations Component', function() {

    it('should render a given geojson', async function() {
        var context = ProxyTools.delayer({})
        var id = "test"
        var feature = {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [100.0, 0.0],
                        [101.0, 0.0],
                        [101.0, 1.0],
                        [100.0, 1.0],
                        [100.0, 0.0]
                    ]
                ]
            }
        }
        Render.renderFeature(id, feature, context)

        expect(context.__queue).to.exist;
        var expected = [
            [
                "set",
                "strokeStyle",
                "#d95f02"
            ],
            [
                "fcn",
                "moveTo", [
                    100,
                    0
                ]
            ],
            [
                "fcn",
                "lineTo", [
                    100,
                    0
                ]
            ],
            [
                "fcn",
                "beginPath", []
            ],
            [
                "fcn",
                "lineTo", [
                    101,
                    0
                ]
            ],
            [
                "fcn",
                "lineTo", [
                    101,
                    1
                ]
            ],
            [
                "fcn",
                "lineTo", [
                    100,
                    1
                ]
            ],
            [
                "fcn",
                "lineTo", [
                    100,
                    0
                ]
            ],
            [
                "fcn",
                "lineTo", [
                    100,
                    0
                ]
            ],
            [
                "fcn",
                "closePath", []
            ],
            [
                "fcn",
                "stroke", []
            ]
        ];
        expect(context.__queue).to.deep.equal(expected);
    });
});
