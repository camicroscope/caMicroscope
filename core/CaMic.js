/** Class representing camicroscope core instance **/
class CaMic{
  /**
  * create a camic core instance
  * @param divId - the div id to inject openseadragon into
  * @param slideId - the id of the slide to load
  * @property slideId - the slide id
  * @property viewer - the OSD viewer object
  * @property draw - the drawing layer controls
  * @property layers - the layer controller
  */
  constructor(divId,slideId, options){
    // initalize viewer
    this.__default_opt = {
      id: divId,
      prefixUrl: "images/",

      // -- navigator setting
      showNavigationControl:false,
      showNavigator: true,
      navigatorAutoFade: false,
      navigatorPosition: "BOTTOM_RIGHT",


      zoomPerClick: 1,
      animationTime: 0.75,
      maxZoomPixelRatio: 1,
      visibilityRatio: 1,
      maxZoomLevel:4,
      minZoomLevel:.4,
      constrainDuringPan: true
    }

    extend(this.__default_opt, options);

    this.viewer = new OpenSeadragon.Viewer(this.__default_opt);
    // initialize layers
    //this.__draw;
    //this.__hover;


    this.layersManager; // = new Layer(this.viewer);
    this.draw;// = new Draw(this.viewer);
    
    this.slideId = slideId;
    // initalize store
    this.store = new Store({});
    this.store.setId(slideId)
    // load image
    // set overlay thing

    

    this.viewer.addHandler('open',this.init.bind(this));
  
  
  }

  init(){
    this.draw = new Draw(this.viewer,{
      btns:this.__default_opt.draw.btns
    });
    this.layersManager = new OverlayersManager(this.viewer);
    this.viewer.removeHandler('open', this.init.bind(this));
    this.viewer.controls.bottomright.style.zIndex = 600;
  }
  /**
  * Change which image is staged, used loadImg to load it.
  */
  setImg(slideId){
    this.layers.resetAll();
    this.slideId = slideId;
    this.store.setId(slideId)
  }
  /**
  * Loads the staged image
  */
  loadImg(){
    // loads current image
    this.store.getSlide()
      .then((x)=>{
        this.viewer.open(x[0].location);
        this.scalebar(x[0].mpp)
      })
      .catch(console.log)
  }
  /**
  * Set up a scalebar on the image
  * @param {number} mpp - microns per pixel of image
  */
  scalebar(mpp){
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
