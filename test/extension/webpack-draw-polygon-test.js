//Stylesheets
//google material icons css sheet
import 'google material icons css sheet'
//css sheet
import '../../css/style.css'
//zoom control css
import '../../core/extension/openseadragon-zoom-control/openseadragon-zoom-control.css'
//loading cover css
import '../../components/loading/loading.css'
//toolbar css
import '../../components/toolbar/toolbar.css'
//color-picker-css
import '../../common/colorpicker/color-picker.css'

import '../../core/extension/openseadragon-measurement-tool/openseadragon-measurement-tool.css'

import '../../core/extension/openseadragon-labeling/openseadragon-labeling.css'

//JS files
//Fetch
import './slideId'
//loading cover js
import '../../components/loading/loading.js'
//toolbar js
import '../../components/toolbar/toolbar.js'
//color picker js
import '../../common/colorpicker/color-picker.js'
//open seadragon lib
import '../../core/openseadragon/openseadragon.js'
import '../../core/openseadragon-imaginghelper.min.js'
import '../../core/openseadragon-scalebar.js'
import '../../core/openseadragonzoomlevels.js'
//util.js
import '../../common/util.js'
//core (package/ext) libs
import '../../common/DrawHelper.js'
import '../../common/simplify.js'
import '../../common/paths.js'
import '../../core/Store.js'
import '../../core/CaMic.js'
import '../../core/extension/openseadragon-canvas-draw-overlay.js'
import '../../core/extension/openseadragon-overlays-manage.js'
import '../../core/extension/openseadragon-measurement-tool/openseadragon-measurement-tool.js'
import '../../core/extension/openseadragon-zoom-control/openseadragon-zoom-control.js'
//ods js
import '../../apps/viewer/uicallbacks.js'
import '../../apps/viewer/dataloaders.js'
//init data
import 'draw-polygon-test.js'
const $D = {
    pages: {
        home: '/table.html',
        table: '/table.html'
    },
    params: null // parameter from url - slide Id and status in it (object).
};

Loading.open(document.body, 'CaMicroscope is initializing...');
// get slide id from url
// $D.params = getUrlVars();
$D.params = {slideId: 'CMU1'};
$D.params.slideId = 'CMU1';
// load if we have at least one slide query element
if ($D.params && $D.params.slideId) {
    // normal initialization starts
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    let STORE = new Store('../../data/', {});
    STORE.findSlide('CMU1').then(x => {
        let offset = parseInt($D.params.offset, 10) || 0;
        if (x.length === 0 || offset >= x.length) {
            redirect($D.pages.table, 'No Slide Found. Redirecting to Table.');
        } else {
            newParams = $D.params;
            // delete newParams.data
            // delete newParams.slide
            // delete newParams.location
            // delete newParams.offset
            newParams.slideId = x[offset]['_id']['$oid'];
            newUrl = window.location.href.split("?")[0] + "?" + objToParamStr(newParams);
            window.location.href = newUrl
        }
    }).catch(e => {
        console.warn(e);
        redirect($D.pages.table, 'Redirecting to Table.');
    })
    // find the associated slideID
    // open viewer with that slideID
}

// get states parameters
if ($D.params.states) {
    $D.params.states = StatesHelper.decodeStates($D.params.states);
}