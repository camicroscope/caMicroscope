function ImgBoxMods() {
  console.warn("{imgbox mods enabled}")
  CaMic.prototype.default_loadImg = CaMic.prototype.loadImg
  CaMic.prototype.loadImg = function(func) {
    var urlParams = new URLSearchParams(window.location.search);
    var img_id = urlParams.get('id');
    let slideId = img_id
    this.slideId = slideId
    this.slideName = slideId
    this.study = ""
    this.specimen = ""
    fetch(img_id + "/info.json").then(response => {
      if (response.status >=400){
        throw response;
      } else {
        return response.json();
      }
    }).then(data => {
      let tile_count = Math.ceil(Math.log2(Math.max(data.height,data.width)))
      let scaleFactors = []
      for(let i=0; i <= tile_count; i++){
        scaleFactors.push(2**i)
      }
      let imbox_source = {
        "@context": "http://iiif.io/api/image/2/context.json",
        "@id": img_id,
        "height": data.height,
        "width": data.width,
        "profile": ["http://iiif.io/api/image/2/level2.json"],
        "protocol": "http://iiif.io/api/image",
        "tiles": [{
          "scaleFactors": scaleFactors,
          "width": 256
        }]
      }
      this.viewer.open(imbox_source);
      // set mpp
      this.mpp_x = data['mpp-x']
      this.mpp_y = data['mpp-y']
      this.mpp = data.mpp || this.mpp_x || this.mpp_y || 1e9;
      this.mpp_x = data['mpp-x'] || this.mpp
      this.mpp_y = data['mpp-y'] || this.mpp

      this.viewer.mpp = this.mpp;
      this.viewer.mpp_x = this.mpp_x;
      this.viewer.mpp_y = this.mpp_y;

      //set scalebar
      let mpp = this.mpp_x || this.mpp;
      if(mpp&&mpp!=1e9) this.createScalebar(this.mpp)
      var imagingHelper = new OpenSeadragonImaging.ImagingHelper({
        viewer: this.viewer
      });
      imagingHelper.setMaxZoom(1);
      // create item to pass to the callback function, previously x[0] (slide data)
      let x = {}
      x['_id'] = "0"
      x.name = this.slideName
      x.study = this.study
      x.specimen = this.specimen
      x.mpp = this.mpp;
      x.mpp_x = this.mpp_x;
      x.mpp_y = this.mpp_y;
      x.location = img_id;
      x.url = imbox_source;
      if (func && typeof func === 'function'){
        func.call(null, x);
      }
      Loading.text.textContent = `loading slide's tiles...`;
      // WARN; note that spyglass isn't working due to semi-hardcoded value at init.js line 140
      // we may want another init.js or our own callback
    }).catch(e=>{
      console.error(e)
      Loading.text.textContent = "ERROR - Slide May be Broken or Unsupported"
      //if(func && typeof func === 'function') func.call(null,{hasError:true,message:e});
    })

  }
}


export default ImgBoxMods
