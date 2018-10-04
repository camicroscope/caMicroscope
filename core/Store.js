// requires: Api_Utils
// METHODS HERE RETURN PROMISES
// for test server
try{
  var fetch = require('node-fetch');
}catch(e){
  var b;
}
/**
* converts an object into a string of url components
* @param {object} obj - keys and values
* @returns the url encoded string
**/
function objToParamStr(obj) {
    var parts = [];
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            if (Array.isArray(obj[i])) {
                // arrays are a list of strings with escaped quotes, surrounded by []
                parts.push(encodeURIComponent(i) + "=" + encodeURIComponent("[" + obj[i].map((x) => '\"' + x + '\"').toString() + "]"));
            } else {
                parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
            }
        }
    }
    return parts.join("&");
}
/**
 * @constructor
* Storage interpreter for camicroscope, uses same auth as origin
* @param base - base url for data
* @param [config] - configuration options, unused so far
**/
class Store{
  constructor(base, config){
    this.base = base || "/data/";
    this.config = config;
  }
  /**
  * find marks matching slide and/or marktype
  * @param {string} [name] - the associated slide name
  * @param {string} [slide] - the associated marktype name, supporting regex match
  * @returns {promise} - promise which resolves with data
  **/
  findMark(slide, name){
    var suffix = "Mark/find"
    var url = this.base + suffix;
    var query = {}
    if (name){
      query.name = name
    }
    if (slide){
      query.slide = slide
    }

    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
        }).then((x)=>x.json())
  }

  /**
  * find marks which contain a given point
  * @param {number} x - x position to search for
  * @param {number} y - y position to search for
  * @param {string} [name] - the associated slide name
  * @param {string} [slide] - the associated marktype name, supporting regex match
  * @returns {promise} - promise which resolves with data
  **/
  findMarkSpatial(x, y, name, slide){
    var suffix = "Mark/findPoint"
    var url = this.base + suffix;
    var query = {}
    query.x = x
    query.y = y
    if (name){
      query.name = name
    }
    if (slide){
      query.slide = slide
    }
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
        }).then((x)=>x.json())
  }

  getMarkByIds(ids, slide){

    if(!Array.isArray(ids) || !slide){
      return {hasError:true,message:'args are illegal'}
    }
    var suffix = "Mark/multFind"
    var url = this.base + suffix;
    var query = {}
    var stringifiedIds = ids.map(id=>`"${id}"`).join(',');
    query.name = `[${stringifiedIds}]`;
    console.log(query.name);
    query.slide = slide;
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
    }).then((x)=>x.json()).catch(e=>console.error(e.message))
  }
  /**
  * get mark by id
  * @param {string} id - the mark id
  * @returns {promise} - promise which resolves with data
  **/
  getMark(id){
    var suffix = "Mark/get"
    var url = this.base + suffix;
    var query = {'id':id}
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
        }).then((x)=>x.json()).catch(e=>console.error(e.message))
  }
  addMark(json){
    var suffix = "mark/submit/json"
    var url = this.base + suffix;
    // api key for bindaas?
    return fetch(url, {
            method:"POST",
            credentials: "same-origin",
            mode: "cors",
            headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
            },
            body:JSON.stringify(json)
        }).then(
        (x)=>x.json()
        )
  }
  deleteMark(id,slide){
    var suffix = "Mark/deleteMark"
    var url = this.base + suffix;
    var query = {
      id:id,
      slide:slide
    }
    return fetch(url + "?" + objToParamStr(query), {
            method:"DELETE",
            credentials: "same-origin",
            mode: "cors"
        }).then(x=>x.text())
  }
  /**
  * find marktypes given slide and name
  * @param {string} [name] - the associated slide name
  * @param {string} [slide] - the marktype name, supporting regex match
  * @returns {promise} - promise which resolves with data
  **/
  findMarkTypes(name, slide){
    var suffix = "Mark/findTypes"
    var url = this.base + suffix;
    var query = {}
    if (name){
      query.name = name
    }
    if (slide){
      query.slide = slide
    }
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
        }).then((x)=>x.json())
  }
  // NOTE there is no getMarktype method since markypes are not stored separately from marks

  /**
  * find overlays matching name and/or type
  * @param {string} [name] - the overlay, supporting regex match
  * @param {string} [slide] - the associated slide id
  * @returns {promise} - promise which resolves with data
  **/
  findOverlay(name, slide){
    var suffix = "Overlay/find"
    var url = this.base + suffix;
    var query = {}
    if (name){
      query.name = name
    }
    if (slide){
      query.slide = slide
    }
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
        }).then((x)=>x.json())
  }

  /**
  * get overlay by id
  * @param {string} id - the overlay id
  * @returns {promise} - promise which resolves with data
  **/
  getOverlay(id){
    var suffix = "Overlay/get"
    var url = this.base + suffix;
    var query = {'id':id}
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
        }).then((x)=>x.json())
  }

  /**
  * find overlays matching name and/or type
  * @param {string} [name] - the slide name
  * @param {string} [location] - the slide location, supporting regex match
  * @returns {promise} - promise which resolves with data
  **/
  findSlide(slide, location){
    var suffix = "Slide/find"
    var url = this.base + suffix;
    var query = {}
    if (slide){
      query.slide = slide
    }
    if (location){
      query.location = location
    }
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
        }).then((x)=>x.json())
  }

  /**
  * get slide by id
  * @param {string} id - the slide id
  * @returns {promise} - promise which resolves with data
  **/
  getSlide(id){
    var suffix = "Slide/get"
    var url = this.base + suffix;
    var query = {'id':id}
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
        }).then((x)=>x.json())
  }

  /**
  * find templates matching name and/or type
  * @param {string} [name] - the template name, supporting regex match
  * @param {string} [type] - the template type, supporting regex match
  * @returns {promise} - promise which resolves with data
  **/
  findTemplate(name, type){
    var suffix = "Template/find"
    var url = this.base + suffix;
    var query = {}
    if (name){
      query.name = name
    }
    if (type){
      query.slide = slide
    }
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
        }).then((x)=>x.json())
  }

  /**
  * get template by id
  * @param {string} id - the template id
  * @returns {promise} - promise which resolves with data
  **/
  getTemplate(id){
    var suffix = "Template/get"
    var url = this.base + suffix;
    var query = {'id':id}
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
        }).then((x)=>x.json())
  }

  /**
  * post data
  * @param {string} type - the datatype to post
  * @param {object} data - the data to post
  * @param {object} [query] - the query of url parameters
  * @returns {promise} - promise which resolves with data
  **/
  post(type, query, data){
    var url = this.base + type + "/post";
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            method: "POST",
            mode: "cors",
            body: JSON.stringify(data),
            credentials: "same-origin"
        }).then((x)=>x.json())
  }

  /**
  * update data
  * @param {string} type - the datatype to get
  * @param {object} query - the query of url parameters
  * @param {object} data - the data to update
  * @returns {promise} - promise which resolves with data
  **/
  update(type, query, data){
    var url = this.base + type + "/update";
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            method: "UPDATE",
            mode: "cors",
            body: JSON.stringify(data),
            credentials: "same-origin"
        }).then((x)=>x.json())
  }

  /**
  * delete data
  * @param {string} type - the datatype to get
  * @param {object} query - the query of url parameters
  * @returns {promise} - promise which resolves with data
  **/
  delete(type, query){
    var url = this.base + type + "/delete";
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
        }).then((x)=>x.json())
  }
}

try{
  module.exports = Store;
}
catch(e){
  var a
}
