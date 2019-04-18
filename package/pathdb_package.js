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
  Store.prototype.default_findMark = Store.prototype.findMark
  Store.prototype.findMark = function(slide, name, specimen, study, footprint, source, x0, x1, y0, y1) {
    var suffix = "Mark/find"
    var url = this.base + suffix;
    var query = {}
    var bySlideId
    if (slide) {
      query.slide = slide
    }
    if (name) {
      query.name = name
    }
    if (specimen) {
      query.specimen = specimen
    }
    if (study) {
      query.study = study
    }
    if (footprint) {
      query.footprint = footprint
    }
    if (source) {
      query.source = source
    }
    if (x0) {
      query.x0 = x0;
    }
    if (x1) {
      query.x1 = x1;
    }
    if (y0) {
      query.y0 = y0;
    }
    if (y1) {
      query.y1 = y1;
    }
    let bySlide = fetch(url + "?" + objToParamStr(query), {
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler).then(x => this.filterBroken(x, "mark"))
    return bySlide
  }
  Store.prototype.getMarkByIds = function(ids, slide, study, specimen, source, footprint, x0, x1, y0, y1) {
    if (!Array.isArray(ids) || !slide) {
      return {
        hasError: true,
        message: 'args are illegal'
      }
    }
    var bySlideId
    var suffix = "Mark/multi"
    var url = this.base + suffix;
    var query = {}
    var stringifiedIds = ids.map(id => `"${id}"`).join(',');
    query.name = `[${stringifiedIds}]`;
    query.slide = slide;
    if (study) {
      query.study = study;
    }
    if (specimen) {
      query.specimen = specimen;
    }
    if (source) {
      query.source = source;
    }
    if (footprint) {
      query.footprint = footprint;
    }
    if (x0) {
      query.x0 = x0;
    }
    if (x1) {
      query.x1 = x1;
    }
    if (y0) {
      query.y0 = y0;
    }
    if (y1) {
      query.y1 = y1;
    }
    let bySlide = fetch(url + "?" + objToParamStr(query), {
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler).then(x => this.filterBroken(x, "mark"))
    return bySlide
  }
  Store.prototype.findMarkTypes = function(slide, name) {
    var suffix = "Mark/types"
    var url = this.base + suffix;
    var query = {}
    var bySlideId
    if (name) {
      query.name = name
    }
    if (slide) {
      query.slide = slide
    }
    let bySlide = fetch(url + "?" + objToParamStr(query), {
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler)
    return bySlide
  }
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


  Store.prototype.default_findHeatmapType = Store.prototype.findHeatmapType;
  Store.prototype.findHeatmapType = function(slide, name) {
     return this.getSlide(slide).then(data => {

      var suffix = "Heatmap/types"
      var url = this.base + suffix;
      var query = {}
      
      data = data[0]
      if (data.field_subject_id) {
        query.subject = data.field_subject_id[0].value
      }
      if (data.field_case_id) {
        query.case = data.field_case_id[0].value
        query.slide = data.field_case_id[0].value
      }

      return fetch(url + "?" + objToParamStr(query), {
        credentials: "include",
        mode: "cors"
      }).then(this.errorHandler).then(x=>this.filterBroken(x, "heatmap"))
    }).catch(function(e){
      console.error(e);
    })

  };
  
  Store.prototype.default_findHeatmap = Store.prototype.findHeatmap;
  Store.prototype.findHeatmap = function(slide, name) {
    return this.getSlide(slide).then(data => {

      var suffix = "Heatmap/find"
      var url = this.base + suffix;
      var query = {}
      
      data = data[0]
      if (data.field_subject_id) {
        query.subject = data.field_subject_id[0].value
      }
      if (data.field_case_id) {
        query.case = data.field_case_id[0].value
        query.slide = data.field_case_id[0].value
      }
      if(name) query.name = name;

      return fetch(url + "?" + objToParamStr(query), {
        credentials: "include",
        mode: "cors"
      }).then(this.errorHandler).then(x=>this.filterBroken(x, "heatmap"))
    }).catch(function(e){
      console.error(e);
    })
  };
  Store.prototype.default_getHeatmap = Store.prototype.getHeatmap;
  Store.prototype.getHeatmap = function(slide, exec) {
    return this.getSlide(slide).then(data => {

      var suffix = "Heatmap/get"
      var url = this.base + suffix;
      var query = {}
      
      data = data[0]
      if (data.field_subject_id) {
        query.subject = data.field_subject_id[0].value
      }
      if (data.field_case_id) {
        query.case = data.field_case_id[0].value
      }
      if(exec) query.exec = exec;

      return fetch(url + "?" + objToParamStr(query), {
        credentials: "include",
        mode: "cors"
      }).then(this.errorHandler).then(x=>this.filterBroken(x, "heatmap"))
    }).catch(function(e){
      console.error(e);
    })
  };

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
    this.study = ""
    this.specimen = ""
    this.subject_id = ""
    this.case_id = ""
    this.image_id = ""
    this.study_id = ""
    this.store.getSlide(pathdb_id).then(data => {
      data = data[0]
      console.log(data)
      // set mpp
      this.mpp = 1e9

      if (data.field_mpp_y && data.field_mpp_y.length >= 1) {
        this.mpp_y = data.field_mpp_y[0].value
        this.mpp = this.mpp_y
      }
      if (data.field_mpp_x && data.field_mpp_x.length >= 1) {
        this.mpp_x = data.field_mpp_x[0].value
        this.mpp = this.mpp_x
      }
      // identifier fields
      if(data.field_subject_id){
        this.subject_id = data.field_subject_id[0].value
      }
      if(data.field_case_id){
        this.case_id = data.field_case_id[0].value
      }
      if(data.field_image_id){
        this.image_id = data.field_image_id[0].value
      }
      if(data.field_study_id){
        this.study_id = data.field_study_id[0].value
      }

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

      // identifier field
      x.subject_id = this.subject_id
      x.case_id = this.case_id
      x.image_id = this.image_id
      x.study_id = this.study_id

      x.study = this.study
      x.specimen = this.specimen
      x.mpp = this.mpp;
      x.mpp_x = this.mpp_x;
      x.mpp_y = this.mpp_y;
      x.location = this.location;
      x.url = this.url;
      if (func && typeof func === 'function') {
        func.call(null, x);
      }
      Loading.text.textContent = `loading slide's tiles...`;
      // we may want another init.js or our own callback
    }).catch(e => {
      console.error(e)
      Loading.text.textContent = "ERROR - PathDB Image Error (Try a refresh)"
      //if(func && typeof func === 'function') func.call(null,{hasError:true,message:e});
    })

  }
}


PathDbMods()
console.warn("This setup is intended for pathdb")
