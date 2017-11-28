<?php
/**
 * caMicroscope
 */
include 'shared/osdHeader.php';
?>

<!-- ANNOTATION -->
<script src="js/annotationtools/annotools-openseajax-handler.js"></script>
<script src="js/annotationtools/ToolBar.js"></script>
<script src="js/annotationtools/AnnotationStore.js"></script>
<script src="js/annotationtools/osdAnnotationTools.js"></script>
<script src="js/annotationtools/geoJSONHandler.js"></script>
<!-- /ANNOTATION -->

<div id="container">

    <div id="tool"></div>
    <div id="panel"></div>
    <div id="bookmarkURLDiv"></div>
    <div id="algosel">
        <div id="tree"></div>
    </div>

    <div class="demoarea">
        <div id="viewer" class="openseadragon"></div>
    </div>
    <div id="navigator"></div>

</div>

<script type="text/javascript">
    $.noConflict();

    var annotool, tissueId = null;
    tissueId = <?php echo json_encode($_GET['tissueId']); ?>;
    var imagedata = new OSDImageMetaData({imageId: tissueId});
    var MPP = imagedata.metaData[0];
    var fileLocation = imagedata.metaData[1];
    console.log("imagedata: ", imagedata);

    if (typeof tissueId === 'undefined' || tissueId === null || tissueId === '') {
        alert("tissueId is undefined. Exiting.");
    }

    jQuery("#bookmarkURLDiv").hide();

    var viewer = new OpenSeadragon.Viewer({
        id: "viewer",
        prefixUrl: "images/",
        showNavigator: true,
        navigatorPosition: "BOTTOM_RIGHT",
        //navigatorId: "navigator",
        zoomPerClick: 2,
        animationTime: 0.75,
        maxZoomPixelRatio: 2,
        visibilityRatio: 1,
        constrainDuringPan: true
        //zoomPerScroll: 1
    });
    //console.log(viewer.navigator);
    //      var zoomLevels = viewer.zoomLevels({
    //        levels:[0.001, 0.01, 0.2, 0.1,  1]
    //      });

    viewer.addHandler("open", addOverlays);
    viewer.clearControls();
    viewer.open("<?php print_r($config['fastcgi_server']); ?>?DeepZoom=" + fileLocation);

    var imagingHelper = new OpenSeadragonImaging.ImagingHelper({viewer: viewer});
    imagingHelper.setMaxZoom(1);

    overlayRoutine(tissueId, viewer);

    //console.log(this.MPP);

    try {
        viewer.scalebar({
            type: OpenSeadragon.ScalebarType.MAP,
            pixelsPerMeter: (1 / (parseFloat(this.MPP["mpp-x"]) * 0.000001)),
            xOffset: 5,
            yOffset: 10,
            stayInsideImage: true,
            color: "rgb(150,150,150)",
            fontColor: "rgb(100,100,100)",
            backgroundColor: "rgba(255,255,255,0.5)",
            barThickness: 2
        });
    }
    catch (ex) {
        console.log("scalebar err: ", ex.message);
    }
    

    /*
    // No longer using Filters/BRIGHTNESS
    osdVersion = OpenSeadragon.version;
    if ((osdVersion.major === 2 && osdVersion.minor >= 1) || osdVersion.major > 2) {
        // This plugin requires OpenSeadragon 2.1+
        viewer.setFilterOptions({
            filters: {
                processors: OpenSeadragon.Filters.BRIGHTNESS(0)
            }
        });
    }
    */

    //console.log(viewer);

    function isAnnotationActive() {
        // called from osdAnnotationTools.js
        this.isOpera = (!!window.opr && !!opr.addons) || navigator.userAgent.indexOf(' OPR/') >= 0;
        this.isFirefox = typeof InstallTrigger !== 'undefined';
        this.isSafari = ((navigator.userAgent.toLowerCase().indexOf('safari') > -1) && !(navigator.userAgent.toLowerCase().indexOf('chrome') > -1) && (navigator.appName == "Netscape"));
        this.isChrome = !!window.chrome && !!window.chrome.webstore;
        this.isIE = /*@cc_on!@*/false || !!document.documentMode;
        this.annotationActive = !( this.isIE || this.isOpera);
        return this.annotationActive;
    }

    function addOverlays() {
        var annotationHandler = new AnnotoolsOpenSeadragonHandler(viewer, {});

        annotool = new annotools({
            canvas: 'openseadragon-canvas',
            iid: tissueId,
            viewer: viewer,
            annotationHandler: annotationHandler,
            mpp: MPP
        });
        filteringtools = new FilterTools();
        //console.log(tissueId);
        var toolBar = new ToolBar('tool', {
            left: '0px',
            top: '0px',
            height: '48px',
            width: '100%',
            iid: tissueId,
            annotool: annotool,
            FilterTools: filteringtools
        });
        annotool.toolBar = toolBar;
        toolBar.createButtons();

        // For the bootstrap tooltip
        // jQuery('[data-toggle="tooltip"]').tooltip();
        // commented out, working on style

        //var panel = new panel();
        jQuery("#panel").hide();
        /*Pan and zoom to point*/
        var bound_x = <?php echo json_encode($_GET['x']); ?>;
        var bound_y = <?php echo json_encode($_GET['y']); ?>;
        var zoom = <?php echo json_encode($_GET['zoom']); ?> || viewer.viewport.getMaxZoom();
        zoom = Number(zoom); // convert string to number if zoom is string

        /*
        var savedFilters = [
          {'name': 'Brightness', 'value': 100},
          {'name': 'Erosion', 'value': 3},
          {'name': 'Invert'}
        ]

        if (savedFilters) {
          console.log('some filters are saved')
          console.log(filteringtools)
          filteringtools.showFilterControls();
          for(var i=0; i<savedFilters.length; i++){

                console.log(i);
                var f = savedFilters[i];
                var filterName = f.name;
                console.log(filterName);
                jQuery("#"+filterName+"_add").click();
                jQuery("#control"+filterName).val(f.value);
                jQuery("#control"+filterName+"Num").val(f.value);
            }
        }*/

        checkState(<?php echo json_encode($_GET['stateID']); ?>);

        if (bound_x && bound_y) {
            var ipt = new OpenSeadragon.Point(+bound_x, +bound_y);
            var vpt = viewer.viewport.imageToViewportCoordinates(ipt);
            viewer.viewport.panTo(vpt);
            viewer.viewport.zoomTo(zoom);
        } else {
            //console.log("bounds not specified");
        }
    }

    function checkState(stateID) {
        console.log("stateID: ", stateID);

        //Check if loading from saved state
        if (stateID) {
            console.log("so far so good");

            //fetch state from firebase
            jQuery.get("https://test-8f679.firebaseio.com/camicroscopeStates/" + stateID + ".json?auth=kweMPSAo4guxUXUodU0udYFhC27yp59XdTEkTSJ4", function (data) {

                var savedFilters = data.state.filters;
                var viewport = data.state.viewport;
                var pan = data.state.pan;
                var zoom = data.state.zoom || viewer.viewport.getMaxZoom();

                //pan and zoom have preference over viewport
                if (pan && zoom) {
                    console.log("pan && zoom");
                    viewer.viewport.panTo(pan);
                    viewer.viewport.zoomTo(zoom);

                } else {
                    if (viewport) {
                        console.log("viewport");
                        var bounds = new OpenSeadragon.Rect(viewport.x, viewport.y, viewport.width, viewport.height);
                        viewer.viewport.fitBounds(bounds, true);
                    }
                }
                // check if there are savedFilters
                if (savedFilters) {
                    console.log("savedFilters");

                    filteringtools.showFilterControls();

                    for (var i = 0; i < savedFilters.length; i++) {

                        var f = savedFilters[i];
                        var filterName = f.name;

                        jQuery("#" + filterName + "_add").click();
                        if (filterName === "SobelEdge") {
                            console.log("sobel");
                        } else {
                            jQuery("#control" + filterName).val(1 * f.value);
                            jQuery("#control" + filterName + "Num").val(1 * f.value);

                        }
                    }
                }
                filteringtools.updateFilters();

            });
        }
        else
        {
            console.log("no state id");
        }
    }

    if (!String.prototype.format) {
        String.prototype.format = function () {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined'
                    ? args[number]
                    : match
                    ;
            });
        };
    }


</script>
<?php include 'shared/osdFooter.php'; ?>
