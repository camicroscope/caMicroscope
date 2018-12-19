function ImgBoxMods(){
  console.warn("{imgbox mods enabled}")
  CaMic.prototype.default_loadImg = Camic.prototype.loadImg
  CaMic.prototype.loadImg = function(func){
    let params = new URLSearchParams(document.location.search.substring(1));
    let slideId = params.get("id");
    this.slideId = x[0]["_id"]["$oid"]
    this.slideName = "local"
    this.study = ""
    this.specimen = ""
    let ibmox_url = decodeURIComponent(slideId)
    this.viewer.open(ibmox_url);
    // set scalebar
    //his.createScalebar(x[0].mpp)
    var imagingHelper = new OpenSeadragonImaging.ImagingHelper({
      viewer: this.viewer
    });

    imagingHelper.setMaxZoom(1);
    // create item to pass to the callback function, previously x[0] (slide data)
    let x = {}
    x['_id']
    x.name = this.slideName
    x.study = this.study
    x.specimen = this.specimen
    x.mpp = 0;
    x.location = ibmox_url;
    if(func && typeof func === 'function') func.call(null,x);
    Loading.text.textContent = `loading slide's tiles...`;
    this.mpp = 0;
    // WARN; note that spyglass isn't working due to semi-hardcoded value at init.js line 140
    // we may want another init.js or our own callback
  }
}


export default ImgBoxMods
