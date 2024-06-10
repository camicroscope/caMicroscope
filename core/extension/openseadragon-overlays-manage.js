// openseadragon-overlays-manager.js
// Draw
// proposal:
// test:
//

/**
 * @constructor
 * OpenSeadragon Overlays Manage Plugin 0.0.1 based on canvas overlay plugin.
 * A OpenSeadragon plugin that provides a way to mange multiple overlays. 
 * @param {Object} [options]
 *        Allows configurable properties to be entirely specified by passing an options object to the constructor.
 * @param {Object} options.viewer
 *        A instance of viewer in Openseadragon.
 * @param {Object} [zIndex=100]
 *        specifies the z-order of a positioned element
 */
(function($){
    if (!$) {
        $ = require('openseadragon');
        if (!$) {
            throw new Error('OpenSeadragon is missing.');
        }
    }

    // check version
    if (!$.version || $.version.major < 2) {
        throw new Error('This version of OpenSeadragonScalebar requires ' +
                'OpenSeadragon version 2.2.0+');
    }
    $.Viewer.prototype.overlaysManager = function(options) {
        if (!this.omanager) {
            options = options || {};
            options.viewer = this;
            this.omanager = new $.OverlaysManager(options);
        } else {
            //this.omanager.updateOptions(options);
        }
    };

    $.OverlaysManager = function(options) {
        this._viewer = options.viewer;
        this.overlays = [];
        this.events = {
            highlight:this.highlight.bind(this),
            click:this.pathClick.bind(this),
            updateView:this.updateView.bind(this),
            zooming:this._zooming.bind(this),
            panning:this._panning.bind(this),
            drawing:this._drawing.bind(this),
            contextmenu: this.rightClick.bind(this),
        }
        // -- create container div, and hover, display canvas -- // 
        this._containerWidth = 0;
        this._containerHeight = 0;
        
        // create container div
        this._div = document.createElement( 'div');
        this._div.style.position = 'absolute';
        this._div.style.left = 0;
        this._div.style.top = 0;
        this._div.style.width = '100%';
        this._div.style.height = '100%';
        this._div.style.display = 'none';
        this._div.style.transformOrigin = '0 0';
        this._div.style.transform = 'scale(1,1)';
        this._div.style.display = 'none';
        this._div.style.display = 'none';
        this._div.style.zIndex =  options.zIndex || 100;
        this._viewer.canvas.appendChild(this._div);
        // create display_canvas
        this._display_ = document.createElement('canvas');
        this._display_.style.position = 'absolute';
        this._display_.style.top = 0;
        this._display_.style.left = 0;
        this._display_ctx_ = this._display_.getContext('2d');
        this._div.appendChild(this._display_);
        // create hover_canvas
        this._hover_ = document.createElement('canvas');
        this._hover_.style.position = 'absolute';
        this._hover_.style.top = 0;
        this._hover_.style.left = 0;
        this._hover_ctx_ = this._hover_.getContext('2d');
        this._div.appendChild(this._hover_);
        // create edit_tool_canvas
        this._edit_tool_ = document.createElement('canvas');
        this._edit_tool_.style.position = 'absolute';
        this._edit_tool_.style.top = 0;
        this._edit_tool_.style.left = 0;
        this._edit_tool_ctx_ = this._edit_tool_.getContext('2d');
        this._div.appendChild(this._edit_tool_);
        // create edit_tool_hover_canvas
        this._edit_tool_hover_ = document.createElement('canvas');
        this._edit_tool_hover_.style.position = 'absolute';
        this._edit_tool_hover_.style.top = 0;
        this._edit_tool_hover_.style.left = 0;
        this._edit_tool_hover_ctx_ = this._edit_tool_hover_.getContext('2d');
        this._div.appendChild(this._edit_tool_hover_);

        this._center = this._viewer.viewport.getCenter(true);
        this._interval = null;
        this.updateView();
        //this._viewer.addHandler('update-viewport',this.updateView.bind(this));
        this._viewer.addHandler('open',this.updateView.bind(this));
        
        this._viewer.addHandler('resize',this.updateView.bind(this));
        this._viewer.addHandler('pan',this.events.panning);
        this._viewer.addHandler('zoom',this.events.zooming);
        this._viewer.addHandler('animation-finish', this.events.drawing);

        this._div.addEventListener('mousemove', this.events.highlight);
        this._div.addEventListener('click', this.events.click);
        this._div.addEventListener('contextmenu', this.events.contextmenu);
    }


    $.OverlaysManager.prototype = {

        _zooming:function(e){
            if(!this.hasShowOverlay()) return;
            if(!e.refPoint || e.zoom > this._viewer.viewport.getMaxZoom() || e.zoom < this._viewer.viewport.getMinZoom()) return;
            if(e.refPoint === true){
                e.refPoint = this._viewer.viewport.getCenter(true);
            }
            const viewportPoint = this._viewer.viewport.viewportToViewerElementCoordinates(e.refPoint);
            var viewportZoom = this._viewer.viewport.getZoom();
            var zoom = this._viewer.viewport.viewportToImageZoom(e.zoom);
            var scale = viewportZoom/this._zoom;
            if(scale == 1 || Math.abs(1 - scale) < 0.01) return; 
            this._div.style.transformOrigin = `${viewportPoint.x}px ${viewportPoint.y}px`;
            this._div.style.transform = `scale(${scale},${scale})`;


        },

        _panning:function(e){
            if(!this.hasShowOverlay()) return;
            let dx = this._center.x - e.center.x;
            let dy = this._center.y - e.center.y;
            const distance = this._viewer.viewport.deltaPixelsFromPoints(new $.Point(dx,dy), true);
            if(Math.abs(distance.x) < 0.01 && Math.abs(distance.y) < 0.01) return;
            let top = parseFloat(this._div.style.top);
            let left = parseFloat(this._div.style.left);
            this._div.style.top = `${top + distance.y}px`;
            this._div.style.left = `${left + distance.x}px`;
            this._center = e.center;
        },


        _drawing:function(e){
            if(!this.hasShowOverlay()) return;
            // debound if there are a 
            if(this.events['async']){
                clearTimeout(this._interval);
                this._interval = setTimeout(function(){
                    this.events['async'](this.events.updateView);
                }.bind(this),800);
                return;
            }
            this.updateView();
        },

        rightClick: function(e) {
            e.preventDefault();
            if (!this.editPathData) {
                return;
            }
            DrawHelper.clearCanvas(this._edit_tool_);
            const point = new OpenSeadragon.Point(e.clientX, e.clientY);
            const img_point = this._viewer.viewport.windowToImageCoordinates(point);
            // if hover on an edit point then remove the point
            for (let i = 0; i < this.editPointPathList.length; i++) {
                if (this.editPointPathList[i].contains(img_point.x, img_point.y)) {
                    this.editPointPathList = [];
                    if (this.editPathData.geometry.type === 'Polygon') {
                        // handle last point data
                        if (i === 0 || i === this.editPathData.geometry.coordinates[0].length - 1) {
                            this.editPathData.geometry.coordinates[0].splice(0,1);
                            this.editPathData.geometry.coordinates[0][this.editPathData.geometry.coordinates[0].length - 1] = this.editPathData.geometry.coordinates[0][0];
                        } else {
                            this.editPathData.geometry.coordinates[0].splice(i,1);
                        }
                        this.editPathData.geometry.coordinates[0].map((point) => {
                            const pointPath = new Path();
                            pointPath.arc(
                                point[0],
                                point[1], 
                                this._edit_tool_ctx_.radius * 2, 0, 2 * Math.PI
                            );
                            pointPath.closePath();
                            pointPath.strokeAndFill(this._edit_tool_ctx_);
                            this.editPointPathList.push(pointPath);
                        })
                    } else if (this.editPathData.geometry.type === 'LineString') {
                        // brush
                        this.editPathData.geometry.coordinates[0].splice(i,1);
                        this.editPathData.geometry.coordinates[0].map((point) => {
                            const pointPath = new Path();
                            pointPath.arc(
                                point[0],
                                point[1], 
                                this._edit_tool_ctx_.radius * 2, 0, 2 * Math.PI
                            );
                            pointPath.closePath();
                            pointPath.strokeAndFill(this._edit_tool_ctx_);
                            this.editPointPathList.push(pointPath);
                        })
                    }

                    // DrawHelper.draw(this._edit_tool_ctx_, [this.editPathData]);
                    this.drawOnCanvas(this.drawEditPoints, [this._edit_tool_ctx_, this.editPathData, this.editPointStyle]);
                    this.updateView();
                    this._viewer.raiseEvent('annot-edit-save',{id: this.overlays[this.currentEditIndex].data._id.$oid, slide: this.overlays[this.currentEditIndex].data.provenance.image.slide ,data:this.overlays[this.currentEditIndex].data});
                    return;
                }
            }
            if (this.editPathData.geometry.type === 'LineString') {
                const size = this.editPathData.properties.size;
                const topleft = [Math.floor(img_point.x/size[0])*size[0], Math.floor(img_point.y/size[1])*size[1]];
                const index = pointInPolygonVertex(this.editPathData.geometry.coordinates[0], topleft);
                if (index === false) {
                    this.editPathData.geometry.coordinates[0].push(topleft);
                } else {
                    this.editPathData.geometry.coordinates[0].splice(index, 1);
                }
            } else if (this.editPathData.geometry.type === 'Polygon') {
                const index = closestPointOnPolygon(this.editPathData.geometry.coordinates[0], img_point.x, img_point.y);
                this.editPathData.geometry.coordinates[0].splice(index + 1,0,[img_point.x, img_point.y]);
                this.editPathData.geometry.coordinates[0].map((point) => {
                    const pointPath = new Path();
                    pointPath.arc(
                        point[0],
                        point[1], 
                        this._edit_tool_ctx_.radius * 2, 0, 2 * Math.PI
                    );
                    pointPath.closePath();
                    pointPath.strokeAndFill(this._edit_tool_ctx_);
                    this.editPointPathList.push(pointPath);
                })
            }
            this.drawOnCanvas(this.drawEditPoints, [this._edit_tool_ctx_, this.editPathData, this.editPointStyle]);
            this.updateView();
            this._viewer.raiseEvent('annot-edit-save',{id: this.overlays[this.currentEditIndex].data._id.$oid, slide: this.overlays[this.currentEditIndex].data.provenance.image.slide ,data:this.overlays[this.currentEditIndex].data});
            // Get position
        },
        /**
         * @private
         * highlight the path if cursor on the path
         * @param  {Event} e the event
         */
        highlight:function(e){
            this.highlightEditPoint(e);
            if (this.onEditPoint) {
                this._div.style.cursor = 'pointer';
            } else {
                this._div.style.cursor = 'default';
            }
            DrawHelper.clearCanvas(this._hover_);
            const point = new OpenSeadragon.Point(e.clientX, e.clientY);
            const img_point = this._viewer.viewport.windowToImageCoordinates(point);
            for(let i = 0;i<this.overlays.length;i++){
                const layer = this.overlays[i];
                if(!layer.isShow) continue;

                if($.isArray(layer.data)){
                    for(let j = 0;j < layer.data.length;j++){
                        const path = layer.data[j].geometry.path;
                        const style = layer.data[j].properties.style;
                        const pathData = layer.data[j];
                        if(layer.hoverable&&path.contains(img_point.x,img_point.y)){
                            this.resize();
                            this.highlightPath = path;
                            this.highlightPathData = pathData;
                            this.highlightStyle = style;
                            this.highlightLayer = layer;
                            this.highlightLayer.data.selected = j;
                            this.currentHighlightIndex = i;
                            if (this.currentEditIndex !== this.currentHighlightIndex) {
                                this.drawOnCanvas(this.drawOnHover,[this._hover_ctx_,this._div,path,style]);
                            }
                            return;
                        }else{
                            this.highlightPath = null;
                            this.highlightStyle = null;
                            this.highlightPathData = null;
                            if(this.highlightLayer) {
                                this.highlightLayer.data.selected = null;
                                this.highlightLayer = null;
                            }
                            this.currentHighlightIndex = null;
                        }
                    }
                }
                if(!layer.data.geometries) continue;
                const features = layer.data.geometries.features;
                for(let j = 0;j < features.length;j++){
                    const path = features[j].geometry.path;
                    const style = features[j].properties.style;
                    const pathData = features[j];
                    this.subIndex = null;
                    if(layer.hoverable&&path&&path.contains(img_point.x,img_point.y)){
                        this.resize();
                        this.highlightPath = path;
                        this.highlightPathData = pathData;
                        this.highlightStyle = style;
                        this.highlightLayer = layer;
                        this.highlightLayer.data.selected = j;
                        this.currentHighlightIndex = i;
                        if (this.currentEditIndex !== this.currentHighlightIndex) {
                            this.drawOnCanvas(this.drawOnHover,[this._hover_ctx_,this._div,path,style]);
                        }
                        return;
                    }else{
                        this.highlightPath = null;
                        this.highlightStyle = null;
                        this.highlightLayer = null;
                        this.highlightPathData = null;
                        this.currentHighlightIndex = null;
                    }
                }
            }
        },
        /**
         * @private
         * pathClick 
         * @param  {Event} e the event
         */
        pathClick:function(e){
            if (this.onEdit) {
                this.onEditPointMouseUp(e);
                this.editPointStyle = this.highlightStyle || this.editPointStyle;
                this.drawOnCanvas(this.drawEditPoints, [this._edit_tool_ctx_, this.editPathData, this.editPointStyle]);
                this.updateView();
                return;
            }
            else if(this.highlightLayer&&this.highlightLayer.clickable) {
                if (this.currentEditIndex !== this.currentHighlightIndex) {
                    this._viewer.raiseEvent('canvas-lay-click',{position:{x:e.clientX, y:e.clientY}, data:this.highlightLayer?this.highlightLayer.data:null});
                    if (this.currentEditIndex) {
                        this._viewer.raiseEvent('annot-edit-save',{id: this.overlays[this.currentEditIndex].data._id.$oid, slide: this.overlays[this.currentEditIndex].data.provenance.image.slide ,data:this.overlays[this.currentEditIndex].data});
                    }
                    this.currentEditIndex = this.currentHighlightIndex;
                }
                this._viewer.setMouseNavEnabled(false);
                this._div.addEventListener('mousemove', this.onEditPointMouseMove.bind(this));
                this._div.addEventListener('mouseout', this.onEditPointMouseUp.bind(this));
                this._div.addEventListener('mousedown', this.onEditPointMouseDown.bind(this));
            } else {
                try {
                    this._viewer.raiseEvent('annot-edit-save',{id: this.overlays[this.currentEditIndex].data._id.$oid, slide: this.overlays[this.currentEditIndex].data.provenance.image.slide ,data:this.overlays[this.currentEditIndex].data});
                } catch (error) {}
                this.currentEditIndex = this.currentHighlightIndex;
                this._viewer.setMouseNavEnabled(true);
                this._div.removeEventListener('mousemove', this.onEditPointMouseMove.bind(this));
                this._div.removeEventListener('mouseout', this.onEditPointMouseUp.bind(this));
                this._div.removeEventListener('mousedown', this.onEditPointMouseDown.bind(this));
            }
            this.editPathData = this.highlightPathData;
            this.editStyle = this.highlightStyle;
            this.editPointStyle = this.highlightStyle || this.editPointStyle;
            this.drawOnCanvas(this.drawEditPoints, [this._edit_tool_ctx_, this.editPathData, this.editPointStyle]);
            this.updateView();
        },

        drawEditPoints: function(ctx, pathData, style) {
            if (!pathData) return;

            this.editPointPathList = [];
            pathData = pathData.geometry.coordinates;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.fillStyle = hexToRgbA(style.color, 0.7);
            ctx.strokeStyle = style.color;
            ctx.lineWidth = style.lineWidth;

            if (this.editPathData.geometry.type === 'Point') {
                const pointPath = new Path();
                pointPath.arc(
                    pathData[0],
                    pathData[1], 
                    ctx.radius * 2, 0, 2 * Math.PI
                );
                pointPath.closePath();
                pointPath.strokeAndFill(ctx);
                this.editPointPathList.push(pointPath);
            } else if (this.editPathData.geometry.type === 'Circle') {
                // TODO editor
                console.log('drawEditPoints Circle');
            } else if (this.editPathData.geometry.type === 'Ellipse') {
                // TODO editor
                console.log('drawEditPoints Ellipse');
            } else {
                pathData[0].map((point) => {
                    const pointPath = new Path();
                    pointPath.arc(
                        point[0],
                        point[1], 
                        ctx.radius * 1.5, 0, 2 * Math.PI
                    );
                    pointPath.closePath();
                    pointPath.strokeAndFill(ctx);
                    this.editPointPathList.push(pointPath);
                })
            }
        },

        highlightEditPoint: function(e) {
            DrawHelper.clearCanvas(this._edit_tool_hover_);
            if (!this.editPathData) return;
            if (!this.editPointPathList) return;
            this.editPointStyle = this.highlightStyle || this.editPointStyle;
            const point = new OpenSeadragon.Point(e.clientX, e.clientY);
            const img_point = this._viewer.viewport.windowToImageCoordinates(point);
            for(let i = 0;i<this.editPointPathList.length;i++){
                const pointPath = this.editPointPathList[i];
                if (pointPath.contains(img_point.x, img_point.y)) {
                    this.resize();
                    this.drawOnCanvas(this.drawOnEditHover, [this._edit_tool_hover_ctx_, this._div, pointPath, this.editPointStyle]);
                    this.onEditPoint = true;
                    return;
                } else {
                    this.onEditPoint = false;
                }
            }
        },

        drawOnEditHover:function(ctx,div,path,style){
            if (!style) return;
            div.style.cursor = 'move';
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.fillStyle = hexToRgbA(style.color, 1);
            ctx.strokeStyle = style.color;
            
            const imagingHelper = this._viewer.imagingHelper;
            const lineWidth = (imagingHelper.physicalToDataX(4) - imagingHelper.physicalToDataX(0))>> 0;
            ctx.lineWidth = lineWidth;
            path.stroke(ctx);
            path.fill(ctx);
        },

        onEditPointMouseDown: function(e) {
            let isRight;
            e = e || window.event;
            if ('which' in e)
            // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
            {
                isRight = e.which == 3;
            } else if ('button' in e)
            // IE, Opera
            {
                isRight = e.button == 2;
            }
            if (e.ctrlKey || isRight) return;
            const point = new OpenSeadragon.Point(e.clientX, e.clientY);
            const img_point = this._viewer.viewport.windowToImageCoordinates(point);
            for (let i = 0; i < this.editPointPathList.length; i++) {
                if (this.editPointPathList[i].contains(img_point.x, img_point.y)) {
                    this.onEdit = true;
                    this.onEditIndex = i;
                    return;
                }
            }
            this.onEdit = false;
            this.onEditIndex = null;
        },

        onEditPointMouseMove: function(e) {
            if (!this.onEdit) return;
            DrawHelper.clearCanvas(this._edit_tool_);
            const point = new OpenSeadragon.Point(e.clientX, e.clientY);
            const img_point = this._viewer.viewport.windowToImageCoordinates(point);
            // create new edit path data
            this.editPointPathList = [];
            if (this.editPathData.geometry.type === 'Polygon') {
                // handle last point data
                if (this.onEditIndex === 0 || this.onEditIndex === this.editPathData.geometry.coordinates[0].length - 1) {
                    this.editPathData.geometry.coordinates[0][0] = [img_point.x, img_point.y];
                    this.editPathData.geometry.coordinates[0][this.editPathData.geometry.coordinates[0].length - 1] = [img_point.x, img_point.y];
                } else {
                    this.editPathData.geometry.coordinates[0][this.onEditIndex] = [img_point.x, img_point.y];
                }
                this.editPathData.geometry.coordinates[0].map((point) => {
                    const pointPath = new Path();
                    pointPath.arc(
                        point[0],
                        point[1], 
                        this._edit_tool_ctx_.radius * 2, 0, 2 * Math.PI
                    );
                    pointPath.closePath();
                    pointPath.strokeAndFill(this._edit_tool_ctx_);
                    this.editPointPathList.push(pointPath);
                })
            } else if (this.editPathData.geometry.type === 'Point') {
                this.editPathData.geometry.coordinates[0] = img_point.x;
                this.editPathData.geometry.coordinates[1] = img_point.y;
                const pointPath = new Path();
                pointPath.arc(
                    this.editPathData.geometry.coordinates[0],
                    this.editPathData.geometry.coordinates[1], 
                    this._edit_tool_ctx_.radius * 2, 0, 2 * Math.PI
                );
                pointPath.closePath();
                pointPath.strokeAndFill(this._edit_tool_ctx_);
                this.editPointPathList.push(pointPath);
            } else if (this.editPathData.geometry.type === 'Circle') {
                // TODO editor
                console.log('onEditPointMouseMove Circle');
            } else if (this.editPathData.geometry.type === 'Ellipse') {
                // TODO editor
                console.log('onEditPointMouseMove Ellipse');
            } else {
                // brush
                this.editPathData.geometry.coordinates[0][this.onEditIndex] = [img_point.x, img_point.y];
                this.editPathData.geometry.coordinates[0].map((point) => {
                    const pointPath = new Path();
                    pointPath.arc(
                        point[0],
                        point[1], 
                        this._edit_tool_ctx_.radius * 2, 0, 2 * Math.PI
                    );
                    pointPath.closePath();
                    pointPath.strokeAndFill(this._edit_tool_ctx_);
                    this.editPointPathList.push(pointPath);
                })
            }

            DrawHelper.draw(this._edit_tool_ctx_, [this.editPathData]);
        },

        onEditPointMouseUp: function(e) {
            if (this.editPathData?.geometry.type === 'LineString') {
                if (!this.onEdit) return;
                DrawHelper.clearCanvas(this._edit_tool_);
                const point = new OpenSeadragon.Point(e.clientX, e.clientY);
                const img_point = this._viewer.viewport.windowToImageCoordinates(point);
                const size = this.editPathData.properties.size;
                const topleft = [Math.floor(img_point.x/size[0])*size[0], Math.floor(img_point.y/size[1])*size[1]];
                this.editPathData.geometry.coordinates[0][this.onEditIndex] = topleft;
                this.editPathData.geometry.coordinates[0].map((point) => {
                    const pointPath = new Path();
                    pointPath.arc(
                        point[0],
                        point[1], 
                        this._edit_tool_ctx_.radius * 2, 0, 2 * Math.PI
                    );
                    pointPath.closePath();
                    pointPath.strokeAndFill(this._edit_tool_ctx_);
                    this.editPointPathList.push(pointPath);
                })
            }
            this.onEdit = false;
        },

        /**
         * setOverlays
         * add a collection of overlays by geting the data collection
         * @param {Array} overlays the collection of data of the overlays
         */
        setOverlays:function(overlays){
            if(!$.isArray(overlays)) return;
            for(let i = 0;i<overlays.length;i++){
                this.addOverlay(overlays[i]);
            }
        },


        getViewBoundBoxInData: function() {
            const imagingHelper = this._viewer.imagingHelper;
            const { x, y } = imagingHelper._viewportOrigin;
            const width = imagingHelper._viewportWidth;
            const height = this._viewer.imagingHelper._viewportHeight;

            const x1 = x + width;
            const y1 = y + height;
            const min = imagingHelper.logicalToDataPoint({x:x,y:y})
            const max = imagingHelper.logicalToDataPoint({x:x1,y:y1})
            return { min, max };
        },
        /**
         * @private
         * resize the canvas and redraw marks on the proper place
         */
        resize: function() {
            this._div.style.top = 0;
            this._div.style.left = 0;
            this._div.style.transformOrigin = '0 0';
            this._div.style.transform = 'scale(1,1)';
            this._center = this._viewer.viewport.getCenter(true);
            this._zoom = this._viewer.viewport.getZoom(true);

            // get global variable for renderer
            const imagingHelper = this._viewer.imagingHelper;
            this._display_ctx_._lw = (imagingHelper.physicalToDataX(1) - imagingHelper.physicalToDataX(0)) >> 0;
            this._display_ctx_.radius = (imagingHelper.physicalToDataX(3) - imagingHelper.physicalToDataX(0)) >> 0;
            this._display_ctx_.lineWidth = (imagingHelper.physicalToDataX(1) - imagingHelper.physicalToDataX(0)) >> 0;;       
            this._display_ctx_.viewBoundBoxInData = this.getViewBoundBoxInData()
            this._display_ctx_.imagingHelper = imagingHelper;
            this._edit_tool_ctx_.radius = (imagingHelper.physicalToDataX(3) - imagingHelper.physicalToDataX(0)) >> 0;
            // 
            if (this._containerWidth !== this._viewer.container.clientWidth) {
                this._containerWidth = this._viewer.container.clientWidth;
                this._div.setAttribute('width', this._containerWidth);
                this._hover_.setAttribute('width', this._containerWidth);
                this._display_.setAttribute('width', this._containerWidth);
                this._edit_tool_.setAttribute('width', this._containerWidth);
                this._edit_tool_hover_.setAttribute('width', this._containerWidth);
            }

            if (this._containerHeight !== this._viewer.container.clientHeight) {
                this._containerHeight = this._viewer.container.clientHeight;
                this._div.setAttribute('height', this._containerHeight);
                this._hover_.setAttribute('height', this._containerHeight);
                this._display_.setAttribute('height', this._containerHeight);
                this._edit_tool_.setAttribute('height', this._containerHeight);
                this._edit_tool_hover_.setAttribute('height', this._containerHeight);
            }
            this._viewportOrigin = new $.Point(0, 0);
            var boundsRect = this._viewer.viewport.getBounds(true);
            this._viewportOrigin.x = boundsRect.x;
            this._viewportOrigin.y = boundsRect.y * this.imgAspectRatio;
            
            this._viewportWidth = boundsRect.width;
            this._viewportHeight = boundsRect.height * this.imgAspectRatio;
            var image1 = this._viewer.world.getItemAt(0);
            this.imgWidth = image1.source.dimensions.x;
            this.imgHeight = image1.source.dimensions.y;
            this.imgAspectRatio = this.imgWidth / this.imgHeight;
        },

        /**
         * @private
         * drawOnCanvas draw marks on canvas
         * @param  {Canvas} ctx  a canvas' 2d context that the marks draw on
         * @param  {Function} drawFuc [description]
         * @return {[type]}         [description]
         */
        drawOnCanvas:function(drawFuc,args){
            var viewportZoom = this._viewer.viewport.getZoom(true);
            var image1 = this._viewer.world.getItemAt(0);
            var zoom = image1.viewportToImageZoom(viewportZoom);

            var x=((this._viewportOrigin.x/this.imgWidth-this._viewportOrigin.x )/this._viewportWidth)*this._containerWidth;
            var y=((this._viewportOrigin.y/this.imgHeight-this._viewportOrigin.y )/this._viewportHeight)*this._containerHeight;

            DrawHelper.clearCanvas(args[0].canvas);
            args[0].translate(x,y);
            args[0].scale(zoom,zoom);
            drawFuc.apply(this,args);
            //this.drawOnDisplay(this._display_ctx_);
            args[0].setTransform(1, 0, 0, 1, 0, 0);
        },

        /**
         * hasShowOverlay determine that there is a overlay to show or not
         * @return {Boolean} return true if has overlay to show. Otherwise, return false.
         */
        hasShowOverlay:function(){
            return this.overlays.some(lay => lay.isShow == true);
        },

        /**
         * @private
         * drawOnDisplay draw marks on display canvas
         * @param  {Canvas} ctx  a canvas' 2d context that the marks draw on
         */
        drawOnDisplay:function(ctx){
            for (var i = 0; i < this.overlays.length; i++) {
                const layer = this.overlays[i];
                if(layer.isShow) layer.onDraw(ctx);
            }
        },

        viewBoundFilter: function(layer) {
          // current view's bounding box against a patch
          if (this._getCanvasBoundBox)
          return $.isIntersectBbox(this._getCanvasBoundBox, {
            x: x,
            y: y,
            width: this._size[0],
            height: this._size[1]
          });
          else
            console.log(this._getCanvasBoundBox);
        },
        /**
         * @private
         * drawOnHover draw marks on hover canvas
         * @param  {Canvas} ctx  a canvas' 2d context that the marks draw on
         * @param  {Path/Path2D} path  the data of a path/marks
         * @param  {Object} style  the style of drawing
         */
        drawOnHover:function(ctx,div,path,style){
            div.style.cursor = 'point';
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.fillStyle = hexToRgbA(style.color, 0.2);
            ctx.strokeStyle = style.color;
            ctx.lineWidth = style.lineWidth;
            

            if(style.isFill ==undefined || style.isFill){
                const imagingHelper = this._viewer.imagingHelper;
                const lineWidth = (imagingHelper.physicalToDataX(2) - imagingHelper.physicalToDataX(0))>> 0;
                ctx.lineWidth = lineWidth;
                path.stroke(this._hover_ctx_);
                path.fill(this._hover_ctx_);

            }else{
                const imagingHelper = this._viewer.imagingHelper;
                const lineWidth = (imagingHelper.physicalToDataX(2) - imagingHelper.physicalToDataX(0))>> 0;
                ctx.lineWidth = lineWidth;
                path.stroke(this._hover_ctx_);
            }
            
        },

        /**
         * updateView update all canvas according to the current states of the osd'viewer
         */
        updateView:function(){
            this.resize();
            if(this.hasShowOverlay()) {
                this._div.style.display = 'block';
            }else{
                this._div.style.display = 'none';
                return;
            };
            this.drawOnCanvas(this.drawOnDisplay,[this._display_ctx_]);
            if(this.highlightPath&& this.highlightLayer&& this.highlightLayer.hoverable)this.drawOnCanvas(this.drawOnHover,[this._hover_ctx_,this._div,this.highlightPath,this.highlightStyle]);
            // if(this.editPath&& this.highlightLayer&& this.editPathData)this.drawOnCanvas(this.drawEditPoints, [this._edit_tool_ctx_, this._div, this.editPathData, this.editPath, this.editStyle]);
        },

        /**
         * 
         * addOverlay add a new over lay
         * @param {Object} options
         *        allows configurable properties to be entirely specified by passing an options object to the constructor.
         * @param {String} options.id
         *        the overlay's id
         * @param {Object} options.data
         *        the data that is used to describe the overlay
         * @param {object} options.renderer
         *        the renderer to render the overlay
         * 
         */
        addOverlay:function(options){ // id, data, render
            if(this.overlays.find(layer => layer.id == options.id)){
              console.warn('duplicate overlay ID');
              return;
            }
            options.viewer = this._viewer
            const lay = new Overlay(options)
            this.overlays.push(lay);
            // TODO redraw

            return lay;
            
        },

        /**
         * remove a overlay from the manager
         * @param  {String} id overlay's id
         * @return {Boolean} true - remove success. false - remove fail
         */
        removeOverlay:function(id){
            const index = this.overlays.findIndex(layer => layer.id == id);
            if (index > -1) {
              this.overlays.splice(index, 1);
              this.updateView();
              //const sort = this.overlays.map(layer=>layer.id);
              //this.setSort(sort.reverse());
              return true;
            }
            
            return false;
        },
        /**
         * get Overlay by id
         * @param  {String} id the overlay's id
         * @return {Object}   
         */
        getOverlay:function(id){
            return this.overlays.find(layer => layer.id == id);
 
        },


        sort:function(){
            // for (var i = data.length - 1; i >= 0; i--) {
            //     const id = data[i];
            //     const layer = this.getOverlayer(id);
            //     const index = data.length - i;
            //     layer.index = index;
            // }
        },

        clearOverlays:function(){
            this.overlays = [];
        },

        clearCanvas:function(){
            DrawHelper.clearCanvas(this._display_);
            DrawHelper.clearCanvas(this._hover_);
            DrawHelper.clearCanvas(this._edit_tool_);
            DrawHelper.clearCanvas(this._edit_tool_hover_);
        },

        clear:function(){
            this.clearCanvas();
            this.clearOverlays();
        },
        /**
         * Function to destroy the instance of OverlayManager and clean up everything created by OverlayManager.
         *
         * Example:
         * var omanger = OverlayManager({
         *   [...]
         * });
         *
         * //when you are done with the omanger:
         * omanger.destroy();
         * omanger = null; //important
         *
         */
        destroy:function(){
            for(const key in this){
                this[key] = null;
            }
        }
    }

    
    $.extend( $.OverlaysManager.prototype, $.EventSource.prototype);


    /**
     * @constructor
     * Overlay a instance of overlay.
     * @param {Object} options
     *        allows configurable properties to be entirely specified by passing an options object to the constructor.
     * @param {Object} options.id
     *        the overlay's id
     * @param {Object} options.data
     *        the data that is used to describe the overlay
     * @param {Object} options.render
     *        the render that is used to render the overlay
     */
    var Overlay = function(options){
        this.className = 'Overlay'
        if(!options){
            console.error(`${this.className}: No Options.`);
            return;
        }
        if(!options.id){
            console.error(`${this.className}: No ID.`);
            return;
        }
        if(!options.data){
            console.error(`${this.className}: No Data.`);
            return;
        }
        if(!options.render || typeof options.render !== 'function'){
            console.error(`${this.className}: No Render or Illegal.`);
            return;
        }
        this.id = options.id;
        this.data = options.data; 
        this.render = options.render;
        //this.clickable = options.clickable || true;
        //this.hoverable = options.hoverable || true;
        this.viewer = options.viewer;
        if(options.clickable!=null && options.clickable == false){
            this.clickable = options.clickable
        }else{
            this.clickable = true;
        }        
        if(options.hoverable!=null && options.hoverable == false){
            this.hoverable = options.hoverable
        }else{
            this.hoverable = true;
        }
        if(options.isShow!=null && options.isShow == false){
            this.isShow = options.isShow
        }else{
            this.isShow = true;
        }
        //this.isShow = options.isShow || true;
    }

    Overlay.prototype = {
        /**
         * onDraw draw overlay
         * @param  {2DContext} ctx
         *         the context that is used to draw shapes
         * @param  {[type]} data 
         *         the data that is used to describe the overlay
         */
        onDraw:function( ctx, data){
            if(data) this.data = data;
            this.render( ctx, this.data);
        }
    }






})(OpenSeadragon)