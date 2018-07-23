/**
* Layer manager for camicroscope
* @param viewer - the viewer to associate with
* @property layers - the ViewportCalibratedCanvas layer objects
* @property delayers - the ProxyTool delayers which hold image coordinates
* @property visibleLayers - the names of visible layers
**/
class Layer{
  constructor(viewer){
    this.viewer = viewer;
    this.layers={};
    this.delayers={};
    this.visibleLayers=new Set([]);
  }
  /**
  * gets a layer, creating it if it does not exist, and sets it visible
  * @param name - the layer to get and activate
  **/
  getLayer(name){
    if (!(name in this.layers)){
      this.delayers[name] = delayer({});
      this.layers[name] = ViewportCalibratedCanvas(this.delayers[name], this.viewer);
    }
    this.showLayer(name)
    return this.layers[name]
  }
  /**
  * hides a layer, but does not delete the associated data - can be seemlessly reactivated
  * @param name - the layer to hide
  **/
  hideLayer(name){
    this.visibleLayers.delete(name)
  }
  /**
  * clears all layer and delayer data, associated with changing image
  **/
  resetAll(){
    this.layers={};
    this.delayers={};
    this.visibleLayers=new Set([]);
  }
  /**
  * clears all layer and delayer data, associated with changing image
  **/
  showLayer(name){
    this.visibleLayers.add(name)
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
