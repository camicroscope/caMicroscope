/**
* Draw layer for a camicroscope instance, makes geojson polygon
* @param viewer - the viewer to associate with
* @param layer - the layer to draw onto
* @param testmode - whether to skip the render step for testing
* @property data - the geojson assotiated with the drawing
**/

// TODO event handler
// TODO may need to use simplify,js to simplify the points 
// how to collect data?
class Draw{
  constructor(viewer, options = {}){
    this.viewer = viewer;

    // draw mode on/off
    this.isOn = false;
    // is drawing things
    this.isDrawing = false;

    // creat supplies free, square, rectangle
    this.drawMode = 'free'; // 'free', 'square', 'rect'
    

    // coordinate mode [image [range: 0 - width/heigh ] or view [ range:0 - 1;]
    this.coordinationMode = 'image';//

    //
    //
    //
    this.__handlers = {
      'draw-stop':[],
      'draw-start':[]
    }
    this._event = {
      start:this.startDrawing.bind(this), 
      stop:this.stopDrawing.bind(this),
      drawing:this.drawing.bind(this)
    };
    // ctx styles opt
    this.style = {
      color: '#7CFC00', // default black
      lineWidth:3, // 
      lineJoin: 'round', // "bevel" || "round" || "miter";
      lineCap: 'round' // "butt" || "round" || "square";
    }

    // style context menu
    this.contextMenu = new StyleContextMenu(
      this, 
      {
        btns:options.btns
      }
    );

    // draw things or paths on it and collect data
    this._draw_ = document.createElement('canvas');
    this._draw_.id = '_draw_';
    this._draw_ctx = this._draw_.getContext('2d');
    
    // display what paths or things draw on
    this._display_ = document.createElement('canvas');
    this._display_.id = '_display_';
    this._display_ctx = this._display_.getContext('2d');
    
    // set canvas size based on the image of slide/viewer
    this.__resetSize();
    
    // record coord for drawing and collecting data
    this._last = [0,0];
    
    this.data = {type:"Feature", geometry:{coordinates:[], type:"MultiPolygon"}};

    // [
    //   { 
    //   path:[{x,y}...]
    //   style:{} object that store style
    //   drawMode: object that store draw mode['free','square','rect']
    //   }, reperesent a note with a path/draw
    //   {x,y,note,style}
    // ]
    this._current_path_ = {};
    this._draws_data_ = [];
    this._path_index = 0;
    
    // disable undo and redo
    this.contextMenu.ctrl[1].disabled = true;
    this.contextMenu.ctrl[2].disabled = true;
    
    // add to viewer
    //this.__initOverLayer();

  }

  addHandler(name, func){
    if(!this.__handlers[name]) return;
    this.__handlers[name].push(func);
  }
  removeHandler(name, func){
    if(!this.__handlers[name]) return;
    const f = this.__handlers[name].find(f => f === func);
    //const layer = this.overlayers.find(layer => layer.id == id);
    const index = this.__handlers.indexOf(f);
    if (index > -1) {
      this.__handlers.splice(index, 1);
      return true;
    }
    return false;
  }

  drawOn(){
    // stop turning on draw mode if already turn on
    if(this.isOn === true) return;
    // clock viewer
    //this.viewer.controls.bottomright.style.display = 'none';
    this.viewer.setMouseNavEnabled(false);
    this._draw_.style.cursor = 'pointer';

    // add Events
    this._draw_.addEventListener('mousemove', this._event.drawing);
    this._draw_.addEventListener('mouseout',this._event.stop);
    this._draw_.addEventListener('mouseup',this._event.stop);
    this._draw_.addEventListener('mousedown',this._event.start);
    //
    this.isOn = true;
    
    // add _draw_ and _display_ layer on top and show
    this.__addOverLayers();

    // context menu draw mode checked
    this.contextMenu.ctrl[0].checked = true;
  }

  drawOff(isCloseMenu = false){
    // stop turning off draw mode if already turn off
    //if(this.contextMenu) this.contextMenu.
    if(this.isOn === false) return;
    // unclock viewer
    //this.viewer.controls.bottomright.style.display = '';
    this.viewer.setMouseNavEnabled(true);
    this._draw_.style.cursor = 'default';
    // remove Events
    this._draw_.removeEventListener('mousemove', this._event.drawing);
    this._draw_.removeEventListener('mouseout',this._event.stop);
    this._draw_.removeEventListener('mouseup',this._event.stop);
    this._draw_.removeEventListener('mousedown',this._event.start);

    this.isOn = false;
    // set remove _draw_ and _display_ layer and hide
    this.__removeOverLayers();

    // context menu draw mode unchecked
    this.contextMenu.ctrl[0].checked = false;
    // close contextmenu
    if(isCloseMenu) this.contextMenu.close();
  }

  /*
  * Start drawing in a new geojson feature
  */
  startDrawing(e){
    //prevent to open context menu when click on drawing mode
    let isRight;
    e = e || window.event;
    if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRight = e.which == 3; 
    else if ("button" in e)  // IE, Opera 
        isRight = e.button == 2; 
    if(e.ctrlKey || isRight) return;
    
    // close style context menu if it open
    this.contextMenu.close(e);

    // start drawing
    this.isDrawing = true;
    this._draw_.style.cursor = 'crosshair'
    let point = new OpenSeadragon.Point(e.clientX, e.clientY);
    let img_point = this.viewer.viewport.windowToImageCoordinates(point);
    this._last = [img_point.x,img_point.y]
    // first feature within
    this.__newFeature(this._last.slice());
  }
  
  drawing(e){
    if(!this.isDrawing || !this.isOn) return;
    // drawing
    let point = new OpenSeadragon.Point(e.clientX, e.clientY);
    let img_point = this.viewer.viewport.windowToImageCoordinates(point);

    //set style for ctx
    DrawHelper.setStyle(this._draw_ctx,this.style);
    this._draw_ctx.fillStyle = hexToRgbA(this.style.color,0.1);
    switch (this.drawMode) {
      case 'free':
        // draw line
        DrawHelper.drawLine(this._draw_ctx, this._last, [img_point.x,img_point.y]);  
        this._last = [img_point.x,img_point.y];
        
        // store current point
        this._current_path_.data.points.push(this._last.slice());
        break;

      case 'square':
        // draw square
        DrawHelper.clearCanvas(this._draw_);
        this._current_path_.data = DrawHelper.drawRectangle(this._draw_ctx,this._last,[img_point.x,img_point.y],true);
        //this._current_path_.path=[s,e];
        break;
      case 'rect':
        // draw rectangle
        DrawHelper.clearCanvas(this._draw_);
        this._current_path_.data = DrawHelper.drawRectangle(this._draw_ctx,this._last,[img_point.x,img_point.y]);
        break;
      default:
        // statements_def
        break;
    }
  }
  /*
  * stop drawing
  @ @returns data - the geojson assotiated with the drawing
  */
  stopDrawing(e){
    if(this.isDrawing) {
      // add style and data to data collection
      this.__endNewFeature();

    };


    // this is the geometry data, in points; conv to geojson
    this.isDrawing = false;
    this._draw_.style.cursor = 'pointer';
    
  }
  /* private method */
  
  __resetSize(){
    let {x:width, y:height} = this.viewer.world.getItemAt(0).getContentSize();
    this._draw_.width = width;
    this._draw_.height = height;
    this._draw_.style.zIndex = 500;
    this._display_.width = width;
    this._display_.height = height;
    this._display_.style.zIndex = 500;

  }
  __addOverLayers(){

    let {x:width, y:height} = this.viewer.world.getItemAt(0).getContentSize();
    this.viewer.addOverlay({
      element: this._display_,
      location: this.viewer.viewport.imageToViewportRectangle(0,0,width,height)
      });
    this.viewer.addOverlay({
      element: this._draw_,
      location: this.viewer.viewport.imageToViewportRectangle(0,0,width,height)
    });
  }
  __removeOverLayers(){
    this.viewer.removeOverlay(this._display_);
    this.viewer.removeOverlay(this._draw_);

  }

  getPaths() { //Image [for draw on image] // Viewport
    
    return this._draws_data_.slice(0,this._path_index);
  }

  clear(){
    DrawHelper.clearCanvas(this._draw_);
    DrawHelper.clearCanvas(this._display_);
    // clear path data
    this._current_path_ = {};
    this._draws_data_ = [];
    this._path_index = 0;
    this.contextMenu.ctrl[1].disabled = true;
    this.contextMenu.ctrl[2].disabled = true;
  }

  /*
  * adds the point to the current feature
  @ @param x - x position in logical coords
  @ @param y - y position in logical coords
  */
  __extendFeature(x,y){
    this._current_path_.data.points.add({x:x,y:y});
  }
  /*
  * creates a new feature in the geojson coordinate list
  */
  __newFeature(point){
    this._current_path_={
      data:{
        points:[point],
        path:null,
      },
      style:{}
    };
  }
  __isOnlyTwoSamePoints(points){
    if(points.length == 2 && points[0].x == points[1].x && points[0].y == points[1].y){
      return true;
    }
    return false;
  }
  __endNewFeature(){
    if(this._current_path_.data.points.length < 2 || this.__isOnlyTwoSamePoints(this._current_path_.data.points)  ) return; // click on canvas
    console.log(this._current_path_);
    // set style and drawing model
    this._current_path_.style.color = this.style.color;
    this._current_path_.style.lineJoin = this.style.lineJoin;
    this._current_path_.style.lineCap = this.style.lineCap;
    this._current_path_.style.lineWidth = this.style.lineWidth;
    let points = this._current_path_.data.points;
    points.push(points[0]);
    
    if(this.drawMode === 'free') {
      // simplify
      this._current_path_.data.points = simplify(points);
    };
    // other styles
    DrawHelper.setStyle(this._display_ctx, this._current_path_.style);
    // fill color
    this._display_ctx.fillStyle = hexToRgbA(this._current_path_.style.color,0.1);
    DrawHelper.drawPolygon(this._display_ctx, this._current_path_.data.points);

    // 
    if(this._path_index < this._draws_data_.length){
      this._draws_data_ = this._draws_data_.slice(0,this._path_index);
    }
    
    this._draws_data_.push(Object.assign({},this._current_path_));
    this._path_index++;
    this.contextMenu.ctrl[2].disabled = true;

    // enable undo btns
    if(this.contextMenu &&this._path_index > 0){
      this.contextMenu.ctrl[1].disabled = false;
    }

    this._current_path_ = null;
    DrawHelper.clearCanvas(this._draw_); 
  }

  __undo(){
    this._path_index--;
    // clear canvas
    DrawHelper.clearCanvas(this._display_); 
    // redraw path
    if(this._path_index > 0) DrawHelper.draw(this._display_ctx,this._draws_data_.slice(0,this._path_index));
     
    if(this.contextMenu && this._path_index <= 0) this.contextMenu.ctrl[1].disabled = true;
    this.contextMenu.ctrl[2].disabled = false;

  }
  __redo(){
    // redraw path
    DrawHelper.draw(this._display_ctx,[this._draws_data_[this._path_index]]);
    this._path_index++;
    // 
    if(this.contextMenu && this._path_index == this._draws_data_.length) this.contextMenu.ctrl[2].disabled = true;
    this.contextMenu.ctrl[1].disabled = false;
  }
}

try{
  module.exports = Draw;
}
catch(e){
  var a
}
