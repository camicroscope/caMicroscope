/*
Copyright (C) 2012 Shaohuan Li <shaohuan.li@gmail.com>, Ashish Sharma <ashish.sharma@emory.edu>
This file is part of Biomedical Image Viewer developed under the Google of Summer of Code 2012 program.
 
Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 
http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
var IP = '';
var annotools = new Class({
    initialize: function (element, options) {
	//this.suffix = "Firefox/26.0";
	//this.annotationActive = !(navigator.userAgent.indexOf(this.suffix, navigator.userAgent.length - this.suffix.length) !== -1);
	this.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	this.isFirefox = typeof InstallTrigger !== 'undefined';
	this.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
	this.isChrome = !!window.chrome && !this.isOpera;
	this.isIE = /*@cc_on!@*/false || !!document.documentMode;

	this.annotationActive = !(this.isFirefox || this.isIE || this.isOpera);
	this.source = element; //The Tool Source Element
        this.left = options.left || '150px'; //The Tool Location
        this.ratio = options.ratio || 0.005; //One pixel equals to the length in real situation. Will be used in the measurement tool
        this.maxWidth = options.maxWidth || 4000; //MaxWidth of the Image
        this.maxHeight = options.maxHeight || 800; ////MaxHeight of the Image
        this.initialized = false;
	this.top = options.top || '0px';
        this.color = options.color || 'lime'; //Default Annotation Color
        this.height = options.height || '30px';
        this.width = options.width || '270px';
        this.zindex = options.zindex || '100'; //To Make Sure The Tool Appears in the Front
        this.iidDecoded = decodeURI(options.iid);
	this.canvas = options.canvas; //The canvas Element that The Use will be drawing annotatoins on.
        this.iid = options.iid || null; //The Image ID
        this.annotVisible = true; //The Annotations are Set to be visible at the First Loading
        this.mode = 'default'; //The Mode is Set to Default

        this.viewer = options.viewer;
        this.imagingHelper = this.viewer.imagingHelper;
	this.mpp = options.mpp;
	this.mppx = parseFloat(this.mpp["mpp-x"]);
	this.mppy = parseFloat(this.mpp["mpp-y"]);
	this.x1 = 0.0;
	this.x2 = 1.0;
	this.y1 = 0.0;
	this.y2 = 1.0;
	this.annotationHandler = options.annotationHandler || new AnnotoolsOpenSeadragonHandler();
        window.addEvent("domready", function () {
            //this.getAnnot();
		this.createButtons();
        }.bind(this)); //Get the annotation information and Create Buttons
        window.addEvent("keydown", function (event) {
            this.keyPress(event.code)
        }.bind(this)); //Add KeyDown Events
        //this.viewer.viewport.zoomTo(1);
        //this.iid = "AA00448";
        if(this.annotationActive)
	    this.getAnnot();
        this.imagingHelper.addHandler('image-view-changed',function (event)
        {
            //this.getAnnot();
        }.bind(this));

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
        //this.tool.makeDraggable(); //Make it Draggable.
        if(this.annotationActive)
	{
	this.rectbutton = new Element('img', {
            'title': 'Draw Rectangle (r)',
            'class': 'toolButton firstToolButtonSpace',
            'src': 'images/rect.svg'
        }).inject(this.tool);//Create Rectangle Tool
        this.ellipsebutton = new Element('img', {
            'title': 'Draw Circle (c)',
            'class': 'toolButton',
            'src': 'images/ellipse.svg'
        }).inject(this.tool); //Ellipse Tool
        this.polybutton = new Element('img', {
            'title': 'Draw Polygon (p)',
            'class': 'toolButton',
            'src': 'images/poly.svg'
        }).inject(this.tool); //Polygon Tool
        this.pencilbutton = new Element('img', {
            'title': 'Draw Freeline (f)',
            'class': 'toolButton',
            'src': 'images/pencil.svg'
        }).inject(this.tool); //Pencil Tool
        /*this.colorbutton = new Element('img', {
            'title': 'Change Color',
            'class': 'toolButton',
            'src': 'images/color.svg'
        }).inject(this.tool); //Select Color*/
        this.measurebutton = new Element('img', {
            'title': 'Measurement Tool (m)',
            'class': 'toolButton',
            'src': 'images/measure.svg'
        }).inject(this.tool); //Measurement Tool
       /* this.magnifybutton = new Element('img', {
            'title': 'Loupe (l)',
            'class': 'toolButton',
            'src': 'images/magnify.svg'
        }).inject(this.tool); //Magnify Tool
	*/
       this.hidebutton = new Element('img', {
            'title': 'Toggle Markup (t)',
            'class': 'toolButton',
            'src': 'images/hide.svg'
        }).inject(this.tool); //Show/Hide Button
	this.analyzebutton = new Element('img', {
	    'title': 'Region of Interest (a)',
	    'class': 'toolButton',
	    'src': 'images/gear.svg'
	}).inject(this.tool); //Create analysis button
	
        /*this.savebutton = new Element('img', {
            'title': 'Save Current State',
            'class': 'toolButton',
            'src': 'images/save.svg'
        }).inject(this.tool); //Save Button
*/
	}
	this.titleButton = new Element('<p>',{
		'class' : 'titleButton',
		'text' : 'caMicroscope'
	}).inject(this.tool);

	this.iidbutton = new Element('<p>',{
		'class':'iidButton',
		'text':'SubjectID :' + this.iid
	}).inject(this.tool);

/* ASHISH - disable quit button
        this.quitbutton = new Element('img', {
            'title': 'quit',
            'class': 'toolButton',
            'src': 'images/quit.svg'
        }).inject(this.tool); //Quit Button
*/
	if(this.annotationActive)
	{
        this.rectbutton.addEvents({
            'click': function () {
                this.mode = 'rect';
                this.drawMarkups();
            }.bind(this)
        }); //Change Mode
	this.analyzebutton.addEvents({
	    'click': function() {
		this.mode = 'analyze';
		this.drawMarkups();
	    }.bind(this)
	});
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
        /*this.magnifybutton.addEvents({
            'click': function () {
                this.mode = 'magnify';
                this.magnify();
            }.bind(this)
        });
        this.colorbutton.addEvents({
            'click': function () {
                this.selectColor()
            }.bind(this)
        });*/
        this.hidebutton.addEvents({
            'click': function () {
                this.toggleMarkups()
            }.bind(this)
        });
        /*this.savebutton.addEvents({
            'click': function () {
                this.saveState()
            }.bind(this)
        });*/
/* ASHISH Disable quit button
        this.quitbutton.addEvents({
            'click': function () {
                this.quitMode();
                this.quitbutton.hide();
            }.bind(this)
        });
        this.quitbutton.hide(); //Quit Button Will Be Used To Return To the Default Mode
*/
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
	}
    },

    getAnnot: function (viewer) //Get Annotation from the API
    {
	if(this.initialized)
	{
	    this.x1 = this.imagingHelper._viewportOrigin["x"];
	    this.y1 = this.imagingHelper._viewportOrigin["y"];
	    this.x2 = this.x1 + this.imagingHelper._viewportWidth;
	    this.y2 = this.y1 + this.imagingHelper._viewportHeight;
	}

	this.initialized = true;
            var jsonRequest = new Request.JSON({
                //url: IP + 'api/getAnnotSpatial.php',
                url: 'api/Data/getAnnotSpatial.php',
                onSuccess: function (e) {
                    if (e == null) this.annotations = new Array();
                    else this.annotations = e;
                    this.convertAllToNative();
		    this.displayAnnot(); //Display The Annotations
		    this.relativeToGlobal();
                    this.setupHandlers();
                    //console.log("successfully get annotations");
                }.bind(this),
                onFailure: function (e) {
                    this.showMessage("cannot get the annotations,please check your getAnnot function");
                    this.annotations = new Array();
                }.bind(this)
            }).get({
                'iid': this.iid,
		'x':this.x1,
		'y':this.y1,
		'x1':this.x2,
		'y1':this.y2
            });
    },
    
    keyPress: function (code) //Key Down Events Handler
    {
        switch (code) {
            case 84:
                //press t to toggle tools
                this.tool.toggle();
                break;
/* ASHISH Disable quit
            case 81:
                //press q to quit current mode and return to the default mode
                this.quitMode();
                this.quitbutton.hide();
                break;
*/
            case 72:
                //press white space to toggle annotations
                this.toggleMarkups();
                break;
            case 82:
                //1 for rectangle mode
                this.mode = 'rect';
                this.drawMarkups();
                break;
            case 67:
                // 2 for ellipse mode
                this.mode = 'ellipse';
                this.drawMarkups();
                break;
            case 80:
                // 3 for polyline mode
                this.mode = 'polyline';
                this.drawMarkups();
                break;
            case 70:
                // 4 for pencil mode
                this.mode = 'pencil';
                this.drawMarkups();
                break;
            case 77:
                // 5 for measurement mode
                this.mode = 'measure';
                this.drawMarkups();
                break;
	    case 37:
		this.mode = 'analyze';
		this.drawMarkups();
		break;
            case 69:
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
/* ASHISH Disable quit
        this.quitbutton.show(); //Show The Quit Button
*/
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
                    this.drawRectangle(ctx);
		    break;
                case "ellipse":
                    this.drawEllipse(ctx);
		    break;
                case "pencil":
		    this.drawPencil(ctx);
		    break;
                case "polyline":
                    this.drawPolyline(ctx);
		    break;
                case "measure":
                    this.drawMeasure(ctx);
		    break;
		case "analyze":
		    this.markAnalysisRegion(ctx);
            }
        } else this.showMessage("Container Not SET Correctly Or Not Fully Loaded Yet");
        
    },
    magnify: function () //Magnify Tool
    {
/* ASHISH Disable quit
        this.quitbutton.show();
*/
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
            }.bind(this)
/*ASHISH DIsable quit
            ,onDrop: function (draggable) {
                this.showMessage("Press q to quit");
            }.bind(this)
*/
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
        newAnnot.iid = this.iidDecoded;
        newAnnot.annotId = MD5(new Date().toString());
        this.annotations.push(newAnnot);
        this.saveAnnot();
        //this.displayAnnot();
    },

    addnewJob: function(newAnnot)
    {
	newAnnot.iid = this.iidDecoded;
	newAnnot.jobId = MD5(new Date().toString());
	this.saveJob(newAnnot);
    },
/*ASHISH DIsable quit
    quitMode: function () //Return To the Default Mode
    {
        this.drawLayer.hide();
        this.magnifyGlass.hide();
    },
*/
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
/*ASHISH DIsable quit
        if (!(msg)) msg = this.mode + " mode,press q to quit";
*/
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
    relativeToGlobal: function() 
    {
            for (var i = 0; i < $('#viewport').children().length; i++) {
                var object = $('#viewport').children()[i];
    
                if (object.tagName == "ellipse") {
                    var originalCoord = {};
                    console.log("relativeToGlobal: " + viewer.viewport.getZoom() + "  " + this.annotationHandler.zoomBase);
                    originalCoord.cx = object.getAttribute('cx');
                    originalCoord.cy = object.getAttribute('cy');
                    if (viewer.viewport.getZoom() != this.annotationHandler.zoomBase ) {

                        originalCoord.rx = object.getAttribute('rx') * this.annotationHandler.zoomBase; 
                        originalCoord.ry = object.getAttribute('ry') * this.annotationHandler.zoomBase;

                    } else {

                        originalCoord.rx = object.getAttribute('rx');
                        originalCoord.ry = object.getAttribute('ry');

                    }
                    originalCoord.zoom = viewer.viewport.getZoom();
                    this.annotationHandler.originalCoords[object.id] = originalCoord;
                    var bbox = object.getBBox();

                    var objectCenterPt = new OpenSeadragon.Point(bbox.x+bbox.width/2, bbox.y+bbox.height/2);
                    var objectCenterRelPt = this.viewer.viewport.pointFromPixel(objectCenterPt);

                    // SBA
                    originalCoord.cx = objectCenterRelPt.x;
                    originalCoord.cy = objectCenterRelPt.y;

                    this.annotationHandler.objectCenterPts[i] = objectCenterRelPt;
                } else if (object.tagName == "rect"){
                    var originalCoord = {};
                    originalCoord.x     = object.getAttribute('x');
                    originalCoord.y     = object.getAttribute('y');
                    originalCoord.width = object.getAttribute('width');
                    originalCoord.height = object.getAttribute('height');
                    originalCoord.zoom = viewer.viewport.getZoom();
                    this.annotationHandler.originalCoords[object.id] = originalCoord;
                    var bbox = object.getBBox();
                    var objectCenterPt = new OpenSeadragon.Point(bbox.x+bbox.width/2, bbox.y+bbox.height/2);
                    var objectCenterRelPt = this.viewer.viewport.pointFromPixel(objectCenterPt);
                    this.annotationHandler.objectCenterPts[i] = objectCenterRelPt;

                }
                else {
                    var bbox = object.getBBox();
                    var objectCenterPt = 
                        new OpenSeadragon.Point(
                            bbox.x+bbox.width/2, 
                            bbox.y+bbox.height/2
                    );
                    console.log("bbox: " + bbox);
                    var objectCenterRelPt = 
                        this.viewer.viewport.pointFromPixel(objectCenterPt);
                    this.annotationHandler.objectCenterPts[i] = objectCenterRelPt;
                    var originalCoord = {};
                    originalCoord.cx     =  objectCenterPt.x;
                    originalCoord.cy     =  objectCenterPt.y;
                    var points = 
                        String.split(object.getAttribute("points").trim(), ' ');

                    var distances = [];
                    for (var j = 0; j < points.length; j++) {
                        var pointPair = String.split(points[j], ",");
                        var point = 
                                new OpenSeadragon.Point(
                                    parseFloat(pointPair[0]),
                                        parseFloat(pointPair[1])
                                );
                        var relPt = this.viewer.viewport.pointFromPixel(point);
                        var dist = relPt.minus(objectCenterRelPt); 
                        distances.push(dist);

                    }

                    this.annotationHandler.originalCoords[object.id] = {
                        center: objectCenterRelPt, 
                        distances: distances};


                }

            };

    },
        
    setupHandlers: function() 
    {
        
                    
        var root = document.getElementsByTagName('svg')[0]; 
                    
        if (root != undefined) {
            if(navigator.userAgent.toLowerCase().indexOf('webkit') >= 0) {
                window.addEventListener('mousewheel',   this.annotationHandler.handleMouseWheel, false); // Chrome/Safari
                window.addEventListener('mousemove',    this.annotationHandler.handleMouseMove, false); // Chrome/Safari
                window.addEventListener('mousedown',    this.annotationHandler.handleMouseDown, false); // Chrome/Safari
                window.addEventListener('mouseup',      this.annotationHandler.handleMouseUp, false); // Chrome/Safari
    
            } else {

                window.addEventListener('DOMMouseScroll', this.annotationHandler.handleMouseWheel, false); // Others
                window.addEventListener('mousemove',    this.annotationHandler.handleMouseMove, false); // Chrome/Safari
                window.addEventListener('mousedown',    this.annotationHandler.handleMouseDown, false); // Chrome/Safari
                window.addEventListener('mouseup',      this.annotationHandler.handleMouseUp, false); // Chrome/Safari
            }
        }

        for (var i = 0; i < this.viewer.buttons.buttons.length; i++) {
            var button = this.viewer.buttons.buttons[i];

            if (button.tooltip.toLowerCase() == "go home") {
                var onHomeRelease = button.onRelease;
                var annot = this;
                button.onRelease = function(args){

                    $('svg')[0].setStyle('opacity', 0);
                    onHomeRelease(args);
                    setTimeout(annotationHandler.goHome, annotationHandler.animateWaitTime, annot);
                };
            }
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
                    svgHtml += '<ellipse id="originpt" cx="' + origin.x + '" cy="' + origin.y + '" rx="' + 4 + '" ry="' + 4  + '" style="display: none"/>';
                    svgHtml += '</g>';
                    svgHtml += '<g id="viewport" transform="translate(0,0)">';
                for (index = 0; index < a.length; index++) {
    //                if (((width * a[index].x + left) > 0) && ((width * a[index].x + left + width * a[index].w) < window.innerWidth) && ((height * a[index].y + top) > 0) && ((height * a[index].y + top + height * a[index].h) < window.innerHeight)) {
                        switch (a[index].type) {
                            case "rect":
                                var x = parseFloat(a[index].x);
                                var y = parseFloat(a[index].y);
                                var w = parseFloat(a[index].w);
                                var h = parseFloat(a[index].h);
                                // handle displaying the drawing when they are already zoomed in

				w = this.imagingHelper.physicalToLogicalDistance(w);
				h = this.imagingHelper.physicalToLogicalDistance(h);
				w = w * viewer.viewport.getZoom();
				h = h * viewer.viewport.getZoom();
				h = h/this.imagingHelper.imgAspectRatio;

				var offset = OpenSeadragon.getElementOffset(viewer.canvas);

				x = x + offset.x;
				y = y + offset.y;
                                svgHtml += '<rect id="' + index + '" x="' + x + '" y="' + y + '" width="' + w*width + '" height="' + width*h + '" stroke="' + a[index].color + '" stroke-width="2" fill="none"/>';
                                break;
                            case "ellipse":
				var offset = OpenSeadragon.getElementOffset(viewer.canvas);

				var x = parseFloat(a[index].x) + offset.x;
				var y = parseFloat(a[index].y) + offset.y;
				var w = parseFloat(a[index].w);
				var h = parseFloat(a[index].h);
				h = h/this.imagingHelper.imgAspectRatio;
                                var cx = x + w / 2;
                                var cy = y + h / 2;
				w = this.imagingHelper.physicalToLogicalDistance(w);
				h = this.imagingHelper.physicalToLogicalDistance(h);
                                var rx = w / 2;
                                var ry = h / 2;
                                // handle displaying the drawing when they are already zoomed in
                                rx = rx * viewer.viewport.getZoom();
                                ry = ry * viewer.viewport.getZoom();

                                svgHtml += '<ellipse id="' + index + '" cx="' + cx + '" cy="' + cy + '" rx="' + width* rx + '" ry="' + width * ry + '" style="fill:none;stroke:' + a[index].color + ';stroke-width:2"/>';
                                break;
                            case "pencil":
                                var points = a[index].points;
                                var poly = String.split(points, ';');
                                for (var k = 0; k < poly.length; k++) {
                                    var p = String.split(poly[k], ' ');
                                    svgHtml += '<polyline id="'+index+'" points="';
                                    for (var j = 0; j < p.length; j++) {
                                        point = String.split(p[j], ',');
					var penPixelX = this.imagingHelper.logicalToPhysicalX(point[0]);
					var penPixelY = this.imagingHelper.logicalToPhysicalY(point[1]);
                                        svgHtml += penPixelX + ',' + penPixelY + ' ';
                                    }
                                    svgHtml += '" style="fill:none;stroke:' + a[index].color + ';stroke-width:2"/>';
                                }
                                break;
                            case "polyline":
                                var points = a[index].points;
                                var poly = String.split(points, ';');
				var offset = OpenSeadragon.getElementOffset(viewer.canvas);
                                for (var k = 0; k < poly.length; k++) {
                                    var p = String.split(poly[k], ' ');
                                    svgHtml += '<polygon id="'+index+ '" points="';
                                    for (var j = 0; j < p.length; j++) {
                                        point = String.split(p[j], ',');
					var polyPixelX = this.imagingHelper.logicalToPhysicalX(point[0]);
					var polyPixelY = this.imagingHelper.logicalToPhysicalY(point[1]);
                                        svgHtml += polyPixelX + ',' + polyPixelY + ' ';
                                    }
                                    svgHtml += '" style="fill:none;stroke:' + a[index].color + ';stroke-width:2"/>';
                                }
                                break;
                            case "line":
				var points = String.split(a[index].points, ',');
				x2 = this.imagingHelper.logicalToPhysicalX(points[0]);
				y2 = this.imagingHelper.logicalToPhysicalY(points[1]);
				svgHtml += '<polygon id="'+index+'" points="'+ a[index].x +','+ a[index].y + ' ' + x2 + ',' + y2 + ' ' + a[index].x + ',' + a[index].y + ' " style="fill:none;stroke:' + a[index].color + ';stroke-width:2"/>';
				break;
                        }

                    }
                }
                svgHtml += '</g></svg>';


                //if (this.annotations.length > 0) {
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
                    console.log("added svg");
                    var annots = $('svg')[0].getChildren()[2];
                    for (var k = 0; k < annots.getChildren().length; k++) {
                        var bbox = annots.getChildren()[k].getBBox();
                        var d = new Element("div", {
                            id: k,
                            "class": 'annotcontainer',
                            styles: {
                                position: 'absolute',
                                left: bbox.x,
                                top: bbox.y,
                                width: bbox.width,
                                height: bbox.height
                                //border: '1px solid'
                            }
                        }).inject(container);

                        var c = this;
                        d.addEvents({
                            'mouseenter': function (e) {
                                e.stop;
                                c.displayTip(this.id);
                            },
                            'mouseleave': function (e) {
                                e.stop;
                                c.destroyTip();
                            },
                            'dblclick': function (e) {
                                e.stop();
                                c.editTip(this.id);
                            }
                        });
                        this.annotationHandler.originalDivCoords.push(bbox);
                    }
                    for (var j = 0; j < pointsArr.length; j++) {
                        $('#groupcenter')[0].appendChild(pointsArr[j]);
                    }
                    for (j = 0; j < lines.length; j++) {
                        $('#groupcenter')[0].appendChild(lines[j]);
                    }
                //} else {
                //    this.showMessage("Please Press white space to toggle the Annotations");
                //}
            }
        else {
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
                left: Math.round(width * annot.x + parseInt(container.offsetLeft)),
                top: Math.round(height * annot.y + parseInt(container.offsetHeight) + parseInt(container.offsetTop))
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
	var x = this.imagingHelper.physicalToLogicalX(annot.x);
	var y = this.imagingHelper.physicalToLogicalY(annot.y);
	var w = this.imagingHelper.physicalToLogicalDistance(annot.w);
	var h = this.imagingHelper.physicalToLogicalDistance(annot.h);
        var d = new Element("div", {
            "class": 'edittip',
            styles: {
                position: 'absolute',
                left: Math.round(width * x + left),
                top: Math.round(height * y + height * h + top)
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

	var cancelButton = new Element("button",{
	    html: 'Cancel',
	    events: {
	    'click' : function() {
		d.destroy();
		}.bind(this)
	    }
	}).inject(d);
        /*var editButton = new Element("button", {
            html: 'Edit',
            events: {
                'click': function () {
                    var tip = prompt("Make some changes", annot.text);
                    if (tip != null) {
                        var newAnnot = this.annotations[id];
                        newAnnot.text = tip;
                        this.deleteAnnot(id);
                            
                        //this.saveAnnot();
                        //this.updateAnnot(this.annotations[id]);
                        this.addnewAnnot(newAnnot);
                        //this.displayAnnot();
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
        }).inject(d);*/
    },
    deleteAnnot: function (id) //Delete Annotations
    {
        //this.annotations.splice(id, 1);
        //this.saveAnnot();
        //this.displayAnnot();
        var testAnnotId = this.annotations[id].annotId;	
	    this.annotations.splice(id,1);
	    //########### Do the delete using bindaas instead of on local list.
	    if(this.iid)
        {
            var jsonRequest = new Request.JSON({
                    url: 'api/Data/deleteAnnot.php',
                    async:false,
                    onSuccess: function(e){
                        this.showMessage("deleted from server");
                }.bind(this),
                    onFailure:function(e){
                        this.showMessage("Error deleting the Annotations, please check your deleteAnnot php");
                }
                .bind(this)}
            ).get({'annotId':testAnnotId});
        }
        this.displayAnnot();
    },
    updateAnnot: function (annot) //Save Annotations
    {
            var jsonRequest = new Request.JSON({
                url:  'api/Data/updateAnnot.php',
                onSuccess: function (e) {
                    this.showMessage("saved to the server");
                }.bind(this),
                onFailure: function (e) {
                    this.showMessage("Error Saving the Annotations,please check you saveAnnot funciton");
                }.bind(this)
            }).post({
                'iid': this.iid,
                'annot': annot
            });
    	this.displayAnnot();
    },
    saveAnnot: function () //Save Annotations
    {
            var jsonRequest = new Request.JSON({
                //url: IP + '/api/annotation_relative.php',
                url:  'api/Data/getAnnotSpatial.php',
                async:false,
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
    },
    saveJob: function (newAnnot) //Save Annotations
    {
            var jsonRequest = new Request.JSON({
                //url: IP + '/api/annotation_relative.php',
                url:  'api/Data/submitJobParameters.php',
                async:false,
                onSuccess: function (e) {
                    this.showMessage("saved to the job manager");
                }.bind(this),
                onFailure: function (e) {
                    this.showMessage("Error Saving the job,please check you saveAnnot funciton");
                }.bind(this)
            }).post({
                'iid': this.iid,
                'job': newAnnot
            });
    },

    convertToNative: function (annot)
    {
	if(annot.type == "rect" || annot.type == "ellipse")
	{
	    var x = annot.x;
	    var y = annot.y;
	    var w = annot.w;
	    var h = annot.h;

	    var nativeW = this.imagingHelper.logicalToPhysicalDistance(w);
	    var nativeH = this.imagingHelper.logicalToPhysicalDistance(h);
	    var nativeX = this.imagingHelper.logicalToPhysicalX(x);
	    var nativeY = this.imagingHelper.logicalToPhysicalY(y);
	    var nativeNumbers = JSON.encode({nativeW:nativeW,nativeH:nativeH,nativeX:nativeX,nativeY:nativeY});
	    return nativeNumbers;
	}

	else if(annot.type == "polyline" || annot.type == "pencil" || annot.type == "line")
	{
	    var x = annot.x;
	    var y = annot.y;
	    var w = annot.w;
	    var h = annot.h;
	    var point = annot.points;

	    var nativeW = this.imagingHelper.logicalToPhysicalDistance(w);
	    var nativeH = this.imagingHelper.logicalToPhysicalDistance(h);
	    var nativeX = this.imagingHelper.logicalToPhysicalX(x);
	    var nativeY = this.imagingHelper.logicalToPhysicalY(y);
	        
	    var poly_first_split = String.split(point,' ');
	    var points  = "";
	    for(var k = 0; k < poly_first_split.length - 1; k++)
	    {
		var poly_second_split = String.split(poly_first_split[k], ',');

		var polyPoint = new OpenSeadragon.Point(parseFloat(poly_second_split[0]),parseFloat(poly_second_split[1]));

		points += this.imagingHelper.logicalToPhysicalX(polyPoint.x) + ',' + this.imagingHelper.logicalToPhysicalY(polyPoint.y) + ' ';	
	    }

	    var last_poly_split = String.split(poly_first_split[k],',');

	    var lastPolyPoint = new OpenSeadragon.Point(parseFloat(last_poly_split[0]),parseFloat(last_poly_split[1]));

	    points += this.imagingHelper.logicalToPhysicalX(lastPolyPoint.x) + ',' + this.imagingHelper.logicalToPhysicalY(lastPolyPoint.y);
	  
	    var nativeNumbers = JSON.encode({nativeW:nativeW,nativeH:nativeH,nativeX:nativeX,nativeY:nativeY,nativePoints:points});
	    return nativeNumbers;
	}

	else
	    return JSON.encode(annot);
    },

    convertFromNative: function(annot,end)
    {
	if(annot.type == "rect" || annot.type == "roi" || annot.type == "ellipse")
	{
	    var x = annot.x;
	    var y = annot.y;
	    var w = annot.w;
	    var h = annot.h;
	    var x_end = end.x;
	    var y_end = end.y;

	    var nativeX_end = this.imagingHelper.physicalToLogicalX(x_end);
	    var nativeY_end = this.imagingHelper.physicalToLogicalY(y_end);
	    var nativeX = this.imagingHelper.physicalToLogicalX(x);
	    var nativeY = this.imagingHelper.physicalToLogicalY(y);
	    var nativeW = nativeX_end - nativeX;
	    var nativeH = nativeY_end - nativeY;

	    var globalNumber = JSON.encode({nativeW: nativeW, nativeH: nativeH, nativeX: nativeX, nativeY: nativeY});

	    return globalNumber;
	}

	else if(annot.type == "polyline" || annot.type == "pencil" || annot.type == "line")
	{
	    var x = annot.x;
	    var y = annot.y;
	    var w = annot.w;
	    var h = annot.h;
	    var point = annot.points;
	    var poly_first_split = String.split(point,' ');
	    var points  = "";
	    for(var k = 0; k < poly_first_split.length - 1; k++)
	    {
		var poly_second_split = String.split(poly_first_split[k], ',');

		var polyPoint = new OpenSeadragon.Point(parseFloat(poly_second_split[0]),parseFloat(poly_second_split[1]));

		points += this.imagingHelper.physicalToLogicalX(polyPoint.x) + ',' + this.imagingHelper.physicalToLogicalY(polyPoint.y) + ' ';	
	    }

	    var last_poly_split = String.split(poly_first_split[k],',');

	    var lastPolyPoint = new OpenSeadragon.Point(parseFloat(last_poly_split[0]),parseFloat(last_poly_split[1]));

	    points += this.imagingHelper.physicalToLogicalX(lastPolyPoint.x) + ',' + this.imagingHelper.physicalToLogicalY(lastPolyPoint.y);
	    var x_end = end.x;
	    var y_end = end.y;

	    var nativeX_end = this.imagingHelper.physicalToLogicalX(x_end);
	    var nativeY_end = this.imagingHelper.physicalToLogicalY(y_end);
	    var nativeX = this.imagingHelper.physicalToLogicalX(x);
	    var nativeY = this.imagingHelper.physicalToLogicalY(y);
	    var nativeW = nativeX_end - nativeX;
	    var nativeH = nativeY_end - nativeY;
	    var nativePoints = points;

	    var globalNumber = JSON.encode({nativeW: nativeW, nativeH:nativeH, nativeX:nativeX, nativeY:nativeY,points: nativePoints});

	    return globalNumber;
	}

	else
	    return JSON.encode(annot);
    },

    convertAllToNative: function()
    {
	for(index = 0; index < this.annotations.length; index++)
	{
	    //unparsed = this.convertToNative(this.annotations[index]);
	    newannot = JSON.parse(this.convertToNative(this.annotations[index]));
	    this.annotations[index].x = newannot.nativeX;
	    this.annotations[index].y = newannot.nativeY;
	    this.annotations[index].w = newannot.nativeW;
	    this.annotations[index].h = newannot.nativeH;
	}
    },

    drawEllipse: function(ctx)
    {
	var started = false;
	var min_x,min_y,max_x,max_y,w,h;
	var startPosition;
	this.drawCanvas.addEvent('mousedown',function(e)
	{
	    started = true;
	    startPosition = OpenSeadragon.getMousePosition(e.event);
	    x = startPosition.x;
	    y = startPosition.y;
	});

	this.drawCanvas.addEvent('mousemove',function(e)
	{
	    if(started)
	    {
		ctx.clearRect(0,0,this.drawCanvas.width,this.drawCanvas.height);
		var currentMousePosition = OpenSeadragon.getMousePosition(e.event);

		min_x = Math.min(currentMousePosition.x,startPosition.x);
		min_y = Math.min(currentMousePosition.y,startPosition.y);
		max_x = Math.max(currentMousePosition.x,startPosition.x);
		max_y = Math.max(currentMousePosition.y,startPosition.y);
		w = Math.abs(max_x - min_x);
		h = Math.abs(max_y - min_y);

		var kappa = .5522848;
		var ox = (w/2) *kappa;
		var oy = (h/2) *kappa;
		var xe = min_x + w;
		var ye = min_y + h;
		var xm = min_x + w/2;
		var ym = min_y + h/2;

		ctx.beginPath();
		ctx.moveTo(min_x,ym);
		ctx.bezierCurveTo(min_x,ym - oy,xm - ox, min_y, xm, min_y);
		ctx.bezierCurveTo(xm + ox, min_y, xe, ym - oy, xe, ym);
		ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
		ctx.bezierCurveTo(xm - ox, ye, min_x, ym + oy, min_x, ym);
		ctx.closePath();
		ctx.strokeStyle = this.color;
		ctx.stroke();

	    }
	}.bind(this));

	this.drawCanvas.addEvent('mouseup', function (e)
	{
	    started = false;
	    var finalMousePosition = new OpenSeadragon.getMousePosition(e.event);
	    min_x = Math.min(finalMousePosition.x,startPosition.x);
	    min_y = Math.min(finalMousePosition.y,startPosition.y);
	    max_x = Math.max(finalMousePosition.x,startPosition.x);
	    max_y = Math.max(finalMousePosition.y,startPosition.y);

	    var startRelativeMousePosition = new OpenSeadragon.Point(min_x,min_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
	    var endRelativeMousePosition = new OpenSeadragon.Point(max_x,max_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
	    var tip = prompt("Please Enter Some Description","");

	    if(tip != null)
	    {
		var newAnnot = {
		    x: startRelativeMousePosition.x,
		    y: startRelativeMousePosition.y,
		    w: w,
		    h: h,
		    type: "ellipse",
		    text: tip,
		    color: this.color,
		    loc: new Array()
		};

		var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition));

		newAnnot.x = globalNumbers.nativeX;
		newAnnot.y = globalNumbers.nativeY;
		newAnnot.w = globalNumbers.nativeW;
		newAnnot.h = globalNumbers.nativeH;
		var loc = new Array();
		loc[0] = parseFloat(newAnnot.x);
		loc[1] = parseFloat(newAnnot.y);
		newAnnot.loc = loc;

		this.addnewAnnot(newAnnot);
		this.getAnnot();
	    }

	    else
	    {
		ctx.clearRect(0,0,this.drawCanvas.width,this.drawCanvas.height);
	    }
	}.bind(this));
    },
    drawRectangle: function(ctx)
    {
	var started = false;
	var min_x,min_y,max_x,max_y,w,h;
	var startPosition;
	this.drawCanvas.addEvent('mousedown',function(e)
	{
	    started = true;
	    startPosition = OpenSeadragon.getMousePosition(e.event);
	    x = startPosition.x;
	    y = startPosition.y;
	});

	this.drawCanvas.addEvent('mousemove',function(e)
	{
	    if(started)
	    {
		ctx.clearRect(0,0,this.drawCanvas.width, this.drawCanvas.height);
		var currentMousePosition = OpenSeadragon.getMousePosition(e.event);

		min_x = Math.min(currentMousePosition.x,startPosition.x);
		min_y = Math.min(currentMousePosition.y,startPosition.y);
		max_x = Math.max(currentMousePosition.x,startPosition.x);
		max_y = Math.max(currentMousePosition.y,startPosition.y);
		w = Math.abs(max_x - min_x);
		h = Math.abs(max_y - min_y);
		ctx.strokeStyle = this.color;
		ctx.strokeRect(min_x,min_y,w,h);
	    }
	}.bind(this));

	this.drawCanvas.addEvent('mouseup',function(e)
	{
	    started = false;
	    var finalMousePosition = new OpenSeadragon.getMousePosition(e.event);

		min_x = Math.min(finalMousePosition.x,startPosition.x);
		min_y = Math.min(finalMousePosition.y,startPosition.y);
		max_x = Math.max(finalMousePosition.x,startPosition.x);
		max_y = Math.max(finalMousePosition.y,startPosition.y);

	    
	    var startRelativeMousePosition = new OpenSeadragon.Point(min_x,min_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
	    var endRelativeMousePosition = new OpenSeadragon.Point(max_x,max_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
	    var tip = prompt("Please Enter Some Description","");
	    if(tip != null)
	    {
		var newAnnot = {
		    x: startRelativeMousePosition.x,
		    y: startRelativeMousePosition.y,
		    w: w,
		    h: h,
		    type: "rect",
		    text: tip,
		    color: this.color,
		    loc: new Array()
		};

		var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition));

		newAnnot.x = globalNumbers.nativeX;
		newAnnot.y = globalNumbers.nativeY;
		newAnnot.w = globalNumbers.nativeW;
		newAnnot.h = globalNumbers.nativeH;
		var loc = new Array();
		loc[0] = parseFloat(newAnnot.x);
		loc[1] = parseFloat(newAnnot.y);
		newAnnot.loc = loc;
		this.addnewAnnot(newAnnot);
		this.getAnnot();
	    }

	    else
	    {
		ctx.clearRect(0,0,this.drawCanvas.width,this.drawCanvas.height);
	    }
	}.bind(this));
    },
    markAnalysisRegion: function(ctx)
    {
	var started = false;
	var min_x,min_y,max_x,max_y,w,h;
	var startPosition;
	this.drawCanvas.addEvent('mousedown',function(e)
	{
	    started = true;
	    startPosition = OpenSeadragon.getMousePosition(e.event);
	    x = startPosition.x;
	    y = startPosition.y;
	});

	this.drawCanvas.addEvent('mousemove',function(e)
	{
	    if(started)
	    {
		ctx.clearRect(0,0,this.drawCanvas.width, this.drawCanvas.height);
		var currentMousePosition = OpenSeadragon.getMousePosition(e.event);

		min_x = Math.min(currentMousePosition.x,startPosition.x);
		min_y = Math.min(currentMousePosition.y,startPosition.y);
		max_x = Math.max(currentMousePosition.x,startPosition.x);
		max_y = Math.max(currentMousePosition.y,startPosition.y);
		w = Math.abs(max_x - min_x);
		h = Math.abs(max_y - min_y);
		ctx.fillStyle  = "rgba(0,0,0,0.4)";
		ctx.fillRect(min_x,min_y,w,h);
	    }
	}.bind(this));

	this.drawCanvas.addEvent('mouseup',function(e)
	{
	    started = false;
	    var finalMousePosition = new OpenSeadragon.getMousePosition(e.event);

		min_x = Math.min(finalMousePosition.x,startPosition.x);
		min_y = Math.min(finalMousePosition.y,startPosition.y);
		max_x = Math.max(finalMousePosition.x,startPosition.x);
		max_y = Math.max(finalMousePosition.y,startPosition.y);

	    
	    var startRelativeMousePosition = new OpenSeadragon.Point(min_x,min_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
	    var endRelativeMousePosition = new OpenSeadragon.Point(max_x,max_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
	    var tip = prompt("Please Enter Location of Analysis Script","");
	    if(tip != null)
	    {
		var newAnnot = {
		    x: startRelativeMousePosition.x,
		    y: startRelativeMousePosition.y,
		    w: w,
		    h: h,
		    type: "roi",
		    scriptLocation: tip,
		    color: this.color,
		    zoomFactor: this.imagingHelper.getZoomFactor(),
		    maxHeight: this.imagingHelper.imgHeight,
		    maxWidth: this.imagingHelper.imgWidth,
		    jobstatus: "InQueue",
		    loc: new Array()
		};

		var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition));

		newAnnot.x = globalNumbers.nativeX;
		newAnnot.y = globalNumbers.nativeY;
		newAnnot.w = globalNumbers.nativeW;
		newAnnot.h = globalNumbers.nativeH;
		var loc = new Array();
		loc[0] = parseFloat(newAnnot.x);
		loc[1] = parseFloat(newAnnot.y);
		newAnnot.loc = loc;
		//this.addnewAnnot(newAnnot);
		this.addnewJob(newAnnot);
		this.getAnnot();
	    }

	    else
	    {
		ctx.clearRect(0,0,this.drawCanvas.width,this.drawCanvas.height);
	    }
	}.bind(this));
    },
    drawPencil: function(ctx)
    {
	var started = false;
	var pencil = [];
	var newpoly = [];
	this.drawCanvas.addEvent('mousedown',function(e)
	{
	    started = true;
	    var startPoint = OpenSeadragon.getMousePosition(e.event);
	    var relativeStartPoint = startPoint.minus(OpenSeadragon.getElementOffset(viewer.canvas));
	    newpoly.push({
		"x":relativeStartPoint.x,
		"y":relativeStartPoint.y
		});
	    ctx.beginPath();
	    ctx.moveTo(relativeStartPoint.x, relativeStartPoint.y)
	    ctx.strokeStyle = this.color;
	    ctx.stroke();
	}.bind(this));

	this.drawCanvas.addEvent('mousemove',function(e)
	{
	    var newPoint = OpenSeadragon.getMousePosition(e.event);
	    var newRelativePoint = newPoint.minus(OpenSeadragon.getElementOffset(viewer.canvas));
	    if(started)
	    {
		newpoly.push({
			"x":newRelativePoint.x,
			"y":newRelativePoint.y
		    });

		ctx.lineTo(newRelativePoint.x,newRelativePoint.y);
		ctx.stroke();
	    }
	});

	this.drawCanvas.addEvent('mouseup',function(e)
	{
	    started = false;
	    pencil.push(newpoly);
	    newpoly = [];
	    numpoint = 0;
	    var tip = prompt("Please Enter Some Descriptions","");
	    var x,y,w,h;
	    x = pencil[0][0].x;
	    y = pencil[0][0].y;

	    var maxdistance = 0;
	    var points = "";
	    var endRelativeMousePosition;
	    for(var i = 0; i < pencil.length; i++)
	    {
		newpoly = pencil[i];
		for(j = 0; j < newpoly.length - 1; j++)
		{
		    points += newpoly[j].x + ',' + newpoly[j].y + ' ';
		    if(((newpoly[j].x - x) * (newpoly[j].x - x) + (newpoly[j].y -y) * (newpoly[j].y-y)) > maxdistance)
		    {
			maxdistance = ((newpoly[j].x - x) * (newpoly[j].x - x) + (newpoly[j].y -y) * (newpoly[j].y-y));
			var endMousePosition = new OpenSeadragon.Point(newpoly[j].x, newpoly[j].y);
			endRelativeMousePosition = endMousePosition.minus(OpenSeadragon.getElementOffset(viewer.canvas));
		    }
		}

		points = points.slice(0,-1);
		points += ';';
	    }

	    points = points.slice(0,-1);


	    if(tip != null)
	    {
		var newAnnot = {
		    x:x,
		    y:y,
		    w:w,
		    h:h,
		    type: 'pencil',
		    points: points,
		    text: tip,
		    color: this.color,
		    loc: new Array()
		};

		var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition));
		newAnnot.x = globalNumbers.nativeX;
		newAnnot.y = globalNumbers.nativeY;
		newAnnot.w = globalNumbers.nativeW;
		newAnnot.h = globalNumbers.nativeH;
		newAnnot.points = globalNumbers.points;
		var loc = new Array();
		loc[0] = parseFloat(newAnnot.x);
		loc[1] = parseFloat(newAnnot.y);
		newAnnot.loc = loc;
		this.addnewAnnot(newAnnot);
		this.getAnnot();
	    }

	    else
	    {
		ctx.clearRect(0,0,this.drawCanvas.width,this.drawCanvas.height);
	    }
	}.bind(this));
    },

    drawMeasure: function(ctx)
    {
	var started = false;
	var x0,y0,x1,y1;
	var length;
	
	this.drawCanvas.addEvent('mousedown',function (e) 
	{
	    if(!started)
	    {
		var startPosition = OpenSeadragon.getMousePosition(e.event);
		var startRelativeMousePosition = startPosition.minus(OpenSeadragon.getElementOffset(viewer.canvas));
		x0 = startRelativeMousePosition.x;
		y0 = startRelativeMousePosition.y;
		started = true;
	    }

	    else
	    {
		var endPosition = OpenSeadragon.getMousePosition(e.event);
		var endRelativePosition = endPosition.minus(OpenSeadragon.getElementOffset(viewer.canvas));
		x1 = endRelativePosition.x;
		y1 = endRelativePosition.y;
		ctx.beginPath();
		ctx.moveTo(x0,y0);
		ctx.lineTo(x1,y1);
		ctx.strokeStyle = this.color;
		ctx.stroke();
		ctx.closePath();

		var minX, minY = 0;
		var maxX, maxY = 0
		if(x1 > x0)
		{
		    minX = x0;
		    maxX = x1;
		}

		else
		{
		    minX = x1;
		    maxX = x0;
		}
		if(y1 > y0)
		{
		    minY = y0;
		    maxY = y1;
		}

		else
		{
		    minY = y1;
		    maxY = y0;
		}

		var x_dist = ((this.imagingHelper.physicalToDataX(x0)) - (this.imagingHelper.physicalToDataX(x1)));
		var y_dist = ((this.imagingHelper.physicalToDataY(y0)) - (this.imagingHelper.physicalToDataY(y1)));

		var x_micron = this.mppx * x_dist;
		var y_micron = this.mppy * y_dist;

		var length = Math.sqrt(x_micron.pow(2) + y_micron.pow(2));
		var tip = prompt("Save This?",length + "um");
		if (tip != null)
		{
		    points = (x1 + "," + y1);
		    var w = 0;
		    var h = 0;
		    var newAnnot = 
		    {
			x:x0,
			y:y0,
			w:w,
			h:h,
			type:"line",
			points: points,
			text: tip,
			color: this.color,
			loc: new Array()
		    };
		    var finalPosition = new OpenSeadragon.Point(maxX,maxY);
		    var finalRelativePosition = finalPosition.minus(OpenSeadragon.getElementOffset());

		    var globalNumbers = JSON.parse(this.convertFromNative(newAnnot,finalRelativePosition));
		
		    var finalRelativePosition = finalPosition.minus(OpenSeadragon.getElementOffset());

		    var globalNumbers = JSON.parse(this.convertFromNative(newAnnot,finalRelativePosition));
		    newAnnot.x = globalNumbers.nativeX;
		    newAnnot.y = globalNumbers.nativeY;
		    newAnnot.w = globalNumbers.nativeW;
		    newAnnot.h = globalNumbers.nativeH;
		    newAnnot.points = globalNumbers.points;
		    var loc = new Array();
		    loc[0] = parseFloat(newAnnot.x);
		    loc[1] = parseFloat(newAnnot.y);
		    newAnnot.loc = loc;
		    this.addnewAnnot(newAnnot);
		    this.getAnnot();
		}

		else
		{
		    ctx.clearRect(0,0,this.drawCanvas.width,this.drawCanvas.height);
		}

		started = false;
	    }
	}.bind(this));

	this.drawCanvas.addEvent('mousemove', function (e)
	{
	    if(started)
	    {
		ctx.clearRect(0,0, this.drawCanvas.width, this.drawCanvas.height);
		var currentPosition = OpenSeadragon.getMousePosition(e.event);
		var currentRelativePosition = OpenSeadragon.getMousePosition(e.event);

		x1 = currentRelativePosition.x;
		y1 = currentRelativePosition.y;

		ctx.beginPath();
		ctx.moveTo(x0,y0);
		ctx.lineTo(x1,y1);
		ctx.strokeStyle = this.color;
		ctx.stroke();
		ctx.closePath();
	    }
	}.bind(this));
    },

    drawPolyline: function(ctx)
    {
	var started = true;
	var newpoly = [];
	var numpoint = 0;
	this.drawCanvas.addEvent('mousedown',function(e)
	{
	    if(started)
	    {
		    var  newPoint = OpenSeadragon.getMousePosition(e.event);
		    var newRelativePoint = newPoint.minus(OpenSeadragon.getElementOffset(viewer.canvas));
		    ctx.fillStyle = this.color;
		    ctx.beginPath();
		    ctx.arc(e.event.layerX, e.event.layerY, 2, 0, Math.PI* 2, true);
		    ctx.closePath();
		    ctx.fill;
		    newpoly.push({"x" : newRelativePoint.x,
			"y": newRelativePoint.y});

		    if(numpoint > 0)
		    {
			ctx.beginPath();
			ctx.moveTo(newpoly[numpoint].x, newpoly[numpoint].y);
			ctx.lineTo(newpoly[numpoint - 1].x, newpoly[numpoint-1].y);
			ctx.strokeStyle = this.color;
			ctx.stroke();
		    }
    
		numpoint++;
	    }
	}.bind(this));

	this.drawCanvas.addEvent('dblclick',function(e)
	{
	    started = false;
	    ctx.beginPath();
	    ctx.moveTo(newpoly[numpoint-1].x, newpoly[numpoint-1].y);
	    ctx.lineTo(newpoly[0].x,newpoly[0].y);
	    ctx.stroke();
	    var x,y,w,h;

	    x = newpoly[0].x;
	    y = newpoly[0].y;

	    var maxdistance = 0;

	    var tip = prompt("Please Enter Some Description","");

	    var points = "";

	    var endMousePosition;
	    for(var i = 0; i < numpoint -1; i++)
	    {
		points += newpoly[i].x + ',' + newpoly[i].y + ' ';
		if(((newpoly[i].x -x) *( newpoly[i].x - x) + (newpoly[i].y - y) * (newpoly[i].y - y)) > maxdistance)
		{
		    maxdistance = ((newpoly[i].x - x) * (newpoly[i].x - x) + (newpoly[i].y - y) * (newpoly[i].y - y));

		    endMousePosition = new OpenSeadragon.Point(newpoly[i].x,newpoly[i].y);
		    w = Math.abs(newpoly[i].x - x);
		    h = Math.abs(newpoly[i].y - y);
		}
	    }

	    points += newpoly[i].x + ',' + newpoly[i].y;

	    var endRelativeMousePosition = endMousePosition.minus(OpenSeadragon.getElementOffset(viewer.canvas));

	    if(tip != null)
	    {
		var newAnnot = {
		    x: x,
		    y: y,
		    w: w,
		    h: h,
		    type: 'polyline',
		    points: points,
		    text: tip,
		    color: this.color,
		    loc: new Array()
		};
		
		var globalNumbers = JSON.parse(this.convertFromNative(newAnnot,endRelativeMousePosition));

		newAnnot.x = globalNumbers.nativeX;
		newAnnot.y = globalNumbers.nativeY;
		newAnnot.w = globalNumbers.nativeW;
		newAnnot.h = globalNumbers.nativeH;
		newAnnot.points = globalNumbers.points;
		var loc = new Array();
		loc[0] = newAnnot.x;
		loc[1] = newAnnot.y;
		newAnnot.loc = loc;
		this.addnewAnnot(newAnnot);
		this.getAnnot();
	    }

	    else
	    {
		ctx.clearRect(0,0, this.drawCanvas.width, this.drawCanvas.height);
	    }
	}.bind(this));
    },
    saveState: function () {
        if (this.iid) {
            var jsonRequest = new Request.JSON({
                //url: IP + 'api/state.php',
                url:  'api/Data/state.php',
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
});
