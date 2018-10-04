/** Class representing camicroscope core instance **/
// proposal:
// test:
// constructor
// load on each component

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
  constructor(divId, slideId, options){
    // initalize viewer
    this.setting = {
      id: divId,
      prefixUrl: "images/",
      constrainDuringPan:true,
      // -- navigator setting
      showNavigationControl:false,
      showNavigator: true,
      navigatorAutoFade: false,
      navigatorPosition: "BOTTOM_RIGHT",
      zoomPerClick: 1,
      animationTime: 0.1,
      maxZoomPixelRatio: 1,
      visibilityRatio: 1,
      springStiffness:0.0001,

      /* extension */
      hasZoomControl:true,
      hasDrawLayer:true,
      hasLayerManager:true,
      hasScalebar:true
    }
    extend(this.setting, options);

    this.viewer = new OpenSeadragon.Viewer(this.setting);

    this.slideId = slideId;
    // initalize store
    this.store = new Store();
    // load image
    // set overlay thing
    this.viewer.addOnceHandler('open',this.init.bind(this));
  }

  /**
   * initialize the CAMIC and the dependenced components
   */
  init(){
    this.viewer.controls.bottomright.style.zIndex = 600;

    this.viewer.addOnceHandler('tile-loaded', function(){
      $UI.message.add('Tile loaded');
      Loading.close();
      // set zoom and pan
      if(this.setting.states){
        const states = this.setting.states;
        var pt = new OpenSeadragon.Point(states.x, states.y);
        this.viewer.viewport.zoomTo(states.z, pt);
        this.viewer.viewport.panTo(pt, true);
      }
    }.bind(this));

    // create draw pulgin
    this.createCanvasDraw();
    this.createOverlayers();




    // change navigator style
    if(this.setting.showNavigator){
      const nav = this.viewer.element.querySelector('.navigator');
      nav.style.backgroundColor = '#365f9c';
      nav.style.opacity = 1;
    }

    this.createZoomControl();

  }
  /**
  * Change which image is staged, used loadImg to load it.
  */
  setImg(slideId){
    this.layers.resetAll();
    this.slideId = slideId;
  }
  /**
  * Loads the staged image
  */
  loadImg(func){
    // loads current image
    this.store.findSlide(this.slideId)
      .then((x)=>{
        if(!x || !OpenSeadragon.isArray(x) || !x.length || !x[0].location){
          redirect($D.pages.table,`Can't find the slide information`);
          return;
        }

        this.viewer.open("./img/Slide/"+ x[0]["_id"]["$oid"] + ".dzi");
        // set scalebar
        this.createScalebar(x[0].mpp)
        var imagingHelper = new OpenSeadragonImaging.ImagingHelper({
          viewer: this.viewer
        });
        imagingHelper.setMaxZoom(1);
        if(func && typeof func === 'function') func.call(null,x[0]);
        Loading.text.textContent = `loading slide's tiles...`;
        //func.call(null,x[0]);
      })
      .catch(e=>{
        Loading.close();
        $UI.message.addError('loadImg Error');
        console.error(e);

        if(func && typeof func === 'function') func.call(null,{hasError:true,message:e});
      })
  }
  /**
   * set up a zoom control functionality on the image
   */
  createZoomControl(){
    if(!this.setting.hasZoomControl) return;
    this.viewer.cazoomctrl({
      position:"BOTTOM_RIGHT",
      autoFade: false
    });
  }
  /**
   * set up a canvas Draw functionality on the image
   */
  createCanvasDraw(){
    if(!this.setting.hasDrawLayer) return;
    this.viewer.canvasDraw();
    // create style context menu for draw
    this.drawContextmenu = new StyleContextMenu(
      this.viewer.container,
      {
        btns:this.setting.draw.btns
      }
    );

    // add event to hook up
    this.drawContextmenu.addHandler('style-changed',function(e){
      this.viewer.canvasDrawInstance.style = e.style;
    }.bind(this));

    this.drawContextmenu.addHandler('undo',function(e){
      this.viewer.canvasDrawInstance.undo();
    }.bind(this));

    this.drawContextmenu.addHandler('redo',function(e){
      this.viewer.canvasDrawInstance.redo();
    }.bind(this));

    this.drawContextmenu.addHandler('clear',function(e){
      if(this.viewer.canvasDrawInstance._draws_data_.length == 0) return;
      if(confirm("Do you want to clear all markups?")) this.viewer.canvasDrawInstance.clear();
    }.bind(this));

    this.drawContextmenu.addHandler('draw-mode-changed',function(e){
      this.viewer.canvasDrawInstance.drawMode = e.mode;
    }.bind(this));

    this.drawContextmenu.addHandler('draw',draw);
  }

  /**
   * set up a overlay manage on the image
   */
  createOverlayers(){
    if(!this.setting.hasLayerManager) return;
    this.viewer.overlaysManager();
  }

  /**
  * Set up a scalebar on the image
  * @param {number} mpp - microns per pixel of image
  */
  createScalebar(mpp){
    if(!this.setting.hasScalebar) return;
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

  /**
   * Function to destroy the instance of CaMic and clean up everything created by CaMic.
   *
   * Example:
   * var camic = CaMic({
   *   [...]
   * });
   *
   * //when you are done with the camic:
   * camic.destroy();
   * camic = null; //important
   *
   */
  destroy(){
    // destroy CanvasDraw's instance if exists
    if(this.viewer.canvasDrawInstance){
      this.viewer.canvasDrawInstance.destroy();
      this.viewer.canvasDrawInstance = null;
    }

    // destroy CaZoomControl's instance if exists
    if(this.viewer.cazoomctrlInstance){
      this.viewer.cazoomctrlInstance.destroy();
      this.viewer.cazoomctrlInstance = null;
    }

    // destroy OverlayManager's instance if exists
    if(this.viewer.omanager){
      this.viewer.omanager.destroy();
      this.viewer.omanager = null;
    }

    // destroy Scalebar's instance if exists
    if(this.viewer.scalebarInstance){
      for(const key in this.viewer.scalebarInstance){
        this.viewer.scalebarInstance[key] = null;
      }
      this.viewer.scalebarInstance;
    }

    // destroy viewer if exists
    this.viewer.destroy();
    this.viewer = null;
  }
}
