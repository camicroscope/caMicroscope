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

        getLayerId();

        // Display by fetching data
        // _1n7w6ahx2
        let url='/data/Mark/multi?name=["_1n7w6ahx2"]&slide=CMU1';
        fetchJSON(url, queryPoly);

        // Display with coordinates
        $CAMIC.viewer.omanager.addOverlay({id: getLayerId(), data: this.coords, render: renderPoly, isShow: true});

        // Display using spatial query
        // _rh5xco7oc
        url='http://nexi-bmi.uhmc.sunysb.edu:4010/data/Mark/findBound?x0=0.45&y0=0.62&x1=0.53&y1=0.68';
        fetchJSON(url, queryPoly);

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

    //console.log('item1', JSON.stringify(item1));

    let array1 = item1[0].geometries.features[0].geometry.coordinates[0];
    //console.log('array1', array1);

    const map1 = array1.map(x => {
        const img_point = $CAMIC.viewer.viewport.viewportToImageCoordinates(x[0], x[1]);
        return [img_point.x, img_point.y];
    });
    //console.log('map1', map1);

    $CAMIC.viewer.omanager.addOverlay({id: getLayerId(), data: map1, render: renderPoly, isShow: true});
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

// image coordinates
coords = [
    [1000, 1000],
    [1100, 1000],
    [1200, 1100],
    [1100, 1200],
    [1000, 1200],
    [900, 1100],
    [1000, 1000],
];

layerId = 'id0';

function getLayerId()
{
    let tmp = this.layerId;
    let pre = tmp.slice(0, -1);
    let num = tmp.substr(-1);
    let integer = parseInt(num);
    integer = integer + 1;
    this.layerId = (pre + integer);

    return this.layerId;
}
