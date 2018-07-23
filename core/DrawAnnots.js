// if drawing
// keep list of points
// on mouse events add to this list
// call the renaerannots with current
class Draw{
  constructor(viewer, layer, testmode=false){
    this.layer = layer;
    this.data = {type:"Feature", geometry:{coordinates:[], type:"MultiPolygon"}};
    this.active = false;
    this.viewer=viewer;
    this.testmode = testmode
  }
  startDrawing(){
    this.active = true;
    // first feature within
    this.newFeature();
  }
  stopDrawing(){
    // this is the geometry data, in points; conv to geojson
    this.active = false;
    return this.data;
  }
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
  newFeature(){
    if (this.active){
        this.data.geometry.coordinates.push([[]])
    }
  }
  registerMouse(){
    this.viewer.canvas.addEventListener("mousedown", ()=>this.startDrawing())
    this.viewer.canvas.addEventListener("mouseup", ()=>console.log(this.stopDawing()))
    this.viewer.canvas.addEventListener("mousemove", (e)=>{
      let in_pt = new OpenSeadragon.Point(e.clientX, e.clientY)
      let out_pt = this.viewer.viewport.windowToViewportCoordinates(in_pt)
      this.extendFeature(out_pt.x,out_pt.y)
    })
  }
}

try{
  module.exports = Draw;
}
catch(e){
  var a
}
