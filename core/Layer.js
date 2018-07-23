class Layer{
  constructor(viewer){
    this.viewer = viewer;
    this.layers={};
    this.delayers={};
    this.visibleLayers=new Set([]);
  }
  getLayer(name){
    if (!(name in this.layers)){
      this.delayers[name] = delayer({});
      this.layers[name] = ViewportCalibratedCanvas(this.delayers[name], this.viewer);
    }
    this.showLayer(name)
    return this.layers[name]
  }
  hideLayer(name){
    this.visibleLayers.delete(name)
  }
  resetAll(){
    this.layers={};
    this.delayers={};
    this.visibleLayers=new Set([]);
  }
  // add a layer to the visible list
  showLayer(name){
    this.visibleLayers.add(name)
  }
  // draw all visible layers
  drawVisible(onto){
    for (let name of this.visibleLayers.entries()){
      this.delayers[name].__apply_all(onto);
    }
  }

}
