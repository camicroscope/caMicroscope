<?php require '../authenticate.php';

$config = require 'api/Configuration/config.php';

?>
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>

    <title>[caMicroscope OSD][Subject: <?php echo json_encode($_GET['tissueId']); ?>][User: <?php echo $_SESSION["name"]; ?>]</title>

    <link rel="stylesheet" type="text/css" media="all" href="css/annotools.css" />

    <script src="js/openseadragon/openseadragon-bin-1.0.0/openseadragon.js"></script>
    <script src="js/openseadragon/openseadragon-imaginghelper.min.js"></script>
    <script src="js/openseadragon/openseadragon-scalebar.js"></script>
    <script type="text/javascript" src="js/mootools-core-1.4.5-full-nocompat-yc.js"></script>
    <script type="text/javascript" src="js/mootools-more-1.4.0.1-compressed.js"></script>
    <script src="js/jquery.js"></script>
    <script src="js/annotools-openseajax-handler.js"></script>
    <script src="js/OSDImageMetaData.js"></script>
    <script src="js/annotools.js"></script>
    <script src="js/MD5.js"></script>
     <!-- Google Analytics JS -->
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
            background-color: black;
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

    </div>

    <div class="demoarea">
        <div id="viewer" class="openseadragon"></div>
    </div>

    <script type="text/javascript">
      var annotool = null;
      var tissueId = <?php echo json_encode($_GET['tissueId']); ?>;
      var imagedata = new OSDImageMetaData({imageId:tissueId});
      var MPP = imagedata.metaData[0];
      var fileLocation = imagedata.metaData[1];
      var viewer = new OpenSeadragon.Viewer(
          { id: "viewer", 
            prefixUrl: "images/",
            showNavigator:  false,
	    zoomPerClick: 1
	  });

      viewer.scalebar({
	    type: OpenSeadragon.ScalebarType.MICROSCOPY,
	    pixelsPerMeter:1/(parseFloat(this.MPP["mpp-x"])*0.000001),
	    barThickness: 2,
	    backgroundColor: "rgba(255, 255, 255, 0.5)",
	    fontColor: "rgb(100,100,100)",
	    xOffset: 5,
	    yOffset: 10,
	    stayInsideImage: true
	    });

      viewer.addHandler("open", addOverlays);
      viewer.clearControls();
      viewer.open("<?php print_r($config['fastcgi_server']); ?>?DeepZoom=" + fileLocation);
      var imagingHelper = new OpenSeadragonImaging.ImagingHelper({viewer: viewer});
      function addOverlays() {
        var annotationHandler = new AnnotoolsOpenSeadragonHandler(viewer, {});
        
        annotool=new annotools('tool',{
            left:'0px',
                top:'0px',
		height: '30px',
		width: '100%',
                canvas:'openseadragon-canvas',
                iid: tissueId, 
                viewer: viewer,
		annotationHandler: annotationHandler,
		mpp:MPP
        });
        
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

      

     </script>


</body>
</html>

