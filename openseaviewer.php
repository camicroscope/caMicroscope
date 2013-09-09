<?php session_start();

$config = require 'api/config.php';

?>
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>

    <title>OpenSeadragon</title>

    <link rel="stylesheet" type="text/css" media="all" href="css/annotools.css" />

    <script src="js/openseadragon.min.js"></script>
    <script type="text/javascript" src="js/mootools-core-1.4.5-full-nocompat-yc.js"></script>
    <script type="text/javascript" src="js/mootools-more-1.4.0.1-compressed.js"></script>
    <script src="js/jquery.js"></script>
    <script src="js/annotools-openseajax-handler.js"></script>
    <script src="js/annotools.js"></script>
    <script src="js/MD5.js"></script>
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

    var viewer = new OpenSeadragon.Viewer(
      { id: "viewer", 
      prefixUrl: "images/",
      showNavigator:  true,
      zoomPerClick: 1
  });
    viewer.addHandler("open", addOverlays);

    viewer.open("<?php print_r($config['fastcgi_server']); ?>?DeepZoom=<?php print_r($_REQUEST['fileLocation']); ?>");
    function addOverlays() {
        var annotationHandler = new AnnotoolsOpenSeadragonHandler(viewer, {});
        
        annotool=new annotools('tool',{
         left:'150px',
         top:'0px',
         height: '30px',
         width: '270px',
         canvas:'openseadragon-canvas',
         iid: '<?php print_r($_REQUEST['iid']); ?>', 
         viewer: viewer,
         annotationHandler: annotationHandler 
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

