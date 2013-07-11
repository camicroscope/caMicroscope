/*
Copyright (C) 2012 Shaohuan Li <shaohuan.li@gmail.com>, Ashish Sharma <ashish.sharma@emory.edu>
This file is part of Biomedical Image Viewer developed under the Google of Summer of Code 2012 program.
 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 
http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
//var IP = 'http://170.140.138.125';
var IP = '';
var annotools = new Class({
    initialize: function (element, options) {
        this.source = element; //The Tool Source Element
        this.left = options.left || '0px'; //The Tool Location
        this.ratio = options.ratio || 0.005; //One pixel equals to the length in real situation. Will be used in the measurement tool
        this.maxWidth = options.maxWidth || 4000; //MaxWidth of the Image
        this.maxHeight = options.maxHeight || 800; ////MaxHeight of the Image
        this.top = options.top || '0px';
        this.color = options.color || 'lime'; //Default Annotation Color
        this.height = options.height || '20px';
        this.width = options.width || '200px';
        this.zindex = options.zindex || '100'; //To Make Sure The Tool Appears in the Front
        this.canvas = options.canvas; //The canvas Element that The Use will be drawing annotatoins on.
        this.iid = options.iid || null; //The Image ID
        this.annotVisible = true; //The Annotations are Set to be visible at the First Loading
        this.mode = 'default'; //The Mode is Set to Default
        window.addEvent("domready", function () {
            //this.getAnnot();
            this.createButtons();
        }.bind(this)); //Get the annotation information and Create Buttons
        window.addEvent("keydown", function (event) {
            this.keyPress(event.code)
        }.bind(this)); //Add KeyDown Events
    },
    setViewer: function(viewer) 
    {
        this.viewer = viewer;
        viewer.viewport.zoomTo(1);
        this.getAnnot2();

    },
    createButtons: function () //Create Buttons
    {
        this.tool = document.id(this.source); //Get The Element with the Source ID.
        this.tool.setStyles({
            'position': 'absolute',
            'left': this.left,
            'top': this.top,
            'width': this.width,
            'height': this.height,
            'z-index': this.zindex
        });
        this.tool.addClass('annotools'); //Update Styles
        this.tool.makeDraggable(); //Make it Draggable.
        this.rectbutton = new Element('img', {
            'title': 'rectangle',
            'class': 'toolButton',
            'src': 'images/rect.svg'
        }).inject(this.tool); //Create Rectangle Tool
        this.ellipsebutton = new Element('img', {
            'title': 'ellipse',
            'class': 'toolButton',
            'src': 'images/ellipse.svg'
        }).inject(this.tool); //Ellipse Tool
        this.polybutton = new Element('img', {
            'title': 'polyline',
            'class': 'toolButton',
            'src': 'images/poly.svg'
        }).inject(this.tool); //Polygon Tool
        this.pencilbutton = new Element('img', {
            'title': 'pencil',
            'class': 'toolButton',
            'src': 'images/pencil.svg'
        }).inject(this.tool); //Pencil Tool
        this.colorbutton = new Element('img', {
            'title': 'Change Color',
            'class': 'toolButton',
            'src': 'images/color.svg'
        }).inject(this.tool); //Select Color
        this.measurebutton = new Element('img', {
            'title': 'measure',
            'class': 'toolButton',
            'src': 'images/measure.svg'
        }).inject(this.tool); //Measurement Tool
        this.magnifybutton = new Element('img', {
            'title': 'magnify',
            'class': 'toolButton',
            'src': 'images/magnify.svg'
        }).inject(this.tool); //Magnify Tool
        this.hidebutton = new Element('img', {
            'title': 'hide',
            'class': 'toolButton',
            'src': 'images/hide.svg'
        }).inject(this.tool); //Show/Hide Button
        this.savebutton = new Element('img', {
            'title': 'Save Current State',
            'class': 'toolButton',
            'src': 'images/save.svg'
        }).inject(this.tool); //Save Button
        this.quitbutton = new Element('img', {
            'title': 'quit',
            'class': 'toolButton',
            'src': 'images/quit.svg'
        }).inject(this.tool); //Quit Button
        this.rectbutton.addEvents({
            'click': function () {
                this.mode = 'rect';
                this.drawMarkups();
            }.bind(this)
        }); //Change Mode
        this.ellipsebutton.addEvents({
            'click': function () {
                this.mode = 'ellipse';
                this.drawMarkups();
            }.bind(this)
        });
        this.polybutton.addEvents({
            'click': function () {
                this.mode = 'polyline';
                this.drawMarkups();
            }.bind(this)
        });
        this.pencilbutton.addEvents({
            'click': function () {
                this.mode = 'pencil';
                this.drawMarkups();
            }.bind(this)
        });
        this.measurebutton.addEvents({
            'click': function () {
                this.mode = 'measure';
                this.drawMarkups();
            }.bind(this)
        });
        this.magnifybutton.addEvents({
            'click': function () {
                this.mode = 'magnify';
                this.magnify();
            }.bind(this)
        });
        this.colorbutton.addEvents({
            'click': function () {
                this.selectColor()
            }.bind(this)
        });
        this.hidebutton.addEvents({
            'click': function () {
                this.toggleMarkups()
            }.bind(this)
        });
        this.savebutton.addEvents({
            'click': function () {
                this.saveState()
            }.bind(this)
        });
        this.quitbutton.addEvents({
            'click': function () {
                this.quitMode();
                this.quitbutton.hide();
            }.bind(this)
        });
        this.quitbutton.hide(); //Quit Button Will Be Used To Return To the Default Mode
        var toolButtons = document.getElements(".toolButton");
        for (var i = 0; i < toolButtons.length; i++) {
            toolButtons[i].addEvents({
                'mouseenter': function () {
                    this.addClass('selected')
                },
                'mouseleave': function () {
                    this.removeClass('selected')
                }
            });
        }
        this.messageBox = new Element('div', {
            'id': 'messageBox'
        }).inject(document.body); //Create A Message Box
        this.showMessage("Press white space to toggle annotations");
        this.drawLayer = new Element('div', {
            html: "",
            styles: {
                position: 'absolute',
                'z-index': 1
            }
        }).inject(document.body); //drawLayer will hide by default
        this.drawCanvas = new Element('canvas').inject(this.drawLayer);
        this.drawLayer.hide();
        this.magnifyGlass = new Element('div', {
            'class': 'magnify'
        }).inject(document.body); //Magnify glass will hide by default
        this.magnifyGlass.hide();
    },

    getAnnot2: function (viewer) //Get Annotation from the API
    {
        if (this.iid) //When the database is set. User can refer to the annotation.php for saving the annotations
        {
            var jsonRequest = new Request.JSON({
                //url: IP + 'api/annotation.php',
                url: 'api/annotation.php',
                onSuccess: function (e) {
                    if (e == null) this.annotations = new Array();
                    else this.annotations = e;
                    this.displayAnnot(); //Display The Annotations
                    //console.log("successfully get annotations");
                }.bind(this),
                onFailure: function (e) {
                    this.showMessage("cannot get the annotations,please check your getAnnot function");
                }.bind(this)
            }).get({
                'iid': this.iid
            });
        } else //When the database is not set, one TXT file will be used to save the Annotation Data. Please Refer to annot.php in the API folder
        {
            var jsonRequest = new Request.JSON({
                //url: IP + 'api/annot.php',
                url:  'api/annot.php',
                onSuccess: function (e) {
                    var annot = JSON.decode(e);
                    if (annot == null) annot = new Array();
                    this.annotations = annot; //Display The Annotations
                    this.displayAnnot();
                    for (var i = 0; i < $('#viewport').children().length; i++) {
                        var object = $('#viewport').children()[i];
            
                        if (object.tagName == "ellipse") {
                            var originalCoord = {};
                            originalCoord.cx = object.getAttribute('cx');
                            originalCoord.cy = object.getAttribute('cy');
                            originalCoord.rx = object.getAttribute('rx');
                            originalCoord.ry = object.getAttribute('ry');
                            originalCoords[i] = originalCoord;
                            var bbox = object.getBBox();
                            console.log("original: " + (bbox.width/2) + ", " + (bbox.height/2));
                            //var ellipseCenter = makeSVG('ellipse', {
                                //'id': 'center',
                                //'cx': bbox.x+bbox.width/2, 
                                //'cy': bbox.y+bbox.height/2, 
                                //'rx':'4', 
                                //'ry':'4',
                                //'style': 'fill:blue;stroke-width:2' 
                            //});
                            //$('#groupcenter')[0].appendChild(ellipseCenter);
                            //var ellipseCenterPt = new OpenSeadragon.Point($('#center')[0].cx.baseVal.value, $('#center')[0].cy.baseVal.value);
                            var objectCenterPt = new OpenSeadragon.Point(bbox.x+bbox.width/2, bbox.y+bbox.height/2);
                            var objectCenterRelPt = this.viewer.viewport.pointFromPixel(objectCenterPt);
                            objectCenterPts[i] = objectCenterRelPt;
                        } else if (object.tagName == "rect"){
                            var originalCoord = {};
                            originalCoord.x     = object.getAttribute('x');
                            originalCoord.y     = object.getAttribute('y');
                            originalCoord.width = object.getAttribute('width');
                            originalCoord.height = object.getAttribute('height');
                            originalCoords[i] = originalCoord;
                            var bbox = object.getBBox();
                            var objectCenterPt = new OpenSeadragon.Point(bbox.x+bbox.width/2, bbox.y+bbox.height/2);
                            var objectCenterRelPt = this.viewer.viewport.pointFromPixel(objectCenterPt);
                            objectCenterPts[i] = objectCenterRelPt;
                            $('#groupcenter')[0].appendChild(makeSVG('ellipse',{
                                'cx': objectCenterPt.x, 
                                    'cy': objectCenterPt.y, 
                                    'rx':4, 
                                    'ry':4, 
                                    'style':'fill:blue;stroke-width:2'}
                                )
                            );

                        } 
                        //else if (object.tagName == "polygon") {
                        else {
                            var bbox = object.getBBox();
                            var objectCenterPt = 
                                new OpenSeadragon.Point(
                                    bbox.x+bbox.width/2, 
                                    bbox.y+bbox.height/2
                            );
                            var objectCenterRelPt = 
                                this.viewer.viewport.pointFromPixel(objectCenterPt);
                            objectCenterPts[i] = objectCenterRelPt;
                            $('#groupcenter')[0].appendChild(makeSVG('ellipse',{
                                'cx': objectCenterPt.x, 
                                    'cy': objectCenterPt.y, 
                                    'rx':4, 
                                    'ry':4, 
                                    'style':'fill:blue;stroke-width:2'}
                                )
                            );
                            var originalCoord = {};
                            originalCoord.cx     =  objectCenterPt.x;
                            originalCoord.cy     =  objectCenterPt.y;
                            var points = 
                                String.split(object.getAttribute("points").trim(), ' ');

                            var distances = [];
                            for (var j = 0; j < points.length-1; j++) {
                                var pointPair = String.split(points[j], ",");
                                var point = 
                                        new OpenSeadragon.Point(
                                            parseFloat(pointPair[0]),
                                                parseFloat(pointPair[1])
                                        );
                                var relPt = this.viewer.viewport.pointFromPixel(point);
                                var dist = relPt.minus(objectCenterRelPt); 
                                console.log("dist: " + dist.x +"," + dist.y);
                                distances.push(dist);

                            }

                            originalCoords[object.id] = {
                                center: objectCenterRelPt, 
                                distances: distances};


                        }
                         

                    };

                    this.setupHandlers();
                }.bind(this),
                onFailure: function (e) {
                    this.showMessage("cannot get the annotations,please check your getAnnot funciton");
                }.bind(this)
            }).get();
        }
    },
    getAnnot: function () //Get Annotation from the API
    {
        if (this.iid) //When the database is set. User can refer to the annotation.php for saving the annotations
        {
            var jsonRequest = new Request.JSON({
                //url: IP + 'api/annotation.php',
                url: 'api/annotation.php',
                onSuccess: function (e) {
                    if (e == null) this.annotations = new Array();
                    else this.annotations = e;
                    this.displayAnnot(); //Display The Annotations
                }.bind(this),
                onFailure: function (e) {
                    this.showMessage("cannot get the annotations,please check your getAnnot function");
                }.bind(this)
            }).get({
                'iid': this.iid
            });
        } else //When the database is not set, one TXT file will be used to save the Annotation Data. Please Refer to annot.php in the API folder
        {
            var jsonRequest = new Request.JSON({
                //url: IP + 'api/annot.php',
                url:  'api/annot.php',
                onSuccess: function (e) {
                    var annot = JSON.decode(e);
                    if (annot == null) annot = new Array();
                    this.annotations = annot; //Display The Annotations
                    this.displayAnnot();
                    this.setupHandlers();
                }.bind(this),
                onFailure: function (e) {
                    this.showMessage("cannot get the annotations,please check your getAnnot funciton");
                }.bind(this)
            }).get();
        }
    },
    keyPress: function (code) //Key Down Events Handler
    {
        switch (code) {
            case 84:
                //press t to toggle tools
                this.tool.toggle();
                break;
            case 81:
                //press q to quit current mode and return to the default mode
                this.quitMode();
                this.quitbutton.hide();
                break;
            case 32:
                //press white space to toggle annotations
                this.toggleMarkups();
                break;
            case 49:
                //1 for rectangle mode
                this.mode = 'rect';
                this.drawMarkups();
                break;
            case 50:
                // 2 for ellipse mode
                this.mode = 'ellipse';
                this.drawMarkups();
                break;
            case 51:
                // 3 for polyline mode
                this.mode = 'polyline';
                this.drawMarkups();
                break;
            case 52:
                // 4 for pencil mode
                this.mode = 'pencil';
                this.drawMarkups();
                break;
            case 53:
                // 5 for measurement mode
                this.mode = 'measure';
                this.drawMarkups();
                break;
            case 54:
                // 6 for magnify mode
                this.mode = 'magnify';
                this.magnify();
                break;
        }
    },
    drawMarkups: function () //Draw Markups
    {
        this.showMessage(); //Show Message
        this.drawCanvas.removeEvents('mouseup');
        this.drawCanvas.removeEvents('mousedown');
        this.drawCanvas.removeEvents('mousemove');
        this.drawLayer.show(); //Show The Drawing Layer
        this.quitbutton.show(); //Show The Quit Button
        this.magnifyGlass.hide(); //Hide The Magnifying Tool
        //this.container = document.id(this.canvas); //Get The Canvas Container
        this.container = document.getElementsByClassName(this.canvas)[0]; //Get The Canvas Container
        //this.container = document.getElementById('container'); //Get The Canvas Container
        if (this.container) {
            //var left = parseInt(this.container.offsetLeft), //Get The Container Location
            var left = parseInt(this.container.getLeft()), //Get The Container Location
                top = parseInt(this.container.offsetTop),
                width = parseInt(this.container.offsetWidth),
                height = parseInt(this.container.offsetHeight),
                oleft = left,
                otop = top,
                owidth = width,
                oheight = height;
            //console.log("left: " + left + " top: " + top + " width: " + width + " height: " + height);
            if (left < 0) {
                left = 0;
                width = window.innerWidth;
            } //See Whether The Container is outside The Current ViewPort
            if (top < 0) {
                top = 0;
                height = window.innerHeight;
            }
            //Recreate The CreateAnnotation Layer Because of The ViewPort Change Issue.
            this.drawLayer.set({
                'styles': {
                    left: left,
                    top: top,
                    width: width,
                    height: height
                }
            });
            //Create Canvas on the CreateAnnotation Layer
            this.drawCanvas.set({
                width: width,
                height: height
            });
            //The canvas context
            var ctx = this.drawCanvas.getContext("2d");
            //Draw Markups on Canvas
            switch (this.mode) {
                case "rect":
                    //Draw Rectangles
                    var started = false;
                    var x, //start location x
                        y, //start location y
                        w, //width
                        h; //height
                    this.drawCanvas.addEvent('mousedown', function (e) {
                        started = true;
                        x = e.event.layerX;
                        y = e.event.layerY;
                    });
                    this.drawCanvas.addEvent('mousemove', function (e) {
                        if (started) {
                            ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
                            x = Math.min(e.event.layerX, x);
                            y = Math.min(e.event.layerY, y);
                            w = Math.abs(e.event.layerX - x);
                            h = Math.abs(e.event.layerY - y);
                            ctx.strokeStyle = this.color;
                            ctx.strokeRect(x, y, w, h);
                        }
                    }.bind(this));
                    this.drawCanvas.addEvent('mouseup', function (e) {
                        started = false;
                        //Save the Percentage Relative to the Container
                        //x = (x + left - oleft) / owidth;
                        //y = (y + top - otop) / oheight;
                        //w = w / owidth;
                        //h = h / oheight;
                        var p = 
                            OpenSeadragon.Utils.getMousePosition2(e).minus
                                (OpenSeadragon.Utils.getElementPosition(viewer.element));
                        var point = viewer.viewport.pointFromPixel(p);
                        var pixelPt = viewer.viewport.pixelFromPoint(point);
                        var pointFromPixel = viewer.viewport.pointFromPixel(new Seadragon.Point(x, y));

                        var distx = Math.abs(pixelPt.x - x);
                        var disty = Math.abs(pixelPt.y - y);
                        x = pointFromPixel.x; 
                        y = pointFromPixel.y;
                        var wpoint = point.minus(pointFromPixel);
                        w = wpoint.x;
                        h = wpoint.y;

                        var tip = "asdf";//prompt("Please Enter Some Descriptions", "");
                        if (tip != null) {
                            //Update Annotations
                            var newAnnot = {
                                x: x,
                                y: y,
                                w: w,
                                h: h,
                                type: "rect",
                                text: tip,
                                color: this.color
                            };
                            this.addnewAnnot(newAnnot);
                            viewer.viewport.zoomTo(1);
                            //this.drawMarkups();
                            this.getAnnot2();
                        } else {
                            ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
                        }
                    }.bind(this));
                    break;
                case "ellipse":
                    //Draw Ellipse
                    var started = false;
                    var x, //start location x
                        y, //start location y
                        w, //width
                        h; //height
                    this.drawCanvas.addEvent('mousedown', function (e) {
                        started = true;
                        x = e.event.layerX;
                        y = e.event.layerY;
                    });
                    this.drawCanvas.addEvent('mousemove', function (e) {
                        if (started) {
                            ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
                            x = Math.min(e.event.layerX, x);
                            y = Math.min(e.event.layerY, y);
                            w = Math.abs(e.event.layerX - x);
                            h = Math.abs(e.event.layerY - y);
                            var kappa = .5522848;
                            var ox = (w / 2) * kappa; // control point offset horizontal
                            var oy = (h / 2) * kappa; // control point offset vertical
                            var xe = x + w; // x-end
                            var ye = y + h; // y-end
                            var xm = x + w / 2; // x-middle
                            var ym = y + h / 2; // y-middle
                            ctx.beginPath();
                            ctx.moveTo(x, ym);
                            ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
                            ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
                            ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                            ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
                            ctx.closePath();
                            ctx.strokeStyle = this.color;
                            ctx.stroke();
                        }
                    }.bind(this));
                    this.drawCanvas.addEvent('mouseup', function (e) {
                        started = false;
                        //Save the Percentage Relative to the Container
                        
                        //x = (x + left - oleft) / owidth;
                        //y = (y + top - otop) / oheight;
                        //w = w / owidth;
                        //h = h / oheight;
                        var p = 
                            OpenSeadragon.Utils.getMousePosition2(e).minus
                                (OpenSeadragon.Utils.getElementPosition(viewer.element));
                        var point = viewer.viewport.pointFromPixel(p);
                        var pixelPt = viewer.viewport.pixelFromPoint(point);
                        var pointFromPixel = viewer.viewport.pointFromPixel(new Seadragon.Point(x, y));

                        var distx = Math.abs(pixelPt.x - x);
                        var disty = Math.abs(pixelPt.y - y);
                        x = pointFromPixel.x; 
                        y = pointFromPixel.y;
                        var wpoint = point.minus(pointFromPixel);
                        w = wpoint.x;
                        h = wpoint.y;

                        var tip = "adf"; //prompt("Please Enter Some Descriptions", "");
                        if (tip != null) {
                            //Update Annotations
                            var newAnnot = {
                                x: x,
                                y: y,
                                w: w,
                                h: h,
                                type: "ellipse",
                                text: tip,
                                color: this.color
                            };
                            this.addnewAnnot(newAnnot);
                            //this.drawMarkups();
                            //viewer.viewport.goHome();
                            viewer.viewport.zoomTo(1);
                            this.getAnnot2();
                        } else {
                            ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
                        }
                    }.bind(this));
                    break;
                case "pencil":
                    //Draw Pencil
                    var started = false;
                    var pencil = []; //The Pencil Object
                    var newpoly = []; //Every Stroke is treated as a Continous Polyline
                    this.drawCanvas.addEvent('mousedown', function (e) {
                        started = true;
                        newpoly.push({
                            "x": e.event.layerX,
                            "y": e.event.layerY
                        }); //The percentage will be saved
                        ctx.beginPath();
                        ctx.moveTo(e.event.layerX, e.event.layerY);
                        ctx.strokeStyle = this.color;
                        ctx.stroke();
                    }.bind(this));
                    this.drawCanvas.addEvent('mousemove', function (e) {
                        if (started) {
                            newpoly.push({
                                "x": e.event.layerX,
                                "y": e.event.layerY
                            });
                            ctx.lineTo(e.event.layerX, e.event.layerY);
                            ctx.stroke();
                        }
                    });
                    this.drawCanvas.addEvent('mouseup', function (e) {
                        started = false;
                        pencil.push(newpoly); //Push the Stroke to the Pencil Object
                        newpoly = []; //Clear the Stroke
                        numpoint = 0; //Clear the Points
                        var tip = prompt("Please Enter Some Descriptions", "");
                        var x, y, w, h;
                        x = pencil[0][0].x;
                        y = pencil[0][0].y;
                        var maxdistance = 0; //The Most Remote Point to Determine the Markup Size
                        var points = "";
                        for (var i = 0; i < pencil.length; i++) {
                            newpoly = pencil[i];
                            for (j = 0; j < newpoly.length; j++) {
                                points += (newpoly[j].x + left - oleft) / owidth + ',' + (newpoly[j].y + top - otop) / oheight + ' ';
                                if (((newpoly[j].x - x) * (newpoly[j].x - x) + (newpoly[j].y - y) * (newpoly[j].y - y)) > maxdistance) {
                                    maxdistance = ((newpoly[j].x - x) * (newpoly[j].x - x) + (newpoly[j].y - y) * (newpoly[j].y - y));
                                    w = Math.abs(newpoly[j].x - x) / owidth;
                                    h = Math.abs(newpoly[j].y - y) / oheight;
                                }
                            }
                            points = points.slice(0, -1)
                            points += ';';
                        }
                        points = points.slice(0, -1);
                        x = (x + left - oleft) / owidth;
                        y = (y + top - otop) / oheight;
                        if (tip != null) {
                            //Save Annotations
                            var newAnnot = {
                                x: x,
                                y: y,
                                w: w,
                                h: h,
                                type: "pencil",
                                points: points,
                                text: tip,
                                color: this.color
                            };
                            this.addnewAnnot(newAnnot);
                            this.drawMarkups();
                        } else {
                            ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
                        }
                    }.bind(this));
                    break;
                case "polyline":
                    //Create Polylines
                    var newpoly = []; //New Polyline
                    var numpoint = 0; //Number of Points
                    this.drawCanvas.addEvent('mousedown', function (e) {
                        ctx.fillStyle = this.color;
                        ctx.beginPath();
                        ctx.arc(e.event.layerX, e.event.layerY, 2, 0, Math.PI * 2, true);
                        ctx.closePath();
                        ctx.fill();
                        newpoly.push({
                            "x": e.event.layerX,
                            "y": e.event.layerY
                        });
                        if (numpoint > 0) {
                            ctx.beginPath();
                            ctx.moveTo(newpoly[numpoint].x, newpoly[numpoint].y);
                            ctx.lineTo(newpoly[numpoint - 1].x, newpoly[numpoint - 1].y);
                            ctx.strokeStyle = this.color;
                            ctx.stroke();
                        }
                        numpoint++;
                    }.bind(this));
                    this.drawCanvas.addEvent('dblclick', function (e) {
                        ctx.beginPath();
                        ctx.moveTo(newpoly[numpoint - 1].x, newpoly[numpoint - 1].y);
                        ctx.lineTo(newpoly[0].x, newpoly[0].y);
                        ctx.strokeStyle = this.color;
                        ctx.stroke();
                        var x, y, w, h;
                        x = newpoly[0].x;
                        y = newpoly[0].y;
                        var maxdistance = 0;
                        var tip = prompt("Please Enter Some Descriptions", "");
                        var points = "";
                        for (var i = 0; i < numpoint - 1; i++) {
                            //points += (newpoly[i].x + left - oleft) / owidth + ',' + 
                             //           (newpoly[i].y + top - otop) / oheight + ' ';
                            var polyPixelPt = new OpenSeadragon.Point(newpoly[i].x, newpoly[i].y);
                            var polyPt      = viewer.viewport.pointFromPixel(polyPixelPt); 
                            points += polyPt.x + ',' + polyPt.y + ' ';

                            if (((newpoly[i].x - x) * (newpoly[i].x - x) + (newpoly[i].y - y) * (newpoly[i].y - y)) > maxdistance) {
                                maxdistance = ((newpoly[i].x - x) * (newpoly[i].x - x) + (newpoly[i].y - y) * (newpoly[i].y - y));
                                w = Math.abs(newpoly[i].x - x) / owidth;
                                h = Math.abs(newpoly[i].y - y) / oheight;
                            }
 
                        }
                        //points += (newpoly[i].x + left - oleft) / owidth + ',' + 
                                    //(newpoly[i].y + top - otop) / oheight;

                        var polyPixelPt = new OpenSeadragon.Point(newpoly[i].x, newpoly[i].y);
                        var polyPt      = viewer.viewport.pointFromPixel(polyPixelPt); 
                        points += polyPt.x + ',' + polyPt.y;

                        x = (x + left - oleft) / owidth;
                        y = (y + top - otop) / oheight;
                        if (tip != null) {
                            var newAnnot = {
                                x: x,
                                y: y,
                                w: w,
                                h: h,
                                type: "polyline",
                                points: points,
                                text: tip,
                                color: this.color
                            };
                            this.addnewAnnot(newAnnot);
                            this.drawMarkups();
                        } else {
                            ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
                        }
                    }.bind(this));
                    break;
                case "measure":
                    //Measurement Tool
                    var started = false;
                    var x0, y0, x1, y1;
                    var length;
                    var maxWidth = this.maxWidth;
                    var maxHeight = this.maxHeight;
                    var ratio = this.ratio;
                    this.ruler = new Element('div', {
                        styles: {
                            background: 'black',
                            position: 'absolute',
                            color: 'white',
                            width: '200px'
                        }
                    }).inject(this.container);
                    this.ruler.hide();
                    this.drawCanvas.addEvent('mousedown', function (e) {
                        if (!started) {
                            x0 = e.event.layerX;
                            y0 = e.event.layerY;
                            started = true;
                            this.ruler.show();
                        } else {
                            x1 = e.event.layerX;
                            y1 = e.event.layerY;
                            ctx.beginPath();
                            ctx.moveTo(x0, y0);
                            ctx.lineTo(x1, y1);
                            ctx.strokeStyle = this.color;
                            ctx.stroke();
                            ctx.closePath();
                            var tip = prompt("Save This?", length);
                            if (tip != null) {
                                x = (x0 + left - oleft) / owidth;
                                y = (y0 + top - otop) / oheight;
                                w = Math.abs(x1 - x0) / owidth;
                                h = Math.abs(y1 - y0) / oheight;
                                points = (x1 + left - oleft) / owidth + "," + (y1 + top - otop) / oheight;
                                this.ruler.destroy();
                                var newAnnot = {
                                    x: x,
                                    y: y,
                                    w: w,
                                    h: h,
                                    type: "line",
                                    points: points,
                                    text: tip,
                                    color: this.color
                                };
                                this.addnewAnnot(newAnnot);
                                this.drawMarkups();
                            } else {
                                ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
                            }
                            started = false;
                            this.ruler.destroy();
                        }
                    }.bind(this));
                    this.drawCanvas.addEvent('mousemove', function (e) {
                        if (started) {
                            ctx.clearRect(0, 0, iip.wid, iip.hei);
                            x1 = e.event.layerX;
                            y1 = e.event.layerY;
                            var maxLength = (Math.sqrt(maxWidth * maxWidth + maxHeight * maxHeight));
                            var screen = (Math.sqrt(owidth * owidth + oheight * oheight));
                            length = ((Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1))) / screen) * maxLength * ratio + 'mm';
                            this.ruler.set({
                                html: length,
                                styles: {
                                    left: x1 + left - oleft + 10,
                                    top: y1 + top - otop
                                }
                            });
                            ctx.beginPath();
                            ctx.moveTo(x0, y0);
                            ctx.lineTo(x1, y1);
                            ctx.strokeStyle = this.color;
                            ctx.stroke();
                            ctx.closePath();
 
                        }
                    }.bind(this));
                    break;
            }
        } else this.showMessage("Container Not SET Correctly Or Not Fully Loaded Yet");
    },
    magnify: function () //Magnify Tool
    {
        this.quitbutton.show();
        this.drawLayer.hide();
        this.magnifyGlass.hide();
        this.magnifyGlass.set({
            html: ''
        });
        var content = new Element('div', {
            'class': "magnified_content",
            styles: {
                width: document.getSize().x,
                height: document.getSize().y
            }
        });
        content.set({
            html: document.body.innerHTML
        });
        content.inject(this.magnifyGlass);
        var scale = 2.0;
        var left = parseInt(this.magnifyGlass.style.left);
        var top = parseInt(this.magnifyGlass.style.top);
        this.magnifyGlass.set({
            'styles': {
                left: left,
                top: top
            }
        });
        content.set({
            'styles': {
                left: -scale * left,
                top: -scale * top
            }
        });
        this.magnifyGlass.show();
        this.magnifyGlass.makeDraggable({
            onDrag: function (draggable) {
                this.showMessage("drag the magnifying glass");
                var left = parseInt(this.magnifyGlass.style.left);
                var top = parseInt(this.magnifyGlass.style.top);
                this.magnifyGlass.set({
                    'styles': {
                        left: left,
                        top: top
                    }
                });
                content.set({
                    'styles': {
                        left: -scale * left,
                        top: -scale * top
                    }
                });
            }.bind(this),
            onDrop: function (draggable) {
                this.showMessage("Press q to quit");
            }.bind(this)
        });
    },
    selectColor: function () //Pick A Color
    {
 
        this.colorContainer = new Element('div').inject(this.tool);
        var blackColor = new Element('img', {
            'class': 'colorButton',
            'title': 'black',
            'styles': {
                'background-color': 'black'
            },
            'events': {
                'click': function () {
                    this.color = 'black';
                    this.colorContainer.destroy();
                }.bind(this)
            }
        }).inject(this.colorContainer);
        var redColor = new Element('img', {
            'class': 'colorButton',
            'title': 'Default',
            'styles': {
                'background-color': 'red'
            },
            'events': {
                'click': function () {
                    this.color = 'red';
                    this.colorContainer.destroy();
                }.bind(this)
            }
        }).inject(this.colorContainer);
        var blueColor = new Element('img', {
            'class': 'colorButton',
            'title': 'blue',
            'styles': {
                'background-color': 'blue'
            },
            'events': {
                'click': function () {
                    this.color = 'blue';
                    this.colorContainer.destroy();
                }.bind(this)
            }
        }).inject(this.colorContainer);
        var greenColor = new Element('img', {
            'class': 'colorButton',
            'title': 'lime',
            'styles': {
                'background-color': 'lime'
            },
            'events': {
                'click': function () {
                    this.color = 'lime';
                    this.colorContainer.destroy();
                }.bind(this)
            }
        }).inject(this.colorContainer);
        var purpleColor = new Element('img', {
            'class': 'colorButton',
            'title': 'purple',
            'styles': {
                'background-color': 'purple'
            },
            'events': {
                'click': function () {
                    this.color = 'purple';
                    this.colorContainer.destroy();
                }.bind(this)
            }
        }).inject(this.colorContainer);
        var orangeColor = new Element('img', {
            'class': 'colorButton',
            'title': 'orange',
            'styles': {
                'background-color': 'orange'
            },
            'events': {
                'click': function () {
                    this.color = 'orange';
                    this.colorContainer.destroy();
                }.bind(this)
            }
        }).inject(this.colorContainer);
        var yellowColor = new Element('img', {
            'class': 'colorButton',
            'title': 'yellow',
            'styles': {
                'background-color': 'yellow'
            },
            'events': {
                'click': function () {
                    this.color = 'yellow';
                    this.colorContainer.destroy();
                }.bind(this)
            }
        }).inject(this.colorContainer);
        var pinkColor = new Element('img', {
            'class': 'colorButton',
            'title': 'pink',
            'styles': {
                'background-color': 'pink'
            },
            'events': {
                'click': function () {
                    this.color = 'pink';
                    this.colorContainer.destroy();
                }.bind(this)
            }
        }).inject(this.colorContainer);
        var colorButtons = document.getElements(".colorButton");
        for (var i = 0; i < colorButtons.length; i++) {
            colorButtons[i].addEvents({
                'mouseenter': function () {
                    this.addClass('selected')
                },
                'mouseleave': function () {
                    this.removeClass('selected')
                }
            });
        }
    },
    addnewAnnot: function (newAnnot) //Add New Annotations
    {
        this.annotations.push(newAnnot);
        this.saveAnnot();
        this.displayAnnot();
    },
    quitMode: function () //Return To the Default Mode
    {
        this.drawLayer.hide();
        this.magnifyGlass.hide();
    },
    toggleMarkups: function () //Toggle Markups
    {
        if (this.svg) {
            if (this.annotVisible) {
                this.annotVisible = false;
                this.svg.hide();
                document.getElements(".annotcontainer").hide();
            } else {
                this.annotVisible = true;
                this.displayAnnot();
                document.getElements(".annotcontainer").show();
            }
        } else {
            this.annotVisible = true;
            this.displayAnnot();
        }
        this.showMessage("annotation toggled");
    },
    showMessage: function (msg) //Show Messages
    {
        if (!(msg)) msg = this.mode + " mode,press q to quit";
        this.messageBox.set({
            html: msg
        });
        var myFx = new Fx.Tween('messageBox', {
            duration: 'long',
            transition: 'bounce:out',
            link: 'cancel',
            property: 'opacity'
        }).start(0, 1).chain(function () {
            this.start(0.5, 0);
        });
    },
    setupHandlers: function() 
    {
        
                    var scale       = 1;



                    var state = 'none',stateTarget, stateOrigin, stateTf;
                    
                    
                    var root = document.getElementsByTagName('svg')[0]; 
                    var z = 1;
                    setAttributes(root, {
                        "onmouseup" : "handleMouseUp(evt)",
                        "onmousedown" : "handleMouseDown(evt)",
                        "onmousemove" : "handleMouseMove(evt)",
                        "onmouseout" : "handleMouseUp(evt)", // Decomment this to stop the pan functionality when dragging out of the SVG element
                    });
                    
                    if (root != undefined) {
                        setupHandlers(root);

                    }
                    
                    function setupHandlers(root){
                    
                        if(navigator.userAgent.toLowerCase().indexOf('webkit') >= 0) {
                            window.addEventListener('mousewheel', handleMouseWheel, false); // Chrome/Safari
                            window.addEventListener('mousemove', handleMouseMove, false); // Chrome/Safari
                            window.addEventListener('mousedown', handleMouseDown, false); // Chrome/Safari
                            window.addEventListener('mouseup', handleMouseUp, false); // Chrome/Safari
                        } else {
                            window.addEventListener('DOMMouseScroll', handleMouseWheel, false); // Others
                        }
                    }
                    
                    function setAttributes(element, attributes){
                        for (i in attributes)
                            element.setAttributeNS(null, i, attributes[i]);
                    }


                    // Retrieves the root element for SVG manipulation. The element is then cached into the svgRoot global variable.
                    function getRoot(root) {
                        if(typeof(svgRoot) == "undefined") {
                            var g = null;
                    
                            //g = root.getElementById("viewport");
                            g = root.getElemenstByTagName("viewport")[0];
                    
                            if(g == null)
                                //g = root.getElementsByTagName('g')[0];
                                g = root.getElementsByTagName('ellipse')[0];
                    
                            if(g == null)
                                alert('Unable to obtain SVG root element');
                    
                            setCTM(g, g.getCTM());
                    
                            g.removeAttribute("viewBox");
                    
                            svgRoot = g;
                        }
                    
                        return svgRoot;
                    }
                    


                    

    },
    displayAnnot: function () //Display SVG Annotations
    {
        var a = [],
            b, index;
        //var container = document.id(this.canvas);
        var pointsArr = [];
        var lines = [];
        var container = document.getElementsByClassName(this.canvas)[0]; //Get The Canvas Container
        if (container) {
            var left = parseInt(container.offsetLeft),
                top = parseInt(container.offsetTop),
                width = parseInt(container.offsetWidth),
                height = parseInt(container.offsetHeight);
            this.drawLayer.hide();
            this.magnifyGlass.hide();
            //for (index in this.annotations) this.annotations[index].id = index, a.push(this.annotations[index]);
            for (index = 0; index < this.annotations.length; index++) {
                this.annotations[index].id = index; 
                a.push(this.annotations[index]);
            }
            container.getElements(".annotcontainer").destroy();
            if (this.svg) {
                this.svg.html = '';
                this.svg.destroy();
            }
            //This part is for displaying SVG annotations
            if (this.annotVisible) {
                index--;
                var svgHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + 'px" height="' + height + 'px" version="1.1">';
                    svgHtml += '<g id="groupcenter"/>';
                    svgHtml += '<g id="origin">';
                    var origin = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5));
                    svgHtml += '<ellipse id="originpt" cx="' + origin.x + '" cy="' + origin.y + '" rx="' + 4 + '" ry="' + 4  + '" style="fill:blue;stroke:red;stroke-width:2"/>';
                    svgHtml += '</g>';
                    svgHtml += '<g id="viewport" transform="translate(0,0)">';
                for (index = 0; index < a.length; index++) {
                    if (((width * a[index].x + left) > 0) && ((width * a[index].x + left + width * a[index].w) < window.innerWidth) && ((height * a[index].y + top) > 0) && ((height * a[index].y + top + height * a[index].h) < window.innerHeight)) {
                        switch (a[index].type) {
                            case "rect":
                                var x = parseFloat(a[index].x);
                                var y = parseFloat(a[index].y);
                                var w = parseFloat(a[index].w);
                                var h = parseFloat(a[index].h);
                                var point = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(x,y));

                                //svgHtml += '<rect x="' + width * a[index].x + '" y="' + height * a[index].y + '" width="' + width * a[index].w + '" height="' + height * a[index].h + '" stroke="' + a[index].color + '" stroke-width="2" fill="none"/>';
                                svgHtml += '<rect x="' + point.x + '" y="' + point.y + '" width="' + w*width + '" height="' + width*h + '" stroke="' + a[index].color + '" stroke-width="2" fill="none"/>';
                                break;
                            case "ellipse":
                                var cx = parseFloat(a[index].x) + parseFloat(a[index].w) / 2;
                                var cy = parseFloat(a[index].y) + parseFloat(a[index].h) / 2;
                                var rx = parseFloat(a[index].w) / 2;
                                var ry = parseFloat(a[index].h) / 2;
                                //rx = rx*Math.pow(1.2,zoom-1);
                                //ry = ry*Math.pow(1.2,zoom-1);
                            /*
                            var tempPt = 
                                viewer.viewport.pixelFromPoint(
                                    new OpenSeadragon.Point(parseFloat(a[index].x), 
                                            parseFloat(a[index].y)));
                            var tempPt2 = 
                                viewer.viewport.pixelFromPoint(
                                    new OpenSeadragon.Point(parseFloat(a[index].x), 0));
                                            
                            var tempPt3 = 
                                viewer.viewport.pixelFromPoint(
                                    new OpenSeadragon.Point(parseFloat(a[index].y), 0));
                                            
                            var endPt = 
                                viewer.viewport.pixelFromPoint(
                                    new OpenSeadragon.Point(parseFloat(a[index].w), 0));
                            var endPt2 = 
                                viewer.viewport.pixelFromPoint(
                                    new OpenSeadragon.Point(parseFloat(a[index].h), 0));

                            var dist2 = endPt2.distanceTo(tempPt3);
                            var dist = endPt.distanceTo(tempPt2);
                        var test = makeSVG('ellipse', {
                            'cx': tempPt.x,
                            'cy': tempPt.y,
                            'rx': 2,
                            'ry': 2,
                            'style': 'fill:blue;stroke:rgb(255,0,0);stroke-width:2' 
                        });
                        var newline = makeSVG('line', {
                            'x1': tempPt.x,
                            'y1': tempPt.y,
                            'x2': tempPt.x + dist,
                            'y2': tempPt.y,
                            'style': 'stroke:rgb(255,0,0);stroke-width:2' 
                        });
                        var newline2 = makeSVG('line', {
                            'x1': tempPt.x,
                            'y1': tempPt.y,
                            'x2': tempPt.x,
                            'y2': tempPt.y+dist2,
                            'style': 'stroke:rgb(255,0,0);stroke-width:2' 
                        });
                        points.push(test);
                        lines.push(newline);
                        lines.push(newline2);
                        */
                                var point = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(cx,cy));

                                svgHtml += '<ellipse id="' + index + '" cx="' + point.x + '" cy="' + point.y + '" rx="' + width* rx + '" ry="' + width * ry + '" style="fill:none;stroke:' + a[index].color + ';stroke-width:2"/>';
                                break;
                            case "pencil":
                                var points = a[index].points;
                                var poly = String.split(points, ';');
                                for (var k = 0; k < poly.length; k++) {
                                    var p = String.split(poly[k], ' ');
                                    svgHtml += '<polyline id="'+index+'" points="';
                                    for (var j = 0; j < p.length; j++) {
                                        point = String.split(p[j], ',');
                                        px = point[0] * width;
                                        py = point[1] * height;
                                        svgHtml += px + ',' + py + ' ';
                                    }
                                    svgHtml += '" style="fill:none;stroke:' + a[index].color + ';stroke-width:2"/>';
                                }
                                break;
                            case "polyline":
                                var points = a[index].points;
                                var poly = String.split(points, ';');
                                for (var k = 0; k < poly.length; k++) {
                                    var p = String.split(poly[k], ' ');
                                    svgHtml += '<polygon id="'+index+ '" points="';
                                    for (var j = 0; j < p.length; j++) {
                                        point = String.split(p[j], ',');
                                        //px = point[0] * width;
                                        //py = point[1] * height;
                                        var polyPt = 
                                            new OpenSeadragon.Point(
                                                parseFloat(point[0]),
                                                parseFloat(point[1])
                                        );
                                        var polyPixelPt = viewer.viewport.pixelFromPoint(polyPt);
                                        //svgHtml += px + ',' + py + ' ';
                                        svgHtml += polyPixelPt.x + ',' + polyPixelPt.y + ' ';
                                    }
                                    svgHtml += '" style="fill:none;stroke:' + a[index].color + ';stroke-width:2"/>';
                                }
                                break;
                            case "line":
                                var points = String.split(a[index].points, ',');
                                svgHtml += '<line x1="' + a[index].x * width + '" y1="' + a[index].y * height + '" x2="' + parseFloat(points[0]) * width + '" y2="' + parseFloat(points[1]) * height + '" style="stroke:' + a[index].color + ';stroke-width:2"/>';
                                break;
                        }
                        var d = new Element("div", {
                            id: a[index].id,
                            "class": 'annotcontainer',
                            styles: {
                                position: 'absolute',
                                left: Math.round(width * a[index].x),
                                top: Math.round(height * a[index].y),
                                width: Math.round(width * a[index].w),
                                height: Math.round(height * a[index].h)
                            }
                        //}).inject(container);
                        });
                        var c = this;
                        d.addEvents({
                            'mouseenter': function (e) {
                                e.stop;
                                c.displayTip(this.id)
                            },
                            'mouseleave': function (e) {
                                e.stop;
                                c.destroyTip()
                            },
                            'dblclick': function (e) {
                                e.stop();
                                c.editTip(this.id)
                            }
                        });
                    }
                }
                svgHtml += '</g></svg>';
                //svgHtml += '</svg>';


                //if (this.annotations.length > 0) {
                if (1==1) {
                    //inject the SVG Annotations to this.Canvas
                    this.svg = new Element("div", {
                        styles: {
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%'
                        },
                        html: svgHtml
                    }).inject(container);
                    for (var j = 0; j < pointsArr.length; j++) {
                        $('#groupcenter')[0].appendChild(pointsArr[j]);
                    }
                    for (j = 0; j < lines.length; j++) {
                        $('#groupcenter')[0].appendChild(lines[j]);
                    }
                } else {
                    this.showMessage("Please Press white space to toggle the Annotations");
                }
            }
        } else {
            this.showMessage("Canvas Container Not Ready");
        }
    },
    displayTip: function (id) //Display Tips
    {
 
        //var container = document.id(this.canvas);
        var container = document.getElementsByClassName(this.canvas)[0]; //Get The Canvas Container
        var width = parseInt(container.offsetWidth),
            height = parseInt(container.offsetHeight),
            annot = this.annotations[id];
        var d = new Element("div", {
            "class": 'annotip',
            styles: {
                position: 'absolute',
                left: Math.round(width * annot.x),
                top: Math.round(height * annot.y)
            },
            html: annot.text
        }).inject(container);
        this.showMessage("Double Click to Edit");
    },
    destroyTip: function () //Destroy Tips
    {
        //var container = document.id(this.canvas);
        var container = document.getElementsByClassName(this.canvas)[0]; //Get The Canvas Container
        container.getElements(".annotip").destroy();
    },
    editTip: function (id) //Edit Tips
    {
        //var container = document.id(this.canvas);
        var container = document.getElementsByClassName(this.canvas)[0]; //Get The Canvas Container
        container.getElements(".annotip").destroy();
        var width = parseInt(container.offsetWidth),
            height = parseInt(container.offsetHeight),
            left = parseInt(container.offsetLeft),
            top = parseInt(container.offsetTop),
            annot = this.annotations[id];
        var d = new Element("div", {
            "class": 'edittip',
            styles: {
                position: 'absolute',
                left: Math.round(width * annot.x + left),
                top: Math.round(height * annot.y + height * annot.h + top)
            }
        }).inject(document.body);
        d.makeDraggable();
        var deleteButton = new Element("button", {
            html: 'Delete',
            events: {
                'click': function () {
                    d.destroy();
                    this.deleteAnnot(id)
                }.bind(this)
            }
        }).inject(d);
        var editButton = new Element("button", {
            html: 'Edit',
            events: {
                'click': function () {
                    var tip = prompt("Make some changes", annot.text);
                    if (tip != null) {
                        this.annotations[id].text = tip;
                        this.saveAnnot();
                        this.displayAnnot();
                        d.destroy();
                    } else d.destroy();
                }.bind(this)
            }
        }).inject(d);
        var cancelButton = new Element("button", {
            html: 'Cancel',
            events: {
                'click': function () {
                    d.destroy();
                }
            }
        }).inject(d);
    },
    deleteAnnot: function (id) //Delete Annotations
    {
        this.annotations.splice(id, 1);
        this.saveAnnot();
        this.displayAnnot();
    },
    saveAnnot: function () //Save Annotations
    {
        if (this.iid) {
            var jsonRequest = new Request.JSON({
                //url: IP + '/api/annotation.php',
                url:  'api/annotation.php',
                onSuccess: function (e) {
                    this.showMessage("saved to the server");
                }.bind(this),
                onFailure: function (e) {
                    this.showMessage("Error Saving the Annotations,please check you saveAnnot funciton");
                }.bind(this)
            }).post({
                'iid': this.iid,
                'annot': this.annotations
            });
 
        } else {
            var jsonRequest = new Request.JSON({
                //url: IP + 'api/annot.php',
                url:  'api/annot.php',
                onSuccess: function (e) {
                    this.showMessage("saved to the server");
                }.bind(this),
                onFailure: function (e) {
                    this.showMessage("Error Saving the Annotations,please check you saveAnnot funciton and the api/annot.php function");
                }.bind(this)
            }).post({
                'annot': this.annotations
            });
        }
    },
    saveState: function () {
        if (this.iid) {
            var jsonRequest = new Request.JSON({
                //url: IP + 'api/state.php',
                url:  'api/state.php',
                onSuccess: function (e) {
                    this.showMessage("saved to the server");
                }.bind(this),
                onFailure: function (e) {
                    this.showMessage("Error Saving the state,please check you saveState funciton");
                }.bind(this)
            }).post({
                'iid': this.iid,
                'zoom': iip.view.res,
                'left': iip.view.x,
                'top': iip.view.y
            });
 
        } else this.showMessage("Sorry, This Function is Only Supported With the Database Version");
    }
        //var currentTrans = 
        //    document.getElementById("viewport").getAttribute("transform").replace(/ /g,"").replace("translate(", "").replace(")","");
});
