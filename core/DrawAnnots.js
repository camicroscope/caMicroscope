/**
* Draw layer for a camicroscope instance, makes geojson polygon
* @param viewer - the viewer to associate with
* @param layer - the layer to draw onto
* @param testmode - whether to skip the render step for testing
* @property data - the geojson assotiated with the drawing
**/
class Draw{
  constructor(viewer, layer, testmode=false){
    this.layer = layer;
    this.data = {type:"Feature", geometry:{coordinates:[], type:"MultiPolygon"}};
    this.active = false;
    this.viewer=viewer;
    this.testmode = testmode
  }
  /*
  * Start drawing in a new geojson feature
  */
  startDrawing(){
    this.active = true;
    // first feature within
    this.newFeature();
  }
  /*
  * stop drawing
  @ @returns data - the geojson assotiated with the drawing
  */
  stopDrawing(){
    // this is the geometry data, in points; conv to geojson
    this.active = false;
    return this.data;
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
  /*
  * Registers mouse events to the viewer
  */
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
