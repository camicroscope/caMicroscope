/** Class representing osd overlayer instance **/
class CaMicCanvasOverLayer{
  /**
  * create a camic overlayer instance
  */
  constructor(viewer, options){
    // initalize viewer
    this.viewer = viewer;
    this.id = options.id; 
    //this.type = options.type; 
    this.data = options.data; 
    this.render = options.render;

    // only if osd is one image
    let {width, height} = viewer.world.getItemAt(0).getContentSize();
    this._canvas.width = width;
    this._canvas.height = height; 
    this._ctx = this._canvas.getContext('2d');
  }
}
