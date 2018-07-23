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
      constrainDuringPan: true,
      navigatorAutoFade: false
      //zoomPerScroll: 1
    });
    // initialize layers
    this.layers = new Layer(this.viewer);
    this.draw = new Draw(this.layers.getLayer("drawing"))
    this.slideId = slideId;
    // initalize store
    this.store = new Store({});
    this.store.setId(slideId)
    // load image
    // set overlay thing
    this.overlay = this.viewer.canvasOverlay({
        clearBeforeRedraw:true,
        onRedraw:function() {
          var lw = 50 / (this.viewer.viewport.getZoom(true));
          this.overlay.context2d().lineWidth = lw
          this.layers.drawVisible(this.overlay.context2d());
        }.bind(this)
    });
  }
  setImg(slideId){
    // when changing image, clear all stuff
    this.layers.resetAll();
    this.slideId = slideId;
    this.store.setId(slideId)
  }

  loadImg(){
    // loads current image
    this.store.getSlide()
      .then((x)=>{
        this.viewer.open(x[0].location);
        this.scalebar(x[0].mpp)
      })
      .catch(console.log)
  }
  scalebar(mpp){
    // set up for scalebar
    try {
      this.viewer.scalebar({
              type: OpenSeadragon.ScalebarType.MAP,
              pixelsPerMeter: (1 / (parseFloat(mpp) * 0.000001)),
              xOffset: 5,
              yOffset: 10,
              stayInsideImage: true,
              color: "rgb(150,150,150)",
              fontColor: "rgb(100,100,100)",
              backgroundColor: "rgba(255,255,255,0.5)",
              barThickness: 2
          });
      } catch (ex) {
          console.log("scalebar err: ", ex.message);
      }
  }
}
