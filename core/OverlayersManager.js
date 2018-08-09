/**
* Layer manager for camicroscope
* @param viewer - the viewer to associate with
* @property layers - the ViewportCalibratedCanvas layer objects
* @property delayers - the ProxyTool delayers which hold image coordinates
* @property visibleLayers - the names of visible layers
**/
class OverlayersManager{
  constructor(viewer){
    this.startIndex = 10;
    this.viewer = viewer;
    this.overlayers=[];
    //this.delayers={};
    //this.visibleLayers=new Set([]);
  }

  // get overlayer by id
  getOverlayer(id){
    return this.overlayers.find(layer => layer.id == id);
  }

  // data or render changed and wants to redraw overlayer
  updateOverlayer(id){
    const overlayer = this.getOverlayer(id);
    overlayer.draw();
  }

  // add a new overlayer
  addOverlayer(options, isShow = true, isDraw = true){
    if(this.overlayers.find(layer => layer.id == options.id)){
      console.warn('duplicate overlayer ID');
      return;
    }

    options.viewer = this.viewer;
    // create a new overlayer and add to the array that stores overlayers
    const overlayer = new AnnotationCanvasOverlayer(options, isShow)
    this.overlayers.push(overlayer);

    // add it to the viewer if isShow == true
    //if(isShow){
    overlayer.addToViewer();
    //}

    //add draw the data on canvas if isDraw == true
    if(isDraw){
      overlayer.draw();
    }
    return overlayer;
  }

  // 
  removeOverlayer(id){

    const layer = this.overlayers.find(layer => layer.id == id);
    layer.removeFromViewer();
    const index = this.overlayers.indexOf(layer);
    if (index > -1) {
      this.overlayers.splice(index, 1);
      return true;
    }
    return false;

  }


  //
  
  sort([]){
    console.log('layerManager:sort');
  }
  /**
  * gets a layer, creating it if it does not exist, and sets it visible
  * @param name - the layer to get and activate
  **/
  // getLayer(name){
  //   if (!(name in this.layers)){
  //     this.delayers[name] = delayer({});
  //     this.layers[name] = ViewportCalibratedCanvas(this.delayers[name], this.viewer);
  //   }
  //   this.showLayer(name)
  //   return this.layers[name]
  // }
  /**
  * hides a layer, but does not delete the associated data - can be seemlessly reactivated
  * @param name - the layer to hide
  **/
  hideOverlayer(id){
    const layer = this.getOverlayer(id);
    if(!layer){
      console.warn(`${id} layer doesn't exist.`);
      return;
    }
    layer.hide();
  }
  /**
  * clears all layer and delayer data, associated with changing image
  **/
  showOverlayer(id){

    const layer = this.getOverlayer(id);
    if(!layer){
      console.warn(`${id} layer doesn't exist.`);
      return;
    }
    layer.show(); 
  }
  /**
  * clears all layer and delayer data, associated with changing image
  **/
  resetAll(){
    // remove all overlayer from viewer
    this.overlayers.forEach(layer => {
      layer.removeFromViewer();
      // destory each layers
      layer = null;
    },this);
    // clear overlayers
    this.overlayers = [];

  }

  /**
  * draws all visible layers
  * @param onto - the canvas object to draw layers onto
  **/
  drawVisible(onto){
    for (let name of this.visibleLayers.entries()){
      let dl = this.delayers[name[0]]
      if (dl){
        dl.__apply_all(onto);
      }
    }
  }

}

try{
  module.exports = Layer;
}
catch(e){
  var a
}
