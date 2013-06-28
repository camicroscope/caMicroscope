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
    <!--<script src="js/seadragon-min.js"></script>-->
    <script type="text/javascript" src="js/mootools-core-1.4.5-full-nocompat-yc.js"></script>
    <script type="text/javascript" src="js/mootools-more-1.4.0.1-compressed.js"></script>
    <script src="js/jquery.js"></script>
    <script src="js/jquery.livequery.js"></script>
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
        margin:0px;
        color: white;   /* for error messages */
      }
    </style>
</head>

<body>

    <div id="container">

        <div class="demoarea">
                
                <div id="tool"></div>
            </div>
        </div>

    </div>
                <div id="viewer" class="openseadragon"></div>

    <script type="text/javascript">

      var viewer;
      var Seadragon;
      Seadragon = OpenSeadragon;
      OpenSeadragon.Utils = OpenSeadragon; 

    
      viewer = new OpenSeadragon.Viewer({
                        id:            "viewer",
                        prefixUrl:     "images/"
                    });
      viewer.addHandler("open", addOverlays);
      viewer.openDzi("/fastcgi-bin/iipsrv.fcgi?DeepZoom=/u01/app/oracle/images/NLSI0000063.tiff.dzi");
      //OpenSeadragon.addEvent(viewer.element, "mousemove", showMouse);



      function showMousePosition(event) {
        // getMousePosition() returns position relative to page,
        // while we want the position relative to the viewer
        // element. so subtract the difference.
        var pixel = OpenSeadragon.Utils.getMousePosition(event).minus
        (OpenSeadragon.Utils.getElementPosition(viewer.element));
        //document.getElementById("mousePixels").innerHTML = toString(pixel, true);
        //document.getElementById("mousePixels").innerHTML =  pixel.x + ", " + pixel.y;
        if (!viewer.isOpen()) {
            return;
        }
        var point = viewer.viewport.pointFromPixel(pixel);
        //document.getElementById("mousePoints").innerHTML = 
            //point.x.toFixed(3) + ", " + point.y.toFixed(3);
        console.log("mouse: " + point.x.toFixed(3) + ", " + point.y.toFixed(3));
      } 


             
      function addOverlays() {
        var annotool=new annotools('tool',{left:'0px',top:'50px',canvas:'openseadragon-canvas',iid: ''});
        annotool.setViewer(viewer);

      }

     </script>


</body>
</html>
