async function PathDbMods() {
  console.log("PathDbMods()...");
  // determine if user is authenicated
  await fetch("/user/login_status?_format=json", {credentials: 'include'})
    .then(response => response.json())
    .then(function(data) {
      if (data!=0) {
         console.log("user is authenticated.  get jwt and put the auth jwt in cookie as token");
         fetch("/jwt/token", {credentials:'include'})
           .then(x => x.json()).then(x => {
              console.log(x)
              if (x.hasOwnProperty('token') && x.token) {
                document.cookie = "token=" + x.token + ";"
                console.log("set cookie, is now:" , document.cookie)
              }
           })
      } else {
        console.log("user is unauthenticated.  let them see only public data");
      }
     }).catch(function(error) {
      console.log("bad "+error.status);
     })

  function convertPathDbSlide(data){
    let x={}
    if (Array.isArray(data) && data.length > 0){
      data = data[0]
    }
    x["_raw"] = data
    x.mpp = 1e9
    x.source="pathdb"
    let pathdbid = data.nid[0].value
    // default dislpay name
    x.name = pathdbid
    x["_id"] = {"$oid": pathdbid}
    if (data.field_mpp_y && data.field_mpp_y.length >= 1) {
      this.mpp_y = data.field_mpp_y[0].value
      this.mpp = this.mpp_y
    }
    if (data.field_mpp_x && data.field_mpp_x.length >= 1) {
      x.mpp_x = data.field_mpp_x[0].value
      x.mpp = this.mpp_x
    }
    if (data.referencepixelphysicalvaluey && data.referencepixelphysicalvaluey.length >=1){
      x.mpp_y = data.referencepixelphysicalvaluey[0].value
      x.mpp = x.mpp_y
    }
    if (data.referencepixelphysicalvaluex && data.referencepixelphysicalvaluex.length >=1){
      x.mpp_x = data.referencepixelphysicalvaluex[0].value
      x.mpp = x.mpp_x
    }
    if (data.field_iip_path && data.field_iip_path.length >= 1) {
      //x.location = data.field_iip_path[0].value;
      x.location = "pathdb*" + pathdbid;
      x.url = "../../img/IIP/raw/?DeepZoom=pathdb*" + pathdbid + ".dzi";
    } else {
      throw "no iip path in pathdb data"
    }
    // identifier fields for display name
    var subject_id = ""
    var image_id = ""
    var study_id = ""
    if(data.field_subject_id && data.field_subject_id.length >= 1){
      subject_id = data.field_subject_id[0].value
    }
    if(data.clinicaltrialsubjectid && data.clinicaltrialsubjectid.length >= 1){
      subject_id = data.clinicaltrialsubjectid[0].value
    }
    if(data.field_image_id && data.field_image_id.length >=1){
      image_id = data.field_image_id[0].value
    }
    if(data.imageid && data.imageid.length >=1){
      image_id = data.imageid[0].value
    }
    if(data.field_study_id && data.field_study_id.length >=1){
      study_id = data.field_study_id[0].value
    }
    if(data.studyid && data.studyid.length >=1){
      study_id = data.studyid[0].value
    }
    // if we have the triple, add it
    if (subject_id && image_id && study_id){
      x.name = study_id + ' | ' + subject_id + ' | ' + image_id;
    }
    return x
  }

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
  Store.prototype.findSlide = function(slide, specimen, study, location, q, collection) {
    var url = `/idlookup/${collection}/${study}/${specimen}/${slide}?_format=json`
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
      return response.json().then(x=>convertPathDbSlide(x[0])).then(x => [x]);
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
      return response.json().then(convertPathDbSlide).then(x => [x]);
    })
  }

  if (!(typeof StatesHelper === 'undefined')){
    StatesHelper.prototype.default_getCurrentStatesURL = StatesHelper.prototype.getCurrentStatesURL;
    getCurrentStatesURL = function(isImageCoordinate=false){
      let states = StatesHelper.getCurrentStates(isImageCoordinate);
      if(!states)return;
      console.log(states);
      states = StatesHelper.encodeStates(states);
      return `${location.origin}${location.pathname}?slideId=${$D.params.slideId}&states=${$D.params.states}&mode=${$D.params.mode}`
    };
  }

  console.warn("This Setup Is Intended For Pathdb")
}
