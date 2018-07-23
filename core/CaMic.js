// camicroscope object
class CaMic{
  constructor(divId,slideId){
    // initalize viewer
    this.viewer = new OpenSeadragon.Viewer({
      id: divId,
      prefixUrl: "images/",
      showNavigator: true,
      navigatorPosition: "BOTTOM_RIGHT",
      //navigatorId: "navigator",
      zoomPerClick: 2,
      animationTime: 0.75,
      maxZoomPixelRatio: 2,
      visibilityRatio: 1,
      constrainDuringPan: true
      //zoomPerScroll: 1
    });
    // initialize layers
    this.layers = new Layer(this.viewer);
    this.draw = new Draw(this.layers.getLayer("drawing"))
    this.slideId = slideId;
    // initalize store
    this.store = new Store({});
    // load image
    // set overlay thing
    this.overlay = viewer.canvasOverlay({
        clearBeforeRedraw:true,
        onRedraw:function() {
          var lw = 50 / (this.viewer.viewport.getZoom(true));
          this.overlay.context2d().lineWidth = lw
          this.layers.drawVisible(this.overlay.context2d());
        }
    });
  }
  setImg(slideId){
    // when changing image, clear all stuff
    this.layers.resetAll();
    this.slideId = slideId;
  }
  
  loadImg(){
    // loads current image
    this.store.setId(slideId);
    this.store.getSlide()
      .then((x)=>viewer.open(x[0].location))
      .catch(console.log)
  }
}
