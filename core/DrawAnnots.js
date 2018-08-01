/**
* Draw layer for a camicroscope instance, makes geojson polygon
* @param viewer - the viewer to associate with
* @param layer - the layer to draw onto
* @param testmode - whether to skip the render step for testing
* @property data - the geojson assotiated with the drawing
**/


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
    this._event = {
      start:this.startDrawing.bind(this), 
      stop:this.stopDrawing.bind(this),
      drawing:this.drawing.bind(this)
    };
    // ctx styles opt
    this.style = {
      color: 'rgba(0,0,0,1)', // default black
      lineWidth:5, // 
      lineJoin: 'round', // "bevel" || "round" || "miter";
      lineCap: 'round' // "butt" || "round" || "square";
    }
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
    this._last = { x:0, y:0};
    
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
    // add to viewer
    //this.__initOverLayer();

  }


  drawOn(){
    // stop turning on draw mode if already turn on
    if(this.isOn === true) return;
    // clock viewer
    this.viewer.controls.bottomright.style.display = 'none';
    this.viewer.setMouseNavEnabled(false);
    this._draw_.style.cursor = 'pointer';

    // add Events
    this._draw_.addEventListener('mousemove', this._event.drawing);
    this._draw_.addEventListener('mouseout',this._event.stop);
    this._draw_.addEventListener('mouseup',this._event.stop);
    this._draw_.addEventListener('mousedown',this._event.start);
    //
    this.isOn = true;
    // 
    // add _draw_ and _display_ layer on top and show
    this.__addOverLayers();
  }

  drawOff(){
    // stop turning off draw mode if already turn off
    if(this.isOn === false) return;
    // unclock viewer
    this.viewer.controls.bottomright.style.display = '';
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
  }

  /*
  * Start drawing in a new geojson feature
  */
  startDrawing(e){
    console.log('start');
    this.isDrawing = true;
    this._draw_.style.cursor = 'crosshair'
    let point = new OpenSeadragon.Point(e.clientX, e.clientY);
    let img_point = viewer.viewport.windowToImageCoordinates(point);
    [this._last.x, this._last.y] = [img_point.x,img_point.y]
    // first feature within
    this.__newFeature({
      x:this._last.x,
      y:this._last.y
    });
  }
  
  drawing(e){
    if(!this.isDrawing || !this.isOn) return;
    // drawing
    let point = new OpenSeadragon.Point(e.clientX, e.clientY);
    let img_point = viewer.viewport.windowToImageCoordinates(point);

    //set style for ctx
    this.__setStyle(this._draw_ctx,this.style);
    switch (this.drawMode) {
      case 'free':
        // draw line
        this.__drawLine(this._draw_ctx, this._last, img_point);  
        [this._last.x, this._last.y] = [img_point.x,img_point.y]
        
        // store current point
        this._current_path_.path.push({x:this._last.x,y:this._last.y});
        break;

      case 'square':
        // draw square
        this.__clearCanvas(this._draw_);
        this._current_path_.path = this.__drawRectangle(this._draw_ctx,this._last,img_point,true);
        //this._current_path_.path=[s,e];
        break;
      case 'rect':
        // draw rectangle
        this.__clearCanvas(this._draw_);
        this._current_path_.path = this.__drawRectangle(this._draw_ctx,this._last,img_point);
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
    console.log('stop');
    if(this.isDrawing) {
      // add style and data to data collection
      this.__endNewFeature();
      //
      this.__draw(this._display_ctx, [this._current_path_])
      this._current_path_ = null;
      // clear _draw_
      this.__clearCanvas(this._draw_); 
    };


    // this is the geometry data, in points; conv to geojson
    this.isDrawing = false;
    this._draw_.style.cursor = 'pointer';
    console.log(this._draws_data_);
    // need closed polygons for mongo, re add first point
    //let pt=this.data.geometry.coordinates[this.data.geometry.coordinates.length-1][0][0]
    //this.data.geometry.coordinates[this.data.geometry.coordinates.length-1][0].push(pt)
    //return this.data;
  }
  /* private method */
  __draw(ctx, image_data){
    for (let i = 0; i < image_data.length; i++) {
      const polygon = image_data[i];
      this.__setStyle(ctx, polygon.style);
      //this.__setStyle(ctx,polygon.style);
      switch (polygon.drawMode) {
        case 'free':
          // statements_1
          const paths = polygon.path;
          for (let i = 0; i < paths.length-1; i++) {
            this.__drawLine(this._display_ctx, paths[i],paths[i+1]);
          }
          break;
        case 'square':
          // statements_1
          this.__drawRectangle(this._display_ctx, polygon.path[0],polygon.path[1],true);
          break;
        case 'rect':
          // statements_1
          this.__drawRectangle(this._display_ctx, polygon.path[0],polygon.path[1]);
          break;
        default:
          // statements_def
          break;
      }

    }

  }
  __resetSize(){
    let {x:width, y:height} = this.viewer.world.getItemAt(0).getContentSize();
    this._draw_.width = width;
    this._draw_.height = height;
    this._draw_.style.zIndex = 501;
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

  __clearCanvas(canvas){
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  __setStyle(ctx,style){
    ctx.strokeStyle = style.color;
    ctx.lineJoin = style.lineJoin;
    ctx.lineCap = style.lineCap;
    ctx.lineWidth = style.lineWidth;
  }

  __getRect(start,end){
    if(start < end){
      return [start, end-start]
    }else{
      return [end, start-end]

    }
  }

  __forRect(start,end){
    let [x,width] = this.__getRect(start.x,end.x);
    let [y,height] = this.__getRect(start.y,end.y);
    return [x,y,width,height];
  }

  __forSquare(start,end){
    let dx = Math.abs(start.x - end.x);
    let dy = Math.abs(start.y - end.y);
    let length = Math.max(dx,dy); // Math.max(dx,dy);
    let x = start.x < end.x ? start.x:start.x - length;
    let y = start.y < end.y ? start.y:start.y - length;
    return [x,y,length,length];
  }

  __drawRectangle(ctx, start, end, isSquare = false){
    // draw rect
    ctx.beginPath();
    let [x, y, width, height] = isSquare?this.__forSquare(start,end):this.__forRect(start,end);
    ctx.rect(x, y, width, height);
    ctx.stroke();
    return [{x:x,y:y},{x:x+width,y:y+height}];

  }

  __drawLine(ctx, start, end){
    // draw line
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x,end.y);
    ctx.stroke();
  }

  /*
  * adds the point to the current feature
  @ @param x - x position in logical coords
  @ @param y - y position in logical coords
  */
  __extendFeature(x,y){
    this._current_path_.path.add({x:x,y:y});
  }
  /*
  * creates a new feature in the geojson coordinate list
  */
  __newFeature(point){
    this._current_path_={
      path:[point],
      style:{},
      drawMode:null
    };
  }

  __endNewFeature(){
    this._current_path_.style.color = this.style.color;
    this._current_path_.style.lineJoin = this.style.lineJoin;
    this._current_path_.style.lineCap = this.style.lineCap;
    this._current_path_.style.lineWidth = this.style.lineWidth;
    this._current_path_.drawMode = this.drawMode;
    this._draws_data_.push(Object.assign({},this._current_path_));
  }
}

try{
  module.exports = Draw;
}
catch(e){
  var a
}
