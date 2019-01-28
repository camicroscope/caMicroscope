function ImgBoxMods() {
  console.warn("{imgbox mods enabled}")
  CaMic.prototype.default_loadImg = CaMic.prototype.loadImg
  CaMic.prototype.loadImg = function(func) {
    var urlParams = new URLSearchParams(window.location.search);
    var p = urlParams.get('id');
    console.log("image ID : " + p);
    let slideId = p
    this.slideId = slideId
    this.slideName = slideId
    this.study = ""
    this.specimen = ""
    fetch(p + "/info.json").then(response => {
      return response.json();
    }).then(data => {
      let imbox_source = {
        "@context": "http://iiif.io/api/image/2/context.json",
        //"@id": "/iiif?iri=https://s3.amazonaws.com/ebremeribox/TCGA-02-0001-01C-01-BS1.0cc8ca55-d024-440c-a4f0-01cf5b3af861.svs",
        "@id": p,
        "height": data.height,
        "width": data.width,
        "profile": ["http://iiif.io/api/image/2/level2.json"],
        "protocol": "http://iiif.io/api/image",
        "tiles": [{
          "scaleFactors": [1, 2, 4, 8, 16, 32],
          "width": 256
        }]
      }
      this.viewer.open(imbox_source);
      //set scalebar
      this.mpp = data['mpp-x'] || data['mpp-y'] || 1
      this.createScalebar(this.mpp)
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
      x.mpp = 1;
      x.location = p;
      x.url = imbox_source
      console.log(func)
      console.log(x)
      if (func && typeof func === 'function'){
        func.call(null, x);
      }
      Loading.text.textContent = `loading slide's tiles...`;
      // WARN; note that spyglass isn't working due to semi-hardcoded value at init.js line 140
      // we may want another init.js or our own callback
    });

  }
}


export default ImgBoxMods
