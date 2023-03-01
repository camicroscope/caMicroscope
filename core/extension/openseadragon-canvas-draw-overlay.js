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
 * A OpenSeadragon plugin that provides a way to make/draw multiple marks on the images and transforms the marks to the collection in geojson form.
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
    throw new Error(
        'This version of OpenSeadragonCanvasDrawOverlay requires ' +
        'OpenSeadragon version 2.2.0+',
    );
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
    // drawing mode on/off, initialises draw
    this.isOn = false;
    // moving mode on/off
    this.moveOn = false;
    // is drawing? helps in drawing
    this.isDrawing = false;
    // is moving? helps in moving
    this.isMoving = false;
    this.size = [];
    // create supplies free, square, rectangle, line
    this.drawMode = options.drawMode || 'free'; // 'free', 'square', 'rect', 'line', 'stepSquare', 'grid', 'point'
    this.size = options.size || null;
    // ctx styles opt
    this.style = {
      color: '#7CFC00',
      // lineWidth:3,
      lineJoin: 'round', // "bevel" || "round" || "miter"
      lineCap: 'round', // "butt" || "round" || "square"
      isFill: true,
    };

    if (options.style && options.style.color) {
      this.style.color = options.style.color;
    }
    // if(options.style && options.style.lineWidth) this.style.lineWidth = options.style.lineWidth;
    if (options.style && options.style.lineJoin) {
      this.style.lineJoin = options.style.lineJoin;
    }
    if (options.style && options.style.lineCap) {
      this.style.lineCap = options.style.lineCap;
    }
    if (
      options.style &&
      options.style.isFill != undefined &&
      options.style.isFill == false
    ) {
      this.style.isFill = false;
    }
    this.events = {};
    // global events list for easily remove and add
    this._event = {
      start: this.startDrawing.bind(this),
      stop: this.stopDrawing.bind(this),
      drawing: this.drawing.bind(this),
      pointMove: this.pointMove.bind(this),
      pointClick: this.pointClick.bind(this),
      updateView: this.updateView.bind(this),
    };

    // status data
    this._last = [0, 0];
    // current stroke
    this._current_path_ = {};
    // all data
    this._draws_data_ = [];
    this._path_index = 0;
    // movement
    this._moveset = [];
    this._hash_data = new Map();
    // aligndata
    this._align_data = [];
    this._simplify = true;

    // -- create container div, and draw, display canvas -- //
    this._containerWidth = 0;
    this._containerHeight = 0;

    // container div
    this._div = document.createElement('div');
    this._div.style.position = 'absolute';
    this._div.style.left = 0;
    this._div.style.top = 0;
    this._div.style.width = '100%';
    this._div.style.height = '100%';
    this._div.style.display = 'none';
    this._div.style.zIndex = options.zIndex || 200;
    this._viewer.canvas.appendChild(this._div);
    // draw canvas, for current stroke
    this._draw_ = document.createElement('canvas');
    this._draw_.style.position = 'absolute';
    this._draw_.style.top = 0;
    this._draw_.style.left = 0;
    this._draw_ctx_ = this._draw_.getContext('2d');
    this._div.appendChild(this._draw_);

    // display canvas for all strokes
    this._display_ = document.createElement('canvas');
    this._display_.style.position = 'absolute';
    this._display_.style.top = 0;
    this._display_.style.left = 0;
    this._display_ctx_ = this._display_.getContext('2d');
    this._div.appendChild(this._display_);

    this.updateView();
  };
  // ----------
  $.CanvasDraw.prototype = {
    /**
     * updateView update all canvas according to the current states of the osd'viewer
     */
    updateView: function() {
      this.resize();
      this._updateCanvas();
    },

    /**
     * update the draw according to the options
     * @param  {Object} options
     *         see the options in constructor.
     *
     */
    updateOptions: function(options) {
      // draw mode on/off
      this.isOn = false;
      this.moveOn = false;
      // is drawing things
      this.isDrawing = false;
      this.isMoving = false;

      // creat supplies free, square, rectangle, line
      this.drawMode = options.drawMode || 'rect'; // 'free', 'square', 'rect', 'line', 'grid', clickable
      this.size = options.size || null;
      // ctx styles opt
      this.style = {
        color: '#7CFC00',
        // lineWidth:0,
        lineJoin: 'round', // "bevel" || "round" || "miter"
        lineCap: 'round', // "butt" || "round" || "square"
        isFill: true,
      };

      if (options.style && options.style.color) {
        this.style.color = options.style.color;
      }
      // if(options.style && options.style.lineWidth) this.style.lineWidth = options.style.lineWidth;
      if (options.style && options.style.lineJoin) {
        this.style.lineJoin = options.style.lineJoin;
      }
      if (options.style && options.style.lineCap) {
        this.style.lineCap = options.style.lineCap;
      }
      if (
        options.style &&
        options.style.isFill != undefined &&
        options.style.isFill == false
      ) {
        this.style.isFill = false;
      }

      this._div.style.display = 'none';
      this._div.style.zIndex = options.zIndex || 500;
      this.clearStatus();
      this.clearCanvas();
      this.drawOff();
    },

    /**
     * @private
     * drawOnCanvas draw marks on canvas
     * @param  {Canvas} ctx  a canvas' 2d context that the marks draw on
     * @param  {Function} drawFuc [description]
     * @return {[type]}         [description]
     */
    drawOnCanvas: function(ctx, drawFuc) {
      var viewportZoom = this._viewer.viewport.getZoom(true);
      var zoom = this._viewer.viewport.viewportToImageZoom(viewportZoom);
      var x =
        ((this._viewportOrigin.x / this.imgWidth - this._viewportOrigin.x) /
          this._viewportWidth) *
        this._containerWidth;
      var y =
        ((this._viewportOrigin.y / this.imgHeight - this._viewportOrigin.y) /
          this._viewportHeight) *
        this._containerHeight;

      const imagingHelper = this._viewer.imagingHelper;
      ctx.lineWidth = this.style.lineWidth =
        (imagingHelper.physicalToDataX(2) - imagingHelper.physicalToDataX(0)) >>
        0;
      ctx.radius =
        (imagingHelper.physicalToDataX(3) - imagingHelper.physicalToDataX(0)) >>
        0;
      DrawHelper.clearCanvas(ctx.canvas);
      ctx.translate(x, y);
      ctx.scale(zoom, zoom);
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

      // var iamgeBounds = this._viewer.viewport.viewportToImageRectangle(boundsRect);
      const imagingHelper = this._viewer.imagingHelper;
      this.style.lineWidth =
        (imagingHelper.physicalToDataX(2) - imagingHelper.physicalToDataX(0)) >>
        0;
      this._draw_ctx_.radius =
        (imagingHelper.physicalToDataX(3) - imagingHelper.physicalToDataX(0)) >>
        0;
      this._display_ctx_.radius =
        (imagingHelper.physicalToDataX(3) - imagingHelper.physicalToDataX(0)) >>
        0;
      // this.style.lineWidth = 2*Math.round(Math.max(iamgeBounds.width/this._containerWidth,iamgeBounds.height/this._containerHeight ));
    },

    /**
     * @private
     * _updateCanvas transform and scale the canvas bases on the movement of the view
     */
    _updateCanvas: function() {
      var viewportZoom = this._viewer.viewport.getZoom(true);
      var image1 = this._viewer.world.getItemAt(0);
      var zoom = image1.viewportToImageZoom(viewportZoom);

      var x =
        ((this._viewportOrigin.x / this.imgWidth - this._viewportOrigin.x) /
          this._viewportWidth) *
        this._containerWidth;
      var y =
        ((this._viewportOrigin.y / this.imgHeight - this._viewportOrigin.y) /
          this._viewportHeight) *
        this._containerHeight;

      this.clearCanvas();
      this._display_.getContext('2d').translate(x, y);
      this._display_.getContext('2d').scale(zoom, zoom);
      const imagingHelper = this._viewer.imagingHelper;

      this._display_ctx_.lineWidth = this.style.lineWidth =
        (imagingHelper.physicalToDataX(2) - imagingHelper.physicalToDataX(0)) >>
        0;
      this._display_ctx_.radius =
        (imagingHelper.physicalToDataX(3) - imagingHelper.physicalToDataX(0)) >>
        0;
      // this.drawMode !== "grid"
      //   ?
      DrawHelper.draw(
          this._display_ctx_,
          this._draws_data_.slice(0, this._path_index),
      );

      // : DrawHelper.drawGrids(
      //     this._display_ctx_,
      //     this._draws_data_.slice(0, this._path_index)
      //   );
      this._display_.getContext('2d').setTransform(1, 0, 0, 1, 0, 0);
    },

    /**
     * turn on drawing functionality.
     */
    drawOn: function() {
      // stop turning on draw mode if already turn on
      if (this.isOn === true && this.moveOn === true) return;
      // clock viewer
      // this._viewer.controls.bottomright.style.display = 'none';
      this.updateView();
      this._viewer.setMouseNavEnabled(false);
      this._viewer.innerTracker.startTrackingScroll();
      this._div.style.cursor = 'pointer';
      this._div.style.display = 'block';

      // add Event listeners
      this._div.addEventListener('mousemove', this._event.drawing);
      
      this._div.addEventListener('mouseout', this._event.stop);
      this._div.addEventListener('mouseup', this._event.stop);
      this._div.addEventListener('mousedown', this._event.start);
      
      // point to point
      this._div.addEventListener('mousemove', this._event.pointMove);
      this._div.addEventListener('click', this._event.pointClick);

      this._viewer.addHandler('update-viewport', this._event.updateView);
      this._viewer.addHandler('open', this._event.updateView);
      //
      this.isOn = true;
      this.moveOn = true;

      this._viewer.raiseEvent('canvas-draw-on', {draw: true});
    },

    /**
     * turn off drawing functionality.
     */
    drawOff: function() {
      // stop turning off draw mode if already turn off
      // if(this.contextMenu) this.contextMenu.
      if (this.isOn === false && this.moveOn == false) return;
      // unclock viewer
      // this._viewer.controls.bottomright.style.display = '';
      this._viewer.setMouseNavEnabled(true);
      this._div.style.cursor = 'default';
      this._div.style.display = 'none';

      // remove Events
      this._div.removeEventListener('mousemove', this._event.drawing);
      this._div.removeEventListener('mouseout', this._event.stop);
      this._div.removeEventListener('mouseup', this._event.stop);
      this._div.removeEventListener('mousedown', this._event.start);

      this._viewer.removeHandler('update-viewport', this._event.updateView);
      this._viewer.removeHandler('open', this._event.updateView);

      this.isOn = false;
      this.moveOn = false;

      this._viewer.raiseEvent('canvas-draw-off', {draw: false});
    },

    /*
     * @private
     * start drawing on the drawing canvas and create the collection that store the marks in geojson form
     * as the mouse steps in
     */
    startDrawing: function(e) {
      if(this.drawMode == 'pointToPoint') {
        return;
      }      
      // prevent to open context menu when click on drawing mode

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

      // custom event on start
      this.raiseEvent('start-drawing', {originalEvent: e});
      if (this.stop) {
        this.stop = false;
        return;
      }
      // close style context menu if it open
      if (this.contextMenu) this.contextMenu.close(e);
      let point = new OpenSeadragon.Point(e.clientX, e.clientY);
      let img_point = this._viewer.viewport.windowToImageCoordinates(point);
      img_point.x = Math.floor(img_point.x); img_point.y = Math.floor(img_point.y);

      // alignment
      spen.initcanvas(this._viewer.drawer.canvas);
      this.align_fy = this._viewer.drawer.canvas.width/this._display_.width;
      this.align_fx = this._viewer.drawer.canvas.height/this._display_.height;

      if (
        0 > img_point.x ||
        this.imgWidth < img_point.x ||
        0 > img_point.y ||
        this.imgHeight < img_point.y
      ) {
        return;
      }

      // check either moving or drawing
      // start moving
      if (this.moveOn) {
        this._init_hash_data();
        var pt = this._close_anno(img_point, ~~this.scaleWindowtoImage(5));
        this._moveset = [this._hash_data[mtool.hash(pt, this.imgWidth*10)], pt];
        if (this._moveset[0] != undefined) {
          this.isMoving = true;
          var st = this._moveset[0][0], ind = this._moveset[0][1];
          // throw the moving stroke to current path
          this._current_path_ = this._draws_data_[st];
          this._current_path_.geometry.coordinates[0] = mtool.populate(this._current_path_.geometry.coordinates[0], ~~this.scaleWindowtoImage(5), ~~this.scaleWindowtoImage(1), 150);
          this._draws_data_.splice(st, 1);
          this.drawOnCanvas(
              this._display_ctx_,
              function() {
                DrawHelper.draw(this._display_ctx_, this._draws_data_.slice(0, --this._path_index));
              }.bind(this));
          this.drawing(e);
          return;
        }
      }

      if (this.isOn) {
        // start drawing
        this.isDrawing = true;
        this._draw_.style.cursor = 'crosshair';

        // create a point
        if (this.drawMode === 'point') {
          this._last = [Math.round(img_point.x), Math.round(img_point.y)];
          this.__newFeature(this._last.slice());

          //
          this.stopDrawing(e);
          return;
        }

        const imagingHelper = this._viewer.imagingHelper;
        this.style.lineWidth =
          (imagingHelper.physicalToDataX(2) - imagingHelper.physicalToDataX(0)) >>
          0;
        this._draw_ctx_.radius =
          (imagingHelper.physicalToDataX(3) - imagingHelper.physicalToDataX(0)) >>
          0;
        this._display_ctx_.radius =
          (imagingHelper.physicalToDataX(3) - imagingHelper.physicalToDataX(0)) >>
          0;
        this._last = [Math.round(img_point.x), Math.round(img_point.y)];

        this.__newFeature(this._last.slice());
      }
    },
    pointMove: function(e) {
      if(this.isOn && this.drawMode == 'pointToPoint') {
        let point = new OpenSeadragon.Point(e.clientX, e.clientY);
        let img_point = this._viewer.viewport.windowToImageCoordinates(point);
        if (
          0 > img_point.x ||
          this.imgWidth < img_point.x ||
          0 > img_point.y ||
          this.imgHeight < img_point.y
        ) {
          return;
        }
        img_point.x = Math.round(img_point.x);
        img_point.y = Math.round(img_point.y);

        // drawing anchor and lines
        var line = $.isEmptyObject(this._current_path_)?
        []:
        [].concat(this._current_path_.geometry.coordinates[0]);
        line = line.concat([[img_point.x,img_point.y]]);        
        if(line.length == 1) return;
        this.drawOnCanvas(
          this._draw_ctx_,
          function() {
            // case 1: only one point
            // if(line.length > 1) {
            //   // end point
            //   this._draw_ctx_.strokeStyle = 'red';
            //   DrawHelper.drawCircle(
            //     this._draw_ctx_,
            //     img_point.x,
            //     img_point.y,
            //     this.style.lineWidth * 3,
            //   );
            // } else {
              // draw line
              DrawHelper.setStyle(this._draw_ctx_, this.style);              
              DrawHelper.drawMultiline(
                  this._draw_ctx_,
                  line,
              )
              
              // draw circle
              // get start point (x, y)
              const sx = line[0][0];
              const sy = line[0][1];
              // get end point (x, y)         
              const ex = line[line.length - 1][0];
              const ey = line[line.length - 1][1];              
              if(line.length == 2) { // case 2: has two points   
                this._draw_ctx_.strokeStyle = 'red';
              } else { // case 3: more than 2 points
                // calculate distance between start and end points                
                const distance  = getDistance(
                  this._viewer,
                  new OpenSeadragon.Point(sx, sy),
                  new OpenSeadragon.Point(ex, ey)
                )
                
                this._draw_ctx_.strokeStyle = distance > 14 ? 'red' : 'blue';
              }
              // start point
              DrawHelper.drawCircle(
                  this._draw_ctx_,
                  sx,
                  sy,
                  this.style.lineWidth * 3,
              );              
              // end point
              DrawHelper.drawCircle(
                  this._draw_ctx_,
                  img_point.x,
                  img_point.y,
                  this.style.lineWidth * 3,
              ); 
            // }
                               
          }.bind(this))
      }
      
    },
    pointClick: function(e) {
      
      this.raiseEvent('start-drawing', {originalEvent: e});
      if (this.stop) {
        this.stop = false;
        return;
      }

      if(this.isOn && this.drawMode == 'pointToPoint') {
        let point = new OpenSeadragon.Point(e.clientX, e.clientY);
        let img_point = this._viewer.viewport.windowToImageCoordinates(point);
        if (
          0 > img_point.x ||
          this.imgWidth < img_point.x ||
          0 > img_point.y ||
          this.imgHeight < img_point.y
        ) {
          return;
        }
        img_point.x = Math.round(img_point.x);
        img_point.y = Math.round(img_point.y);
        this._last = [img_point.x, img_point.y];

        if($.isEmptyObject(this._current_path_)) { 
          this.__newFeature(this._last.slice());
        } else {
          this._current_path_.geometry.coordinates[0].push(this._last.slice());
        }
        // get current lines
        var line = this._current_path_.geometry.coordinates[0];
        // save point to point if the
        if(line.length > 2 && getDistance(
          this._viewer,
          new OpenSeadragon.Point(line[0][0], line[0][1]),
          new OpenSeadragon.Point(line[line.length - 1][0], line[line.length - 1][1])
        ) <= 14) { // save annotations
          this.__endNewFeature();
          try {
            // custom event on stop
            this.raiseEvent('stop-drawing', {originalEvent: e});
          } catch (e) {
            // statements
            console.error('draw-overlay:stop-drawing error:');
            console.error(e);
          }
          return;
        } 

        // drawing anchor and lines
        if(line.length == 1) return;
        this.drawOnCanvas(
          this._draw_ctx_,
          function() {
            // case 1: only one point
            // if(line.length == 1) {
            //   // end point
            //   this._draw_ctx_.strokeStyle = 'red';
            //   DrawHelper.drawCircle(
            //     this._draw_ctx_,
            //     img_point.x,
            //     img_point.y,
            //     this.style.lineWidth * 3,
            //   );
            // } else {
              // draw line
              DrawHelper.setStyle(this._draw_ctx_, this.style);              
              DrawHelper.drawMultiline(
                  this._draw_ctx_,
                  line,
              )
              // draw circle
              // get start point (x, y)
              const sx = line[0][0];
              const sy = line[0][1];
              // get end point (x, y)         
              const ex = line[line.length - 1][0];
              const ey = line[line.length - 1][1];              
              if(line.length == 2) { // case 2: has two points   
                this._draw_ctx_.strokeStyle = 'red';
              } else { // case 3: more than 2 points
                // calculate distance between start and end points
                const distance  = getDistance(
                  this._viewer,
                  new OpenSeadragon.Point(sx, sy),
                  new OpenSeadragon.Point(ex, ey)
                )
                this._draw_ctx_.strokeStyle = distance > 14 ? 'red' : 'blue';
              }
              // start point
              DrawHelper.drawCircle(
                  this._draw_ctx_,
                  sx,
                  sy,
                  this.style.lineWidth * 3,
              );              
              // end point
              DrawHelper.drawCircle(
                  this._draw_ctx_,
                  img_point.x,
                  img_point.y,
                  this.style.lineWidth * 3,
              ); 
            //}        
          }.bind(this)) 
      }
    },
    /**
     * @private
     * each drawing and collects the path data as point, as the mouse moves
     * @param  {Event} e the event
     */
    drawing: function(e) {
      // stop if the draw mode is pointToPoint
      if(this.drawMode == 'pointToPoint') {
        return;
      }
      // anything happening?
      if (!(this.isDrawing) && !(this.isMoving)) return;

      let point = new OpenSeadragon.Point(e.clientX, e.clientY);
      let img_point = this._viewer.viewport.windowToImageCoordinates(point);
      if (
        0 > img_point.x ||
        this.imgWidth < img_point.x ||
        0 > img_point.y ||
        this.imgHeight < img_point.y
      ) {
        return;
      }
      img_point.x = Math.round(img_point.x);
      img_point.y = Math.round(img_point.y);
      // set style for ctx
      DrawHelper.setStyle(this._draw_ctx_, this.style);
      this._draw_ctx_.fillStyle = hexToRgbA(this.style.color, 0.3);

      if (this.isDrawing) {
        img_point = this.__align_real(img_point);
        switch (this.drawMode) {
          case 'free':
          // draw line
            this._last = [img_point.x, img_point.y];
            // store current point
            this._current_path_.geometry.coordinates[0].push(this._last.slice());
            this.drawOnCanvas(
                this._draw_ctx_,
                function() {
                // draw circle
                  const sx = this._current_path_.geometry.coordinates[0][0][0];
                  const sy = this._current_path_.geometry.coordinates[0][0][1];
                  let start = new OpenSeadragon.Point(sx, sy);
                  start = this._viewer.viewport.imageToWindowCoordinates(start);
                  const ex = this._current_path_.geometry.coordinates[0][
                      this._current_path_.geometry.coordinates[0].length - 1
                  ][0];
                  const ey = this._current_path_.geometry.coordinates[0][
                      this._current_path_.geometry.coordinates[0].length - 1
                  ][1];
                  let end = new OpenSeadragon.Point(ex, ey);
                  end = this._viewer.viewport.imageToWindowCoordinates(end);
                  const dx = Math.round(Math.abs(start.x - end.x));
                  const dy = Math.round(Math.abs(start.y - end.y));
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  this._draw_ctx_.strokeStyle = distance > 14 ? 'red' : 'blue';
                  // start point
                  DrawHelper.drawCircle(
                      this._draw_ctx_,
                      sx,
                      sy,
                      this.style.lineWidth * 3,
                  );
                  // end point
                  DrawHelper.drawCircle(
                      this._draw_ctx_,
                      ex,
                      ey,
                      this.style.lineWidth * 3,
                  );

                  DrawHelper.setStyle(this._draw_ctx_, this.style);
                  // draw circle
                  DrawHelper.drawMultiline(
                      this._draw_ctx_,
                      this._current_path_.geometry.coordinates[0],
                  );
                }.bind(this),
            );
            break;
          case 'line':
          // draw line
            this._last = [img_point.x, img_point.y];

            // store current point
            this._current_path_.geometry.coordinates[0].push(this._last.slice());
            this.drawOnCanvas(
                this._draw_ctx_,
                function() {
                  DrawHelper.drawMultiline(
                      this._draw_ctx_,
                      this._current_path_.geometry.coordinates[0],
                  );
                }.bind(this),
            );
            break;
          case 'grid':
          // draw line
            this._last = [img_point.x, img_point.y];
            // store current point
            this._current_path_.geometry.coordinates[0].push(this._last.slice());
            const grids = getGrids(
                this._current_path_.geometry.coordinates[0],
                this._current_path_.properties.size,
            );
            this._draw_ctx_.fillStyle = hexToRgbA(this.style.color, 0.5);
            this.drawOnCanvas(
                this._draw_ctx_,
                function() {
                  DrawHelper.drawMultiGrid(
                      this._draw_ctx_,
                      grids,
                      this._current_path_.properties.size,
                  );
                // DrawHelper.drawGrid(this._draw_ctx_,this._current_path_.geometry.coordinates[0]);
                }.bind(this),
            );
            // this.drawOnCanvas(this._draw_ctx_,function(){
            //     DrawHelper.drawMultiline(this._draw_ctx_,this._current_path_.geometry.coordinates[0]);
            // }.bind(this));
            break;
          case 'square':
          // draw square
            DrawHelper.clearCanvas(this._draw_);
            this.drawOnCanvas(
                this._draw_ctx_,
                function() {
                  DrawHelper.setStyle(this._draw_ctx_, this.style);
                  const item = DrawHelper.drawRectangle(
                      this._draw_ctx_,
                      this._last,
                      [img_point.x, img_point.y],
                      true,
                  );
                  this._current_path_.geometry.path = item.path;
                  this._current_path_.geometry.coordinates[0] = item.points;
                }.bind(this),
            );
            break;
          case 'rect':
          // draw rectangle
            DrawHelper.clearCanvas(this._draw_);
            this.drawOnCanvas(
                this._draw_ctx_,
                function() {
                  DrawHelper.setStyle(this._draw_ctx_, this.style);
                  const item = DrawHelper.drawRectangle(
                      this._draw_ctx_,
                      this._last,
                      [img_point.x, img_point.y],
                  );
                  this._current_path_.geometry.path = item.path;
                  this._current_path_.geometry.coordinates[0] = item.points;
                }.bind(this),
            );
            break;
          case 'stepSquare':
          // draw squares at steps
            DrawHelper.clearCanvas(this._draw_);
            this.drawOnCanvas(
                this._draw_ctx_,
                function() {
                  DrawHelper.setStyle(this._draw_ctx_, this.style);
                  const item = DrawHelper.drawRectangle(
                      this._draw_ctx_,
                      this._last,
                      [img_point.x, img_point.y],
                      true,
                      this.size,
                  );
                  this._current_path_.geometry.path = item.path;
                  this._current_path_.geometry.coordinates[0] = item.points;
                }.bind(this),
            );
            break;
          // case 'grid':
          //   // draw rectangle
          //   DrawHelper.clearCanvas(this._draw_);
          //   this.drawOnCanvas(this._draw_ctx_,function(){
          //       DrawHelper.setStyle(this._draw_ctx_,this.style);
          //       const item = DrawHelper.drawRectangle(this._draw_ctx_,getTopLeft(this._last,this.size),this.size);
          //       this._current_path_.geometry.path = item.path;
          //       this._current_path_.geometry.coordinates[0] = item.points;
          //   }.bind(this));
          //   break;
          default:
          // statements_def
            break;
        }
      } else if (this.isMoving) {
        var ind = this._moveset[0][1];
        var disp = this._current_path_.geometry.coordinates[0]; var mx = Math.min(disp.length, 500);
        disp = mtool.gaussianInterpolate(disp, ind, img_point, 40*mx/500, mx/disp.length);
        this._current_path_.geometry.coordinates[0] = disp.slice();
        disp.push(disp[0]);
        this.drawOnCanvas(
            this._draw_ctx_,
            function() {
              DrawHelper.drawMultiline(
                  this._draw_ctx_,
                  disp,
              );
            }.bind(this),
        );
      }
    },

    /*
     * @private
     * stop drawing on the drawing canvas, when the mouse is up
     */
    stopDrawing: function(e) {
      // stop if the draw mode is pointToPoint
      if(this.drawMode == 'pointToPoint') {
        return;
      }      
      // if any movement or drawing
      if ((this.isDrawing) || (this.isMoving)) {
        // add style and data to data collection
        // saving the stroke to all data
        this.__endNewFeature();
        try {
          // custom event on stop
          this.raiseEvent('stop-drawing', {originalEvent: e});
        } catch (e) {
          // statements
          console.error('draw-overlay:stop-drawing error:');
          console.error(e);
        }
      }
      // this is the geometry data, in points; conv to geojson
      this.isDrawing = false;
      this.isMoving = false;
      this.stop = false;
      this._draw_.style.cursor = 'pointer';
    },

    /**
     * get Feature Collection in which the points are in the image coordinates
     * @return {geojson} the collection in the geojson form.
     */
    getImageFeatureCollection() {
      // Image [for draw on image] // Viewport
      const rs = {
        type: 'FeatureCollection',
        features: [],
      };
      // for (var i = 0; i < this._path_index; i++) {
      //     const featrue = this._draws_data_[i].feature;
      rs.features = this._draws_data_.slice(0, this._path_index);
      // }
      return rs;
    },

    /**
     * @private
     * __newFeature with first point in it
     * @param  {Ojbect} first point
     */
    __newFeature: function(point) {
      if (this.drawMode == 'point') {
        this._current_path_ = {
          type: 'Feature',
          properties: {
            style: {},
          },
          geometry: {
            type: 'Point',
            coordinates: [...point],
          },
          bound: {
            type: 'Point',
            coordinates: [...point],
          },
        };
        return;
      }

      this._current_path_ = {
        type: 'Feature',
        properties: {
          style: {},
        },
        geometry: {
          type:
            this.drawMode === 'line' || this.drawMode === 'grid' ?
              'LineString' :
              'Polygon',
          coordinates: [[point]],
          path: null,
        },
        bound: {
          type:
            this.drawMode === 'line' || this.drawMode === 'grid' ?
              'LineString' :
              'Polygon',
          coordinates: [[point]],
        },
      };

      if (this.drawMode === 'grid') {
        this._current_path_.properties.size = [...this.size];
        this._current_path_.properties.notes = this.brushType;
      }
    },

    /**
     * @private
     * __isOnlyTwoSamePoints return true if and only if there are two same points in collection.
     *
     * @param  {Array} points the collection of points
     * @return {Boolean} true if and only if there are two same points in collection. Otherwise, return false.
     */
    __isOnlyTwoSamePoints: function(points) {
      if (
        points.length == 2 &&
        points[0].x == points[1].x &&
        points[0].y == points[1].y
      ) {
        return true;
      }
      return false;
    },

    /**
     * @private
     * __endNewFeature create a new feature data.
     */
    __endNewFeature: function() {
      if (this.drawMode == 'point') {
        this._current_path_.properties.style.color = this.style.color;
        this._current_path_.properties.style.lineJoin = this.style.lineJoin;
        this._current_path_.properties.style.lineCap = this.style.lineCap;
        this._current_path_.properties.style.isFill = this.style.isFill;

        if (this._path_index < this._draws_data_.length) {
          this._draws_data_ = this._draws_data_.slice(0, this._path_index);
        }

        this._draws_data_.push(Object.assign({}, this._current_path_));

        this._path_index++;
        this._current_path_ = null;
        DrawHelper.clearCanvas(this._draw_);
        this._display_ctx_.lineWidth = this.style.lineWidth;
        this.drawOnCanvas(
            this._display_ctx_,
            function() {
            // this.drawMode !== "grid"
            //   ?
              DrawHelper.draw(
                  this._display_ctx_,
                  this._draws_data_.slice(0, this._path_index),
              );
              // : DrawHelper.drawGrids(
              //     this._display_ctx_,
              //     this._draws_data_.slice(0, this._path_index),
              //     this.size
              //   );
            }.bind(this),
        );
        return;
      }
      if (
        !this._current_path_ ||
        this._current_path_.geometry.coordinates[0].length < 2 ||
        this.__isOnlyTwoSamePoints(this._current_path_.geometry.coordinates[0])
      ) {
        return;
      } // click on canvas
      // set style and drawing model
      this._current_path_.properties.style.color = this.style.color;
      this._current_path_.properties.style.lineJoin = this.style.lineJoin;
      this._current_path_.properties.style.lineCap = this.style.lineCap;
      this._current_path_.properties.style.isFill = this.style.isFill;
      let points = this._current_path_.geometry.coordinates[0];
      /* Modifications */

      // last point push
      if (!(this.drawMode === 'line' || this.drawMode === 'grid'))
        points.push(points[0]);

      // preprocess
      if (!(this.drawMode === 'grid'))
        if(spen.mode == 1)
          points = mtool.populate(points, ~~this.scaleWindowtoImage(5), ~~this.scaleWindowtoImage(1), 150);
      if(this.isMoving) {spen.s = spen.smoothness; spen.smoothness = 10e12;}

      // align
      points = this.__align(points);

      // simplify and postprocess
      if(this.isMoving) spen.smoothness = spen.s;
      if (!(this.drawMode === 'grid') && this._simplify)
        if(spen.mode != 0)
          points = mtool.populate(points, 500000, ~~this.scaleWindowtoImage(2), 150);
        else
          points = simplify(points, 3.5);

      // float to integer
      points = this._convert_integer(points);

      if (!(this.drawMode === 'line' || this.drawMode == 'grid')) {
        let isIntersect = false;
        if (isSelfIntersect(points)) {
          isIntersect = true;
          console.info('The polygon just drawn has an intersection.');
          if (! window.localStorage.getItem('_intersect_warn')) {
            alert(
                'A Self-Intersecting Polygon Will Cause Inaccurate Area and Circumference.',
            );
            console.info('Firing Intersect user Alert just this once.');
            window.localStorage.setItem('_intersect_warn', 'true');
          }
        }
        let sqmpsqp = null; // square microns per square pixels
        if (
          this._viewer.mpp_x &&
          this._viewer.mpp_y &&
          this._viewer.mpp_x != 1e9 &&
          this._viewer.mpp_y != 1e9
        ) {
          sqmpsqp = this._viewer.mpp_x * this._viewer.mpp_y;
          // calculate the are of polygon
          this._current_path_.properties.area =
            sqmpsqp * polygonArea(points);
          this._current_path_.properties.circumference = getCircumference(
              points,
              this._viewer.mpp_x,
              this._viewer.mpp_y,
          );
          this._current_path_.properties.isIntersect = isIntersect;
        } else if (this._viewer.mpp && this._viewer.mpp != 1e9) {
          sqmpsqp = this._viewer.mpp * this._viewer.mpp;
          // calculate the are of polygon
          this._current_path_.properties.area =
            sqmpsqp * polygonArea(points);
          this._current_path_.properties.circumference = getCircumference(
              points,
              this._viewer.mpp_x,
              this._viewer.mpp_y,
          );
          this._current_path_.properties.isIntersect = isIntersect;
        } else {
          this._current_path_.properties.nommp = true;
        }
      }
      this._current_path_.geometry.coordinates[0] = points;
      // create bounds
      this._current_path_.bound.coordinates[0] = getBounds(
          this._current_path_.geometry.coordinates[0],
      );

      if (this._path_index < this._draws_data_.length) {
        this._draws_data_ = this._draws_data_.slice(0, this._path_index);
      }

      this._draws_data_.push(Object.assign({}, this._current_path_));
      this._path_index++;
      this._current_path_ = null;
      DrawHelper.clearCanvas(this._draw_);
      this._display_ctx_.lineWidth = this.style.lineWidth;
      this.drawOnCanvas(
          this._display_ctx_,
          function() {
          // this.drawMode !== "grid"
          //   ?
            DrawHelper.draw(
                this._display_ctx_,
                this._draws_data_.slice(0, this._path_index),
            );
            // : DrawHelper.drawGrids(
            //     this._display_ctx_,
            //     this._draws_data_.slice(0, this._path_index)
            //   );
          }.bind(this),
      );
    },

    /**
     * redraw the previous mark if it exist.
     */
    undo: function() {
      if (this._path_index > 0)
      // redraw path
      {
        this.drawOnCanvas(
            this._display_ctx_,
            function() {
            this.drawMode !== 'grid' ?
              DrawHelper.draw(
                  this._display_ctx_,
                  this._draws_data_.slice(0, --this._path_index),
              ) :
              DrawHelper.drawGrids(
                  this._display_ctx_,
                  this._draws_data_.slice(0, --this._path_index),
              );
            }.bind(this),
        );
      }
      this.refresh_data();
    },

    /**
     * cancel or reverse the latest mark if it exist.
     */
    redo: function() {
      if (this._draws_data_.length > this._path_index)
      // redraw path
      {
        this.drawOnCanvas(
            this._display_ctx_,
            function() {
            this.drawMode !== 'grid' ?
              DrawHelper.draw(
                  this._display_ctx_,
                  this._draws_data_.slice(0, ++this._path_index),
              ) :
              DrawHelper.drawGrids(
                  this._display_ctx_,
                  this._draws_data_.slice(0, ++this._path_index),
              );
            }.bind(this),
        );
      }
    },

    /**
     * clear the entire display canvas
     */
    clear: function() {
      this.clearStatus();
      this.clearCanvas();
    },
    /**
     * clearStatus clear all datas that are used to associate with the feature collection
     */
    clearStatus: function() {
      this._last = [0, 0];
      this._current_path_ = {};
      this._draws_data_ = [];
      this._path_index = 0;
      this._hash_data = new Map();
      this._align_data = [];
    },
    // clear/refresh misc cache of strokes
    refresh_data: function() {
      this._align_data = [];
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
    destory: function() {
      for (const key in this) {
        this[key] = null;
      }
    },

    /**
     * Align functions
     *@param {points}
     *@return {points}
     */
    __align: function(points) {
      if (spen.mode != 1) {
        return points;
      }
      this._align_data = points.slice();
      var dist = new Array();
      var ol = points;
      for (i = 0; i < ol.length; i++) {
        dist.push(new OpenSeadragon.Point(ol[i][0], ol[i][1]));
        dist[i] = this._viewer.viewport.imageToWindowCoordinates(dist[i]);
        dist[i].x = Math.floor(dist[i].x * this.align_fx);
        dist[i].y = Math.floor(dist[i].y * this.align_fy);
      }
      dist = spen.align(dist);
      for (i = 0; i < dist.length; i++) {
        dist[i] = new OpenSeadragon.Point(dist[i].x / this.align_fx, dist[i].y / this.align_fy);
        dist[i] = this._viewer.viewport.windowToImageCoordinates(dist[i]);
        dist[i].x = Math.floor(dist[i].x);
        dist[i].y = Math.floor(dist[i].y);
        points[i] = [dist[i].x, dist[i].y];
      }
      return points;
    },
    __align_real: function(pix) {
      if (spen.mode == 0) {
        return pix;
      }
      var pt = pix;
      pt = this._viewer.viewport.imageToWindowCoordinates(pt);
      pt.x = Math.floor(pt.x * this.align_fx);
      pt.y = Math.floor(pt.y * this.align_fy);
      pt = spen.alignR(pt);
      pt = new OpenSeadragon.Point(pt.x / this.align_fx, pt.y / this.align_fy);
      pt = this._viewer.viewport.windowToImageCoordinates(pt);
      pt.x = Math.floor(pt.x);
      pt.y = Math.floor(pt.y);
      if (spen.mode == 1) {
        return pix;
      }
      return pt;
    },
    __align_undo() {
      if (this._path_index > 0 && this._align_data.length) {
        var tm = spen.mode; spen.mode = 3;
        var type = this._draws_data_[--this._path_index].geometry.type;
        this._draws_data_ = this._draws_data_.slice(0, this._path_index);
        this._redraw(this._align_data,type);
        this.refresh_data();
        spen.mode = tm;
      } else this.undo();
    },

    /**
     * Movement functions
     */
    _init_hash_data() {
      this._hash_data = new Map();
      for (var i = 0; i < this._path_index; i++) {
      	var cur = this._draws_data_[i].geometry.coordinates[0];
        cur = mtool.populate(cur, ~~this.scaleWindowtoImage(5), ~~this.scaleWindowtoImage(1), 150);
      	for (var j = 0; j < cur.length; j++) {
      		this._hash_data[mtool.hash({
      			x: cur[j][0],
      			y: cur[j][1],
      		}, this.imgWidth * 10)] = [i, j];
      	}
      }
    },
    _close_anno(pt, cl = 50) {
      var d = 100000; d*=d, opt = pt;
      for (var i = -cl; i < cl; i++)
        for (var j = -cl; j < cl; j++) {
          var nt = {x: pt.x + i, y: pt.y + j};
          if (this._hash_data[mtool.hash(nt, this.imgWidth*10)] != undefined) {
            var dd = mtool.distance(pt, nt);
            if (d > dd) {
              d = dd; opt = nt;
            }
          }
        }
      return opt;
    },
    // function to convert array of points to array of pair or vice-versa
    _convert_arr(arr, topoint = true) {
      var dist = [];
      if (topoint) {
      	arr.forEach((e) => dist.push(new OpenSeadragon.Point(e[0], e[1])));
      } else {
      	arr.forEach((e) => dist.push([e.x, e.y]));
      }
      return dist;
    },
    // convert float arr to integer
    _convert_integer(arr) {
      var dist = [];
      arr.forEach((e) => dist.push([~~e[0], ~~e[1]]));
      return dist;
    },
    scaleWindowtoImage(x) {
      let pt = new OpenSeadragon.Point(x, 0);
      let pt2 = new OpenSeadragon.Point(0, 0);
      let dx = this._viewer.viewport.windowToImageCoordinates(pt).x - this._viewer.viewport.windowToImageCoordinates(pt2).x;
      return dx;
    },
    _redraw(data, type){
      var t = this.drawMode
      this.drawMode = type;
      this.__newFeature(data[0]);
      this._current_path_.geometry.coordinates[0] = data;
      this.__endNewFeature();
      this.drawMode = t;
    }
  };


  $.extend($.CanvasDraw.prototype, $.EventSource.prototype);
  function getDistance(viewer, start, end) {
    start = viewer.viewport.imageToWindowCoordinates(start);
    end = viewer.viewport.imageToWindowCoordinates(end);

    const dx = Math.round(Math.abs(start.x - end.x));
    const dy = Math.round(Math.abs(start.y - end.y));
    
    return Math.sqrt(dx * dx + dy * dy);
  }
  function getBounds(points) {
    let max; let min;
    points.forEach((point) => {
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
      [min[0], min[1]], // top-left
      [max[0], min[1]], // top-right
      [max[0], max[1]], // bottom-right
      [min[0], max[1]],
      [min[0], min[1]],
    ];
  }
})(OpenSeadragon);
