function ImgBoxMods(){
  console.warn("{imgbox mods enabled}")
  CaMic.prototype.default_loadImg = Camic.prototype.loadImg
  CaMic.prototype.loadImg = function(func){
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
        this.specimen = x[0]['study']
        this.viewer.open("./img/Slide/"+ x[0]["_id"]["$oid"] + ".dzi");
        // set scalebar
        this.createScalebar(x[0].mpp)
        var imagingHelper = new OpenSeadragonImaging.ImagingHelper({
          viewer: this.viewer
        });

        imagingHelper.setMaxZoom(1);
        if(func && typeof func === 'function') func.call(null,x[0]);
        Loading.text.textContent = `loading slide's tiles...`;
        this.mpp = x[0].mpp;


      })
      .catch(e=>{
        Loading.close();
        $UI.message.addError('loadImg Error');
        console.error(e);

        if(func && typeof func === 'function') func.call(null,{hasError:true,message:e});
      })
  }
}


export default ImgBoxMods
