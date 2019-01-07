// Draw
// proposal:
// test:
// 1. create canvasDraw twins, only one instance that keeps in the viewer
// 2. reset options style = opt.style drawOn/Off -> drawOff
// 3. getImagePaths -> image coordinates
// 4. getViewportPaths -> viewport coordinates
// 5. redo
// 6. undo
// 7. clear status
// 8. clear canvas
// 9. clearAll
// 10. change zoom -> undo -> redo == paths are correct
//


/**
 * @constructor
 * OpenSeadragon Draw plugin 0.0.1 based on canvas overlay plugin.
 * A OpenSeadragon pulgin that provides a way to make/draw multiple marks on the images and transforms the marks to the collection in geojson form.
 * @param {Object} [options]
 *        Allows configurable properties to be entirely specified by passing an options object to the constructor.
 * @param {Object} options.viewer
 *        A instance of viewer in Openseadragon.
 * @param {String} [options.drawMode='free']
 *        Drawing mode, there are 4 modes on drawing. 'free' - free draw. 'square' - draw as a square.
 *        'rectangle' - draw as a rectangle. 'line' - draw a line.
 * @param {Object} [options.style]
 *        The style of the draw on a image
 * @param {String} [options.style.color='#7CFC00']
 *        The color of lines
 * @param {Object} [options.style.lineJoin='round']
 *        how two connecting segments in a shape are joined together. There are 3 possible values: 'bevel', 'round', 'miter'
 * @param {Object} [options.style.lineCap='round']
 *        how the end points of every line are drawn. There are three possible values: 'butt', 'round' and 'square'
 * @param {Object} [zIndex=200]
 *        specifies the z-order of a positioned element
 */
(function($) {

    if (!$) {
        $ = require('openseadragon');
        if (!$) {
            throw new Error('OpenSeadragon is missing.');
        }
    }

    // check version
    if (!$.version || $.version.major < 2) {
        throw new Error('This version of OpenSeadragonCanvasDrawOverlay requires ' +
                'OpenSeadragon version 2.2.0+');
    }
    // initialize the instance of DrawOverlay
    $.Viewer.prototype.canvasDraw = function(options) {
        if (!this.canvasDrawInstance) {
            // declare and initialize the instance based on the options
            options = options || {};
            options.viewer = this;
            this.canvasDrawInstance = new $.CanvasDraw(options);
        } else {
            // update the options
            this.canvasDrawInstance.updateOptions(options);
        }
    };


    $.CanvasDraw = function(options) {

        this._viewer = options.viewer;
        // flag
        // draw mode on/off
        this.isOn = false;
        // is drawing things
        this.isDrawing = false;

        // create supplies free, square, rectangle, line
        this.drawMode = options.drawMode || 'free'; // 'free', 'square', 'rect', 'line'
        // ctx styles opt
        this.style = {
            color:'#7CFC00',
            //lineWidth:3,
            lineJoin:'round', // "bevel" || "round" || "miter"
            lineCap:'round', // "butt" || "round" || "square"
            isFill:true,
        };

        if(options.style && options.style.color) this.style.color = options.style.color;
        //if(options.style && options.style.lineWidth) this.style.lineWidth = options.style.lineWidth;
        if(options.style && options.style.lineJoin) this.style.lineJoin = options.style.lineJoin;
        if(options.style && options.style.lineCap) this.style.lineCap = options.style.lineCap;
        if(options.style && options.style.isFill!= undefined && options.style.isFill == false) this.style.isFill = false;
        this.events = {};
        // global events list for easily remove and add
        this._event = {
          start:this.startDrawing.bind(this),
          stop:this.stopDrawing.bind(this),
          drawing:this.drawing.bind(this),
          updateView:this.updateView.bind(this)
        };

        // status data
        this._last = [0,0];
        this._current_path_ = {};
        this._draws_data_ = [];
        this._path_index = 0;


        // -- create container div, and draw, display canvas -- //
        this._containerWidth = 0;
        this._containerHeight = 0;

        // container div
        this._div = document.createElement( 'div');
        this._div.style.position = 'absolute';
        this._div.style.left = 0;
        this._div.style.top = 0;
        this._div.style.width = '100%';
        this._div.style.height = '100%';
        this._div.style.display = 'none';
        this._div.style.zIndex =  options.zIndex || 200;
        this._viewer.canvas.appendChild(this._div);
        // draw canvas
        this._draw_ = document.createElement('canvas');
        this._draw_.style.position = 'absolute';
        this._draw_.style.top = 0;
        this._draw_.style.left = 0;
        this._draw_ctx_ = this._draw_.getContext('2d');
        this._div.appendChild(this._draw_);

        // display vanvas
        this._display_ = document.createElement('canvas');
        this._display_.style.position = 'absolute';
        this._display_.style.top = 0;
        this._display_.style.left = 0;
        this._display_ctx_ = this._display_.getContext('2d');
        this._div.appendChild(this._display_);

        this.updateView();

    }
    // ----------
    $.CanvasDraw.prototype = {

        /**
         * updateView update all canvas according to the current states of the osd'viewer
         */
        updateView: function(){
            this.resize();
            this._updateCanvas();
        },

        /**
         * update the draw according to the options
         * @param  {Object} options
         *         see the options in constructor.
         *
         */
        updateOptions:function(options){
            // draw mode on/off
            this.isOn = false;
            // is drawing things
            this.isDrawing = false;

            // creat supplies free, square, rectangle, line
            this.drawMode = options.drawMode || 'rect'; // 'free', 'square', 'rect', 'line'
            // ctx styles opt
            this.style = {
                color:'#7CFC00',
                //lineWidth:0,
                lineJoin:'round', // "bevel" || "round" || "miter"
                lineCap:'round', // "butt" || "round" || "square"
                isFill:true
            };

            if(options.style && options.style.color) this.style.color = options.style.color;
            //if(options.style && options.style.lineWidth) this.style.lineWidth = options.style.lineWidth;
            if(options.style && options.style.lineJoin) this.style.lineJoin = options.style.lineJoin;
            if(options.style && options.style.lineCap) this.style.lineCap = options.style.lineCap;
            if(options.style && options.style.isFill!= undefined && options.style.isFill == false) this.style.isFill = false;

            this._div.style.display = 'none';
            this._div.style.zIndex =  options.zIndex || 500;
            this.clearStatus();
            this.clearCanvas();
            this.drawOff();

        },

        /**
         * clearStatus clear all datas that are used to associate with the feature collection
         */
        clearStatus:function(){
            this._last = [0,0];
            this._current_path_ = {};
            this._draws_data_ = [];
            this._path_index = 0;
        },
        /**
         * @private
         * drawOnCanvas draw marks on canvas
         * @param  {Canvas} ctx  a canvas' 2d context that the marks draw on
         * @param  {Function} drawFuc [description]
         * @return {[type]}         [description]
         */
        drawOnCanvas:function(ctx,drawFuc){
            var viewportZoom = this._viewer.viewport.getZoom(true);
            var image1 = this._viewer.world.getItemAt(0);
            var zoom = image1.viewportToImageZoom(viewportZoom);

            var x=((this._viewportOrigin.x/this.imgWidth-this._viewportOrigin.x )/this._viewportWidth)*this._containerWidth;
            var y=((this._viewportOrigin.y/this.imgHeight-this._viewportOrigin.y )/this._viewportHeight)*this._containerHeight;

            DrawHelper.clearCanvas(ctx.canvas);
            ctx.translate(x,y);
            ctx.scale(zoom,zoom);
            //
            drawFuc();
            //
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        },

        /**
         * clearCanvas clear entire canvas which includes display and draw canvas
         */
        clearCanvas: function() {
            DrawHelper.clearCanvas(this._display_);
            DrawHelper.clearCanvas(this._draw_);
        },

        /**
         * @private
         * resize the canvas and redraw marks on the proper place
         */
        resize: function() {
            if (this._containerWidth !== this._viewer.container.clientWidth) {
                this._containerWidth = this._viewer.container.clientWidth;
                this._div.setAttribute('width', this._containerWidth);
                this._draw_.setAttribute('width', this._containerWidth);
                this._display_.setAttribute('width', this._containerWidth);
            }

            if (this._containerHeight !== this._viewer.container.clientHeight) {
                this._containerHeight = this._viewer.container.clientHeight;
                this._div.setAttribute('height', this._containerHeight);
                this._draw_.setAttribute('height', this._containerHeight);
                this._display_.setAttribute('height', this._containerHeight);
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

            var iamgeBounds = this._viewer.viewport.viewportToImageRectangle(boundsRect);

            this.style.lineWidth = 2*Math.round(Math.max(iamgeBounds.width/this._containerWidth,iamgeBounds.height/this._containerHeight ));
        },

        /**
         * @private
         * _updateCanvas transform and scale the cavans bases on the movement of the view
         */
        _updateCanvas: function() {
            var viewportZoom = this._viewer.viewport.getZoom(true);
            var image1 = this._viewer.world.getItemAt(0);
            var zoom = image1.viewportToImageZoom(viewportZoom);

            var x=((this._viewportOrigin.x/this.imgWidth-this._viewportOrigin.x )/this._viewportWidth)*this._containerWidth;
            var y=((this._viewportOrigin.y/this.imgHeight-this._viewportOrigin.y )/this._viewportHeight)*this._containerHeight;

            this.clearCanvas();
            this._display_.getContext('2d').translate(x,y);
            this._display_.getContext('2d').scale(zoom,zoom);
            this._display_ctx_.lineWidth = this.style.lineWidth;
            DrawHelper.draw(this._display_ctx_,this._draws_data_.slice(0,this._path_index));
            this._display_.getContext('2d').setTransform(1, 0, 0, 1, 0, 0);
        },

        /**
         * turn on drawing functionality.
         */
        drawOn:function(){
            // stop turning on draw mode if already turn on
            if(this.isOn === true) return;
            // clock viewer
            //this._viewer.controls.bottomright.style.display = 'none';
            this.updateView();
            this._viewer.setMouseNavEnabled(false);
            this._div.style.cursor = 'pointer';
            this._div.style.display = 'block';

            // add Events
            this._div.addEventListener('mousemove', this._event.drawing);
            this._div.addEventListener('mouseout',this._event.stop);
            this._div.addEventListener('mouseup',this._event.stop);
            this._div.addEventListener('mousedown',this._event.start);

            this._viewer.addHandler('update-viewport',this._event.updateView);
            this._viewer.addHandler('open',this._event.updateView);
            //
            this.isOn = true;

            this._viewer.raiseEvent('canvas-draw-on',{draw:true});

        },

        /**
         * turn off drawing functionality.
         */
        drawOff:function(){
            // stop turning off draw mode if already turn off
            //if(this.contextMenu) this.contextMenu.
            if(this.isOn === false) return;
            // unclock viewer
            //this._viewer.controls.bottomright.style.display = '';
            this._viewer.setMouseNavEnabled(true);
            this._div.style.cursor = 'default';
            this._div.style.display = 'none';

            // remove Events
            this._div.removeEventListener('mousemove', this._event.drawing);
            this._div.removeEventListener('mouseout',this._event.stop);
            this._div.removeEventListener('mouseup',this._event.stop);
            this._div.removeEventListener('mousedown',this._event.start);

            this._viewer.removeHandler('update-viewport',this._event.updateView);
            this._viewer.removeHandler('open',this._event.updateView);

            this.isOn = false;

            this._viewer.raiseEvent('canvas-draw-off',{draw:false});
        },

        /*
        * @private
        * start drawing on the drawing canvas and creata the collection that store the marks in geojson form
        */
        startDrawing:function(e){


            //prevent to open context menu when click on drawing mode
            let isRight;
            e = e || window.event;
            if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
                isRight = e.which == 3;
            else if ("button" in e)  // IE, Opera
                isRight = e.button == 2;
            if(e.ctrlKey || isRight) return;

            this.raiseEvent('start-drawing',{originalEvent:e});
            if(this.stop){
                this.stop = false;
                return;
            }
            // close style context menu if it open
            if(this.contextMenu)this.contextMenu.close(e);
            let point = new OpenSeadragon.Point(e.clientX, e.clientY);
            let img_point = this._viewer.viewport.windowToImageCoordinates(point);

            if(0 > img_point.x || this.imgWidth < img_point.x || 0 > img_point.y || this.imgHeight < img_point.y )return;
            // start drawing
            this.isDrawing = true;
            this._draw_.style.cursor = 'crosshair'


            this._last = [Math.round(img_point.x),Math.round(img_point.y)]
            // first feature within
            this.__newFeature(this._last.slice());
        },

        /**
         * @private
         * each drawing and collects the path data as point.
         * @param  {Event} e the event
         */
        drawing:function(e){
            if(!this.isDrawing || !this.isOn) return;
            // drawing
            let point = new OpenSeadragon.Point(e.clientX, e.clientY);
            let img_point = this._viewer.viewport.windowToImageCoordinates(point);
            if(0 > img_point.x || this.imgWidth < img_point.x || 0 > img_point.y || this.imgHeight < img_point.y )return;
            img_point.x = Math.round(img_point.x);
            img_point.y = Math.round(img_point.y);
            //set style for ctx
            DrawHelper.setStyle(this._draw_ctx_,this.style);
            this._draw_ctx_.fillStyle = hexToRgbA(this.style.color,0.3);
            switch (this.drawMode) {
              case 'free':
                // draw line
                this._last = [img_point.x,img_point.y];
                // store current point
                this._current_path_.geometry.coordinates[0].push(this._last.slice());
                this.drawOnCanvas(this._draw_ctx_,function(){
                    DrawHelper.drawMultiline(this._draw_ctx_,this._current_path_.geometry.coordinates[0]);
                }.bind(this));
                break;
             case 'line':
                // draw line
                this._last = [img_point.x,img_point.y];
                // store current point
                this._current_path_.geometry.coordinates[0].push(this._last.slice());
                this.drawOnCanvas(this._draw_ctx_,function(){
                    DrawHelper.drawMultiline(this._draw_ctx_,this._current_path_.geometry.coordinates[0]);
                }.bind(this));
                break;
              case 'square':
                // draw square
                DrawHelper.clearCanvas(this._draw_);
                this.drawOnCanvas(this._draw_ctx_,function(){
                    const item = DrawHelper.drawRectangle(this._draw_ctx_,this._last,[img_point.x,img_point.y],true);
                    this._current_path_.geometry.path = item.path;
                    this._current_path_.geometry.coordinates[0] = item.points;
                }.bind(this));
                break;
              case 'rect':
                // draw rectangle
                DrawHelper.clearCanvas(this._draw_);
                this.drawOnCanvas(this._draw_ctx_,function(){
                    const item = DrawHelper.drawRectangle(this._draw_ctx_,this._last,[img_point.x,img_point.y]);
                    this._current_path_.geometry.path = item.path;
                    this._current_path_.geometry.coordinates[0] = item.points;
                }.bind(this));
                break;
              default:
                // statements_def
                break;
            }
        },

        /*
        * @private
        * stop drawing on the drawing canvas
        */
        stopDrawing:function(e){
            if(this.isDrawing) {
              // add style and data to data collection
              this.__endNewFeature();
              try {
                  this.raiseEvent('stop-drawing',{originalEvent:e});
              } catch(e) {
                  // statements
                  console.error('draw-overlay:stop-drawing error:');
                  console.error(e);
              }
              
            }
            // this is the geometry data, in points; conv to geojson
            this.isDrawing = false;
            this.stop = false;
            this._draw_.style.cursor = 'pointer';

        },

        /**
         * get Feature Collection in which the points are in the image coordinates
         * @return {geojson} the collection in the geojson form.
         */
        getImageFeatureCollection() { //Image [for draw on image] // Viewport
            const rs = {
                type:'FeatureCollection',
                features:[]
            };
            // for (var i = 0; i < this._path_index; i++) {
            //     const featrue = this._draws_data_[i].feature;
            rs.features = this._draws_data_.slice(0,this._path_index);
            // }
            return rs;
        },

        /**
         * @private
         * __newFeature with first point in it
         * @param  {Ojbect} first point
         */
        __newFeature:function(point){
            this._current_path_={
                type:'Feature',
                properties:{
                    style:{}
                },
                geometry:{
                    type:this.drawMode==='line'?"LineString":"Polygon",
                    coordinates:[[point]],
                    path:null
                }
            };
        },

        /**
         * @private
         * __isOnlyTwoSamePoints return true if and only if there are two same points in collection.
         *
         * @param  {Array} points the collection of points
         * @return {Boolean} true if and only if there are two same points in collection. Otherwise, return false.
         */
        __isOnlyTwoSamePoints:function(points){
            if(points.length == 2 && points[0].x == points[1].x && points[0].y == points[1].y){
              return true;
            }
            return false;
        },

        /**
         * @private
         * __endNewFeature create a new feature data.
         */
        __endNewFeature:function(){
            if(!this._current_path_ || this._current_path_.geometry.coordinates[0].length < 2 || this.__isOnlyTwoSamePoints(this._current_path_.geometry.coordinates[0])  ) return; // click on canvas
            // set style and drawing model
            this._current_path_.properties.style.color = this.style.color;
            this._current_path_.properties.style.lineJoin = this.style.lineJoin;
            this._current_path_.properties.style.lineCap = this.style.lineCap;
            this._current_path_.properties.style.isFill = this.style.isFill;
            let points = this._current_path_.geometry.coordinates[0];
            if(this.drawMode !== 'line') points.push([points[0][0],points[0][1]]);

            if(this.drawMode === 'free' || this.drawMode === 'line') {
              // simplify
              this._current_path_.geometry.coordinates[0] = simplify(points);
            };


            // create bounds
            this._current_path_.bound = getBounds(this._current_path_.geometry.coordinates[0]);
            
            if(this._path_index < this._draws_data_.length){
              this._draws_data_ = this._draws_data_.slice(0,this._path_index);
            }

            this._draws_data_.push(Object.assign({},this._current_path_));
            this._path_index++;
            this._current_path_ = null;
            DrawHelper.clearCanvas(this._draw_);
            this._display_ctx_.lineWidth = this.style.lineWidth;
            this.drawOnCanvas(this._display_ctx_, function(){
                DrawHelper.draw(this._display_ctx_, this._draws_data_.slice(0,this._path_index));
            }.bind(this));
        },

        /**
         * redraw the previous mark if it exist.
         */
        undo:function(){
            if(this._path_index > 0)
                // redraw path
                this.drawOnCanvas(this._display_ctx_,function(){
                    DrawHelper.draw(this._display_ctx_,this._draws_data_.slice(0,--this._path_index));
                }.bind(this));

        },

        /**
         * cancel or reverse the latest mark if it exist.
         */
        redo:function(){
            if(this._draws_data_.length > this._path_index)
                // redraw path
                this.drawOnCanvas(this._display_ctx_,function(){
                    DrawHelper.draw(this._display_ctx_,this._draws_data_.slice(0,++this._path_index));
                }.bind(this));
        },

        /**
         * clear the entire display canvas
         */
        clear:function(){
            this.clearStatus();
            this.clearCanvas();
        },
        /**
         * Function to destroy the instance of CanvasDraw and clean up everything created by CanvasDraw.
         *
         * Example:
         * var draw = CanvasDraw({
         *   [...]
         * });
         *
         * //when you are done with the draw:
         * draw.destroy();
         * draw = null; //important
         *
         */
        destory:function(){
            for(const key in this){
                this[key] = null;
            }
        }
    };


    $.extend($.CanvasDraw.prototype,$.EventSource.prototype);

    function getBounds(points){
        let max,min;
        points.forEach(point => {
            if (!min && !max) {
                min = [point[0], point[1]];
                max = [point[0], point[1]];
            } else {
                min[0] = Math.min(point[0], min[0]);
                max[0] = Math.max(point[0], max[0]);
                min[1] = Math.min(point[1], min[1]);
                max[1] = Math.max(point[1], max[1]);
            }
        });
        return [
            [min[0],min[1]],// top-left
            [max[0],min[1]], //top-right
            [max[0],max[1]], // bottom-right
            [min[0],max[1]],
            [min[0],min[1]]
        ];
    }

})(OpenSeadragon);

