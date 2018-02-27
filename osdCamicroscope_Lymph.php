    <?php
	session_start();
	require '../authenticate.php';

    $config = require 'api/Configuration/config.php';
    //Set cancer type
      if(isset($_GET["cancerType"])){
          $cancerType = $_GET["cancerType"];
          $_SESSION["cancerType"] = "u24_" . $cancerType;
      }
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='utf-8'>

        <title>[caMicroscope OSD][Subject: <?php echo json_encode($_GET['tissueId']); ?>][User: <?php echo $_SESSION["name"]; ?>]</title>

        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">

        <!--<link rel="stylesheet" type="text/css" media="all" href="css/jquery-ui.min.css" />-->
        <link rel="stylesheet" type="text/css" media="all" href="css/simplemodal.css" />
        <link rel="stylesheet" type="text/css" media="all" href="css/ui.fancytree.min.css" />
        <link rel="stylesheet" type="text/css" media="all" href="https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.7.0/jquery.modal.css" />
        <script src="js/dependencies/jquery.js"></script>

        <!--JSON Form dependencies-->
        <script src="js/dependencies/underscore.js"></script>
        <script>
            console.log("underscore.js: _");
        </script>
        <script type="text/javascript" src="js/dependencies/jsonform.js"></script>
        <script type="text/javascript" src="js/dependencies/jsv.js"></script>
        <!--End JSON Form dependencies -->

        <script src="../js/config.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
        <script src="js/openseadragon/openseadragon-bin-1.0.0/openseadragon.js"></script>
        <script src="js/openseadragon/openseadragon-imaginghelper.min.js"></script>
        <script src="js/openseadragon/openseadragon-scalebar.js"></script>

        <script type="text/javascript" src="js/mootools/mootools-core-1.4.5-full-nocompat-yc.js"></script>
        <script type="text/javascript" src="js/mootools/mootools-more-1.4.0.1-compressed.js"></script>
        <!--<script src="js/annotationtools/annotools-openseajax-handler.js"></script>-->
        <script src="js/annotationtoolslymph/annotools-openseajax-handler-lymph.js"></script>
        <script src="js/imagemetadatatools/osdImageMetadata.js"></script>
        <!--<script src="js/annotationtools/ToolBar.js"></script>-->
        <!--<script src="js/annotationtools/AnnotationStore.js"></script>-->
        <!--<script src="js/annotationtools/osdAnnotationTools.js"></script>-->
		<!--<script src="js/annotationtools/osdAnnotationDotTools.js"></script>-->
		<!--<script src="js/annotationtools/osdAnnotationTools_Marking.js"></script>-->
        <!--<script src="js/annotationtools/geoJSONHandler.js"></script>-->

        <script src="js/annotationtoolslymph/ToolBar_Lymph.js"></script>
        <script src="js/annotationtoolslymph/AnnotationStore_Lymph.js"></script>
        <script src="js/annotationtoolslymph/osdAnnotationTools_Lymph.js"></script>
		<script src="js/annotationtoolslymph/osdAnnotationTools_Marking.js"></script>
        <script src="js/annotationtoolslymph/geoJSONHandler_Lymph.js"></script>

        <script src="js/dependencies/MD5.js"></script>
        <script src="http://code.jquery.com/ui/1.11.2/jquery-ui.min.js" type="text/javascript"></script>

        <!--<script src="js/dependencies/jquery-ui.min.js"></script>-->

        <script src="js/dependencies/jquery.fancytree-all.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.7.0/jquery.modal.js"> </script>
        <script src="js/dependencies/simplemodal.js"></script>
        <script src="js/dependencies/d3.js"></script>
        <style type="text/css">
            .openseadragon
            {
                height: 100%;
                min-height: 100%;
                width: 100%;
                position: absolute;
                top: 0;
                left: 0;
                margin: 0;
                padding: 0;
                background-color: #E8E8E8;
                border: 1px solid black;
                color: white;
            }
            .controls textarea{
              height: 50px;
            }
            .navWindow
            {
                position: absolute;
                z-index: 10001;
                right: 0;
                bottom: 0;
                border: 1px solid yellow;
            }
            .modal a.close-modal{
              top: 0;
              right: 0;
            }
        </style>
        <link rel="stylesheet" type="text/css" media="all" href="css/annotools.css" />
	    <link rel="stylesheet" type="text/css" media="all" href="css/multiheattools.css" />
    </head>

    <body>
        <div id="tool"></div>
        <div id="panel"></div>

        <div id="weightpanel">
            <a href='#'><div id='closeWeightPanel'><img src='images/ic_close_white_24px.svg' title='Close' alt="Close X" height="16" width="16"></div></a>
            <div id="bar1" class="bar" align="right"><div id="slide1" class="slide"></div></div>
            <label class="lb_heatmap"><input type="checkbox" id="cb1" checked> Lymphocyte Sensitivity</label>
            <div id="bar2" class="bar" align="right"><div id="slide2" class="slide"></div></div>
            <label class="lb_heatmap"><input type="checkbox" id="cb2" checked> Necrosis Specificity</label>
            <div id="bar3" class="bar" align="right"><div id="slide3" class="slide"></div></div>
            <label class="lb_heatmap"><input type="checkbox" id="cb3" checked> Smoothness</label><br><p>
	        <button type="button" class="btn_heatmap" id="btn_revertWeight">Revert Weights</button>
            <br><p>
            <input type="radio" name="weighttype" value="LymSe" id="LymSe"> <label for="LymSe" class=radio_markup>Lymphocyte Prediction</label> <br>
            <input type="radio" name="weighttype" value="NecSe" id="NecSe"> <label for="NecSe" class=radio_markup>Necrosis Prediction</label> <br>
            <input type="radio" name="weighttype" value="BothSe" id="BothSe" checked> <label for="BothSe" class=radio_markup>Lym Prediction with Nec Filtering</label> <br>
            <button type="button" class="btn_heatmap" id="btn_saveHeatmapWeight">Finalize</button>
            <button type="button" class="btn_heatmap" id="btn_heatmapweight_help">&#x2753</button>
        </div>

        <div id="markuppanel">
            <a href='#'><div id='closeMarkupPanel'><img src='images/ic_close_white_24px.svg' title='Close' alt="Close X" height="16" width="16"></div></a>
            <input type="radio" name="marktype" value="LymPos" checked="checked" id="LymPos" class="radio_markup">
            <label for="LymPos" class=radio_markup> (1) LymPos (draw thin line)</label><br>
            <input type="radio" name="marktype" value="LymNeg" id="LymNeg" class="radio_markup">
            <label for="LymNeg" class=radio_markup> (2) LymNeg (draw thin line)</label><br><p><p>
            <input type="radio" name="marktype" value="LymPosBig" id="LymPosBig" class="radio_markup">
            <label for="LymPosBig" class=radio_markup> (3) LymPos (draw thick line)</label><br>
            <input type="radio" name="marktype" value="LymNegBig" id="LymNegBig" class="radio_markup">
            <label for="LymNegBig" class=radio_markup> (4) LymNeg (draw thick line)</label><br><p><p>
            <input type="radio" name="marktype" value="TumorPos" id="TumorPos" class="radio_markup">
            <label for="TumorPos" class=radio_markup> (5) TumorPos (draw polygon)</label><br>
            <input type="radio" name="marktype" value="TumorNeg" id="TumorNeg" class="radio_markup">
            <label for="TumorNeg" class=radio_markup> (6) TumorNeg (draw polygon)</label><br><p><p>
            <input type="radio" name="marktype" value="Moving" id="rb_Moving" class="radio_markup">
            <label for="rb_Moving" class=radio_markup> (7) Save then Navigate</label><br>
            <button type="button" class="btn_mark" id="btn_savemark">Save</button>
            <button type="button" class="btn_mark" id="btn_undomark" >Cancel</button>
            <button type="button" class="btn_mark" id="btn_mark_help">&#x2753</button>
        </div>
        <div id="div_weight_locked" style="display: none;">Free</div>

        <div id="switchuserpanel"><a href='#'><div id='closeSwitchUser'><img src='images/ic_close_white_24px.svg' title='Close' alt="Close X" height="16" width="16"></div></a>
            <h6><img src="images/switch_user.svg" alt="Switch user" height="30" width="30"> Change username to:</h6><br />
        </div>

        <div id="algosel"><div id="tree"></div></div>
            <div class="demoarea">
                <div id="viewer" class="openseadragon"></div>
            </div>
        <div id="navigator"></div>

        </div>
        <div id="confirmDelete" style="display:none">
          <p> Please enter the secret: <input id="deleteSecret" type="password" /> <a href="#confirmDelete" rel="modal:close"><button id="confirmDeleteButton">Delete</button></a></p>
        </div>
        <script type="text/javascript">
          $.noConflict();
          var annotool = null;
          var tissueId = <?php echo json_encode($_GET['tissueId']); ?>;

          var cancerType = "<?php echo $_SESSION["cancerType"] ?>";
          //console.log(cancerType);
          var imagedata = new OSDImageMetaData({imageId:tissueId});
          //console.log(tissueId);
          //console.log(imagedata);
          //console.log(tissueId);

          var MPP = imagedata.metaData[0];
          console.log(MPP);
            //console.log(imagedata);
          var fileLocation = imagedata.metaData[1];//.replace("tcga_data","tcga_images");
          //console.log(fileLocation);

          var viewer = new OpenSeadragon.Viewer({
                id: "viewer",
                prefixUrl: "images/",
                showNavigator:  true,
                navigatorPosition:   "BOTTOM_RIGHT",
                //navigatorId: "navigator",
                zoomPerClick: 2,
                //zoomPerScroll: 1,
                animationTime: 0.75,
                maxZoomPixelRatio: 2,
                visibilityRatio: 1,
                constrainDuringPan: true
          });
            //console.log(viewer.navigator);
            //var zoomLevels = viewer.zoomLevels({
            //  levels:[0.001, 0.01, 0.2, 0.1,  1]
            //});

            viewer.addHandler("open", addOverlays);
            viewer.clearControls();
            viewer.open("<?php print_r($config['fastcgi_server']); ?>?DeepZoom=" + fileLocation);
            var imagingHelper = new OpenSeadragonImaging.ImagingHelper({viewer: viewer});
            imagingHelper.setMaxZoom(2);
            //console.log(this.MPP);
            viewer.scalebar({
              type: OpenSeadragon.ScalebarType.MAP,
              pixelsPerMeter: (1/(parseFloat(this.MPP["mpp-x"])*0.000001)),
              xOffset: 5,
              yOffset: 10,
              stayInsideImage: true,
              color: "rgb(150,150,150)",
              fontColor: "rgb(100,100,100)",
              backgroundColor: "rgba(255,255,255,0.5)",
              barThickness: 2
            });

          //console.log(viewer);

          function isAnnotationActive() {
              this.isOpera = (!!window.opr && !!opr.addons) || navigator.userAgent.indexOf(' OPR/') >= 0;
              // console.log("isOpera", this.isOpera);
              this.isFirefox = typeof InstallTrigger !== 'undefined';
              // console.log("isFirefox", this.isFirefox);
              this.isSafari = ((navigator.userAgent.toLowerCase().indexOf('safari') > -1) && !(navigator.userAgent.toLowerCase().indexOf('chrome') > -1) && (navigator.appName == "Netscape"));
              // console.log("isSafari", this.isSafari);
              this.isChrome = !!window.chrome && !!window.chrome.webstore;
              // console.log("isChrome", this.isChrome);
              this.isIE = /*@cc_on!@*/false || !!document.documentMode;
              // console.log("isIE", this.isIE);
              this.annotationActive = !( this.isIE || this.isOpera);
              // console.log("annotationActive", this.annotationActive);
              return this.annotationActive;
          }

    function addOverlays() {
        var annotationHandler = new AnnotoolsOpenSeadragonHandler(viewer, {});
        var sessionUsername = <?php echo '"' . $_SESSION['email'] . '"' ?>;
        //var sessionUsername = 'test@gmail.com';
        annotool= new annotools({
                canvas:'openseadragon-canvas',
                iid: tissueId,
                viewer: viewer,
                annotationHandler: annotationHandler,
                mpp:MPP,
                username: sessionUsername
            });
        //console.log(tissueId);
        var toolBar = new ToolBar('tool', {
                left:'0px',
                top:'0px',
                height: '48px',
                width: '100%',
                iid: tissueId,
                annotool: annotool

        });

        annotool.toolBar = toolBar;
        annotationHandler.annotool = annotool;
        annotationHandler.toolbar = toolBar;
        toolBar.createButtons();

        /*Pan and zoom to point*/
        var bound_x = <?php echo json_encode($_GET['x']); ?>;
        var bound_y = <?php echo json_encode($_GET['y']); ?>;
        var zoom = <?php echo json_encode($_GET['zoom']); ?> || viewer.viewport.getMaxZoom();
        zoom =Number(zoom); //convert zoom to number if it is string

        jQuery("#panel").hide();
        jQuery("#weightpanel").hide();
        jQuery("#markuppanel").hide();
        jQuery("#switchuserpanel").hide();

        /* Close weight panel */
        jQuery('#closeWeightPanel').click(function (e) {
	        e.preventDefault();
            jQuery("#weightpanel").hide('slide');
        });

        /* Close markup panel */
        jQuery('#closeMarkupPanel').click(function (e) {
	        e.preventDefault();
            annotool.mode = 'normal';
            jQuery("canvas").css("cursor", "default");
            jQuery("#freeLineMarkupButton").removeClass("active");
            jQuery("#markuppanel").hide('slide');
            annotool.drawLayer.hide();
            annotool.addMouseEvents();
        });

        if(bound_x && bound_y){
            var ipt = new OpenSeadragon.Point(+bound_x, +bound_y);
            var vpt = viewer.viewport.imageToViewportCoordinates(ipt);
            viewer.viewport.panTo(vpt);
            viewer.viewport.zoomTo(zoom);
        } else {
            console.log("bounds not specified");
        }
    }

    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
            ;
            });
        };
    }

    /*Zoom to location*/
    /*
        x: 19483.04157968738
        y: 22274.643967801494
    */
    /*
        x: 13083.041579687379
        y: 19609.643967801494
    */

</script>
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-46271588-1', 'auto');
  ga('send', 'pageview');

</script>

</body>
</html>
