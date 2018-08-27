/** Class representing osd overlayer instance **/
class AnnotationCanvasOverlayer{
  /**
  * create a camic overlayer instance
  */
  constructor(options, isShow = true){
    // initalize viewer
    
    this.viewer = options.viewer;
    this.id = options.id; 
    //this.type = options.type; 
    this.data = options.data; 
    this.render = options.render;
    // only if osd is one image
    
    this.clickable = options.clickable || false;
    this.isHighlight = options.isHighlight || false;
    this.clickCallback = options.clickCallback|| null;

    // this.delete = options.deleteCallBack;
    // this.edit = options.editCallBack;

    //let {width, height} = viewer.world.getItemAt(0).getContentSize();
    this._canvas = document.createElement('canvas');
    this._canvas_ctx = this._canvas.getContext('2d');
    this._canvas.id = options.id;

    this._canvas_hover = document.createElement('canvas');
    this._canvas_hover_ctx = this._canvas_hover.getContext('2d');
    this._canvas_hover.id = `${options.id}_hover`;
    if(isShow){
      this.show();
    }else{
      this.hide();
    }

    this._event = {
      highlight:Debounce(this.highlight.bind(this)), 
      click:this.click.bind(this),
      //drawing:this.drawing.bind(this)
    };

    if(this.clickable) this.clickableOn();
    if(this.isHighlight) this.higlightOn();
  }

  clickableOff(){
    this._canvas_hover.removeEventListener('click',this._event.click);
 
  }

  clickableOn(){
    this._canvas_hover.addEventListener('click',this._event.click);
  
  }

  click(e){
    if(!this.clickCallback) return;
    const point = new OpenSeadragon.Point(e.clientX, e.clientY);
    const img_point = this.viewer.viewport.windowToImageCoordinates(point);
    this.data.canvasData.forEach(item => {
      const path = item.data.path;
      if(path.contains(img_point.x,img_point.y)){
        this.clickCallback({x:e.clientX, y:e.clientY}, this.data);
        return;
      }
    });
  }

  higlightOff(){
    this._canvas_hover.removeEventListener('mousemove',this._event.highlight);
  }
  
  higlightOn(){
    this._canvas_hover.addEventListener('mousemove',this._event.highlight);
  }
  
  highlight(e){
    this._canvas_hover.style.cursor = 'default';
    DrawHelper.clearCanvas(this._canvas_hover);
    const point = new OpenSeadragon.Point(e.clientX, e.clientY);
    const img_point = this.viewer.viewport.windowToImageCoordinates(point);
    this.data.canvasData.forEach(item =>{
      const path = item.data.path;
      if(path.contains(img_point.x,img_point.y)){
        this._canvas_hover.style.cursor = 'point';
        this._canvas_hover_ctx.lineJoin = 'round';
        this._canvas_hover_ctx.lineCap = 'round';
        this._canvas_hover_ctx.fillStyle = hexToRgbA(item.style.color,0.3);
        this._canvas_hover_ctx.strokeStyle = item.style.color;
        this._canvas_hover_ctx.lineWidth = item.style.lineWidth < 10? item.style.lineWidth + 5 : item.style.lineWidth*1.5;
        path.strokeAndFill(this._canvas_hover_ctx);
      }
    }); 
  }


  // add to Viewer
  addToViewer(){
    let {x:width, y:height} = this.viewer.world.getItemAt(0).getContentSize();
    this._canvas.width = width;
    this._canvas.height = height; 
    this.viewer.addOverlay({
      element: this._canvas,
      location: this.viewer.viewport.imageToViewportRectangle(0,0,width,height)
    });
    this._canvas_hover.width = width;
    this._canvas_hover.height = height;
    this.viewer.addOverlay({
      element: this._canvas_hover,
      location: this.viewer.viewport.imageToViewportRectangle(0,0,width,height)
    });
  }

  // remove form viewer
  removeFromViewer(){
    this.viewer.removeOverlay(this._canvas);
    this.viewer.removeOverlay(this._canvas_hover);
  }

  hide(){
    this._canvas.style.display = 'none';
    this._canvas_hover.style.display = 'none';
  }

  show(){
    this._canvas.style.display = '';
    this._canvas_hover.style.display = '';
  }
  // redraw based on data
  draw(data){
    if(data) this.data = data;
    this.render(this);
  }
  // clear canvas 
  clear(){
    //this._fabricCanvas.clear();
  }
  setZIndex(index){
    this._canvas.style.zIndex = index;
    this._canvas_hover.style.zIndex = index;
  } 

}
