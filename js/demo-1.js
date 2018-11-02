// image coordinates
const data1 = [
    [1000, 1000],
    [1100, 1000],
    [1200, 1100],
    [1100, 1200],
    [1000, 1200],
    [900, 1100],
    [1000, 1000],
];


// CAMIC is an instance of caMicroscope core
let $CAMIC = null;
// for all instances of UI components
const $UI = {};

const $D = {
    pages: {
        home: './table.html',
        table: './table.html'
    },
    params: null // parameter from url - slide Id and status in it (object).
};

// initialize viewer page
// setting core functionalities
function initialize() {
    // start initial
    const opt = {
        hasZoomControl: true,
        hasDrawLayer: false,
        hasLayerManager: true,
        hasScalebar: true,
        hasMeasurementTool: true
    };

    // set states if exist
    if ($D.params.states) {
        opt.states = $D.params.states;
    }

    try {
        $CAMIC = new CaMic("main_viewer", $D.params.slideId, opt);
    } catch (error) {
        Loading.close();
        $UI.message.addError('Core Initialization Failed');
        console.error(error);
        return;
    }

    $CAMIC.loadImg(function (e) {
        // image loaded
        if (e.hasError) {
            $UI.message.addError(e.message)
        }
    });

    // draw something
    $CAMIC.viewer.addOnceHandler('open', function (e) {
        // ready to draw

        // Display by fetching data
        fetchJSON('/data/Mark/multi?name=["_1n7w6ahx2"]&slide=CMU1', queryPoly);

        // Display with hardcoded coordinates
        $CAMIC.viewer.omanager.addOverlay({id: 'id01', data: data1, render: renderPoly, isShow: true});
    });

}

/**
 * renders a polygon onto a layer or canvas
 * @param context - the canvas context or layer
 * @param points - a list of coordinates, each in form [x,y]
 **/
function renderPoly(context, points) {

    // console.log('length', points.length, 'points', points);

    context.lineWidth = 10;
    context.strokeStyle = 'yellow';
    context.fillStyle = 'rgba(125,125,125,.4)';
    context.moveTo(points[0][0], points[0][1]);
    context.lineTo(points[0][0], points[0][1]);
    context.beginPath();

    points.slice(1).forEach(function (coord) {
        let x = coord[0];
        let y = coord[1];
        context.lineTo(x, y);
    });

    context.lineTo(points[0][0], points[0][1]);
    context.closePath();
    context.stroke();
}

function queryPoly(item, item1) {

    // This works
    let data2 = item1[0].geometries.features[0].geometry.coordinates[0];
    console.log('data2', data2);

    $CAMIC.viewer.omanager.addOverlay({id: 'id02', data: data2, render: renderPoly, isShow: true});
    $CAMIC.viewer.omanager.updateView();

}

function fetchJSON(url, options, callback) {

    if (typeof options === 'function') {
        callback = options;
        options = {}
    }

    options = options || {};

    const headers = (options.headers || (options.headers = {}));
    headers.Accept = 'application/json';

    fetch(url, options)
        .then(response => response.json())
        .then(json => callback(null, json), callback)
}
