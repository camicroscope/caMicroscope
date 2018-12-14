/*
Code borrowed from init.js
Create a line-draw button.
To check your drawing, use $CAMIC.viewer.canvasDrawInstance.getImageFeatureCollection()
Call code from copy of demo.html
<script src='./js/demoLite.js'></script>
*/

// CAMIC is an instance of camicroscope core
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
function initialize() {
    // init UI -- some of them need to wait data loader to load data
    // because UI components need data to initialize
    initUIcomponents();

    // create a viewer and set up
    initCore();
}

// setting core functionality
function initCore() {
    // start initial

    const opt = {
        hasZoomControl: true,
        hasDrawLayer: true,
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
    // $CAMIC.viewer.addOnceHandler('open', function (e) {
    //     // ready to draw
    //     console.log($CAMIC.viewer.omanager);
    //
    // });
}

function initUIcomponents() {
    // ui init
    $UI.toolbar = new CaToolbar({
        /* opts that need to think of */
        id: 'ca_tools',
        zIndex: 601,
        hasMainTools: false,
        subTools: [
            // free-line
            {
                icon: 'border_color',// material icons' name
                title: 'Line',
                type: 'check',
                value: 'line',
                callback: freeLine
            }

        ]
    });

}

// pen draw callback
function freeLine(e) {
    if (!$CAMIC.viewer.canvasDrawInstance) {
        alert('draw doesn\'t initialize');
        return;
    }
    console.log(e);
    const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
    canvasDraw.drawMode = 'line';
    if (e.checked) {
        canvasDraw.drawOn();
    } else {
        canvasDraw.drawOff();
    }
}

function redirect(url, text = '', sec = 5) {
    console.log('we are here');
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

