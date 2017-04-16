/*
Copyright (C) 2013 Sanjay Agravat <sanjay.agravat@emory.edu>, Ashish Sharma <ashish.sharma@emory.edu>

This file is a zoom and pan handler for OpenSeadragon and annotools.js to support resizing annotations on certain mouse events.
 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 
http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/


var AnnotoolsOpenSeadragonHandler = function(viewer, options){

        this.viewer = viewer;
        this.state = 'none';
        this.stateTarget = null;
        this.stateOrigin = null;
        this.scale = options.ratio || 1.3;
        this.lastCenter = {x: 0, y: 0};
        this.objectCenterPts = {};
        this.originalCoords = [];
        this.originalDivCoords = [];
        this.zoom = viewer.viewport.getZoom();
        this.zoomBase = viewer.viewport.getZoom();
        this.zooming = false;
        this.panning = false;
        this.animateWaitTime = options.animateWaitTime || 300;

        //this._setupOpenSeadragonButtonHandlers();

        // global object reference used when the "this" object is referring to the window 
        window.annotationHandler = this;
    };

    /* 
        Redefines the button handlers from the OpenSeadragon button bar
        for the onRelease event. Handles Zoom in, Zoom out, and Home
        buttons.
    */
    AnnotoolsOpenSeadragonHandler.prototype._setupOpenSeadragonButtonHandlers= function() {
        
        for (var i = 0; i < this.viewer.buttons.buttons.length; i++) {
            var button = this.viewer.buttons.buttons[i];
            if (button.tooltip.toLowerCase() == "zoom in") {
                var onZoomInRelease = button.onRelease;
                var zoomIn = this.handleZoomIn; 
                button.onRelease = function(args){

                    $$('svg')[0].setStyle('opacity', 1);
                    onZoomInRelease(args);
                    setTimeout(function() {
                        //zoomIn();
                        $$('svg')[0].setStyle('opacity', 1);
                    }, annotationHandler.animateWaitTime);
                };

            }
            else if (button.tooltip.toLowerCase() == "zoom out") {
                var onZoomOutRelease = button.onRelease;
                var zoomOut = this.handleZoomOut; 
                button.onRelease = function(args){

                    $$('svg')[0].setStyle('opacity', 0);
                    onZoomOutRelease(args);
                    setTimeout(function() {
                        //zoomOut();
                        $$('svg')[0].setStyle('opacity', 1);
                    }, annotationHandler.animateWaitTime);
                };

            }


        }

    }.protect();

    AnnotoolsOpenSeadragonHandler.prototype.goHome= function(annot) {

        annot.getAnnot();
    };

    AnnotoolsOpenSeadragonHandler.prototype.handleZoomIn= function(annot) {
          zooming = true; 
          console.log("handleZoomIn");
	  var center = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5));
          if (annotationHandler.lastCenter.x != center.x || annotationHandler.lastCenter.y != center.y) {
              scale  = 1.3;
              annotationHandler.zoom++;
              var centerPt =
                  viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)); 
              $('originpt').setProperty('cx',centerPt.x);
              $('originpt').setProperty('cy',centerPt.y);
              

              for (var i = 0; i < $('viewport').getChildren().length; i++) { 
    
                  var object = $('viewport').getChildren()[i];
                  //var centerPt = $('center')[0];
                  var bbox = object.getBBox();
      
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

                  var div    = $$('div.annotcontainer')[i];
                  div.style.left   = newLocation.x-(bbox.width/2)*scale + "px";
                  div.style.top    = newLocation.y-(bbox.height/2)*scale + "px";
                  div.style.width  = (bbox.width)*scale + "px";
                  div.style.height = (bbox.height)*scale + "px";
                  
                
    
              }
          }
          
          annotationHandler.lastCenter = center;
	zooming = false;
    };

    AnnotoolsOpenSeadragonHandler.prototype.handleZoomOut= function() {
	zooming = true;
          var center = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5));
          console.log("handleZoomOut");
          if (annotationHandler.lastCenter.x != center.x || annotationHandler.lastCenter.y != center.y) {
              scale  = 1/1.3;
              annotationHandler.zoom--;
    
              var centerPt =
                  viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)); 
              $('originpt').setProperty('cx',centerPt.x);
              $('originpt').setProperty('cy',centerPt.y);
    
              for (var i = 0; i < $('viewport').getChildren().length; i++) { 
    
                  var object = $('viewport').getChildren()[i];
                  var bbox = object.getBBox();
      
                  var newLocation = viewer.viewport.pixelFromPoint(annotationHandler.objectCenterPts[i]);
      
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
                  var div    = $$('div.annotcontainer')[i];
                  div.style.left   = newLocation.x-(bbox.width/2)*scale + "px";
                  div.style.top    = newLocation.y-(bbox.height/2)*scale + "px";
                  div.style.width  = (bbox.width)*scale + "px";
                  div.style.height = (bbox.height)*scale + "px";
                  
    
              }
    
          }
                      
          annotationHandler.lastCenter = center; 
          zooming = false;
    };

    AnnotoolsOpenSeadragonHandler.prototype.handleMouseMove= function(evt) {
      if(evt.preventDefault)
          evt.preventDefault();

      if (this.state == 'pan') {
          //$('svg')[0].hide(); 
          $$('svg')[0].setStyle('opacity', 0);
          var pixel = OpenSeadragon.getMousePosition(evt).minus
              (OpenSeadragon.getElementPosition(viewer.element));
          var point = viewer.viewport.pointFromPixel(pixel);
      }


    };

    AnnotoolsOpenSeadragonHandler.prototype.handleMouseUp= function(evt) {

      //if (evt.target.tagName.toLowerCase() == "button" || evt.target.tagName.toLowerCase() == "div") {
      if (evt.target.tagName.toLowerCase() == "button") {
        
        console.log("handleMouseUp: " + evt.target.tagName);
        return;
            
      }
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

      			 // setTimeout(function() {
       	                 //annotationHandler.handleZoomIn();
                        $$('svg')[0].setStyle('opacity', 1);
       	            // }, annotationHandler.animateWaitTime);

              }
              else {
    
                $('originpt').setProperty('cx',
                        viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)).x);
                $('originpt').setProperty('cy',
                        viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5)).y);
    
                //$('svg')[0].show(); 
                $$('svg')[0].setStyle('opacity', 1);
                for (var i = 0; i < $('viewport').getChildren().length; i++) { 
    
                    var object = $('viewport').getChildren()[i];
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

                    var div    = $$('div.annotcontainer')[i];
                    
                    div.style.left   = (bbox.x + diff.x) + "px";
                    div.style.top    = (bbox.y + diff.y)+ "px";
                }
          }

        }

    };

    AnnotoolsOpenSeadragonHandler.prototype.handleMouseDown= function(evt) {

      if (evt.target.tagName.toLowerCase() == "button") {
        console.log("handleMouseDown: " + evt.target.tagName);
        return;
      }
      if(evt.preventDefault)
          evt.preventDefault();
      this.state = 'pan';
      var pixel = OpenSeadragon.getMousePosition(evt).minus
          (OpenSeadragon.getElementPosition(viewer.element));
    
      $$('svg')[0].setStyle('opacity', 0);
      this.stateOrigin = pixel;

    };

    AnnotoolsOpenSeadragonHandler.prototype.handleMouseWheel= function(evt) {
      if(evt.preventDefault)
          evt.preventDefault();
      if((typeof($$('svg')[0]) != 'undefined') && ('setStyle' in $$('svg')[0]))
          $$('svg')[0].setStyle('opacity', 0);

      if (this.annotool.mode == 'free_markup')
          this.annotool.markSaveClick(null);

      if (evt.wheelDelta > 0)
          this.viewer.viewport.zoomTo(this.viewer.viewport.getZoom()*1.2);
      else
          this.viewer.viewport.zoomTo(this.viewer.viewport.getZoom()/1.2);
   };

   AnnotoolsOpenSeadragonHandler.prototype.handleKeyPress= function(evt) {
     delta = 48.0 / this.viewer.viewport.getZoom() * 0.005;
     switch (evt.key) {
        case "a":
		  if (this.annotool.mode == 'free_markup')
     		  {
        		this.annotool.markSaveClick(null);
     		  }
		  delta_x = -delta; delta_y = 0;
		  var pt = this.viewer.viewport.getCenter(true).plus(new OpenSeadragon.Point(delta_x, delta_y));
		  this.viewer.viewport.panTo(pt, false);
		  break;

        case "d": 
		  if (this.annotool.mode == 'free_markup')
                  {
                        this.annotool.markSaveClick(null);
                  }
		  delta_x = delta; delta_y = 0;
                  var pt = this.viewer.viewport.getCenter(true).plus(new OpenSeadragon.Point(delta_x, delta_y));
                  this.viewer.viewport.panTo(pt, false);
		  break;
             
        case "m": 
          this.annotool.lymheat = !this.annotool.lymheat;
          this.annotool.getMultiAnnot();
          break;

        case "s": 
		  if (this.annotool.mode == 'free_markup')
                  {
                        this.annotool.markSaveClick(null);
                  }
		  delta_x = 0; delta_y = delta;
                  var pt = this.viewer.viewport.getCenter(true).plus(new OpenSeadragon.Point(delta_x, delta_y));
                  this.viewer.viewport.panTo(pt, false);
		  break;

        case "w": 
		  if (this.annotool.mode == 'free_markup')
                  {
                        this.annotool.markSaveClick(null);
                  }
		  delta_x = 0; delta_y = -delta;
                  var pt = this.viewer.viewport.getCenter(true).plus(new OpenSeadragon.Point(delta_x, delta_y));
                  this.viewer.viewport.panTo(pt, false);
		  break;
 
        case " ": annotool.toggleMarkups();
		  break;

        case "1": 
                  if (annotool.marking_choice == 'rb_Moving') {
                      document.getElementById('LymPos').checked = true;
                      annotool.drawMarkups();
                      jQuery("canvas").css("cursor", "crosshair");
                      jQuery("#drawRectangleButton").removeClass("active");
                      jQuery("#drawDotButton").removeClass("active");
                      jQuery("#drawFreelineButton").removeClass("active");
                      annotool.marking_choice = 'LymPos';
                  } else
                      document.getElementById('LymPos').checked = true;
                  break;

        case "2":
                  if (annotool.marking_choice == 'rb_Moving') {
                      document.getElementById('LymNeg').checked = true;
                      annotool.drawMarkups();
                      jQuery("canvas").css("cursor", "crosshair");
                      jQuery("#drawRectangleButton").removeClass("active");
                      jQuery("#drawDotButton").removeClass("active");
                      jQuery("#drawFreelineButton").removeClass("active");
                      annotool.marking_choice = 'LymNeg';
                  } else
                      document.getElementById('LymNeg').checked = true;
                  break;

        case "3":
                  if (annotool.marking_choice == 'rb_Moving') {
                      document.getElementById('LymPosBig').checked = true;
                      annotool.drawMarkups();
                      jQuery("canvas").css("cursor", "crosshair");
                      jQuery("#drawRectangleButton").removeClass("active");
                      jQuery("#drawDotButton").removeClass("active");
                      jQuery("#drawFreelineButton").removeClass("active");
                      annotool.marking_choice = 'LymPosBig';
                  } else
                      document.getElementById('LymPosBig').checked = true;
                  break;

        case "4":
                  if (annotool.marking_choice == 'rb_Moving') {
                      document.getElementById('LymNegBig').checked = true;
                      annotool.drawMarkups();
                      jQuery("canvas").css("cursor", "crosshair");
                      jQuery("#drawRectangleButton").removeClass("active");
                      jQuery("#drawDotButton").removeClass("active");
                      jQuery("#drawFreelineButton").removeClass("active");
                      annotool.marking_choice = 'LymNegBig';
                  } else
                      document.getElementById('LymNegBig').checked = true;
                  break;

        case "5":
                  if (annotool.marking_choice == 'rb_Moving') {
                      document.getElementById('TumorPos').checked = true;
                      annotool.drawMarkups();
                      jQuery("canvas").css("cursor", "crosshair");
                      jQuery("#drawRectangleButton").removeClass("active");
                      jQuery("#drawDotButton").removeClass("active");
                      jQuery("#drawFreelineButton").removeClass("active");
                      annotool.marking_choice = 'TumorPos';
                  } else
                      document.getElementById('TumorPos').checked = true;
                  break;

        case "6":
                  if (annotool.marking_choice == 'rb_Moving') {
                      document.getElementById('TumorNeg').checked = true;
                      annotool.drawMarkups();
                      jQuery("canvas").css("cursor", "crosshair");
                      jQuery("#drawRectangleButton").removeClass("active");
                      jQuery("#drawDotButton").removeClass("active");
                      jQuery("#drawFreelineButton").removeClass("active");
                      annotool.marking_choice = 'TumorNeg';
                  } else
                      document.getElementById('TumorNeg').checked = true;
                  break;

        case "7": document.getElementById('rb_Moving').checked = true;
                  var mock_evt = {target:{id:'rb_Moving'}};
                  annotool.radiobuttonChange(mock_evt);
                  break;

	case "q": annotool.revertWeight(null);
		  break;
     }
   };

