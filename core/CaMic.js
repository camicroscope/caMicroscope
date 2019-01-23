/** Class representing camicroscope core instance **/
// proposal:
// test:
// constructor
// load on each component

class CaMic{
  /**
  *
  * create a camic core instance
  * @param divId - the div id to inject openseadragon into
  * @param slideQuery - query parameters for the slide to load; first result taken
  * @param [slideQuery.id] - the object id for the slide; takes precedence
  * @param [slideQuery.slide] - the given name for the slide, regex supported
  * @param [slideQuery.location] - the slide source location/filename
  * @property slideQuery - the slide id
  * @property options - the options extend from OpenSeadragon
  *
  */
  constructor(divId, slideQuery, options){
    Loading.open(document.body, 'CaMicroscope is initializing...');
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
      animationTime: 0.01,
      maxZoomPixelRatio: 1,
      visibilityRatio: 1,
      springStiffness:0.0001,

      /* extension */
      hasZoomControl:true,
      hasDrawLayer:true,
      hasLayerManager:true,
      hasScalebar:true,
      hasMeasurementTool:true,
      hasPatchManager:true,
      hasHeatmap:false
    }
    extend(this.setting, options);

    this.viewer = new OpenSeadragon.Viewer(this.setting);

    this.slideQuery = slideQuery;
    this.slideId = slideQuery.id
    // initalize store
    this.store = new Store("../../data/");
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
      // the first tile loaded
      // set zoom and pan
      if(this.setting.states){
        const states = this.setting.states;
        let x = states.x;
        let y = states.y;

        if((!states.coordinate)&& states.coordinate!=='image' ){
         const size = this.viewer.world.getItemAt(0).source.dimensions;
         x = Math.round(x*size.x);
         y = Math.round(y*size.y);
        }

        var pt = new OpenSeadragon.Point(x, y); // x, y should in the image coordinate system
        pt = this.viewer.viewport.imageToViewportCoordinates(pt);
        this.viewer.viewport.zoomTo(states.z, pt);
        this.viewer.viewport.panTo(pt, true);

        //set a position mark
        if(states.hasMark){
          // create a mark
          const div = document.createElement('div');
          const mark = document.createElement('div');
          mark.style.transform = 'translate3d(-50%, -50%, 0)';
          mark.style.display = 'flex';
          mark.style.width = '20px';
          mark.style.height = '20px';
          mark.style.border = '2px red solid';
          mark.style.alignItems = 'center';
          mark.style.borderRadius='50%';
          mark.style.textAlign = 'center';
          const center = document.createElement('div');
          center.style.borderRadius = '50%';
          center.style.margin = '0 auto';
          center.style.width = '4px';
          center.style.height = '4px';
          center.style.backgroundColor = 'red';
          mark.appendChild(center);
          div.appendChild(mark);
          this.viewer.addOverlay({
          element: div,
          location: pt,
          checkResize: false
          });
        }

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
    this.createMeasurementTool(this.mpp);
    this.createPatchManager();
    this.createHeatmap();
    Loading.close();
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
    Loading.open(document.body, 'CaMicroscope is loading images ...');
    // loads current image
    // if id is set, use id
    var slidePromise;
    if(this.slideQuery.hasOwnProperty('id') && this.slideQuery.id){
      slidePromise = this.store.getSlide(this.slideQuery.id)
    }
    else {
      slidePromise = this.store.findSlide(this.slideQuery.name, this.slideQuery.location)
    }
    slidePromise
      .then((x)=>{
        if(!x || !OpenSeadragon.isArray(x) || !x.length || !x[0].location){
          redirect($D.pages.table,`Can't find the slide information`);
          return;
        }
        this.slideId = x[0]["_id"]["$oid"]
        this.slideName = x[0]['name']
        this.study = x[0]['study']
        this.specimen = x[0]['specimen']

        this.viewer.open("../../img/Slide/"+ x[0]["_id"]["$oid"] + ".dzi");
        // set scalebar
        this.createScalebar(x[0].mpp)
        var imagingHelper = new OpenSeadragonImaging.ImagingHelper({
          viewer: this.viewer
        });

        imagingHelper.setMaxZoom(1);
        x[0].url = "../../img/Slide/"+ x[0]['_id']['$oid']+".dzi";
        if(func && typeof func === 'function') func.call(null,x[0]);
        Loading.text.textContent = `loading slide's tiles...`;
        this.mpp = x[0].mpp;


      })
      .catch(e=>{
        Loading.close();
        //$UI.message.addError('loadImg Error');
        console.error(e);

        if(func && typeof func === 'function') func.call(null,{hasError:true,message:e});
      })
  }
  /**
   * set up a zoom control functionality on the image
   */
  createZoomControl(){
    if(!this.setting.hasZoomControl || !this.viewer.cazoomctrl) return;
    this.viewer.cazoomctrl({
      position:"BOTTOM_RIGHT",
      autoFade: false
    });
  }
  /**
   * set up a canvas Draw functionality on the image
   */
  createCanvasDraw(){
    if(!this.setting.hasDrawLayer || !this.viewer.canvasDraw) return;
    this.viewer.canvasDraw();
    // create style context menu for draw
    this.drawContextmenu = new __.SimpleContextMenu(
      this.viewer.container,
      {}
    );

    // add event to hook up
    this.drawContextmenu.addHandler('style-changed',function(e){
      this.viewer.canvasDrawInstance.style = e.style;
      this.viewer.canvasDrawInstance.drawMode = e.model;
    }.bind(this));

    // this.drawContextmenu.addHandler('undo',function(e){
    //   this.viewer.canvasDrawInstance.undo();
    // }.bind(this));

    // this.drawContextmenu.addHandler('redo',function(e){
    //   this.viewer.canvasDrawInstance.redo();
    // }.bind(this));

    this.drawContextmenu.addHandler('clear',function(e){
      if(this.viewer.canvasDrawInstance._draws_data_.length == 0) return;
      if(confirm("Do you want to clear all markups?")) this.viewer.canvasDrawInstance.clear();
    }.bind(this));

    // this.drawContextmenu.addHandler('draw-mode-changed',function(e){
    //   this.viewer.canvasDrawInstance.drawMode = e.mode;
    // }.bind(this));

    //this.drawContextmenu.addHandler('draw',draw);
  }

  /**
   * set up a overlay manage on the image
   */
  createOverlayers(){
    if(!this.setting.hasLayerManager || !this.viewer.overlaysManager) return;
    this.viewer.overlaysManager();
  }

  /**
  * Set up a scalebar on the image
  * @param {number} mpp - microns per pixel of image
  */
  createScalebar(mpp){
    if(!this.setting.hasScalebar || !this.viewer.scalebar) return;
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

  createMeasurementTool(mpp){
    if(!this.setting.hasMeasurementTool || !this.viewer.measurementTool) return;
    this.viewer.measurementTool({
      mpp:{
        x:mpp,
        y:mpp,
      }
    });
  }

  createPatchManager(){
    if(!this.setting.hasPatchManager || !this.viewer.createPatchManager) return;
    this.viewer.createPatchManager({});
  }

  createHeatmap(){
    if(!this.setting.hasHeatmap || !this.viewer.createHeatmap) return;
    this.viewer.createHeatmap({});
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
