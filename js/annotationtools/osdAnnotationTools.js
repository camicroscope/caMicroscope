/*
 Copyright (C) 2012 Shaohuan Li <shaohuan.li@gmail.com>, Ashish Sharma <ashish.sharma@emory.edu>
 This file is part of Biomedical Image Viewer developed under the Google of Summer of Code 2012 program.

 Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

console.log("osdAnnotationTools.js");

/**
 * User-selected ROI.
 * @type {string}
 */
var fill_style = "rgba(255, 255, 255, 0.0)";

/**
 * Set up annotation options
 *
 * @param options
 */
var annotools = function (options) {
    // console.log("Setting up annotools");

    this.AnnotationStore = new AnnotationStore(options.iid);

    this.annotationActive = isAnnotationActive();

    this.ratio = options.ratio || 0.005; // One pixel equals to the length in real situation. Will be used in the measurement tool
    this.maxWidth = options.maxWidth || 4000; // MaxWidth of the Image
    this.maxHeight = options.maxHeight || 800; // MaxHeight of the Image
    this.initialized = false;
    this.color = options.color || 'lime'; // Default Annotation Color

    this.iidDecoded = decodeURI(options.iid);
    this.canvas = options.canvas; // The canvas Element that The Use will be drawing annotations on.
    this.iid = options.iid || null; // The Image ID
    this.annotVisible = true; // The Annotations are Set to be visible at the First Loading
    this.mode = 'default'; // The Mode is Set to Default

    this.viewer = options.viewer;
    this.imagingHelper = this.viewer.imagingHelper;
    this.mpp = options.mpp;
    this.mppx = parseFloat(this.mpp['mpp-x']);
    this.mppy = parseFloat(this.mpp['mpp-y']);
    this.x1 = 0.0;
    this.x2 = 1.0;
    this.y1 = 0.0;
    this.y2 = 1.0;

    this.annotationHandler = options.annotationHandler || new AnnotoolsOpenSeadragonHandler();

    /*
     * OpenSeaDragon events
     */
    this.viewer.addHandler('animation-finish', function (event) {
        var self = this;
        self.getMultiAnnot();
    }.bind(this));

    this.viewer.addHandler('animation-start', function (event) {
        var markup_svg = document.getElementById('markups');
        if (markup_svg) {
            // console.log("destroying")
            markup_svg.destroy();
            // console.log("destroyed")
        }
    });

    window.addEvent('domready', function () {
        /*temp*/
        var self = this;
        self.setupHandlers();

        // this.getAnnot()
        // ToolBar.createButtons()
    }.bind(this)); // Get the annotation information and Create Buttons

    if (this.annotationActive) {
        // this.getAnnot()
    }

    this.imagingHelper.addHandler('image-view-changed', function (event) {
        // this.getAnnot()
    }.bind(this));

    this.messageBox = new Element('div', {
        'id': 'messageBox'
    }).inject(document.body); // Create A Message Box

    this.showMessage('Press white space to toggle annotations');

    /*
     this.drawLayer = jQuery('<div>', {
     html: "",
     styles: {
     position: 'absolute',
     'z-index': 1
     }
     })
     jQuery("body").append(this.drawLayer)
     */

    this.drawLayer = new Element('div', {
        html: '',
        styles: {
            position: 'absolute',
            'z-index': 1
        }
    }).inject(document.body); // drawLayer will hide by default

    // this.drawCanvas = jQuery('<canvas></canvas>')
    // this.drawCanvas.css({"position": "absolute", "z-index": 1})
    // this.drawLayer.append(this.drawCanvas)

    this.drawCanvas = new Element('canvas').inject(this.drawLayer);
    // this.drawLayer.hide()
    /*
     this.magnifyGlass = new Element('div', {
     'class': 'magnify'
     }).inject(document.body) //Magnify glass will hide by default
     this.magnifyGlass.hide()
     */
    this.magnifyGlass = jQuery('<div>', {
        'class': 'magnify'
    });

    jQuery('body').append(this.magnifyGlass);
    this.magnifyGlass.hide();
};

/**
 * Destroy markups
 *
 * @param viewer
 */
annotools.prototype.destroyMarkups = function (viewer) {
    // console.log("Destroy markups");

    var markup_svg = document.getElementById('markups');
    if (markup_svg) {
        // console.log("destroying")
        markup_svg.destroy();
        // console.log("destroyed")
    }
};

/**
 * Rendering by execution ids
 * Same as getMultiAnnot??
 * @param algorithms
 */
annotools.prototype.renderByExecutionId = function (algorithms) {
    // console.log("Rendering by execution ids");
    // console.log("algorithms", algorithms);

    var self = this;
    this.x1 = this.imagingHelper._viewportOrigin['x'];
    this.y1 = this.imagingHelper._viewportOrigin['y'];
    this.x2 = this.x1 + this.imagingHelper._viewportWidth;
    this.y2 = this.y1 + this.imagingHelper._viewportHeight;

    boundX1 = this.imagingHelper.physicalToLogicalX(200);
    boundY1 = this.imagingHelper.physicalToLogicalY(20);
    boundX2 = this.imagingHelper.physicalToLogicalX(20);
    boundY2 = this.imagingHelper.physicalToLogicalY(20);

    var max = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(9), this.imagingHelper.physicalToDataY(9));
    var origin = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(0), this.imagingHelper.physicalToDataY(0));
    var area = (max.x - origin.x) * (max.y - origin.y);
    self.destroyMarkups();

    if (algorithms.length) {
        this.toolBar.titleButton.hide();
        this.toolBar.ajaxBusy.show();
        // console.log(this.x1, this.y1, this.x2, this.y2);
        this.annotations = this.AnnotationStore.fetchAnnotations(this.x1, this.y1, this.x2, this.y2, area, algorithms, function (data) {
            // console.log(data);
            self.annotations = data;
            self.displayGeoAnnots();
            self.setupHandlers();

            self.toolBar.titleButton.show();
            self.toolBar.ajaxBusy.hide();
        });
    } else {
        self.setupHandlers();
        self.destroyMarkups();
        // destroy canvas
    }
};

/**
 * Get multiple annotations
 * Same as renderByExecutionId??
 * @param viewer
 */
annotools.prototype.getMultiAnnot = function (viewer) {

    // console.log("Get multiple annotations");
    // console.log("viewer", viewer);

    // console.log("ALGORITHM_LIST", ALGORITHM_LIST);
    // console.log("SELECTED_ALGORITHM_LIST", SELECTED_ALGORITHM_LIST);

    SELECTED_ALGORITHM_LIST = SELECTED_ALGORITHM_LIST.sort();
    var algorithms = SELECTED_ALGORITHM_LIST;

    /*
     if (jQuery('#tree').attr('algotree')) {
     var selalgos = jQuery('#tree').fancytree('getTree').getSelectedNodes()
     // console.log(selalgos)
     for (i = 0; i < selalgos.length; i++) {
     algorithms.push(selalgos[i].refKey)
     // opa["Val" + (i + 1).toString()] = selalgos[i].refKey
     }
     }
     */

    var self = this;
    this.x1 = this.imagingHelper._viewportOrigin['x'];
    this.y1 = this.imagingHelper._viewportOrigin['y'];
    this.x2 = this.x1 + this.imagingHelper._viewportWidth;
    this.y2 = this.y1 + this.imagingHelper._viewportHeight;

    boundX1 = this.imagingHelper.physicalToLogicalX(200);
    boundY1 = this.imagingHelper.physicalToLogicalY(20);
    boundX2 = this.imagingHelper.physicalToLogicalX(20);
    boundY2 = this.imagingHelper.physicalToLogicalY(20);

    var max = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(9), this.imagingHelper.physicalToDataY(9));
    var origin = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(0), this.imagingHelper.physicalToDataY(0));
    var area = (max.x - origin.x) * (max.y - origin.y);


    if (algorithms.length) {
        this.toolBar.titleButton.hide();
        this.toolBar.ajaxBusy.show();
        this.annotations = this.AnnotationStore.fetchAnnotations(this.x1, this.y1, this.x2, this.y2, area, algorithms, function (data) {
            // console.log(data);
            self.annotations = data;
            self.displayGeoAnnots();
            self.setupHandlers();

            self.toolBar.titleButton.show();
            self.toolBar.ajaxBusy.hide();
        });
    } else {
        self.setupHandlers();
        self.destroyMarkups();
        // destroy canvas
    }
};

/**
 * Get Annotation from the API
 *
 * @param viewer
 */
annotools.prototype.getAnnot = function (viewer) {
    // console.log("Get Annotation from the API");

    var self = this;
    this.x1 = this.imagingHelper._viewportOrigin['x'];
    this.y1 = this.imagingHelper._viewportOrigin['y'];
    this.x2 = this.x1 + this.imagingHelper._viewportWidth;
    this.y2 = this.y1 + this.imagingHelper._viewportHeight;

    boundX1 = this.imagingHelper.physicalToLogicalX(200);
    boundY1 = this.imagingHelper.physicalToLogicalY(20);
    boundX2 = this.imagingHelper.physicalToLogicalX(20);
    boundY2 = this.imagingHelper.physicalToLogicalY(20);
    var boundX = boundX1 - this.x1;
    var boundY = boundX;

    var max = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(9), this.imagingHelper.physicalToDataY(9));
    var origin = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(0), this.imagingHelper.physicalToDataY(0));
    var area = (max.x - origin.x) * (max.y - origin.y);

    // var t1 = performance.now()
    this.annotations = this.AnnotationStore.getAnnotations(this.x1, this.y1, this.x2, this.y2, area, boundX, boundY, boundX, boundY, function (data) {
        self.annotations = data;
        self.displayGeoAnnots();
        self.setupHandlers()
        // var t2 = performance.now()
        // console.log("Performance: "+(t2-t1))
    });
};

/**
 * Get Annotation Filter
 *
 * @param author
 * @param grade
 * @param multi
 */
annotools.prototype.getAnnotFilter = function (author, grade, multi) {
    // console.log("Get Annotation Filter");

    if (this.initialized) {
        this.x1 = this.imagingHelper._viewportOrigin['x'];
        this.y1 = this.imagingHelper._viewportOrigin['y'];
        this.x2 = this.x1 + this.imagingHelper._viewportWidth;
        this.y2 = this.y1 + this.imagingHelper._viewportHeight;
    }

    this.initialized = true;

    var jsonRequest = new Request.JSON({
        // url: IP + 'api/getAnnotSpatial.php',
        url: 'api/Data/getAnnotSpatialFilter.php',
        onSuccess: function (e) {
            if (e == null) {
                this.annotations = [];
            }
            else {
                this.annotations = e;
            }
            this.convertAllToNative();
            this.displayAnnot(); // Display The Annotations
            this.relativeToGlobal();
            this.setupHandlers();
            // console.log("successfully get annotations")
        }.bind(this),
        onFailure: function (e) {
            this.showMessage('cannot get the annotations,please check your getAnnot function');
            this.annotations = [];
        }.bind(this)
    }).get({
        'iid': this.iid,
        'x': this.x1,
        'y': this.y1,
        'x1': this.x2,
        'y1': this.y2,
        'author': author,
        'grade': grade,
        'multi': multi
    });
};

/**
 * Key Down Events Handler
 *
 * @param code
 */
annotools.prototype.keyPress = function (code) {
    // console.log("Key Down Events Handler");

    switch (code) {
        case 84:
            // press t to toggle tools
            this.tool.toggle();
            break;
        /* ASHISH Disable quit
         case 81:
         //press q to quit current mode and return to the default mode
         this.quitMode()
         this.quitbutton.hide()
         break
         */
        case 72:
            // press white space to toggle annotations
            this.toggleMarkups();
            break;
        case 82:
            // 1 for rectangle mode
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
        case 69:
            // 6 for magnify mode
            this.mode = 'magnify';
            this.magnify();
            break;
    }
};

/**
 * Draw Markups
 */
annotools.prototype.drawMarkups = function () {
    // console.log("Draw Markups");

    this.showMessage(); // Show Message
    this.drawCanvas.removeEvents('mouseup');
    this.drawCanvas.removeEvents('mousedown');
    this.drawCanvas.removeEvents('mousemove');
    this.drawLayer.show(); // Show The Drawing Layer
    /* ASHISH Disable quit
     this.quitbutton.show() //Show The Quit Button
     */
    this.magnifyGlass.hide(); // Hide The Magnifying Tool

    // this.container = document.id(this.canvas) //Get The Canvas Container
    this.container = document.getElementsByClassName(this.canvas)[0]; // Get The Canvas Container
    // this.container = document.getElementById('container') //Get The Canvas Container

    if (this.container) {
        // var left = parseInt(this.container.offsetLeft), //Get The Container Location
        var left = parseInt(this.container.getLeft()), // Get The Container Location
            top = parseInt(this.container.offsetTop),
            width = parseInt(this.container.offsetWidth),
            height = parseInt(this.container.offsetHeight),
            oleft = left,
            otop = top,
            owidth = width,
            oheight = height;
        // console.log("left: " + left + " top: " + top + " width: " + width + " height: " + height)

        if (left < 0) {
            left = 0;
            width = window.innerWidth;
        }

        // See Whether The Container is outside The Current ViewPort
        if (top < 0) {
            top = 0;
            height = window.innerHeight;
        }

        // Recreate The CreateAnnotation Layer Because of The ViewPort Change Issue.
        this.drawLayer.set({
            'styles': {
                left: left,
                top: top,
                width: width,
                height: height
            }
        });

        // Create Canvas on the CreateAnnotation Layer
        this.drawCanvas.set({
            width: width,
            height: height
        });

        // The canvas context
        var ctx = this.drawCanvas.getContext('2d');
        // Draw Markups on Canvas
        switch (this.mode) {
            case 'rect':
                this.drawRectangle(ctx);
                break;
            case 'ellipse':
                this.drawEllipse(ctx);
                break;
            case 'pencil':
                this.drawPencil(ctx);
                break;
            case 'polyline':
                this.drawPolyline(ctx);
                break;
            case 'measure':
                this.drawMeasure(ctx);
                break;
        }
    } else {
        this.showMessage('Container Not SET Correctly Or Not Fully Loaded Yet');
    }
};

/**
 * Create WorkOrder
 */
annotools.prototype.createWorkOrder = function () {
    // console.log("Create WorkOrder");

    jQuery('html,body').css('cursor', 'crosshair');
    var self = this;
    this.showMessage(); // Show Message
    this.drawCanvas.removeEvents('mouseup');
    this.drawCanvas.removeEvents('mousedown');
    this.drawCanvas.removeEvents('mousemove');
    this.drawLayer.show(); // Show The Drawing Layer

    /* ASHISH Disable quit
     this.quitbutton.show() //Show The Quit Button
     */

    this.magnifyGlass.hide(); // Hide The Magnifying Tool
    // this.container = document.id(this.canvas) //Get The Canvas Container
    this.container = document.getElementsByClassName(this.canvas)[0]; // Get The Canvas Container
    // this.container = document.getElementById('container') //Get The Canvas Container

    if (this.container) {
        // var left = parseInt(this.container.offsetLeft), //Get The Container Location
        var left = (this.container.getLeft()), // Get The Container Location
            top = (this.container.offsetTop),
            width = (this.container.offsetWidth),
            height = (this.container.offsetHeight),
            oleft = left,
            otop = top,
            owidth = width,
            oheight = height;
        // console.log("left: " + left + " top: " + top + " width: " + width + " height: " + height)

        if (left < 0) {
            left = 0;
            width = window.innerWidth;
        }

        // See Whether The Container is outside The Current ViewPort
        if (top < 0) {
            top = 0;
            height = window.innerHeight;
        }

        // Recreate The CreateAnnotation Layer Because of The ViewPort Change Issue.
        this.drawLayer.set({
            'styles': {
                left: left,
                top: top,
                width: width,
                height: height
            }
        });

        // Create Canvas on the CreateAnnotation Layer
        this.drawCanvas.set({
            width: width,
            height: height
        });

        // The canvas context
        var ctx = this.drawCanvas.getContext('2d');

        // console.log('drawing rectangle')
        this.removeMouseEvents();
        var started = false;
        var min_x, min_y, max_x, max_y, w, h;
        var startPosition;

        this.drawCanvas.addEvent('mousedown', function (e) {
            started = true;
            startPosition = OpenSeadragon.getMousePosition(e.event);
            x = startPosition.x;
            y = startPosition.y
            // console.log("started");
        });

        var isLimitROI = false;
        var limitroi = {};
        this.drawCanvas.addEvent('mousemove', function (e) {
            // Following the cursor...
            // console.log("..");
            if (started) {
                // Drawing the box...
                // console.log("moving");
                ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
                var currentMousePosition = OpenSeadragon.getMousePosition(e.event);

                min_x = Math.min(currentMousePosition.x, startPosition.x);
                min_y = Math.min(currentMousePosition.y, startPosition.y);
                max_x = Math.max(currentMousePosition.x, startPosition.x);
                max_y = Math.max(currentMousePosition.y, startPosition.y);
                w = Math.abs(max_x - min_x);
                h = Math.abs(max_y - min_y);


                var startRelativeMousePosition = new OpenSeadragon.Point(min_x, min_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
                var endRelativeMousePosition = new OpenSeadragon.Point(max_x, max_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));

                var newAnnot = {
                    x: startRelativeMousePosition.x,
                    y: startRelativeMousePosition.y,
                    w: w,
                    h: h,
                    type: 'rect',
                    color: this.color,
                    loc: []
                };

                var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition));

                newAnnot.x = globalNumbers.nativeX;
                newAnnot.y = globalNumbers.nativeY;
                newAnnot.w = globalNumbers.nativeW;
                newAnnot.h = globalNumbers.nativeH;

                var roi_x = self.imagingHelper.physicalToDataX(self.imagingHelper.logicalToPhysicalX(newAnnot.x));
                var roi_y = self.imagingHelper.physicalToDataY(self.imagingHelper.logicalToPhysicalY(newAnnot.y));
                var roi_w = (self.imagingHelper.physicalToDataX(self.imagingHelper.logicalToPhysicalX((newAnnot.x + newAnnot.w)))) - roi_x;
                var roi_h = (self.imagingHelper.physicalToDataY(self.imagingHelper.logicalToPhysicalY(newAnnot.y + newAnnot.h))) - roi_y;
                // console.log(roi_w * roi_h);
                if (roi_w * roi_h >= 100000) {
                    if (isLimitROI == false) {
                        isLimitROI = true;
                        limitroi.x = currentMousePosition.x;
                        limitroi.y = currentMousePosition.y;
                        limitroi.w = w;
                        limitroi.h = h;

                    }

                }
                // console.log(min_x, min_y, w, h);

                ctx.strokeStyle = this.color;

                // fillStyle for user-selected ROI
                // ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.fillStyle = fill_style;

                ctx.fillRect(min_x, min_y, w, h);
                ctx.strokeRect(min_x, min_y, w, h);
            }
        }.bind(this));

        this.drawCanvas.addEvent('mouseup', function (e) {
            started = false;
            var finalMousePosition = new OpenSeadragon.getMousePosition(e.event);

            min_x = Math.min(finalMousePosition.x, startPosition.x);
            min_y = Math.min(finalMousePosition.y, startPosition.y);
            max_x = Math.max(finalMousePosition.x, startPosition.x);
            max_y = Math.max(finalMousePosition.y, startPosition.y);

            if (isLimitROI) {
                min_x = Math.min(limitroi.x, startPosition.x);
                min_y = Math.min(limitroi.y, startPosition.y);
                max_x = Math.max(limitroi.x, startPosition.x);
                max_y = Math.max(limitroi.y, startPosition.y);
                w = limitroi.w;
                h = limitroi.h;
            }

            var startRelativeMousePosition = new OpenSeadragon.Point(min_x, min_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
            var endRelativeMousePosition = new OpenSeadragon.Point(max_x, max_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
            // console.log("startPosition", startPosition);

            var newAnnot = {
                x: startRelativeMousePosition.x,
                y: startRelativeMousePosition.y,
                w: w,
                h: h,
                type: 'rect',
                color: this.color,
                loc: []
            };

            var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition));

            newAnnot.x = globalNumbers.nativeX;
            newAnnot.y = globalNumbers.nativeY;
            newAnnot.w = globalNumbers.nativeW;
            newAnnot.h = globalNumbers.nativeH;
            var loc = [];
            loc[0] = parseFloat(newAnnot.x);
            loc[1] = parseFloat(newAnnot.y);
            newAnnot.loc = loc;

            if (isLimitROI) {
                var isConfirm = confirm("Region is too large. Click OK to snap it to closest fit");
                if (!isConfirm) {
                    this.drawLayer.hide();
                    this.addMouseEvents();
                    jQuery('html,body').css('cursor', 'default');
                    return;
                } else {
                    // alert("Region is too large. Click OK to snap it to closest fit");
                    ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
                    ctx.strokeStyle = this.color;
                    // ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.fillStyle = fill_style;
                    // console.log(min_x, min_y, limitroi.w, limitroi.h);
                    ctx.fillRect(min_x, min_y, limitroi.w, limitroi.h);
                    ctx.strokeRect(min_x, min_y, limitroi.w, limitroi.h);
                    isLimitROI = false;
                }
            }
            // console.log("newAnnot", newAnnot);

            // convert to geojson
            // var geoNewAnnot = this.convertRectToGeo(newAnnot)
            geoNewAnnot = newAnnot;
            this.promptForWorkOrder(geoNewAnnot, 'new', this, ctx, this.convertRectToGeo(newAnnot))
        }.bind(this));
    }
};

/**
 * Magnify Tool
 */
annotools.prototype.magnify = function () {
    // console.log("Magnify Tool");

    /* ASHISH Disable quit
     this.quitbutton.show()
     */

    this.drawLayer.hide();
    this.magnifyGlass.hide();
    this.magnifyGlass.set({
        html: ''
    });

    var content = new Element('div', {
        'class': 'magnified_content',
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
            this.showMessage('drag the magnifying glass');
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

        /*ASHISH Disable quit
         ,onDrop: function (draggable) {
         this.showMessage("Press q to quit")
         }.bind(this)
         */
    })
};

/**
 * Pick A Color
 */
annotools.prototype.selectColor = function () {
    // console.log("Pick A Color");

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
                this.colorContainer.destroy()
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
                this.colorContainer.destroy()
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
                this.colorContainer.destroy()
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
                this.colorContainer.destroy()
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
                this.colorContainer.destroy()
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
                this.colorContainer.destroy()
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
                this.colorContainer.destroy()
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
                this.colorContainer.destroy()
            }.bind(this)
        }
    }).inject(this.colorContainer);

    var colorButtons = document.getElements('.colorButton');
    for (var i = 0; i < colorButtons.length; i++) {
        colorButtons[i].addEvents({
            'mouseenter': function () {
                this.addClass('selected')
            },
            'mouseleave': function () {
                this.removeClass('selected')
            }
        })
    }
};

/**
 * Add New Annotations
 *
 * @param newAnnot
 */
annotools.prototype.addnewAnnot = function (newAnnot) {
    // console.log("Add New Annotations");

    this.saveAnnot(newAnnot);
    this.displayGeoAnnots()
};


/*ASHISH Disable quit
 quitMode: function () //Return To the Default Mode
 {
 this.drawLayer.hide()
 this.magnifyGlass.hide()
 },
 */


/**
 * Toggle markups
 */
annotools.prototype.toggleMarkups = function () {
    // console.log("Toggle markups");

    if (this.svg) {
        if (this.annotVisible) {
            this.annotVisible = false;
            this.svg.hide();
            document.getElements('.annotcontainer').hide()
        } else {
            this.annotVisible = true;
            this.displayGeoAnnots();
            document.getElements('.annotcontainer').show()
        }
    } else {
        this.annotVisible = true;

        this.displayGeoAnnots()
    }
    this.showMessage('annotation toggled')
};


/*
analyze: function(ctx) {
    this.removeMouseEvents();
    this.showMessage(); //Show Message
    this.drawLayer.show(); //Show The Drawing Layer
    this.magnifyGlass.hide(); //Hide The Magnifying Tool
    this.container = document.getElementsByClassName(this.canvas)[0]; //Get The Canvas Container
    
    var left = parseInt(this.container.getLeft()), //Get The Container Location
        top = parseInt(this.container.offsetTop),
        width = parseInt(this.container.offsetWidth),
        height = parseInt(this.container.offsetHeight),
        oleft = left,
        otop = top,
        owidth = width,
        oheight = height;
        
    if (left < 0) {
        left = 0;
        width = window.innerWidth
    } 
    
    //See Whether The Container is outside The Current ViewPort
    if (top < 0) {
        top = 0;
        height = window.innerHeight
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
    var started = false;
    var min_x, min_y, max_x, max_y, w, h;
    var startPosition;
    
    this.drawCanvas.addEvent('mousedown', function (e) {
        started = true;
        startPosition = OpenSeadragon.getMousePosition(e.event);
        x = startPosition.x;
        y = startPosition.y
    });

    this.drawCanvas.addEvent('mousemove', function (e) {
        if (started) {
            ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
            var currentMousePosition = OpenSeadragon.getMousePosition(e.event);

            min_x = Math.min(currentMousePosition.x, startPosition.x);
            min_y = Math.min(currentMousePosition.y, startPosition.y);
            max_x = Math.max(currentMousePosition.x, startPosition.x);
            max_y = Math.max(currentMousePosition.y, startPosition.y);
            w = Math.abs(max_x - min_x);
            h = Math.abs(max_y - min_y);
            ctx.strokeStyle = "red";
            ctx.strokeRect(min_x, min_y, w, h)
        }
    }.bind(this));

    this.drawCanvas.addEvent('mouseup', function (e) {
        started = false;
        var finalMousePosition = new OpenSeadragon.getMousePosition(e.event);

        min_x = Math.min(finalMousePosition.x, startPosition.x);
        min_y = Math.min(finalMousePosition.y, startPosition.y);
        max_x = Math.max(finalMousePosition.x, startPosition.x);
        max_y = Math.max(finalMousePosition.y, startPosition.y);

        var startRelativeMousePosition = new OpenSeadragon.Point(min_x, min_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
        var endRelativeMousePosition = new OpenSeadragon.Point(max_x, max_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
        var analysisBox = {
            x: startRelativeMousePosition.x,
            y: startRelativeMousePosition.y,
            w: w,
            h: h,
            type: "rect"
        };

        var globalNumbers = JSON.parse(this.convertFromNative(analysisBox, endRelativeMousePosition));

        analysisBox.x = globalNumbers.nativeX;
        analysisBox.y = globalNumbers.nativeY;
        analysisBox.w = globalNumbers.nativeW;
        analysisBox.h = globalNumbers.nativeH;
        this.promptForAnalysis(this, analysisBox);
        this.drawLayer.hide()
    }.bind(this))
},
*/

/**
 * Show messages
 *
 * @param msg
 */
annotools.prototype.showMessage = function (msg) {
    // console.log("Show message");

    /*ASHISH Disable quit
     if (!(msg)) msg = this.mode + " mode,press q to quit"
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
};

/**
 * Relative to global
 */
annotools.prototype.relativeToGlobal = function () {
    // console.log("Relative to global");

    for (var i = 0; i < $('viewport').getChildren().length; i++) {
        var object = $('viewport').getChildren()[i];

        if (object.tagName == 'ellipse') {
            var originalCoord = {};
            console.log('relativeToGlobal: ' + viewer.viewport.getZoom() + '  ' + this.annotationHandler.zoomBase);
            originalCoord.cx = object.getAttribute('cx');
            originalCoord.cy = object.getAttribute('cy');

            if (viewer.viewport.getZoom() != this.annotationHandler.zoomBase) {
                originalCoord.rx = object.getAttribute('rx') * this.annotationHandler.zoomBase;
                originalCoord.ry = object.getAttribute('ry') * this.annotationHandler.zoomBase
            } else {
                originalCoord.rx = object.getAttribute('rx');
                originalCoord.ry = object.getAttribute('ry');
            }

            originalCoord.zoom = viewer.viewport.getZoom();
            this.annotationHandler.originalCoords[object.id] = originalCoord;
            var bbox = object.getBBox();

            var objectCenterPt = new OpenSeadragon.Point(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);
            var objectCenterRelPt = this.viewer.viewport.pointFromPixel(objectCenterPt);

            // SBA
            originalCoord.cx = objectCenterRelPt.x;
            originalCoord.cy = objectCenterRelPt.y;

            this.annotationHandler.objectCenterPts[i] = objectCenterRelPt

        } else if (object.tagName == 'rect') {
            var originalCoord = {};
            originalCoord.x = object.getAttribute('x');
            originalCoord.y = object.getAttribute('y');
            originalCoord.width = object.getAttribute('width');
            originalCoord.height = object.getAttribute('height');
            originalCoord.zoom = viewer.viewport.getZoom();
            this.annotationHandler.originalCoords[object.id] = originalCoord;
            var bbox = object.getBBox();
            var objectCenterPt = new OpenSeadragon.Point(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2);
            var objectCenterRelPt = this.viewer.viewport.pointFromPixel(objectCenterPt);
            this.annotationHandler.objectCenterPts[i] = objectCenterRelPt
        } else {
            var bbox = object.getBBox();
            var objectCenterPt =
                new OpenSeadragon.Point(
                    bbox.x + bbox.width / 2,
                    bbox.y + bbox.height / 2
                );

            console.log('bbox: ' + bbox);

            var objectCenterRelPt =
                this.viewer.viewport.pointFromPixel(objectCenterPt);

            this.annotationHandler.objectCenterPts[i] = objectCenterRelPt;
            var originalCoord = {};
            originalCoord.cx = objectCenterPt.x;
            originalCoord.cy = objectCenterPt.y;

            var points =
                String.split(object.getAttribute('points').trim(), ' ');

            var distances = [];
            for (var j = 0; j < points.length; j++) {
                var pointPair = String.split(points[j], ',');
                var point =
                    new OpenSeadragon.Point(
                        parseFloat(pointPair[0]),
                        parseFloat(pointPair[1])
                    );
                var relPt = this.viewer.viewport.pointFromPixel(point);
                var dist = relPt.minus(objectCenterRelPt);
                distances.push(dist)
            }

            this.annotationHandler.originalCoords[object.id] = {
                center: objectCenterRelPt,
                distances: distances
            }
        }
    }
};

/**
 * Set up event handlers.
 */
annotools.prototype.setupHandlers = function () {
    // console.log("Setting up event handlers");

    var root = document.getElementsByTagName('svg')[0];
    // console.log("root", root);
    if (root !== undefined) {
        if (navigator.userAgent.toLowerCase().indexOf('webkit') >= 0) {
            window.addEventListener('mousewheel', this.annotationHandler.handleMouseWheel, false) // Chrome/Safari
            // window.addEventListener('mousewheel', this.getAnnot(), false) // Chrome/Safari
        } else {
            window.addEventListener('DOMMouseScroll', this.annotationHandler.handleMouseWheel, false) // Others
            // window.addEventListener('DOMMouseScroll', this.getAnnot(), false) // Others
        }
        // console.log("root", root);
        this.addMouseEvents()
    }

    for (var i = 0; i < this.viewer.buttons.buttons.length; i++) {
        var button = this.viewer.buttons.buttons[i];

        // console.log("tooltip", button.tooltip.toLowerCase());
        if (button.tooltip.toLowerCase() === 'go home') {
            var onHomeRelease = button.onRelease;
            var annot = this;
            button.onRelease = function (args) {
                $$('svg')[0].setStyle('opacity', 0);
                onHomeRelease(args);
                setTimeout(annotationHandler.goHome, annotationHandler.animateWaitTime, annot)
            }
        }
    }
};

/**
 * Display tips
 *
 * @param id
 */
annotools.prototype.displayTip = function (id) {
    // console.log("Display tip", id);

    // var container = document.id(this.canvas)
    var container = document.getElementsByClassName(this.canvas)[0]; // Get The Canvas Container
    var width = parseInt(container.offsetWidth),
        height = parseInt(container.offsetHeight),
        annot = this.annotations[id];
    var d = new Element('div', {
        'class': 'annotip',
        styles: {
            position: 'absolute',
            left: Math.round(width * annot.x),
            top: Math.round(height * annot.y)
        },
        html: annot.text
    }).inject(container);
    this.showMessage('Double Click to Edit')
};

/**
 * Destroy tips
 */
annotools.prototype.destroyTip = function () {
    // console.log("Destroying tips");

    // var container = document.id(this.canvas)
    var container = document.getElementsByClassName(this.canvas)[0]; // Get The Canvas Container
    container.getElements('.annotip').destroy()
};

/**
 * Edit tips
 *
 * @param id
 */
annotools.prototype.editTip = function (id) {
    // console.log("Editing tip", id);

    this.removeMouseEvents();
    var annotools = this;
    var annotation = this.annotations[id];
    var annotationTextJson = annotation.text;
    var content = '';

    for (var key in annotationTextJson) {
        content += "<p class='labelText'>" + key + ': ' + annotationTextJson[key] + '</p>'
    }
    content += "<p class='labelText'>Created by: " + this.annotations[id].username + '</p>';

    var SM = new SimpleModal();
    SM.addButton('Edit Annotation', 'btn primary', function () {
        annotools.promptForAnnotation(annotation, 'edit', annotools, null)
    });

    SM.addButton('Edit Markup', 'btn primary', function () {
        annotools.addMouseEvents();
        this.hide()
    });

    SM.addButton('Delete', 'btn primary', function () {
        var NSM = new SimpleModal();
        NSM.addButton('Confirm', 'btn primary', function () {
            annotools.deleteAnnot(id);
            annotools.addMouseEvents();
            this.hide()
        });
        NSM.addButton('Cancel', 'btn cancel', function () {
            annotools.addMouseEvents();
            this.hide()
        });
        NSM.show({
            'model': 'modal',
            'title': 'Confirm deletion',
            'contents': 'Are you sure you want to delete this annotation?'
        })
    });

    SM.addButton('Cancel', 'btn secondary', function () {
        annotools.addMouseEvents();
        this.hide()
    });

    SM.show({
        'model': 'modal',
        'title': 'Annotation',
        'contents': content
    })
};

/**
 * Delete annotations
 *
 * @param id
 */
annotools.prototype.deleteAnnot = function (id) {
    // console.log("Deleting annotation", id);

    var testAnnotId = this.annotations[id].annotId;
    this.annotations.splice(id, 1);
    // ########### Do the delete using bindaas instead of on local list.
    if (this.iid) {
        var jsonRequest = new Request.JSON({
                url: 'api/Data/deleteAnnot.php',
                async: false,
                onSuccess: function (e) {
                    this.showMessage('deleted from server')
                }.bind(this),
                onFailure: function (e) {
                    this.showMessage('Error deleting the Annotations, please check your deleteAnnot php')
                }
                    .bind(this)
            }
        ).get({'annotId': testAnnotId})
    }
    this.displayAnnot()
};

/**
 * Update annotation
 *
 * @param annot
 */
annotools.prototype.updateAnnot = function (annot) {
    // console.log("Updating annotation");

    var jsonRequest = new Request.JSON({
        url: 'api/Data/updateAnnot.php',
        onSuccess: function (e) {
            this.showMessage('saved to the server')
        }.bind(this),
        onFailure: function (e) {
            this.showMessage('Error Saving the Annotations,please check you saveAnnot funciton')
        }.bind(this)
    }).post({
        'iid': this.iid,
        'annot': annot
    });
    this.displayAnnot()
};

/**
 * Save annotation
 *
 * @param annotation
 */
annotools.prototype.saveAnnot = function (annotation) {
    // console.log("Saving annotation");
    // console.log("annotation", annotation)

    jQuery.ajax({
        'type': 'POST',
        url: 'api/Data/getAnnotSpatial.php',
        data: annotation,
        success: function (res, err) {
            // console.log("response: ")
            console.log(res);
            console.log(err);

            console.log('successfully posted')
        }
    })

};

/**
 * Convert to native
 *
 * @param annot
 * @returns {*}
 */
annotools.prototype.convertToNative = function (annot) {
    // console.log("Converting to native");

    if (annot.type == 'rect' || annot.type == 'ellipse') {
        var x = annot.x;
        var y = annot.y;
        var w = annot.w;
        var h = annot.h;

        var nativeW = this.imagingHelper.logicalToPhysicalDistance(w);
        var nativeH = this.imagingHelper.logicalToPhysicalDistance(h);
        var nativeX = this.imagingHelper.logicalToPhysicalX(x);
        var nativeY = this.imagingHelper.logicalToPhysicalY(y);
        var nativeNumbers = JSON.encode({nativeW: nativeW, nativeH: nativeH, nativeX: nativeX, nativeY: nativeY});
        return nativeNumbers
    }

    else if (annot.type == 'polyline' || annot.type == 'pencil' || annot.type == 'line') {
        var x = annot.x;
        var y = annot.y;
        var w = annot.w;
        var h = annot.h;
        var point = annot.points;

        var nativeW = this.imagingHelper.logicalToPhysicalDistance(w);
        var nativeH = this.imagingHelper.logicalToPhysicalDistance(h);
        var nativeX = this.imagingHelper.logicalToPhysicalX(x);
        var nativeY = this.imagingHelper.logicalToPhysicalY(y);

        var poly_first_split = String.split(point, ' ');
        var points = '';
        for (var k = 0; k < poly_first_split.length - 1; k++) {
            var poly_second_split = String.split(poly_first_split[k], ',');

            var polyPoint = new OpenSeadragon.Point(parseFloat(poly_second_split[0]), parseFloat(poly_second_split[1]));

            points += this.imagingHelper.logicalToPhysicalX(polyPoint.x) + ',' + this.imagingHelper.logicalToPhysicalY(polyPoint.y) + ' '
        }

        var last_poly_split = String.split(poly_first_split[k], ',');

        var lastPolyPoint = new OpenSeadragon.Point(parseFloat(last_poly_split[0]), parseFloat(last_poly_split[1]));

        points += this.imagingHelper.logicalToPhysicalX(lastPolyPoint.x) + ',' + this.imagingHelper.logicalToPhysicalY(lastPolyPoint.y);

        var nativeNumbers = JSON.encode({
            nativeW: nativeW,
            nativeH: nativeH,
            nativeX: nativeX,
            nativeY: nativeY,
            nativePoints: points
        });
        return nativeNumbers
    }

    else
        return JSON.encode(annot)
};

/**
 * Convert from native
 *
 * @param annot
 * @param end
 * @returns {*}
 */
annotools.prototype.convertFromNative = function (annot, end) {
    // console.log("Converting from native");

    if (annot.type == 'rect' || annot.type == 'ellipse') {
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

        return globalNumber
    }

    else if (annot.type == 'polyline' || annot.type == 'pencil' || annot.type == 'line') {
        var x = annot.x;
        var y = annot.y;
        var w = annot.w;
        var h = annot.h;
        var point = annot.points;
        var poly_first_split = String.split(point, ' ');
        var points = '';
        for (var k = 0; k < poly_first_split.length - 1; k++) {
            var poly_second_split = String.split(poly_first_split[k], ',');

            var polyPoint = new OpenSeadragon.Point(parseFloat(poly_second_split[0]), parseFloat(poly_second_split[1]));

            points += this.imagingHelper.physicalToLogicalX(polyPoint.x) + ',' + this.imagingHelper.physicalToLogicalY(polyPoint.y) + ' '
        }

        var last_poly_split = String.split(poly_first_split[k], ',');

        var lastPolyPoint = new OpenSeadragon.Point(parseFloat(last_poly_split[0]), parseFloat(last_poly_split[1]));

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

        var globalNumber = JSON.encode({
            nativeW: nativeW,
            nativeH: nativeH,
            nativeX: nativeX,
            nativeY: nativeY,
            points: nativePoints
        });

        return globalNumber
    }

    else
        return JSON.encode(annot)
};

/**
 * Convert all to native
 */
annotools.prototype.convertAllToNative = function () {
    // console.log("Converting all to native");

    for (index = 0; index < this.annotations.length; index++) {
        // unparsed = this.convertToNative(this.annotations[index])
        newannot = JSON.parse(this.convertToNative(this.annotations[index]));
        this.annotations[index].x = newannot.nativeX;
        this.annotations[index].y = newannot.nativeY;
        this.annotations[index].w = newannot.nativeW;
        this.annotations[index].h = newannot.nativeH
    }
};

/**
 * Draw Ellipse
 *
 * @param ctx
 */
annotools.prototype.drawEllipse = function (ctx) {
    // console.log("Drawing ellipse");

    this.removeMouseEvents();
    var started = false;
    var min_x, min_y, max_x, max_y, w, h;
    var startPosition;
    this.drawCanvas.bind('mousedown', function (e) {
        started = true;
        startPosition = OpenSeadragon.getMousePosition(e.event);
        x = startPosition.x;
        y = startPosition.y
    });

    /*
     this.drawCanvas.addEventListener('mousedown',function(e)
     {
     started = true
     startPosition = OpenSeadragon.getMousePosition(e.event)
     x = startPosition.x
     y = startPosition.y
     })
     */

    this.drawCanvas.bind('mousemove', function (e) {
        if (started) {
            ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
            var currentMousePosition = OpenSeadragon.getMousePosition(e.event);

            min_x = Math.min(currentMousePosition.x, startPosition.x);
            min_y = Math.min(currentMousePosition.y, startPosition.y);
            max_x = Math.max(currentMousePosition.x, startPosition.x);
            max_y = Math.max(currentMousePosition.y, startPosition.y);
            w = Math.abs(max_x - min_x);
            h = Math.abs(max_y - min_y);

            var kappa = .5522848;
            var ox = (w / 2) * kappa;
            var oy = (h / 2) * kappa;
            var xe = min_x + w;
            var ye = min_y + h;
            var xm = min_x + w / 2;
            var ym = min_y + h / 2;

            ctx.beginPath();
            ctx.moveTo(min_x, ym);
            ctx.bezierCurveTo(min_x, ym - oy, xm - ox, min_y, xm, min_y);
            ctx.bezierCurveTo(xm + ox, min_y, xe, ym - oy, xe, ym);
            ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
            ctx.bezierCurveTo(xm - ox, ye, min_x, ym + oy, min_x, ym);
            ctx.closePath();
            ctx.strokeStyle = this.color;
            ctx.stroke()
        }
    }.bind(this));

    this.drawCanvas.bind('mouseup', function (e) {
        started = false;
        var finalMousePosition = new OpenSeadragon.getMousePosition(e.event);
        min_x = Math.min(finalMousePosition.x, startPosition.x);
        min_y = Math.min(finalMousePosition.y, startPosition.y);
        max_x = Math.max(finalMousePosition.x, startPosition.x);
        max_y = Math.max(finalMousePosition.y, startPosition.y);

        var startRelativeMousePosition = new OpenSeadragon.Point(min_x, min_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
        var endRelativeMousePosition = new OpenSeadragon.Point(max_x, max_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
        var newAnnot = {
            x: startRelativeMousePosition.x,
            y: startRelativeMousePosition.y,
            w: w,
            h: h,
            type: 'ellipse',
            color: this.color,
            loc: []
        };

        var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition));

        newAnnot.x = globalNumbers.nativeX;
        newAnnot.y = globalNumbers.nativeY;
        newAnnot.w = globalNumbers.nativeW;
        newAnnot.h = globalNumbers.nativeH;
        var loc = [];
        loc[0] = parseFloat(newAnnot.x);
        loc[1] = parseFloat(newAnnot.y);
        newAnnot.loc = loc;
        this.promptForAnnotation(newAnnot, 'new', this, ctx)

    }.bind(this))
};

/**
 * Draw Rectangle
 *
 * @param ctx
 */
annotools.prototype.drawRectangle = function (ctx) {
    // console.log("Drawing rectangle");
    jQuery('html,body').css('cursor', 'crosshair');

    this.removeMouseEvents();
    var started = false;
    var min_x, min_y, max_x, max_y, w, h;
    var startPosition;

    this.drawCanvas.addEvent('mousedown', function (e) {
        started = true;
        startPosition = OpenSeadragon.getMousePosition(e.event);
        x = startPosition.x;
        y = startPosition.y
    });

    this.drawCanvas.addEvent('mousemove', function (e) {
        if (started) {
            ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
            var currentMousePosition = OpenSeadragon.getMousePosition(e.event);

            min_x = Math.min(currentMousePosition.x, startPosition.x);
            min_y = Math.min(currentMousePosition.y, startPosition.y);
            max_x = Math.max(currentMousePosition.x, startPosition.x);
            max_y = Math.max(currentMousePosition.y, startPosition.y);
            w = Math.abs(max_x - min_x);
            h = Math.abs(max_y - min_y);
            ctx.strokeStyle = this.color;
            // ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillStyle = fill_style;
            ctx.fillRect(min_x, min_y, w, h);
            ctx.strokeRect(min_x, min_y, w, h)
        }
    }.bind(this));

    this.drawCanvas.addEvent('mouseup', function (e) {
        started = false;
        var finalMousePosition = new OpenSeadragon.getMousePosition(e.event);

        min_x = Math.min(finalMousePosition.x, startPosition.x);
        min_y = Math.min(finalMousePosition.y, startPosition.y);
        max_x = Math.max(finalMousePosition.x, startPosition.x);
        max_y = Math.max(finalMousePosition.y, startPosition.y);
        var startRelativeMousePosition = new OpenSeadragon.Point(min_x, min_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
        var endRelativeMousePosition = new OpenSeadragon.Point(max_x, max_y).minus(OpenSeadragon.getElementOffset(viewer.canvas));
        var newAnnot = {
            x: startRelativeMousePosition.x,
            y: startRelativeMousePosition.y,
            w: w,
            h: h,
            type: 'rect',
            color: this.color,
            loc: []
        };

        var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition));

        newAnnot.x = globalNumbers.nativeX;
        newAnnot.y = globalNumbers.nativeY;
        newAnnot.w = globalNumbers.nativeW;
        newAnnot.h = globalNumbers.nativeH;
        var loc = [];
        loc[0] = parseFloat(newAnnot.x);
        loc[1] = parseFloat(newAnnot.y);
        newAnnot.loc = loc;

        // Convert to GeoJSON
        var geoNewAnnot = this.convertRectToGeo(newAnnot);
        // geoNewAnnot = newAnnot
        this.promptForAnnotation(geoNewAnnot, 'new', this, ctx)
    }.bind(this))
};

/**
 * Draw Pencil
 *
 * @param ctx
 */
annotools.prototype.drawPencil = function (ctx) {
    // console.log("Draw Pencil");

    this.removeMouseEvents();
    var started = false;
    var pencil = [];
    var newpoly = [];

    this.drawCanvas.addEvent('mousedown', function (e) {
        started = true;
        var startPoint = OpenSeadragon.getMousePosition(e.event);
        var relativeStartPoint = startPoint.minus(OpenSeadragon.getElementOffset(viewer.canvas));
        newpoly.push({
            'x': relativeStartPoint.x,
            'y': relativeStartPoint.y
        });
        ctx.beginPath();
        ctx.moveTo(relativeStartPoint.x, relativeStartPoint.y);
        ctx.strokeStyle = this.color;
        ctx.stroke()
    }.bind(this));

    this.drawCanvas.addEvent('mousemove', function (e) {
        var newPoint = OpenSeadragon.getMousePosition(e.event);
        var newRelativePoint = newPoint.minus(OpenSeadragon.getElementOffset(viewer.canvas));
        if (started) {
            newpoly.push({
                'x': newRelativePoint.x,
                'y': newRelativePoint.y
            });

            ctx.lineTo(newRelativePoint.x, newRelativePoint.y);
            ctx.stroke()
        }
    });

    this.drawCanvas.addEvent('mouseup', function (e) {
        started = false;
        pencil.push(newpoly);
        newpoly = [];
        numpoint = 0;
        var x, y, w, h;
        x = pencil[0][0].x;
        y = pencil[0][0].y;

        var maxdistance = 0;
        var points = '';
        var endRelativeMousePosition;

        for (var i = 0; i < pencil.length; i++) {
            newpoly = pencil[i];
            for (j = 0; j < newpoly.length - 1; j++) {
                points += newpoly[j].x + ',' + newpoly[j].y + ' ';
                if (((newpoly[j].x - x) * (newpoly[j].x - x) + (newpoly[j].y - y) * (newpoly[j].y - y)) > maxdistance) {
                    maxdistance = ((newpoly[j].x - x) * (newpoly[j].x - x) + (newpoly[j].y - y) * (newpoly[j].y - y));
                    var endMousePosition = new OpenSeadragon.Point(newpoly[j].x, newpoly[j].y);
                    endRelativeMousePosition = endMousePosition.minus(OpenSeadragon.getElementOffset(viewer.canvas))
                }
            }

            points = points.slice(0, -1);
            points += ';'
        }

        points = points.slice(0, -1);

        var newAnnot = {
            x: x,
            y: y,
            w: w,
            h: h,
            type: 'pencil',
            points: points,
            color: this.color,
            loc: []
        };

        var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition));
        newAnnot.x = globalNumbers.nativeX;
        newAnnot.y = globalNumbers.nativeY;
        newAnnot.w = globalNumbers.nativeW;
        newAnnot.h = globalNumbers.nativeH;
        newAnnot.points = globalNumbers.points;

        var loc = [];
        loc[0] = parseFloat(newAnnot.x);
        loc[1] = parseFloat(newAnnot.y);
        newAnnot.loc = loc;
        // console.log("newAnnot", newAnnot)
        var geojsonAnnot = this.convertPencilToGeo(newAnnot);

        this.promptForAnnotation(geojsonAnnot, 'new', this, ctx)
    }.bind(this))
};

/**
 * Draw Measure.
 *
 * @param ctx
 */
annotools.prototype.drawMeasure = function (ctx) {
    // console.log("Draw measure");

    this.removeMouseEvents();
    var started = false;
    var x0, y0, x1, y1;
    var length;

    this.drawCanvas.addEvent('mousedown', function (e) {
        if (!started) {
            var startPosition = OpenSeadragon.getMousePosition(e.event);
            var startRelativeMousePosition = startPosition.minus(OpenSeadragon.getElementOffset(viewer.canvas));
            x0 = startRelativeMousePosition.x;
            y0 = startRelativeMousePosition.y;
            started = true
        } else {
            var endPosition = OpenSeadragon.getMousePosition(e.event);
            var endRelativePosition = endPosition.minus(OpenSeadragon.getElementOffset(viewer.canvas));
            x1 = endRelativePosition.x;
            y1 = endRelativePosition.y;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.strokeStyle = this.color;
            ctx.stroke();
            ctx.closePath();

            var minX, minY = 0;
            var maxX, maxY = 0;
            if (x1 > x0) {
                minX = x0;
                maxX = x1
            } else {
                minX = x1;
                maxX = x0
            }
            if (y1 > y0) {
                minY = y0;
                maxY = y1
            } else {
                minY = y1;
                maxY = y0
            }

            var x_dist = ((this.imagingHelper.physicalToDataX(x0)) - (this.imagingHelper.physicalToDataX(x1)));
            var y_dist = ((this.imagingHelper.physicalToDataY(y0)) - (this.imagingHelper.physicalToDataY(y1)));

            var x_micron = this.mppx * x_dist;
            var y_micron = this.mppy * y_dist;

            var length = Math.sqrt(x_micron.pow(2) + y_micron.pow(2));
            points = (x1 + ',' + y1);
            var w = 0;
            var h = 0;
            var newAnnot =
                {
                    x: x0,
                    y: y0,
                    w: w,
                    h: h,
                    type: 'line',
                    points: points,
                    color: this.color,
                    loc: [],
                    length: length
                };
            var finalPosition = new OpenSeadragon.Point(maxX, maxY);
            var finalRelativePosition = finalPosition.minus(OpenSeadragon.getElementOffset());

            var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, finalRelativePosition));
            newAnnot.x = globalNumbers.nativeX;
            newAnnot.y = globalNumbers.nativeY;
            newAnnot.w = globalNumbers.nativeW;
            newAnnot.h = globalNumbers.nativeH;
            newAnnot.points = globalNumbers.points;
            var loc = [];
            loc[0] = parseFloat(newAnnot.x);
            loc[1] = parseFloat(newAnnot.y);
            newAnnot.loc = loc;
            this.promptForAnnotation(newAnnot, 'new', this, ctx);
            started = false
        }
    }.bind(this));

    this.drawCanvas.addEvent('mousemove', function (e) {
        if (started) {
            ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
            var currentPosition = OpenSeadragon.getMousePosition(e.event);
            var currentRelativePosition = OpenSeadragon.getMousePosition(e.event);

            x1 = currentRelativePosition.x;
            y1 = currentRelativePosition.y;

            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.strokeStyle = this.color;
            ctx.stroke();
            ctx.closePath()
        }
    }.bind(this))
};

/**
 * Draw Polyline
 * @param ctx
 */
annotools.prototype.drawPolyline = function (ctx) {
    // console.log("Draw Polyline");

    this.removeMouseEvents();
    var started = true;
    var newpoly = [];
    var numpoint = 0;
    this.drawCanvas.addEvent('mousedown', function (e) {
        if (started) {
            var newPoint = OpenSeadragon.getMousePosition(e.event);
            var newRelativePoint = newPoint.minus(OpenSeadragon.getElementOffset(viewer.canvas));
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(e.event.layerX, e.event.layerY, 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill;

            newpoly.push({
                'x': newRelativePoint.x,
                'y': newRelativePoint.y
            });

            if (numpoint > 0) {
                ctx.beginPath();
                ctx.moveTo(newpoly[numpoint].x, newpoly[numpoint].y);
                ctx.lineTo(newpoly[numpoint - 1].x, newpoly[numpoint - 1].y);
                ctx.strokeStyle = this.color;
                ctx.stroke()
            }

            numpoint++
        }
    }.bind(this));

    this.drawCanvas.addEvent('dblclick', function (e) {
        started = false;
        ctx.beginPath();
        ctx.moveTo(newpoly[numpoint - 1].x, newpoly[numpoint - 1].y);
        ctx.lineTo(newpoly[0].x, newpoly[0].y);
        ctx.stroke();
        var x, y, w, h;

        x = newpoly[0].x;
        y = newpoly[0].y;

        var maxdistance = 0;

        // var tip = prompt("Please Enter Some Description","")

        var points = '';

        var endMousePosition;
        for (var i = 0; i < numpoint - 1; i++) {
            points += newpoly[i].x + ',' + newpoly[i].y + ' ';
            if (((newpoly[i].x - x) * (newpoly[i].x - x) + (newpoly[i].y - y) * (newpoly[i].y - y)) > maxdistance) {
                maxdistance = ((newpoly[i].x - x) * (newpoly[i].x - x) + (newpoly[i].y - y) * (newpoly[i].y - y));

                endMousePosition = new OpenSeadragon.Point(newpoly[i].x, newpoly[i].y);
                w = Math.abs(newpoly[i].x - x);
                h = Math.abs(newpoly[i].y - y)
            }
        }

        points += newpoly[i].x + ',' + newpoly[i].y;

        var endRelativeMousePosition = endMousePosition.minus(OpenSeadragon.getElementOffset(viewer.canvas));

        var newAnnot = {
            x: x,
            y: y,
            w: w,
            h: h,
            type: 'polyline',
            points: points,
            color: this.color,
            loc: []
        };

        var globalNumbers = JSON.parse(this.convertFromNative(newAnnot, endRelativeMousePosition));

        newAnnot.x = globalNumbers.nativeX;
        newAnnot.y = globalNumbers.nativeY;
        newAnnot.w = globalNumbers.nativeW;
        newAnnot.h = globalNumbers.nativeH;
        newAnnot.points = globalNumbers.points;
        var loc = [];
        loc[0] = newAnnot.x;
        loc[1] = newAnnot.y;
        newAnnot.loc = loc;
        this.promptForAnnotation(newAnnot, 'new', this, ctx)
    }.bind(this))
};

/**
 * Save State
 */
annotools.prototype.saveState = function () {
    // console.log("Save State");

    if (this.iid) {
        var jsonRequest = new Request.JSON({
            // url: IP + 'api/state.php',
            url: 'api/Data/state.php',
            onSuccess: function (e) {
                this.showMessage('saved to the server')
            }.bind(this),
            onFailure: function (e) {
                this.showMessage('Error Saving the state,please check you saveState funciton')
            }.bind(this)
        }).post({
            'iid': this.iid,
            'zoom': iip.view.res,
            'left': iip.view.x,
            'top': iip.view.y
        })
    } else this.showMessage('Sorry, This Function is Only Supported With the Database Version')
};

/**
 * Retrieve Template
 *
 * @returns {string}
 */
annotools.prototype.retrieveTemplate = function () {
    // console.log("Retrieve Template");

    var jsonReturn = '';

    /*
     * Ganesh
     */

    var jsonRequest = new Request.JSON({
        url: 'api/Data/retreiveTemplate.php', // Ameen, fix your spelling!
        async: false,
        onSuccess: function (e) {
            jsonReturn = JSON.parse(e)[0]
            // console.log("jsonReturn", jsonReturn)
        }.bind(this),
        onFailure: function (e) {
            this.showMessage('Error retrieving AnnotationTemplate, please check your retrieveTemplate.php')
        }.bind(this)
    }).get();

    /*
     var jsonRequest = jQuery.ajax({
     url: "api/Data/retreiveTemplate.php",
     success: function(e){
     console.log(e)
     jsonReturn  = JSON.parse(e)[0]
     console.log(jsonReturn)
     },
     async: false
     })
     */

    return jsonReturn
};

/**
 * Retrieve single annotation.
 *
 * @param annotId
 * @returns {*}
 */
annotools.prototype.retrieveSingleAnnot = function (annotId) {
    // console.log("Retrieve Single Annotations");

    var jsonReturn;
    var jsonRequest = new Request.JSON({
        url: 'api/Data/retreiveSingleAnnot.php', // Ameen, fix your spelling! Again!
        async: false,
        onSuccess: function (e) {
            jsonReturn = JSON.parse(e)[0]
        }.bind(this),
        onFailure: function (e) {
            this.showMessage('Error retrieving Annotation, please check your retreiveSingleAnnot.php')
        }.bind(this)
    }).get({'annotId': annotId});

    return jsonReturn
};

/**
 * Handle work order.
 *
 * @param annot
 */
function handleWorkOrder(annot) {
    // console.log("Handle Work Order");

    console.log("annot", annot);
}

/*
 annotools.prototype.showFilterControls = function(newAnnot, mode, annotools, ctx){
 var panel = jQuery("#panel")
 panel.show("slide")

 panel.html("<div id='panelHeader'>Filters</div><div id='panelBody'>Brightness: <input type='range' id='controlBright'>"+
 "<br /> Contrast: <input type='range' min=0 max=2.5 step=0.05 id='controlContrast'><br />"
 +" Threshold: <input type='range' min=0 max=255 step=1 id='controlThreshhold' /><br />"
 + "<button class='btn' id='controlSobel'>Sobel Edge Detection</button> <button class='btn' id='controlInvert'>Invert Colors</button>" +
 "</div>")


 jQuery("#controlInvert").on("click", function(){
 viewer.setFilterOptions({
 filters: {
 processors: OpenSeadragon.Filters.INVERT()
 }
 })
 });

 jQuery("#controlSobel").on("click", function(){
 viewer.setFilterOptions({
 filters: {
 processors: [
 OpenSeadragon.Filters.CONVOLUTION([
 0.0625, 0.125, 0.0625,
 0.125, 0.25, 0.125,
 0.0625, 0.125, 0.625
 ]),
 OpenSeadragon.Filters.CONVOLUTION([
 -1, 0, 1,
 -2, 0, 2,
 -1, 0, 1
 ])
 ]
 }
 })
 });
 jQuery("#controlThreshhold").on("change", function(){
 var threshhold = 1*jQuery(this).val()
 console.log(threshhold)
 viewer.setFilterOptions({
 filters: {
 processors: OpenSeadragon.Filters.THRESHOLDING(threshhold)
 }
 })
 console.log(viewer);
 })

 jQuery("#controlContrast").on("change", function(){
 var contrast = 1*jQuery(this).val()
 console.log(contrast)
 viewer.setFilterOptions({
 filters: {
 processors: OpenSeadragon.Filters.CONTRAST(contrast)
 }
 })
 console.log(viewer);
 })
 jQuery("#controlBright").on("change", function(){
 // console.log(viewer)
 var brightness = 1*jQuery(this).val()
 console.log(brightness)
 viewer.setFilterOptions({
 filters: {
 processors: OpenSeadragon.Filters.BRIGHTNESS(brightness)
 }
 })
 console.log(viewer)
 // console.log(jQuery(this).val())
 })
 }
 */

/*
 annotools.prototype.promptForWorkOrder = function (newAnnot, mode, annotools, ctx) {
 console.log(newAnnot)
 console.log(mode)
 console.log(annotools)
 console.log(ctx)

 var panel = jQuery('#panel').show()
 var iid = this.iid
 var x = annotools.imagingHelper.physicalToDataX(annotools.imagingHelper.logicalToPhysicalX(newAnnot.x))
 var y = annotools.imagingHelper.physicalToDataY(annotools.imagingHelper.logicalToPhysicalY(newAnnot.y))
 var w = (annotools.imagingHelper.physicalToDataX(annotools.imagingHelper.logicalToPhysicalX((newAnnot.x + newAnnot.w)))) - x
 var h = (annotools.imagingHelper.physicalToDataY(annotools.imagingHelper.logicalToPhysicalY(newAnnot.y + newAnnot.h))) - y
 x = parseInt(x)
 y = parseInt(y)
 w = parseInt(w)
 h = parseInt(h)
 if (w * h > 1000000) {
 newAnnot.w = annotools.imagingHelper.dataToLogicalX(1000)
 newAnnot.h = annotools.imagingHelper.dataToLogicalY(1000)
 w = 1000
 h = 1000
 panel.html(function () {
 return "<div id='panelHeader'><h4> Work Order(Error) </h4></div><div id='panelBody'> Error: Very large ROI. <br />" + 'Width: ' + w + '<br />' + 'Height: ' + h + "<br />Please try creating a smaller ROI. Zooming into the ROI would help.<br /> We currently support 1000X1000 tiles <br />  <button id='cancelWorkOrder'>Cancel</button></div>"
 })
 jQuery('#cancelWorkOrder').click(function () {
 console.log('here')
 jQuery('#panel').hide()
 annotools.drawLayer.hide()
 annotools.addMouseEvents()
 })
 return
 }
 panel.html(function () {
 return "<div id='panelHeader'><h4> Work Order </h4></div><div id='panelBody'> <ul><li> x1: " + x + '</li> <li> y1: ' + y + '</li> <li> w: ' + w + '</li> <li>h: ' + h + '</li> <li>Algorithm: SuperSegmenter</li> '
 + "<li>Execution Id:<input id='order-execution_id'></input></li>" + "<li>Notes: <textarea id='order-notes'></textarea>" + "</ul> <br /> <button id='submitWorkOrder' class='btn btn-primary' >Submit</button> <button class='btn' id='cancelWorkOrder'>Cancel</button></div>"
 })

 jQuery('#cancelWorkOrder').click(function () {
 console.log('here')
 jQuery('#panel').hide()
 annotools.drawLayer.hide()
 annotools.addMouseEvents()
 })

 jQuery('#submitWorkOrder').click(function () {
 console.log('events...')

 // annotools.drawCanvas.removeEvents('mouseup')
 // annotools.drawCanvas.removeEvents('mousedown')
 // annotools.drawCanvas.removeEvents('mousemove')
 annotools.drawLayer.hide()
 annotools.addMouseEvents()
 // annotools.removeMouseEvents()
 // annotools.getMultiAnnot();

 var username = 'lastlegion'
 var execution_id = jQuery('#order-execution_id').val()
 var notes = jQuery('#order-notes').val()
 var width = 48002
 var height = 35558
 if (iid == 'TCGA-06-0148-01Z-00-DX1') {
 width = 26001
 height = 27968
 }
 var order = {
 'type': 'order',

 'data': {
 'title': username + ' :: ' + execution_id,
 'algorithm': 'SuperSegmenter',
 'execution_id': execution_id,
 'created_by': username,
 'notes': notes,
 'order': {
 'metadata': {
 'created_on': Date.now(),
 'created_by': 'lastlegion'
 },
 'image': {
 'width': width,
 'height': height,
 'case_id': iid
 },
 'roi': {
 'x': x,
 'y': y,
 'w': w,
 'h': h
 },
 'execution': {
 'execution_id': execution_id,
 'algorithm': 'SuperSegmenter',
 'parameters': [
 {
 'blur': 0.4
 },
 {
 'format': 'jpg'
 }
 ]
 }
 }
 }
 }

 jQuery.post('api/Data/workOrder.php', order)
 .done(function (res) {
 console.log(res)
 panel.html(function () {
 annotools.addMouseEvents()
 return 'Order Submitted!'
 })
 panel.hide('slide')
 })
 console.log('submit')
 console.log(newAnnot)
 console.log(order)
 }.bind(newAnnot))
 }
 */

/**
 * Delete Annotations
 *
 * @param execution_id
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 */
annotools.prototype.deleteAnnotations = function (execution_id, x1, y1, x2, y2) {
    // console.log("Delete Annotations");

    var body = {};
    var self = this;
    body["execution_id"] = execution_id;
    body["case_id"] = this.iid;
    body["x1"] = x1;
    body["x2"] = x2;
    body["y1"] = y1;
    body["y2"] = y2;
    jQuery.ajax({
        url: 'api/Data/deleteMarkups.php',
        type: 'DELETE',
        data: body,
        success: function (data) {
            console.log("data", data);
            self.getMultiAnnot();
        }
    });
};

var execution_id = "";
var previous_execution = {};
var r = 1.0, w = 0.8, l = 3.0, u = 10.0, k = 20.0, pj = 0;

/**
 * Set up WorkOrder panel; prompt for WorkOrder.
 *
 * @param newAnnot
 * @param mode
 * @param annotools
 * @param ctx
 * @param roiGeoJSON
 */
annotools.prototype.promptForWorkOrder = function (newAnnot, mode, annotools, ctx, roiGeoJSON) {
    console.log("\nPrompt For WorkOrder");

    jQuery('html,body').css('cursor', 'default');

    this.removeMouseEvents();
    console.log("Removed mouse events");

    var panel = jQuery('#panel').show();
    panel.html(function () {
        return ""
    });

    var iid = this.iid;
    var roi_x = annotools.imagingHelper.physicalToDataX(annotools.imagingHelper.logicalToPhysicalX(newAnnot.x));
    var roi_y = annotools.imagingHelper.physicalToDataY(annotools.imagingHelper.logicalToPhysicalY(newAnnot.y));
    var roi_w = (annotools.imagingHelper.physicalToDataX(annotools.imagingHelper.logicalToPhysicalX((newAnnot.x + newAnnot.w)))) - roi_x;
    var roi_h = (annotools.imagingHelper.physicalToDataY(annotools.imagingHelper.logicalToPhysicalY(newAnnot.y + newAnnot.h))) - roi_y;

    //roi_x = parseFloat(roi_x);
    //roi_y = parseFloat(roi_y);
    //roi_w = parseFloat(roi_w);
    //roi_h = parseFloat(roi_h);

    roi_x = parseInt(parseFloat(roi_x) + 0.5);
    roi_y = parseInt(parseFloat(roi_y) + 0.5);
    roi_w = parseInt(parseFloat(roi_w) + 0.5);
    roi_h = parseInt(parseFloat(roi_h) + 0.5);

    if (roi_w * roi_h > 1000000) {
        newAnnot.w = annotools.imagingHelper.dataToLogicalX(1000);
        newAnnot.h = annotools.imagingHelper.dataToLogicalY(1000);
        roi_w = 1000;
        roi_h = 1000;
        panel.html(function () {
            return "<div id='panelHeader'><h4> Work Order(Error) </h4></div><div id='panelBody'> Error: Very large ROI. <br />" + 'Width: ' + roi_w + '<br />' + 'Height: ' + roi_h + "<br />Please try creating a smaller ROI. Zooming into the ROI would help.<br /> We currently support 1000X1000 tiles <br />  <button id='cancelWorkOrder' class='btn' >Cancel</button></div>"
        });

        jQuery('#cancelWorkOrder').click(function (e) {
            e.preventDefault();
            if (!jQuery.isEmptyObject(previous_execution)) {
                self.deleteAnnotations(previous_execution.execution_id, previous_execution.x - 0.00001, previous_execution.y - 0.00001, previous_execution.x + previous_execution.w + 0.00001, previous_execution.y + previous_execution.h + 0.000001);
                previous_execution = {};
            }
            console.log("cancelWorkOrder");
            jQuery('#panel').hide();
            annotools.drawLayer.hide();
            annotools.addMouseEvents()
        });
        return
    }

    panel.html(function () {
        return "<div id='panelHeader'><h4 id='workOrderTitle'> Work Order </h4><a href='#' id='cancelOrderTitle'><div id='cancelWorkOrder'> <img src='images/ic_close_white_24px.svg' /> </div></a></div><div id='panelBody'><form id='workOrderForm' action='#'></form></div>";
    });

    var schema = {
        "range1": {
            "type": "number",
            "title": "Threshold Gain",
            //"description": "Threshold gain for calling something in the image as nucleus.  Run as default value 1.0",
            "default": r,
            "minimum": 0.5,
            "exclusiveMinimum": false,
            "maximum": 1.5
        },
        "result1": {
            "type": "number",
            "maxLength": 3,
            "notitle": true,
            "required": true,
            "placeholder": r,
            "readonly": false
        },
        "range2": {
            "type": "number",
            "title": "Expected Roundness/Smoothness",
            //"description": "Threshold gain for calling something in the image as nucleus.  Run as default value 1.0",
            "default": w,
            "minimum": 0.0,
            "exclusiveMinimum": false,
            "maximum": 10.0
        },
        "result2": {
            "type": "number",
            "maxLength": 3,
            "notitle": true,
            "required": true,
            "placeholder": w,
            "readonly": false
        },
        "range3": {
            "type": "number",
            "title": "Size Lower Threshold",
            //"description": "Threshold gain for calling something in the image as nucleus.  Run as default value 1.0",
            "default": l,
            "minimum": 1.0,
            "exclusiveMinimum": false,
            "maximum": 30.0
        },
        "result3": {
            "type": "number",
            "maxLength": 3,
            "notitle": true,
            "required": true,
            "placeholder": l,
            "readonly": false
        },
        "range4": {
            "type": "number",
            "title": "Size Upper Threshold",
            "default": u,
            "minimum": 1.0,
            "maximum": 500.0
        },
        "result4": {
            "type": "number",
            "maxLength": 3,
            "notitle": true,
            "required": true,
            "placeholder": u,
            "readonly": false
        },
        "range5": {
            "type": "number",
            "title": "Kernel Size",
            "default": k,
            "minimum": 1.0,
            "maximum": 30.0
        },
        "result5": {
            "type": "number",
            "maxLength": 3,
            "notitle": true,
            "required": true,
            "placeholder": k,
            "readonly": false
        },
        "radios6": {
            "type": "integer",
            "title": "Choose declumping method",
            "enum": [0, 1, 2],
            default: pj
        }
    };

    // console.log('Schema: ' + JSON.stringify(schema, null, 4));

    var formSchema = {
        'schema': schema,
        'form': [{
            'type': 'fieldset',
            //'legend': 'Parameters',
            'expendable': true,
            'items': [
                {
                    "key": "range1",
                    "type": "range",
                    "step": 0.1,
                    "onChange": function (evt) {
                        var valueRange1 = jQuery(evt.target).val();
                        r = valueRange1;
                        jQuery('[id*="-result1"]').val(r);
                        /*
                         if(valueRange1) {
                         document.getElementById("jsonform-0-elt-result1").value = valueRange1;
                         }
                         document.getElementById("jsonform-0-elt-result1").value = valueRange1;
                         */
                    },
                    "otherField": {"key": "result1", "inline": true}
                },
                "result1",
                {
                    "key": "range2",
                    "type": "range",
                    "step": 0.1,
                    "onChange": function (evt) {
                        var valueRange2 = jQuery(evt.target).val();
                        w = valueRange2;
                        jQuery('[id*="-result2"]').val(w);
                        /*
                         if(valueRange2) {
                         document.getElementById("jsonform-0-elt-result2").value = valueRange2;
                         }
                         */
                    }
                },
                "result2",
                {
                    "key": "range3",
                    "type": "range",
                    "step": 0.1,
                    "onChange": function (evt) {
                        var valueRange3 = jQuery(evt.target).val();
                        l = valueRange3;
                        jQuery('[id*="-result3"]').val(l);
                        /*
                         if(valueRange3) {
                         document.getElementById("jsonform-0-elt-result3").value = valueRange3;
                         } */
                    }
                },
                "result3",
                {
                    "key": "range4",
                    "type": "range",
                    "step": 0.1,
                    "onChange": function (evt) {
                        var valueRange4 = jQuery(evt.target).val();
                        u = valueRange4;
                        jQuery('[id*="-result4"]').val(u);
                        /*
                         if(valueRange4) {
                         document.getElementById("jsonform-0-elt-result4").value = valueRange4;
                         } */
                    }
                },
                "result4",
                {
                    "key": "range5",
                    "type": "range",
                    "step": 0.1,
                    "onChange": function (evt) {
                        var valueRange5 = jQuery(evt.target).val();
                        k = valueRange5;
                        console.log("valueRange5:", k);
                        jQuery('[id*="-result5"]').val(k);
                        /*
                         if(valueRange5) {
                         document.getElementById("jsonform-0-elt-result5").value = valueRange5;
                         }
                         */
                    }
                },
                "result5",

                {
                    "key": "radios6",
                    "type": "radios",
                    "titleMap": {
                        0: "--- No Declumping",
                        1: "--- Mean Shift Declumping",
                        2: "--- Watershed Declumping"
                    },
                    "onChange": function (e) {
                        // console.log(e);
                        var radio_value = jQuery(e.target).val();
                        // console.log("radio_value is : "+radio_value);
                        //pj=parseInt(radio_value);
                        pj = radio_value;
                        // console.log("pj is : "+pj);
                    }
                }

            ]
        }],
        "params": {
            "fieldHtmlClass": "input-small"
        }
    };

    var self = this;

    setTimeout(function () {
        // pj = 0;
        // pj = "n";
        console.log("\nInside setTimeout, pj is :" + pj);

        // console.log("formSchema", formSchema);

        // Check for zero value
        if ((roi_x * roi_y * roi_w * roi_h) === 0) {

            jQuery('#panel').hide();
            annotools.drawLayer.hide();
            annotools.destroyMarkups();
            annotools.addMouseEvents();

            alert("Please select a region. Try again!");
            //this.showMessage("Please select a region. Try again!"); // not accessible here.
        }

        jQuery('#workOrderForm').jsonForm(formSchema);
        jQuery("#workOrderForm").append("<div id='workOrderCtrl'><br /><button class='btn btn-primary' id='submitWorkOrder'>Analyze Region</button><br /><button class='btn' id='saveWorkOrder'>Save Results</button> <button class='btn' id='discardWorkOrder'>Discard Results</button></div>");
        jQuery('#cancelWorkOrder').click(function (e) {
            e.preventDefault();
            console.log(previous_execution);
            if (!jQuery.isEmptyObject(previous_execution)) {
                self.deleteAnnotations(previous_execution.execution_id, previous_execution.x - 0.00001, previous_execution.y - 0.00001, previous_execution.x + previous_execution.w + 0.00001, previous_execution.y + previous_execution.h + 0.000001);
                previous_execution = {};
            }

            console.log("cancelWorkOrder (in setTimeout)");
            jQuery('#panel').hide();
            annotools.drawLayer.hide();
            annotools.addMouseEvents();
        });

        jQuery('[id*="-result1"]').val(r);
        jQuery('[id*="-result2"]').val(w);
        jQuery('[id*="-result3"]').val(l);
        jQuery('[id*="-result4"]').val(u);
        jQuery('[id*="-result5"]').val(k);

        //
        //  Added by Joe Balsamo to accommodate use of text box for input
        //
        jQuery('[id*="-result1"]').on("blur", function (evt) {
            r = this.value;
            document.getElementById(this.id.replace('result', 'range')).value = this.value;
        });

        jQuery('[id*="-result2"]').on("blur", function (evt) {
            w = this.value;
            document.getElementById(this.id.replace('result', 'range')).value = this.value;
        });

        jQuery('[id*="-result3"]').on("blur", function (evt) {
            l = this.value;
            document.getElementById(this.id.replace('result', 'range')).value = this.value;
        });

        jQuery('[id*="-result4"]').on("blur", function (evt) {
            u = this.value;
            document.getElementById(this.id.replace('result', 'range')).value = this.value;
        });

        jQuery('[id*="-result5"]').on("blur", function (evt) {
            k = this.value;
            document.getElementById(this.id.replace('result', 'range')).value = this.value;
        });
        //
        //   End of Text input code
        //

        // TODO: remove hardcoded vars.
        var width = 48002;
        var height = 35558;

        jQuery("#discardWorkOrder").click(function (e) {
            e.preventDefault();
            self.deleteAnnotations(execution_id, newAnnot.x - 0.00001, newAnnot.y - 0.00001, newAnnot.x + newAnnot.w + 0.00001, newAnnot.y + newAnnot.h + 0.000001);
            console.log(previous_execution);
            if (!jQuery.isEmptyObject(previous_execution)) {
                console.log(previous_execution);
                self.deleteAnnotations(previous_execution.execution_id, previous_execution.x - 0.00001, previous_execution.y - 0.00001, previous_execution.x + previous_execution.w + 0.00001, previous_execution.y + previous_execution.h + 0.000001);
            }
            previous_execution = {};
            alert("Discarded results");
            annotools.destroyMarkups();
        });

        jQuery("#saveWorkOrder").click(function (e) {
            e.preventDefault();
            previous_execution = {};
            alert("Saved results as: " + execution_id);
        });

        jQuery('#submitWorkOrder').click(function (e) {
            console.log("Submitting work order");

            // Trigger blurs in case user submits immediately after text-box change. J.B.
            jQuery('[id*="-result1"]').blur();
            jQuery('[id*="-result2"]').blur();
            jQuery('[id*="-result3"]').blur();
            jQuery('[id*="-result4"]').blur();
            jQuery('[id*="-result5"]').blur();

            if (!jQuery.isEmptyObject(previous_execution)) {
                console.log(previous_execution);
                self.deleteAnnotations(previous_execution.execution_id, previous_execution.x - 0.00001, previous_execution.y - 0.00001, previous_execution.x + previous_execution.w + 0.00001, previous_execution.y + previous_execution.h + 0.000001);
                previous_execution = {};
            }

            annotools.destroyMarkups();
            console.log("Destroyed markups!");

            e.preventDefault();

            //annotools.drawLayer.hide()
            //annotools.addMouseEvents()
            var username = 'lastlegion';
            //var execution_id = jQuery('#order-execution_id').val()
            var notes = jQuery('#order-notes').val();

            // TODO: remove if statement
            if (iid === 'TCGA-06-0148-01Z-00-DX1') {
                width = 26001;
                height = 27968
            }

            execution_id = "seg:r" + r + ":" + "w" + w + ":l" + l + ":u" + u + ":k" + k + ":j" + pj;

            roiGeoJSON.provenance.analysis.execution_id = execution_id;
            var order = {
                "data": {
                    "algorithm": execution_id,
                    "created_by": "user1",
                    "execution_id": execution_id,
                    "notes": "",
                    "order": {
                        "execution": {
                            "algorithm": execution_id,
                            "execution_id": execution_id,
                            "parameters": [
                                {
                                    "r": r * 1
                                },
                                {
                                    "w": w * 1
                                },
                                {"l": l * 1}, {"u": u * 1}, {"k": k * 1}, {"j": pj}
                            ]
                        },
                        "pr": r, "pw": w, "pl": l, "pu": u, "pk": k, "pj": pj,
                        "image": {
                            "case_id": iid,
                            "subject_id": iid,
                            "height": height,
                            "width": width,
                            "source": "image_server"
                        },
                        "metadata": {
                            "created_by": "user1",
                            "created_on": "1465592027497"
                        },
                        "roi": {
                            "full": "false",
                            "square": "false",
                            "pct": "false",
                            "h": roi_h,
                            "w": roi_w,
                            "x": roi_x,
                            "y": roi_y
                        }
                    },
                    "title": "title1 :: "
                },
                "type": "analysisJob"
            };

            console.log("order:", order);
            previous_execution = {
                "execution_id": execution_id,
                "y": newAnnot.y,
                "h": newAnnot.h,
                "w": newAnnot.w,
                "x": newAnnot.x
            };

            jQuery.post('api/Data/workOrder.php', order)
                .fail(function (err) {
                    alert("couldn't post order");
                    console.log("err:", err);
                })
                .done(function (res) {
                    var r = JSON.parse(res);
                    var id = r.id;
                    console.log("Order submitted!, Job ID: " + id);
                    jQuery('#workOrderCtrl').html(function () {
                        return "<br /><br />Processing...";
                    });
                    self.toolBar.titleButton.hide();
                    self.toolBar.ajaxBusy.show();

                    self.saveAnnot(roiGeoJSON);
                    //start polling
                    pollOrder(id, function (err, data) {

                        if (err) {
                            jQuery("#workOrderCtrl").html(function () {
                                return "<br /><br />Order failed! Couldn't process your order"
                            });
                        } else {
                            //jQuery('#workOrderCtrl').html(function(){return "<button class='btn' id='submitWorkOrder'>Save</button> <button class='btn id='discard'>Discard</button>";});
                            setTimeout(function () {
                                //self.drawLayer.hide();
                                //annotools.drawLayer.hide()
                                //annotools.addMouseEvents()
                                self.renderByExecutionId([execution_id]);
                                self.toolBar.ajaxBusy.hide();
                                self.toolBar.titleButton.show();
                                self.promptForWorkOrder(newAnnot, mode, annotools, ctx, roiGeoJSON);

                            }, 2000)
                        }
                    });
                })
        }.bind(newAnnot));

    }, 100);

};

/**
 * Poll Order
 *
 * @param id
 * @param cb
 */
function pollOrder(id, cb) {
    console.log("pollOrder_x");

    jQuery.get("api/Data/workOrder.php?id=" + id, function (data) {

        // console.log("data.state", data.state);

        if (data.state.contains("fail")) {
            cb({"error": "failed", data});
            return;
        }
        if (data.state.contains("comp")) { // is completed?
            cb(null, data);

        } else {
            // console.log("data.state 1", data.state);
            setTimeout(pollOrder(id, cb), 300);
        }
    });
}

/**
 * Prompt for annotation.
 *
 * @param newAnnot
 * @param mode
 * @param annotools
 * @param ctx
 */
annotools.prototype.promptForAnnotation = function (newAnnot, mode, annotools, ctx) {
    // console.log('Prompt for annotation');

    jQuery('#panel').show('slide');
    jQuery('html,body').css('cursor', 'default');
    // console.log("newAnnot", newAnnot);
    jQuery('#panel').html('' +
        "<div id = 'panelHeader'> <h4>Enter a new annotation </h4></div>"
        + "<div id='panelBody'>"
        + "<form id ='annotationsForm' action='#'>"
        + '</form>'

        + '</div>'
    );

    jQuery.get('api/Data/retrieveTemplate.php', function (data) {
        var schema = JSON.parse(data);
        schema = JSON.parse(schema)[0];
        // console.log("schema", schema);
        // console.log("retrieved template")
        var formSchema = {
            'schema': schema,
            'form': [
                '*',
                {
                    'type': 'submit',
                    'title': 'Submit'

                },
                {
                    'type': 'button',
                    'title': 'Cancel',
                    'onClick': function (e) {
                        // console.log("e:", e);
                        e.preventDefault();
                        // console.log("cancel")
                        cancelAnnotation()
                    }
                }
            ]
        };

        formSchema.onSubmit = function (err, val) {
            // Add form data to annotation
            newAnnot.properties.annotations = val;
            // console.log("newAnnot", newAnnot);
            // Post annotation
            annotools.addnewAnnot(newAnnot);

            // Hide Panel
            jQuery('#panel').hide('slide');
            annotools.drawLayer.hide();
            annotools.addMouseEvents();
            return false
        };

        var cancelAnnotation = function () {
            console.log('cancel handler');
            jQuery('#panel').hide('slide');
            annotools.drawLayer.hide();
            annotools.addMouseEvents()
        };

        jQuery('#annotationsForm').jsonForm(formSchema)
    })
};

/**
 * Add mouse events.
 */
annotools.prototype.addMouseEvents = function () {
    // console.log('Adding mouse events');

    window.addEventListener('mousemove', this.annotationHandler.handleMouseMove, false);
    window.addEventListener('mousedown', this.annotationHandler.handleMouseDown, false);
    window.addEventListener('mouseup', this.annotationHandler.handleMouseUp, false)

};

/**
 * Remove mouse events.
 */
annotools.prototype.removeMouseEvents = function () {
    // console.log("Removing events");

    // console.log(this.annotationHandler)
    window.removeEventListener('mousemove', this.annotationHandler.handleMouseMove, false);
    window.removeEventListener('mousedown', this.annotationHandler.handleMouseDown, false);
    window.removeEventListener('mouseup', this.annotationHandler.handleMouseUp, false)
    // window.removeEventListener('mouseup', this.getAnnot(), false)
};
