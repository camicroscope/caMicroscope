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
* Storage interpreter for camicroscope, uses same auth as origin
* @param base - base url for data
* @param [config] - configuration options, unused so far
**/
class Store{
  constructor(base, config){
    this.base = base || "/data/services/caMicroscope/";
    this.config = config;
  }
  /**
  * find collections matching name and/or type
  * @param {string} [name] - the collection name, supporting regex match
  * @param {string} [type] - the collection type, supporting regex match
  * @returns {promise} - promise which resolves with data
  **/
  findCollection(name, type){
    var suffix = "Collection/query/find"
    var url = this.base + suffix;
    var query = {}
    if (name){
      query.name = name
    }
    if (type){
      query.type = type
    }
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
        }).then((x)=>x.json())
  }

  /**
  * get collection by id
  * @param {string} id - the collection id
  * @returns {promise} - promise which resolves with data
  **/
  getCollection(id){
    var suffix = "Collection/query/get"
    var url = this.base + suffix;
    var query = {'id':id}
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
        }).then((x)=>x.json())
  }

  /**
  * find marks matching slide and/or marktype
  * @param {string} [name] - the associated slide name, supporting regex match
  * @param {string} [slide] - the associated marktype name, supporting regex match
  * @returns {promise} - promise which resolves with data
  **/
  findMark(slide, name){
    var suffix = "mark/query/find"
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
  * @param {string} [name] - the associated slide name, supporting regex match
  * @param {string} [slide] - the associated marktype name, supporting regex match
  * @returns {promise} - promise which resolves with data
  **/
  findMarkSpatial(x, y, name, slide){
    var suffix = "mark/query/findPoint"
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

  /**
  * get mark by id
  * @param {string} id - the collection id
  * @returns {promise} - promise which resolves with data
  **/
  getMark(id){
    var suffix = "mark/query/get"
    var url = this.base + suffix;
    var query = {'id':id}
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
        }).then((x)=>x.json())
  }

  /**
  * find marktypes given slide and name
  * @param {string} [name] - the associated slide name, supporting regex match
  * @param {string} [slide] - the marktype name, supporting regex match
  * @returns {promise} - promise which resolves with data
  **/
  findMarkTypes(name, slide){
    var suffix = "mark/query/findTypes"
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
  * @param {string} [slide] - the collection type, supporting regex match
  * @returns {promise} - promise which resolves with data
  **/
  findOverlay(name, slide){
    var suffix = "Overlay/query/find"
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
    var suffix = "Overlay/query/get"
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
  * @param {string} [name] - the slide name, supporting regex match
  * @param {string} [location] - the slide location, supporting regex match
  * @returns {promise} - promise which resolves with data
  **/
  findSlide(name, location){
    var suffix = "Slide/query/find"
    var url = this.base + suffix;
    var query = {}
    if (name){
      query.name = name
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
    var suffix = "Slide/query/get"
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
  * @param {string} [type] - the tmplate type, supporting regex match
  * @returns {promise} - promise which resolves with data
  **/
  findTemplate(name, type){
    var suffix = "Template/query/find"
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
    var suffix = "Template/query/get"
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
    var url = this.base + type + "/submit/json";
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
    var url = this.updateUrls[type];
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
    var url = this.deleteUrls[type];
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
