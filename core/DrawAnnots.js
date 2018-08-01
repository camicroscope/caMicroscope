/**
* Draw layer for a camicroscope instance, makes geojson polygon
* @param viewer - the viewer to associate with
* @param layer - the layer to draw onto
* @param testmode - whether to skip the render step for testing
* @property data - the geojson assotiated with the drawing
**/
class Draw{
  constructor(viewer, options = {}){
    this.viewer = viewer;

    // draw mode on/off
    this.isOn = false;
    // is drawing things
    this.isDrawing = false;

    // creat supplies free, square, rectangle
    this.drawMode = 'free'; // 'free', 'square', 'rect'

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
    

    // add to viewer
    this.__initOverLayer();

  }


  drawOn(){
    // clock viewer
    this.viewer.setMouseNavEnabled(false);
    this._draw_.style.cursor = 'pointer';

    // add Events
    this._draw_.addEventListener('mousemove', this._event.drawing);
    this._draw_.addEventListener('mouseout',this._event.stop);
    this._draw_.addEventListener('mouseup',this._event.stop);
    this._draw_.addEventListener('mousedown',this._event.start);
    //
    this.isOn = true;
    // TODO add _draw_ layer on top and show
  }

  drawOff(){
    // unclock viewer
    this.viewer.setMouseNavEnabled(true);
    this._draw_.style.cursor = 'default';
    // remove Events
    this._draw_.removeEventListener('mousemove', this._event.drawing);
    this._draw_.removeEventListener('mouseout',this._event.stop);
    this._draw_.removeEventListener('mouseup',this._event.stop);
    this._draw_.removeEventListener('mousedown',this._event.start);

    this.isOn = false;
    // TODO set remove _draw_ layer and hide
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
    this.newFeature();
  }
  
  drawing(e){
    console.log(e);
    if(!this.isDrawing || !this.isOn) return;
    // drawing
    let point = new OpenSeadragon.Point(e.clientX, e.clientY);
    let img_point = viewer.viewport.windowToImageCoordinates(point);

    switch (this.drawMode) {
      case 'free':
        // statements_1
        this.__freeDraw(img_point);
        break;

      case 'square':
        // statements_1
        this.__drawRectangle(img_point, true);
        break;
      case 'rect':
        // statements_1
        this.__drawRectangle(img_point);
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
    // this is the geometry data, in points; conv to geojson
    this.isDrawing = false;
    this._draw_.style.cursor = 'pointer'
    // need closed polygons for mongo, re add first point
    //let pt=this.data.geometry.coordinates[this.data.geometry.coordinates.length-1][0][0]
    //this.data.geometry.coordinates[this.data.geometry.coordinates.length-1][0].push(pt)
    //return this.data;
  }
  /* private method */
  __resetSize(){
    let {x:width, y:height} = this.viewer.world.getItemAt(0).getContentSize();
    this._draw_.width = width;
    this._draw_.height = height;
    this._draw_.style.zIndex = 501;
    this._display_.width = width;
    this._display_.height = height;
    this._display_.style.zIndex = 500;

  }
  __initOverLayer(){

    let {x:width, y:height} = this.viewer.world.getItemAt(0).getContentSize();
    // this.viewer.addOverlay({
    //   element: this._display_,
    //   location: this.viewer.viewport.imageToViewportRectangle(0,0,width,height)
    //   });
    // this.viewer.addOverlay({
    //   element:this._draw_,
    //   location: this.viewer.viewport.imageToViewportRectangle(0,0,width,height)
    // });
  }

  __setStyle(ctx){
    ctx.strokeStyle = this.style.color;
    ctx.lineJoin = this.style.lineJoin;
    ctx.lineCap = this.style.lineCap;
    ctx.lineWidth = this.style.lineWidth;
  }

  __freeDraw(img_point){
    // create canvas
    this.__setStyle(this._draw_ctx);
    this._draw_ctx.beginPath();
    this._draw_ctx.moveTo(this._last.x, this._last.y);
    this._draw_ctx.lineTo(img_point.x,img_point.y);
    this._draw_ctx.stroke();

    // record
    [this._last.x, this._last.y] = [img_point.x,img_point.y]
  }

  __drawSquare(e,img_point){
    // clear 
    this._draw_ctx.clearRect(0, 0, this._draw_.width, this._draw_.height);
    // draw rect
    this._setStyle(this._draw_ctx);
    this._draw_ctx.beginPath();

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

  __drawRectangle(img_point,isSquare = false){
    // clear
    // 
    this._draw_ctx.clearRect(0, 0, this._draw_.width, this._draw_.height);
    // draw rect
    this.__setStyle(this._draw_ctx);
    this._draw_ctx.beginPath();
    let [x, y, width, height] =isSquare?this.__forSquare(this._last,img_point):this.__forRect(this._last,img_point);
    this._draw_ctx.rect(x, y, width, height);
    this._draw_ctx.stroke();
  }



  /*
  * adds the point to the current feature
  @ @param x - x position in logical coords
  @ @param y - y position in logical coords
  */
  extendFeature(x,y){
    if (this.active){
      let pt=[x,y];
      this.data.geometry.coordinates[this.data.geometry.coordinates.length-1][0].push(pt)
      this.layer.__clear_queue()
      if (!this.testmode){
        renderFeature("drawingnow", this.data, this.layer)
      }
    }
  }
  /*
  * creates a new feature in the geojson coordinate list
  */
  newFeature(){
    if (this.active){
        this.data.geometry.coordinates.push([[]])
    }
  }
}

try{
  module.exports = Draw;
}
catch(e){
  var a
}
