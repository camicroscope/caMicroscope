function PathDbMods() {
  console.log("PathDbMods()...");
  // put the auth jwt in cookie as token
  fetch("/jwt/token", {
    method: 'GET',
    credentials: 'include'
  }).then(x => x.json()).then(x => {
    console.log(x)
    if (x.hasOwnProperty('token') && x.token) {
      document.cookie = "token=" + x.token + ";"
    }
  })
  /**
  Gets a named cookie value
  * @param {string} key - the key to get from the cookie
  **/
  function getCookie(key) {
    var cookiestring = RegExp("" + key + "[^;]+").exec(document.cookie);
    return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
  }
  console.warn("{PathDB mods enabled}")
  Store.prototype.default_findSlide = Store.prototype.findSlide;
  Store.prototype.findSlide = function(slide, specimen, study, location) {
    var url = "/node/" + slide + "?_format=json"
    return fetch(url, {
      mode: "cors",
      headers: new Headers({
        'Authorization': 'Bearer ' + getCookie("token"),
      })
    }).then(function(response) {
      if (!response.ok) return {
        error: !response.ok,
        text: response.statusText,
        url: response.url
      };
      return response.json().then(x => [x]);
    })
  }
  Store.prototype.default_getSlide = Store.prototype.getSlide
  Store.prototype.getSlide = function(id) {
    var url = "/node/" + id + "?_format=json"
    return fetch(url, {
      mode: "cors",
      headers: new Headers({
        'Authorization': 'Bearer ' + getCookie("token"),
      })
    }).then(function(response) {
      if (!response.ok) return {
        error: !response.ok,
        text: response.statusText,
        url: response.url
      };
      return response.json().then(x => [x]);
    })
  }

  StatesHelper.prototype.default_getCurrentStatesURL = StatesHelper.prototype.getCurrentStatesURL;
  getCurrentStatesURL = function(isImageCoordinate=false){
    let states = StatesHelper.getCurrentStates(isImageCoordinate);
    if(!states)return;
    console.log(states);
    states = StatesHelper.encodeStates(states);
    return `${location.origin}${location.pathname}?slideId=${$D.params.slideId}&states=${$D.params.states}&mode=${$D.params.mode}`
  };


  CaMic.prototype.default_loadImg = CaMic.prototype.loadImg
  CaMic.prototype.loadImg = function(func) {
    var urlParams = new URLSearchParams(window.location.search);
    var pathdb_id = urlParams.get('slideId');
    this.slideId = pathdb_id // default value
    this.slideName = pathdb_id
    this.store.getSlide(pathdb_id).then(data => {
      data = data[0]
      console.log(data)
      // set mpp
      this.mpp = 1e9
      this.rawData = data

      if (data.field_mpp_y && data.field_mpp_y.length >= 1) {
        this.mpp_y = data.field_mpp_y[0].value
        this.mpp = this.mpp_y
      }
      if (data.field_mpp_x && data.field_mpp_x.length >= 1) {
        this.mpp_x = data.field_mpp_x[0].value
        this.mpp = this.mpp_x
      }
      if (data.referencepixelphysicalvaluey && data.referencepixelphysicalvaluey.length >=1){
        this.mpp_y = data.referencepixelphysicalvaluey[0].value
        this.mpp = this.mpp_y
      }
      if (data.referencepixelphysicalvaluex && data.referencepixelphysicalvaluex.length >=1){
        this.mpp_x = data.referencepixelphysicalvaluex[0].value
        this.mpp = this.mpp_x
      }
      Store.prototype.pdb_hm_name = this.image_id

      if (data.field_iip_path && data.field_iip_path.length >= 1) {
        this.location = data.field_iip_path[0].value
        // MAKE URL FOR IIP
        this.url = "../../img/IIP/raw/?DeepZoom=" + this.location + ".dzi"
        this.viewer.open(this.url);
      } else {
        throw "No image location --could be token"
      }

      this.viewer.mpp = this.mpp;
      this.viewer.mpp_x = this.mpp_x;
      this.viewer.mpp_y = this.mpp_y;

      //set scalebar
      if (this.mpp && this.mpp != 1e9) this.createScalebar(this.mpp)
      var imagingHelper = new OpenSeadragonImaging.ImagingHelper({
        viewer: this.viewer
      });
      imagingHelper.setMaxZoom(1);
      // create item to pass to the callback function, previously x[0] (slide data)
      let x = {}
      x['_id'] = this.slideId
      x.name = this.slideName
      // other slide data
      x.mpp = this.mpp;
      x.mpp_x = this.mpp_x;
      x.mpp_y = this.mpp_y;
      x.location = this.location;
      x.url = this.url;
      x.rawData = this.rawData
      if (func && typeof func === 'function') {
        func.call(null, x);
      }
      Loading.text.textContent = `Loading Slide's Tiles...`;
      // we may want another init.js or our own callback
    }).catch(e => {
      console.error(e)
      Loading.text.textContent = "ERROR - PathDB Image Error (Try A Refresh)"
      //if(func && typeof func === 'function') func.call(null,{hasError:true,message:e});
    })

  }
}


PathDbMods()
console.warn("This Setup Is Intended For Pathdb")
