<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>

    <title>OpenSeadragon</title>

    <link rel='stylesheet' 
          type='text/css'
          media='screen'
          href='css/style.css'/>
    <link rel="stylesheet" type="text/css" media="all" href="css/annotools.css" />

    <script src="js/openseadragon.js"></script>
    <script type="text/javascript" src="js/mootools-core-1.4.5-full-nocompat-yc.js"></script>
    <script type="text/javascript" src="js/mootools-more-1.4.0.1-compressed.js"></script>
    <script src="js/jquery.js"></script>
    <script src="js/annotools-openseajax-handler.js"></script>
    <script src="js/annotools.js"></script>
      <style type="text/css">
      html, body {
        margin: 0px;
        width:100%;
        height:100%;
        font-family: Verdana;
      }

      #viewer{
        width:100%;
        height:100%;
        margin-left:auto;
        margin-right:auto;
        color: white;   /* for error messages */
      }
    </style>
</head>

<body>

    <div id="container">
                
        <div id="tool"></div>

    </div>

    <div id="viewer" class="openseadragon"></div>

    <script type="text/javascript">
    
      var viewer = new OpenSeadragon.Viewer({ id: "viewer", prefixUrl: "images/" });
      viewer.addHandler("open", addOverlays);
      viewer.openDzi("/fastcgi-bin/iipsrv.fcgi?DeepZoom=/u01/app/oracle/images/NLSI0000063.tiff.dzi");

      function addOverlays() {
        var annotationHandler = new AnnotoolsOpenSeadragonHandler(viewer, {});
        var annotool=new annotools('tool',{
            left:'0px',
                top:'50px',
                canvas:'openseadragon-canvas',
                iid: '', 
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
