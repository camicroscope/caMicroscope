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
        <!-- div id="bookmarkURLDiv"></div -->
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
        var imagedata = new OSDImageMetaData({
            imageId: tissueId
        }); // osdImageMetadata.js
        var MPP = imagedata.metaData[0];
        var fileLocation = imagedata.metaData[1];
        console.log("imagedata: ", imagedata);

        if (typeof tissueId === 'undefined' || tissueId === null || tissueId === '') {
            alert("tissueId is undefined. Exiting.");
        }

        //jQuery("#bookmarkURLDiv").hide();

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
        _viewer_source = "<?php print_r($config['fastcgi_server']); ?>?DeepZoom=" + fileLocation;
        viewer.open(_viewer_source);

        var imagingHelper = new OpenSeadragonImaging.ImagingHelper({
            viewer: viewer
        });
        imagingHelper.setMaxZoom(1);

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
        } catch (ex) {
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
            // isAnnotationActive called from osdAnnotationTools.js
            this.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

            this.isFirefox = typeof InstallTrigger !== 'undefined';

            //this.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0; // Fix Safari check.
            var browser = navigator.userAgent;
            this.isSafari = (browser.search("Safari") >= 0 && browser.search("Chrome") < 0);

            this.isEdge = (browser.search("Edge") >= 0);

            this.isChrome = !!window.chrome && !this.isOpera && !this.isEdge;

            this.isIE = /*@cc_on!@*/ false || !!document.documentMode;

            this.annotationActive = !(this.isIE || this.isOpera);
            return this.annotationActive;
        }

        function addOverlays() {
            var annotationHandler = new AnnotoolsOpenSeadragonHandler(viewer, {}); //annotools-openseajax-handler.js

            //osdAnnotationTools.js
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
                FilterTools: filteringtools,
                viewer: viewer
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



            checkState(<?php echo json_encode($_GET['stateID']); ?>);

            if (bound_x && bound_y) {
                var ipt = new OpenSeadragon.Point(+bound_x, +bound_y);
                var vpt = viewer.viewport.imageToViewportCoordinates(ipt);
                viewer.viewport.panTo(vpt);
                viewer.viewport.zoomTo(zoom);
            } else {
                console.log("bounds not specified");
            }
        }

        var PrefMan = new ClientPrefManager("viewer");
        // on a new press, do the following...
        window.onkeypress = function(event) {
            if (event.keyCode == 122) {
                var toggle = function(e) {
                    if (e) {
                        // if it's on, set it off
                        PrefMan.set_pref("scroll_zoom", false);
                        viewer.zoomPerScroll = 1.2;
                        console.log("Scroll Wheel Enabled")
                    } else {
                        // if it's off, set it on
                        PrefMan.set_pref("scroll_zoom", true);
                        viewer.zoomPerScroll = 1;
                        console.log("Scroll Wheel Disabled")
                    }
                }
                PrefMan.get_pref("scroll_zoom", disable_if_true);
            }
        }

        // Deal previously set
        var disable_if_true = function(e) {
            if (e) {
                viewer.zoomPerScroll = 1;
                // setting to one makes scroll not change zoom level
                console.log("Scroll Wheel Disabled")
            }
        };
        PrefMan.get_pref("scroll_zoom", disable_if_true);

        // handle session expiration/renew
        var st = new SessionTracker("camic");

        function renew_session() {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "../security/server.php?logIn", true);
            xhr.onload = function(e) {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        console.log(xhr.responseText);
                    } else {
                        console.error(xhr.statusText);
                    }
                }
            };
            xhr.send(null);
        }
        st.start(600000, 3e6, renew_session);
        // start the spyglass
        spyglass_init(_viewer_source);


        if (bound_x && bound_y) {
            var ipt = new OpenSeadragon.Point(+bound_x, +bound_y);
            var vpt = viewer.viewport.imageToViewportCoordinates(ipt);
            viewer.viewport.panTo(vpt);
            viewer.viewport.zoomTo(zoom);
        } else {
            console.log("bounds not specified");
        }

        if (!String.prototype.format) {
            String.prototype.format = function() {
                var args = arguments;
                return this.replace(/{(\d+)}/g, function(match, number) {
                    return typeof args[number] !== 'undefined' ?
                        args[number] :
                        match;
                });
            };
        }
    </script>
    <?php include 'shared/osdFooter.php'; ?>
