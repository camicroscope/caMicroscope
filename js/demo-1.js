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
        console.log($CAMIC.viewer.omanager);
        $CAMIC.viewer.omanager.addOverlay({id: 'id01', data: data1, render: renderPoly, isShow: true});
    });

}

/**
 * renders a polygon onto a layer or canvas
 * @param context - the canvas context or layer
 * @param points - a list of coordinates, each in form [x,y]
 **/
function renderPoly(context, points) {
    context.lineWidth = 10;
    context.strokeStyle = 'yellow';
    context.fillStyle = 'rgba(125,125,125,.4)';
    context.moveTo(points[0][0], points[0][1]);
    context.lineTo(points[0][0], points[0][1]);
    context.beginPath();
    //console.log(points);
    points.slice(1).forEach(function (coord) {
        let x = coord[0];
        let y = coord[1];
        context.lineTo(x, y);
    });
    context.lineTo(points[0][0], points[0][1]);
    context.closePath();
    context.stroke();
}

function redirect(url, text = '', sec = 5) {
    let timer = sec;
    setInterval(function () {
        if (!timer) {
            window.location.href = url;
        }

        if (Loading.instance.parentNode) {
            Loading.text.textContent = `${text} ${timer}s.`;
        } else {
            Loading.open(document.body, `${text} ${timer}s.`);
        }
        // Hint Message for clients that page is going to redirect to Flex table in 5s
        timer--;

    }, 1000);
}