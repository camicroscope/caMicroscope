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
        width:800px;
        height:600px;
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

      var viewer;
      var state = 'none',stateTarget, stateOrigin, stateTf;
      var scaleFactor = 1.2;
      var scale = 1;
      
      var Seadragon;
      Seadragon = OpenSeadragon;
      OpenSeadragon.Utils = OpenSeadragon; 

    
      viewer = new OpenSeadragon.Viewer({
                        id:            "viewer",
                        prefixUrl:     "images/"
                    });
      viewer.addHandler("open", addOverlays);
      viewer.openDzi("/fastcgi-bin/iipsrv.fcgi?DeepZoom=/u01/app/oracle/images/NLSI0000063.tiff.dzi");
      OpenSeadragon.addEvent(viewer.element, "mousemove", handleMouseMove);
      OpenSeadragon.addEvent(viewer.element, "mousedown", handleMouseDown);
      OpenSeadragon.addEvent(viewer.element, "mouseup", handleMouseUp);
      OpenSeadragon.addEvent(viewer.element, "DOMMouseScroll", handleMouseWheel);
      var origin = null;

      $('#home_btn').click(  function () {
            console.log("home clicked");
            scale = 1;
            document.getElementById("viewport")
                .setAttribute('transform','translate(0,0)');  
        });

      function handleMouseMove(evt) {
        if(evt.preventDefault)
            evt.preventDefault();

        if (state == 'pan') {

            var pixel = OpenSeadragon.Utils.getMousePosition(evt).minus
                (OpenSeadragon.Utils.getElementPosition(viewer.element));
            var point = viewer.viewport.pointFromPixel(pixel);
            //console.log("move: " + point.x.toFixed(3) + ", " + point.y.toFixed(3));
        }
      }

      function handleMouseDown(evt) {
        if(evt.preventDefault)
            evt.preventDefault();
        state = 'pan';
        var pixel = OpenSeadragon.Utils.getMousePosition(evt).minus
            (OpenSeadragon.Utils.getElementPosition(viewer.element));
        var point = viewer.viewport.pointFromPixel(pixel);
        stateOrigin = pixel;
        console.log("down: " + stateOrigin);
        //console.log("down: " + point.x.toFixed(3) + ", " + point.y.toFixed(3));

      }


      function handleMouseWheel(evt) {
        if(evt.preventDefault)
            evt.preventDefault();
               
 
        var pixel = OpenSeadragon.Utils.getMousePosition(evt).minus
            (OpenSeadragon.Utils.getElementPosition(viewer.element));
        //var point = viewer.viewport.pointFromPixel(pixel);
        //stateOrigin = pixel;
        var delta;
        if(evt.wheelDelta)
            delta = evt.wheelDelta / 360; // Chrome/Safari
        else
            delta = evt.detail / -9; // Mozilla
        //scaleFactor = Math.pow(scaleFactor + 1.2, delta);

        if (delta > 0) {
            scale  = scale * 1.04;
        } else {

            scale  = scale / 1.04;

        }

        var center = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5));
        console.log("center: " + center.x + ", " + center.y);
        var currentTrans = 
            document.getElementById("viewport").getAttribute("transform").replace(/ /g,"").replace("translate(", "").replace(")","");
        var coordStr = currentTrans.split(",");
        var currX = parseInt(coordStr[0]);
        var currY = parseInt(coordStr[1]);
        var currPt = new Seadragon.Point(currX, currY);
        var trans = currPt.minus(pixel);
        var diff = origin.minus(center);
        document.getElementById("viewport")
                    .setAttribute('transform','translate(' + (-diff.x) + ", " + (-diff.y)  + ') scale(' + scale + ')');  
                    //.setAttribute('transform','scale(' + scale + ') translate(' + (-diff.x) + ", " + (-diff.y)  + ') ');  
        console.log("zoom: " + pixel.x + ", " + pixel.y + " scaleFactor: " + scaleFactor);
        //console.log("down: " + point.x.toFixed(3) + ", " + point.y.toFixed(3));

      }

      function handleMouseUp(evt) {
            if(evt.preventDefault)
                evt.preventDefault();

            if (state == 'pan') {
                state = 'up';
                var pixel = OpenSeadragon.Utils.getMousePosition(evt).minus
                    (OpenSeadragon.Utils.getElementPosition(viewer.element));
                var point = viewer.viewport.pointFromPixel(pixel);
                stateTarget = pixel;
                console.log("up: " + stateTarget);
                var transform = document.getElementById("viewport").getAttribute("transform").replace(/ /g,"");
                var diff = stateTarget.minus(stateOrigin);
                var currentTrans = 
                    document.getElementById("viewport").getAttribute("transform").replace(/ /g,"").replace("translate(", "").replace(")","");
                var coordStr = currentTrans.split(",");
                var currX = parseInt(coordStr[0]);
                var currY = parseInt(coordStr[1]);
                document.getElementById("viewport")
                        .setAttribute('transform','translate(' + (currX + diff.x) + ", " + (currY + diff.y)  + ')');  
                console.log("**** diff: " + (currX + diff.x) + ", " + (currY + diff.y));
            }
        }


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
        origin = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5));
        console.log("origin: " + origin.x + ", " + origin.y);
      }

     </script>


</body>
</html>
