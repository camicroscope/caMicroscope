
 <?php 
  session_start();

  require '../authenticate.php';
  $config = require 'api/Configuration/config.php';

  $cancerType = "quip";

  $_SESSION["cancerType"] = $cancerType;
 ?>

    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='utf-8'>

        <title>[caMicroscope OSD][Subject: <?php echo json_encode($_GET['tissueId']); ?>][User: <?php echo $_SESSION["name"]; ?>]</title>

        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">

        <link rel="stylesheet" type="text/css" media="all" href="css/simplemodal.css" />
        <link rel="stylesheet" type="text/css" media="all" href="css/ui.fancytree.min.css" />
        <link rel="stylesheet" type="text/css" media="all" href="https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.7.0/jquery.modal.css" />
        <script src="js/dependencies/jquery.js"></script>

        <!--JSON Form dependencies-->
        <script type="text/javascript" src="js/dependencies/underscore.js">
            console.log(_);
        </script>

        <script>console.log("here"); console.log(_);
	       //	console.log("<?php echo $_SESSION["cancerType"]; ?>");
        </script>

        <script src="js/dependencies/jsonform.js"></script>
        <script src="js/dependencies/jsv.js"></script>
        <!--End JSON Form dependencies -->
        <!-- <script src="/featurescapeapps/js/findapi_config.js" type="text/javascript"></script>" -->
	<script src="/js/config.js"></script>

        <script src="js/openseadragon/openseadragon-bin-1.0.0/openseadragon.js"></script>
        <script src="js/openseadragon/openseadragon-imaginghelper.min.js"></script>
        <script src="js/openseadragon/openseadragon-scalebar.js"></script>
        <script src="js/mootools/mootools-core-1.4.5-full-nocompat-yc.js"></script>
        <script src="js/mootools/mootools-more-1.4.0.1-compressed.js"></script>
        <script src="js/imagemetadatatools/osdImageMetadata.js"></script>

	<script src="js/annotationtools_sc/annotools-openseajax-handler.js"></script>
        <script src="js/annotationtools_sc/ToolBar_sc.js"></script>
        <script src="js/annotationtools_sc/AnnotationStore_sc.js"></script>
        <script src="js/annotationtools_sc/osdAnnotationTools_sc.js"></script>
        <script src="js/annotationtools_sc/geoJSONHandler_sc.js"></script>

        <script src="js/dependencies/MD5.js"></script>
        <script src="https://code.jquery.com/ui/1.11.2/jquery-ui.min.js" type="text/javascript"></script>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.7.0/jquery.modal.js"> </script>
        <script src="js/dependencies/simplemodal.js"></script>
        <script src="js/dependencies/jquery.fancytree-all.min.js"></script>
        <script src="js/dependencies/d3.js"></script>

        <script src="js/Helpers/OsdStateManager.js"></script>

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
    </head>

    <body>

        <div id="container">
            <div id="tool"></div>
            <div id="panel"></div>
            <div id="algosel">
                <div id="tree"></div>
            </div>
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

	  console.log("cancerType is: "+cancerType);
	  console.log("tissueId is: "+tissueId);



          var imagedata = new OSDImageMetaData({imageId:tissueId});
          //console.log(imagedata);

          var MPP = imagedata.metaData[0];
	  console.log(MPP);
          //console.log(imagedata);
          var fileLocation = imagedata.metaData[1];//.replace("tcga_data","tcga_images");
          //console.log(fileLocation);

          var viewer = new OpenSeadragon.Viewer({
                id: "viewer",
                prefixUrl: "images/",
                showNavigator:  true,
                //navigatorPosition:   "BOTTOM_LEFT",
                navigatorPosition:   "BOTTOM_RIGHT",
                //navigatorId: "navigator",
                zoomPerClick: 2,
                //zoomPerScroll: 1,
                animationTime: 0.75,
                maxZoomPixelRatio: 2,
                visibilityRatio: 1,
                constrainDuringPan: true
          });
            console.log(viewer.navigator);
           // var zoomLevels = viewer.zoomLevels({
           //levels:[0.001, 0.01, 0.2, 0.1,  1]
           // });

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

            var StateMan = new OsdStateManager(viewer, {});
            StateMan.setState();
            viewer.addHandler("zoom", StateMan.getState);
            viewer.addHandler("pan", StateMan.getState);

           //console.log(viewer);

          function isAnnotationActive(){
              this.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
              this.isFirefox = typeof InstallTrigger !== 'undefined';
              this.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
		      this.isChrome = !!window.chrome;
		      this.annotationActive = !(this.isIE || this.isOpera);
		    return this.annotationActive;
	      }

         function addOverlays() {
            var annotationHandler = new AnnotoolsOpenSeadragonHandler(viewer, {});
             annotool= new annotools({
                    canvas:'openseadragon-canvas',
                    iid: tissueId,
				            cancerType: cancerType,
                    viewer: viewer,
                    annotationHandler: annotationHandler,
                    mpp:MPP
               });

            //console.log(tissueId);
            var toolBar = new ToolBar('tool', {
                left:'0px',
                top:'0px',
                height: '48px',
                width: '100%',
                iid: tissueId,
				        cancerType: cancerType,
                annotool: annotool

             });

           annotool.toolBar = toolBar;

           toolBar.createButtons();
	 var user_email = "<?php echo $_SESSION["email"]; ?>";  
         console.log("user_email :" + user_email);  
        var index = user_email.indexOf("@");
        var user= user_email.substring(0,index);
        var execution_id =user+"_composite_input" ;

   	annotool.execution_id = execution_id;
	annotool.user = user;
	console.log("execution_id :" + annotool.execution_id);

        /*Pan and zoom to point*/
        var bound_x = <?php echo json_encode($_GET['x']); ?>;
        var bound_y = <?php echo json_encode($_GET['y']); ?>;
        var zoom = <?php echo json_encode($_GET['zoom']); ?> || viewer.viewport.getMaxZoom();
        zoom =Number(zoom); //convert zoom to number if it is string
        jQuery("#panel").hide();
        if(bound_x && bound_y){
            var ipt = new OpenSeadragon.Point(+bound_x, +bound_y);
            var vpt = viewer.viewport.imageToViewportCoordinates(ipt);
            viewer.viewport.panTo(vpt);
            viewer.viewport.zoomTo(zoom);
        } else {
            console.log("bounds not specified");
        }
    }//end of addOverlays()

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
