<?php require '../authenticate.php';

$config = require 'api/Configuration/config.php';

?>
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>

    <title>[caMicroscope OSD][Subject: <?php echo json_encode($_GET['tissueId']); ?>][User: <?php echo $_SESSION["name"]; ?>]</title>

    <link rel="stylesheet" type="text/css" media="all" href="css/annotools.css" />
    <!--<link rel="stylesheet" type="text/css" media="all" href="css/jquery-ui.min.css" />-->
    <link rel="stylesheet" type="text/css" media="all" href="css/simplemodal.css" />
    <script src="js/dependencies/jquery.js"></script>

    <script src="js/openseadragon/openseadragon-bin-2.0.0/openseadragon.js"></script>
    <script src="js/openseadragon/openseadragon-imaginghelper.min.js"></script>
    <script src="js/openseadragon/openseadragon-scalebar.js"></script>
    <script src="js/openseadragon/openseadragonzoomlevels.js"></script>
    <script type="text/javascript" src="js/mootools/mootools-core-1.4.5-full-nocompat-yc.js"></script>
    <script type="text/javascript" src="js/mootools/mootools-more-1.4.0.1-compressed.js"></script>
    <script src="js/annotationtools/annotools-openseajax-handler.js"></script>
    <script src="js/imagemetadatatools/osdImageMetadata.js"></script>
    <script src="js/annotationtools/ToolBar.js"></script>
    <script src="js/annotationtools/AnnotationStore.js"></script>
    <script src="js/annotationtools/osdAnnotationTools.js"></script>
    <script src="js/annotationtools/geoJSONHandler.js"></script>
    <script src="js/dependencies/MD5.js"></script>
    <!--<script src="js/dependencies/jquery-ui.min.js"></script>-->
    <script src="js/dependencies/simplemodal.js"></script>
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

	.navWindow
	{
	    position: absolute;
            z-index: 10001;
            right: 0;
            bottom: 0;
            border: 1px solid yellow;
	}
    </style>
</head>

<body>

    <div id="container">
                
        <div id="tool"></div>
        <div class="demoarea">
            <div id="viewer" class="openseadragon"></div>
        </div>


    </div>

    <script type="text/javascript">
      $.noConflict();
      var annotool = null;
      var tissueId = <?php echo json_encode($_GET['tissueId']); ?>;


      var imagedata = new OSDImageMetaData({imageId:tissueId});
      console.log(tissueId);
      console.log(imagedata);
      console.log(tissueId);
      
      var MPP = imagedata.metaData[0];

        console.log(imagedata);
      var fileLocation = imagedata.metaData[1];
      console.log(fileLocation);
     
      var viewer = new OpenSeadragon.Viewer({ 
            id: "viewer", 
            prefixUrl: "images/",
            showNavigator:  true,
	        zoomPerClick: 2,
            maxZoomPixelRatio: 2,
            animationTime: 0.8
      });

//      var zoomLevels = viewer.zoomLevels({
//        levels:[0.001, 0.01, 0.2, 0.1,  1]
//      });
      viewer.addHandler("open", addOverlays);
      viewer.clearControls();
      viewer.open("<?php print_r($config['fastcgi_server']); ?>?DeepZoom=" + fileLocation);
      var imagingHelper = new OpenSeadragonImaging.ImagingHelper({viewer: viewer});
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


    function isAnnotationActive(){
        this.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        this.isFirefox = typeof InstallTrigger !== 'undefined';
        this.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        this.isChrome = !!window.chrome;
        this.annotationActive = !(this.isFirefox || this.isIE || this.isOpera);
        return this.annotationActive;
    }

    function addOverlays() {
        var annotationHandler = new AnnotoolsOpenSeadragonHandler(viewer, {});
        annotool= new annotools({
                canvas:'openseadragon-canvas',
                iid: tissueId, 
                viewer: viewer,
                annotationHandler: annotationHandler,
                mpp:MPP
            });
        var toolBar = new ToolBar('tool', {
                left:'0px',
                top:'0px',
                height: '48px',
                width: '100%',
                iid: tissueId,
                annotool: annotool
           
        });
        toolBar.createButtons();
        
        /*Pan and zoom to point*/
        var bound_x = <?php echo json_encode($_GET['x']); ?>;
        var bound_y = <?php echo json_encode($_GET['y']); ?>;
        var zoom = <?php echo json_encode($_GET['zoom']); ?> || 6;


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
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-46271588-1', 'auto');
  ga('send', 'pageview');

</script>

</body>
</html>

