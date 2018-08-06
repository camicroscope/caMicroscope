/** Class representing osd overlayer instance **/
class CanvasOverlayer{
  /**
  * create a camic overlayer instance
  */
  constructor(id, viewer, data, render, isShow = true){
    // initalize viewer
    
    this.viewer = viewer;
    this.id = id; 
    //this.type = options.type; 
    this.data = data; 
    this.render = render;
    // only if osd is one image
    //
    //let {width, height} = viewer.world.getItemAt(0).getContentSize();
    this._canvas = document.createElement('canvas');
    this._canvas_ctx = this._canvas.getContext('2d');
    this._canvas.id = id;

    this._canvas_hover = document.createElement('canvas');
    this._canvas_hover_ctx = this._canvas.getContext('2d');
    this._canvas_hover.id = `${id}_hover`;
    if(isShow){
      this.show();
    }else{
      this.hide();
    }
    //this._canvas.width = width;
    //this._canvas.height = height; 

    //this._fabricCanvas; //= new fabric.Canvas(this._canvas);
    // disable fabric selection because default click is tracked by OSD
    //this._fabricCanvas.selection = false;
    // prevent OSD click elements on fabric objects
    // this._fabricCanvas.on('mouse:down', function (options) {
    //     console.log('_fabricCanvas');
    //     if (options.target) {
    //         options.e.preventDefaultAction = true;
    //         options.e.preventDefault();
    //         options.e.stopPropagation();
    //     }
    // });
    //this.render(this._fabricCanvas,this.data);
    this._canvas.addEventListener('click',e=>{
      console.log('click:_canvas');
    });
    this._canvas_hover.addEventListener('click',e=>{
      console.log('click:_hover');
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
    console.log(width, height);


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
  // clear canvas -> fabric
  clear(){
    this._fabricCanvas.clear();
  }

  // TODO click and show
  //  

}
