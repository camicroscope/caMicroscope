/*
Copyright (C) 2013 Sanjay Agravat <sanjay.agravat@emory.edu>, Ashish Sharma <ashish.sharma@emory.edu>

This file is a zoom and pan handler for OpenSeadragon and annotools.js to support resizing annotations on certain mouse events.
 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 
http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/


var AnnotoolsOpenSeadragonHandler = new Class({

    initialize: function (viewer, options) {
        this.viewer = viewer;
        this.state = 'none';
        this.stateTarget = null;
        this.stateOrigin = null;
        this.scale = options.ratio || 1.2;
        this.lastCenter = {x: 0, y: 0};
        this.objectCenterPts = {};
        this.originalCoords = [];
        this.zoom = 1;

        this.animateWaitTime = options.animateWaitTime || 25;

        this._setupOpenSeadragonButtonHandlers();

        // global object reference used when the "this" object is referring to the window 
        window.annotationHandler = this;
    },

    /* 
        Redefines the button handlers from the OpenSeadragon button bar
        for the onRelease event. Handles Zoom in, Zoom out, and Home
        buttons.
    */
    _setupOpenSeadragonButtonHandlers: function() {
        
        for (var i = 0; i < this.viewer.buttons.buttons.length; i++) {
            var button = this.viewer.buttons.buttons[i];
            if (button.tooltip.toLowerCase() == "zoom in") {
                var onZoomInRelease = button.events.onRelease[0];
                var zoomIn = this.handleZoomIn; 
                button.events.onRelease[0] = function(args){

                    onZoomInRelease(args);
                    setTimeout(function() {
                        zoomIn();
                    }, this.animateWaitTime);
                };

            }
            else if (button.tooltip.toLowerCase() == "zoom out") {
                var onZoomOutRelease = button.events.onRelease[0];
                var zoomOut = this.handleZoomOut; 
                button.events.onRelease[0] = function(args){

                    onZoomOutRelease(args);
                    setTimeout(function() {
                        zoomOut();
                    }, this.animateWaitTime);
                };

            }
            else if (button.tooltip.toLowerCase() == "go home") {
                var resetViewer = this.resetViewer; 
                var onHomeRelease = button.events.onRelease[0];
                button.events.onRelease[0] = function(args){

                    onHomeRelease(args);
                    setTimeout(function() {
                        resetViewer();
                    }, this.animateWaitTime);
                };
            }



        }

    }.protect(),

    resetViewer: function() {

          $('#originpt').attr('cx',viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)).x);
          $('#originpt').attr('cy',viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)).y);
              
          annotationHandler.zoom = 1;
          for (var i = 0; i < $('#viewport').children().length; i++) { 
              var object = $('#viewport').children()[i];
              var originalObject = annotationHandler.originalCoords[i];
      
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

              var div    = $('div.annotcontainer')[i];
              div.style.left   = newLocation.x-(bbox.width/2)*scale + "px";
              div.style.top    = newLocation.y-(bbox.height/2)*scale + "px";
              div.style.width  = (bbox.width)*scale + "px";
              div.style.height = (bbox.height)*scale + "px";
    
          }

    },

    handleZoomIn: function() {

          var center = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5));
          if (annotationHandler.lastCenter.x != center.x || annotationHandler.lastCenter.y != center.y) {
              scale  = 1.2;
              annotationHandler.zoom++;
              var centerPt =
                  viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)); 
              $('#originpt').attr('cx',centerPt.x);
              $('#originpt').attr('cy',centerPt.y);
              

              for (var i = 0; i < $('#viewport').children().length; i++) { 
    
                  var object = $('#viewport').children()[i];
                  //var centerPt = $('#center')[0];
                  var bbox = object.getBBox();
                  console.log("handleZoomIn: " + bbox.width);
      
                  var newLocation = viewer.viewport.pixelFromPoint(annotationHandler.objectCenterPts[i]);
      
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
                      var newLocationRelPt = viewer.viewport.pointFromPixel(newLocation);
                      var distances = annotationHandler.originalCoords[i].distances;
                      var pointsStr = "";
                      for (var j = 0; j < distances.length-1; j++) {
                          var pointPair = distances[j].plus(newLocationRelPt);
                          var pixelPoint = viewer.viewport.pixelFromPoint(pointPair);
                          pointsStr += pixelPoint.x + "," + pixelPoint.y + " ";
    
                      }
                      object.setAttribute("points", pointsStr);
    
                  }

                  var div    = $('div.annotcontainer')[i];
                  div.style.left   = newLocation.x-(bbox.width/2)*scale + "px";
                  div.style.top    = newLocation.y-(bbox.height/2)*scale + "px";
                  div.style.width  = (bbox.width)*scale + "px";
                  div.style.height = (bbox.height)*scale + "px";
                  
                
    
              }
          }
          
          annotationHandler.lastCenter = center; 
    


    },

    handleZoomOut: function() {

          var center = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5));
          if (annotationHandler.lastCenter.x != center.x || annotationHandler.lastCenter.y != center.y) {
              scale  = 1/1.2;
              annotationHandler.zoom--;
    
              var centerPt =
                  viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)); 
              $('#originpt').attr('cx',centerPt.x);
              $('#originpt').attr('cy',centerPt.y);
    
              for (var i = 0; i < $('#viewport').children().length; i++) { 
    
                  var object = $('#viewport').children()[i];
                  //var centerPt = $('#center')[0];
                  var bbox = object.getBBox();
                  console.log("handleZoomOut: " + bbox.width);
      
                  var newLocation = viewer.viewport.pixelFromPoint(annotationHandler.objectCenterPts[i]);
      
                  //centerPt.setAttribute("cx", newLocation.x);
                  //centerPt.setAttribute("cy", newLocation.y)
    
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
                      var newLocationRelPt = viewer.viewport.pointFromPixel(newLocation);
                      var distances = annotationHandler.originalCoords[i].distances;
                      var pointsStr = "";
                      for (var j = 0; j < distances.length-1; j++) {
                          var pointPair = distances[j].plus(newLocationRelPt);
                          var pixelPoint = viewer.viewport.pixelFromPoint(pointPair);
                          pointsStr += pixelPoint.x + "," + pixelPoint.y + " ";
    
                      }
                      object.setAttribute("points", pointsStr);
    
                  }
                  var div    = $('div.annotcontainer')[i];
                  div.style.left   = newLocation.x-(bbox.width/2)*scale + "px";
                  div.style.top    = newLocation.y-(bbox.height/2)*scale + "px";
                  div.style.width  = (bbox.width)*scale + "px";
                  div.style.height = (bbox.height)*scale + "px";
                  
    
              }
    
          }
                      
          annotationHandler.lastCenter = center; 
    

    },

    handleMouseMove: function(evt) {
      if(evt.preventDefault)
          evt.preventDefault();
    
      if (this.state == 'pan') {
          $('svg')[0].hide(); 
          var pixel = OpenSeadragon.getMousePosition(evt).minus
              (OpenSeadragon.getElementPosition(viewer.element));
          var point = viewer.viewport.pointFromPixel(pixel);
      }


    },

    handleMouseUp: function(evt) {
      console.log(evt.target.tagName);
      //if (evt.target.tagName.toLowerCase() == "button" || evt.target.tagName.toLowerCase() == "div") return;
          if(evt.preventDefault)
              evt.preventDefault();
    
          if (this.state == 'pan') {
              this.state = 'up';
              var pixel = 
                  OpenSeadragon.getMousePosition(evt).minus
                      (OpenSeadragon.getElementPosition(viewer.element));
    
              var diff = pixel.minus(this.stateOrigin);

              // handles a mouse click (zoom and pan to)
              // otherwise we will handle the pan event
              if (diff.x == 0 && diff.y == 0) {

                    setTimeout(function() {
                        $('svg')[0].show(); 
                        annotationHandler.handleZoomIn();
                    }, 25);

              }
              else {
    
                $('#originpt').attr('cx',
                        viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)).x);
                $('#originpt').attr('cy',
                        viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)).y);
    
                $('svg')[0].show(); 
                for (var i = 0; i < $('#viewport').children().length; i++) { 
    
                    var object = $('#viewport').children()[i];
                    //object.setAttribute("style", style="fill:none;stroke:lime;stroke-width:2");
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

                    var div    = $('div.annotcontainer')[i];
                    
                    div.style.left   = (bbox.x + diff.x) + "px";
                    div.style.top    = (bbox.y  + diff.y)+ "px";
                    //div.style.width  = (bbox.width)*scale + "px";
                    //div.style.height = (bbox.height)*scale + "px";
                    
                }
          }

        }

    },

    handleMouseDown: function(evt) {

      console.log(evt.target.tagName);
      if (evt.target.tagName.toLowerCase() == "button" || evt.target.tagName.toLowerCase() == "div") return;
      if(evt.preventDefault)
          evt.preventDefault();
      this.state = 'pan';
      var pixel = OpenSeadragon.getMousePosition(evt).minus
          (OpenSeadragon.getElementPosition(viewer.element));
    
      $('svg')[0].hide(); 
      this.stateOrigin = pixel;


    },

    handleMouseWheel: function(evt) {
      if(evt.preventDefault)
          evt.preventDefault();
    
      var delta;
      if(evt.wheelDelta)
          delta = evt.wheelDelta / 360; // Chrome/Safari
      else
          delta = evt.detail / -9; // Mozilla
    
      var center = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5));
      if (Math.abs(annotationHandler.lastCenter.x - center.x) > 1 || Math.abs(annotationHandler.lastCenter.y - center.y) > 1) {
          if (delta > 0) {
              annotationHandler.zoom++;
              scale  = 1.2;
              console.log("zoom in: " +  scale);
          } else {
              scale  = 1/1.2;
              console.log("zoom out: " +  scale);
              annotationHandler.zoom--;
          }
    
          var centerPt =
              viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)); 
          $('#originpt').attr('cx',centerPt.x);
          $('#originpt').attr('cy',centerPt.y);
    
          for (var i = 0; i < $('#viewport').children().length; i++) { 
    
              var object = $('#viewport').children()[i];
              //var centerPt = $('#center')[0];
              var bbox = object.getBBox();
              console.log("handleMouseWheel: " + bbox.width);
    
              var newLocation = 
                  viewer.viewport.pixelFromPoint(annotationHandler.objectCenterPts[i]);
    
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
              else {
             
                  var points = String.split(object.getAttribute("points").trim(), ' ');
                  
                  //$('#groupcenter')[0].appendChild(makeSVG('ellipse',{
                          //'cx': newLocation.x, 
                          //'cy': newLocation.y, 
                          //'rx':4, 
                          //'ry':4, 
                          //'style':'fill:blue;stroke-width:2'}
                      //)
                  //);
                  
                  var newLocationRelPt = viewer.viewport.pointFromPixel(newLocation);
                  var distances = annotationHandler.originalCoords[i].distances;
                  var pointsStr = "";
                  for (var j = 0; j < distances.length-1; j++) {
                      var pointPair = distances[j].plus(newLocationRelPt);
                      var pixelPoint = viewer.viewport.pixelFromPoint(pointPair);
                      pointsStr += pixelPoint.x + "," + pixelPoint.y + " ";
    
                  }
                  object.setAttribute("points", pointsStr);
    
              }
                
                  var div    = $('div.annotcontainer')[i];
                  div.style.left   = newLocation.x-(bbox.width/2)*scale + "px";
                  div.style.top    = newLocation.y-(bbox.height/2)*scale + "px";
                  div.style.width  = (bbox.width)*scale + "px";
                  div.style.height = (bbox.height)*scale + "px";
    
          }
    
      } 
      annotationHandler.lastCenter = center; 


    }
});
