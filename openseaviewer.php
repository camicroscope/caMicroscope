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
      var scale = 1.2;
      var lastCenter = {x: 0, y: 0};
      var objectCenterPts = {};
      var originalCoords = [];
      var zoom = 1;
      
      var Seadragon;
      Seadragon = OpenSeadragon;
      OpenSeadragon.Utils = OpenSeadragon; 

    
      viewer = new OpenSeadragon.Viewer({
                        id:            "viewer",
                        prefixUrl:     "images/"
                    });
      viewer.addHandler("open", addOverlays);
      viewer.openDzi("/fastcgi-bin/iipsrv.fcgi?DeepZoom=/u01/app/oracle/images/NLSI0000063.tiff.dzi");
      //OpenSeadragon.addEvent(viewer.element, "mousemove", showMousePosition);

      $('#home_btn').click(  function () {
            $('#originpt').attr('cx',viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)).x);
            $('#originpt').attr('cy',viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)).y);
                
            zoom = 1;
            for (var i = 0; i < $('#viewport').children().length; i++) { 
                var object = $('#viewport').children()[i];
                var originalObject = originalCoords[i];
        
                if (object.tagName == "ellipse") {

                    object.setAttribute("rx", originalObject.rx);
                    object.setAttribute("ry", originalObject.ry);
                    object.setAttribute("cx", originalObject.cx);
                    object.setAttribute("cy", originalObject.cy);
    
                } 
                else if (object.tagName == "rect") {

                    object.setAttribute("width", originalObject.width);
                    object.setAttribute("height", originalObject.height);
                    object.setAttribute("x", originalObject.x);
                    object.setAttribute("y", originalObject.y);

                }
                //else if (object.tagName == "polygon") {
                else {
                
                    var points = String.split(object.getAttribute("points").trim(), ' ');
                    var newLocationRelPt = originalObject.center;
                    var distances = originalObject.distances;
                    var pointsStr = "";
                    for (var j = 0; j < distances.length-1; j++) {
                        var pointPair = distances[j].plus(newLocationRelPt);
                        var pixelPoint = viewer.viewport.pixelFromPoint(pointPair);
                        pointsStr += pixelPoint.x + "," + pixelPoint.y + " ";

                    }
                    object.setAttribute("points", pointsStr);

                }

            }

      });

      $('#zoomin_btn').click(  function () {

            var center = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5));
            if (lastCenter.x != center.x || lastCenter.y != center.y) {
                scale  = 1.2;
                zoom++;
                var centerPt =
                    viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)); 
                $('#originpt').attr('cx',centerPt.x);
                $('#originpt').attr('cy',centerPt.y);

                for (var i = 0; i < $('#viewport').children().length; i++) { 

                    var object = $('#viewport').children()[i];
                    //var centerPt = $('#center')[0];
                    var bbox = object.getBBox();
        
                    var newLocation = viewer.viewport.pixelFromPoint(objectCenterPts[i]);
        
                    var distance = newLocation.distanceTo(center);            
                    if (object.tagName == "ellipse") {

                        object.setAttribute("rx", (bbox.width/2)*scale);
                        object.setAttribute("ry", (bbox.height/2)*scale);
                        object.setAttribute("cx", newLocation.x);
                        object.setAttribute("cy", newLocation.y);

                    } 
                    else if (object.tagName == "rect") {

                        object.setAttribute("width", (bbox.width)*scale);
                        object.setAttribute("height", (bbox.height)*scale);
                        object.setAttribute("x", newLocation.x-(bbox.width/2)*scale);
                        object.setAttribute("y", newLocation.y-(bbox.height/2)*scale);

                    }
                    else {
                    
                        var points = String.split(object.getAttribute("points").trim(), ' ');
                        console.log(points);
                        $('#groupcenter')[0].appendChild(makeSVG('ellipse',{
                                'cx': newLocation.x, 
                                'cy': newLocation.y, 
                                'rx':4, 
                                'ry':4, 
                                'style':'fill:blue;stroke-width:2'}
                            )
                        );
                        var newLocationRelPt = viewer.viewport.pointFromPixel(newLocation);
                        var distances = originalCoords[i].distances;
                        var pointsStr = "";
                        for (var j = 0; j < distances.length-1; j++) {
                            var pointPair = distances[j].plus(newLocationRelPt);
                            var pixelPoint = viewer.viewport.pixelFromPoint(pointPair);
                            pointsStr += pixelPoint.x + "," + pixelPoint.y + " ";

                        }
                        object.setAttribute("points", pointsStr);

                    }

                }
            }
            
            //console.log("down: " + point.x.toFixed(3) + ", " + point.y.toFixed(3));
            lastCenter = center; 


      });
      $('#zoomout_btn').click(  function () {

            var center = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5));
            if (lastCenter.x != center.x || lastCenter.y != center.y) {
                scale  = 1/1.2;
                zoom--;
    
                var centerPt =
                    viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)); 
                $('#originpt').attr('cx',centerPt.x);
                $('#originpt').attr('cy',centerPt.y);

                for (var i = 0; i < $('#viewport').children().length; i++) { 

                    var object = $('#viewport').children()[i];
                    //var centerPt = $('#center')[0];
                    var bbox = object.getBBox();
        
                    var newLocation = viewer.viewport.pixelFromPoint(objectCenterPts[i]);
        
                    //centerPt.setAttribute("cx", newLocation.x);
                    //centerPt.setAttribute("cy", newLocation.y)
                    $('#groupcenter')[0].appendChild(makeSVG('ellipse',{
                        'cx': newLocation.x, 
                            'cy': newLocation.y, 
                            'rx':4, 
                            'ry':4, 
                            'style':'fill:blue;stroke-width:2'}
                        )
                    );

                    if (object.tagName == "ellipse") {

                        object.setAttribute("rx", (bbox.width/2)*scale);
                        object.setAttribute("ry", (bbox.height/2)*scale);
                        object.setAttribute("cx", newLocation.x);
                        object.setAttribute("cy", newLocation.y);

                    } 
                    else if (object.tagName == "rect") {

                        object.setAttribute("width", (bbox.width)*scale);
                        object.setAttribute("height", (bbox.height)*scale);
                        object.setAttribute("x", newLocation.x-(bbox.width/2)*scale);
                        object.setAttribute("y", newLocation.y-(bbox.height/2)*scale);

                    }
                    //else if (object.tagName == "polygon") {
                    else {
                    
                        var points = String.split(object.getAttribute("points").trim(), ' ');
                        console.log(points);
                        $('#groupcenter')[0].appendChild(makeSVG('ellipse',{
                                'cx': newLocation.x, 
                                'cy': newLocation.y, 
                                'rx':4, 
                                'ry':4, 
                                'style':'fill:blue;stroke-width:2'}
                            )
                        );
                        var newLocationRelPt = viewer.viewport.pointFromPixel(newLocation);
                        var distances = originalCoords[i].distances;
                        var pointsStr = "";
                        for (var j = 0; j < distances.length-1; j++) {
                            var pointPair = distances[j].plus(newLocationRelPt);
                            var pixelPoint = viewer.viewport.pixelFromPoint(pointPair);
                            pointsStr += pixelPoint.x + "," + pixelPoint.y + " ";

                        }
                        object.setAttribute("points", pointsStr);

                    }
                    

                }

            }
                        
            
            lastCenter = center; 


      });

      function makeSVG(tag, attrs) {
            var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
            for (var k in attrs)
                el.setAttribute(k, attrs[k]);
            return el;
        }

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

        stateOrigin = pixel;

      }


      function handleMouseWheel(evt) {
        if(evt.preventDefault)
            evt.preventDefault();
               
 
        var delta;
        if(evt.wheelDelta)
            delta = evt.wheelDelta / 360; // Chrome/Safari
        else
            delta = evt.detail / -9; // Mozilla

        var center = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5));
        if (Math.abs(lastCenter.x - center.x) > 1 || Math.abs(lastCenter.y - center.y) > 1) {
            if (delta > 0) {
                zoom++;
                scale  = 1.2;
            } else {
                scale  = 1/1.2;
                zoom--;
            }
    
            var centerPt =
                viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)); 
            $('#originpt').attr('cx',centerPt.x);
            $('#originpt').attr('cy',centerPt.y);

            for (var i = 0; i < $('#viewport').children().length; i++) { 

                var object = $('#viewport').children()[i];
                //var centerPt = $('#center')[0];
                var bbox = object.getBBox();
    
                var newLocation = 
                    viewer.viewport.pixelFromPoint(objectCenterPts[i]);
    
                //centerPt.setAttribute("cx", newLocation.x);
                //centerPt.setAttribute("cy", newLocation.y)
                
                var distance = newLocation.distanceTo(center);            
                if (object.tagName == "ellipse") {

                    object.setAttribute("rx", (bbox.width/2)*scale);
                    object.setAttribute("ry", (bbox.height/2)*scale);
                    object.setAttribute("cx", newLocation.x);
                    object.setAttribute("cy", newLocation.y);

                } 
                else if (object.tagName == "rect") {

                    object.setAttribute("width", (bbox.width)*scale);
                    object.setAttribute("height", (bbox.height)*scale);
                    object.setAttribute("x", newLocation.x-(bbox.width/2)*scale);
                    object.setAttribute("y", newLocation.y-(bbox.height/2)*scale);

                }
                //else if (object.tagName == "polygon") {
                else {
               
                    var points = String.split(object.getAttribute("points").trim(), ' ');
                    console.log(points);
                    $('#groupcenter')[0].appendChild(makeSVG('ellipse',{
                            'cx': newLocation.x, 
                            'cy': newLocation.y, 
                            'rx':4, 
                            'ry':4, 
                            'style':'fill:blue;stroke-width:2'}
                        )
                    );
                    var newLocationRelPt = viewer.viewport.pointFromPixel(newLocation);
                    var distances = originalCoords[i].distances;
                    var pointsStr = "";
                    for (var j = 0; j < distances.length-1; j++) {
                        var pointPair = distances[j].plus(newLocationRelPt);
                        var pixelPoint = viewer.viewport.pixelFromPoint(pointPair);
                        pointsStr += pixelPoint.x + "," + pixelPoint.y + " ";

                    }
                    object.setAttribute("points", pointsStr);

                }

            }

        } 
        lastCenter = center; 


      }

      function handleMouseUp(evt) {
            if(evt.preventDefault)
                evt.preventDefault();

            if (state == 'pan') {
                state = 'up';
                var pixel = 
                    OpenSeadragon.Utils.getMousePosition(evt).minus
                        (OpenSeadragon.Utils.getElementPosition(viewer.element));

                var diff = pixel.minus(stateOrigin);

                $('#originpt').attr('cx',
                        viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)).x);
                $('#originpt').attr('cy',
                        viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)).y);

                for (var i = 0; i < $('#viewport').children().length; i++) { 

                    var object = $('#viewport').children()[i];
                    var bbox = object.getBBox();
                    if (object.tagName == "ellipse") {

                        var currX = bbox.x+bbox.width/2; 
                        var currY = bbox.y+bbox.height/2; 
                        object.setAttribute("cx", currX + diff.x);
                        object.setAttribute("cy", currY + diff.y);

                    } 
                    else if (object.tagName == "rect") {

                        object.setAttribute("x", bbox.x + diff.x);
                        object.setAttribute("y", bbox.y + diff.y);

                    }
                    else {
               
                        var points = String.split(object.getAttribute("points").trim(), ' ');
                        var pointsStr = "";
                        for (var j = 0; j < points.length; j++) {
                            var pointPair = String.split(points[j], ",");
                            pointsStr += (parseFloat(pointPair[0])+diff.x) + 
                                            "," + 
                                        (parseFloat(pointPair[1])+diff.y) + " ";
                            

                        }
                        object.setAttribute("points", pointsStr);
    
                    }
                }
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
