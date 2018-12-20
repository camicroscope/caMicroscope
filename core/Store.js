// requires: Api_Utils
// METHODS HERE RETURN PROMISES
// for test server
try {
  var fetch = require('node-fetch');
} catch (e) {
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
class Store {
  constructor(base, config) {
    this.base = base || "./data/";
    this.config = config;
  }
  /**
   * errorHandler: handle the error response
   * @param  {Response} response
   * @return {object}
   */
  errorHandler(response) {
    if (!response.ok) return {
      error: !response.ok,
      text: response.statusText,
      url: response.url
    };
    return response.json();
  }
  /**
   * find marks matching slide and/or marktype
   * will search by slide field as exactly given and by the oid slide of that name
   * @param {string} [name] - the associated slide name
   * @param {string} [slide] - the associated marktype name, supporting regex match
   * @returns {promise} - promise which resolves with data
   **/
  findMark(slide, name, specimen, study, footprint, source, x0, x1, y0, y1) {
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
    if (x0){
      query.x0 = x0;
    }
    if (x1){
      query.x1 = x1;
    }
    if (y0){
      query.y0 = y0;
    }
    if (y1){
      query.y1 = y1;
    }
    let bySlide = fetch(url + "?" + objToParamStr(query), {
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler)
    if (!slide) {
      return bySlide
    } else {
      bySlideId = this.findSlide(slide).then(x => {
        if (x.length == 0) {
          return []
        } else {
          query.slide = x[0]['_id']['$oid']
          return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
          }).then(this.errorHandler)
        }

      })
      // return as if we did one query by flattening these promises
      return Promise.all([bySlide, bySlideId]).then(x => [].concat.apply([], x))
    }

  }

  /**
   * find marks which contain a given point
   * NOTE: this works only by exact match
   * @param {number} x0 - x min position of rect to search
   * @param {number} y0 - y min position of rect to search
   * @param {number} x1 - x max position of rect to search
   * @param {number} y1 - y max position of rect to search
   * @param {string} [name] - the associated slide name
   * @param {string} [slide] - the associated marktype name, supporting regex match
   * @returns {promise} - promise which resolves with data
   **/
  findMarkSpatial(x0, y0, x1, y1, name, slide, key) {
    var suffix = "Mark/findBound"
    var url = this.base + suffix;
    var query = {}
    query.x0 = x0
    query.y0 = y0
    query.x1 = x1
    query.y1 = y1
    if (name) {
      query.name = name
    }
    if (slide) {
      query.slide = slide
    }
    if (key) {
      query.key = key
    }

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler)
  }

  getMarkByIds(ids, slide, study, specimen, source, footprint, x0, x1, y0, y1) {
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
    if (study){
      query.study = study;
    }
    if (specimen){
      query.specimen = specimen;
    }
    if (source){
      query.source = source;
    }
    if (footprint){
      query.footprint = footprint;
    }
    if (x0){
      query.x0 = x0;
    }
    if (x1){
      query.x1 = x1;
    }
    if (y0){
      query.y0 = y0;
    }
    if (y1){
      query.y1 = y1;
    }

    let bySlide = fetch(url + "?" + objToParamStr(query), {
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler)
    if (!slide) {
      return bySlide
    } else {
      bySlideId = this.findSlide(slide).then(x => {
        if (x.length == 0) {
          return []
        } else {
          query.slide = x[0]['_id']['$oid']
          return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
          }).then(this.errorHandler)
        }

      })
      // return as if we did one query by flattening these promises
      return Promise.all([bySlide, bySlideId]).then(x => [].concat.apply([], x))
    }
  }


  /**
   * get mark by id
   * @param {string} id - the mark id
   * @returns {promise} - promise which resolves with data
   **/
  getMark(id) {
    var suffix = "Mark/get"
    var url = this.base + suffix;
    var query = {
      'id': id
    }

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler)
  }
  /**
   * post mark
   * @param {object} json - the mark data
   * @returns {promise} - promise which resolves with response
   **/
  addMark(json) {
    var suffix = "Mark/post"
    var url = this.base + suffix;

    return fetch(url, {
      method: "POST",
      credentials: "same-origin",
      mode: "cors",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(json)
    }).then(this.errorHandler)
  }
  /**
   * delete mark
   * @param {object} id - the mark object id
   * @param {object} slide - the associated slide
   * @returns {promise} - promise which resolves with response
   **/
  deleteMark(id, slide) {
    var suffix = "Mark/delete"
    var url = this.base + suffix;
    var query = {
      id: id,
      slide: slide
    }
    return fetch(url + "?" + objToParamStr(query), {
      method: "DELETE",
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler)
  }
  /**
   * find marktypes given slide and name
   * @param {string} [name] - the associated slide name
   * @param {string} [slide] - the marktype name, supporting regex match
   * @returns {promise} - promise which resolves with data
   **/
  findMarkTypes(slide, name) {
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

    if (!slide) {
      return bySlide
    } else {
      bySlideId = this.findSlide(slide).then(x => {
        if (x.length == 0) {
          return []
        } else {
          query.slide = x[0]['_id']['$oid']
          return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
          }).then(this.errorHandler)
        }
      })
      // return as if we did one query by flattening these promises
      return Promise.all([bySlide, bySlideId]).then(x => [].concat.apply([], x))
    }
  }

  findHeatmap(slide, name) {
    var suffix = "Heatmap/find"
    var url = this.base + suffix;
    var query = {}
    var bySlideId
    if (name) {
      query.name = name
    }
    if (slide) {
      query.slide = slide
    }
    return fetch(url + "?" + objToParamStr(query), {
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler)
  }
  /**
   * get heatmap by id
   * @param {string} id - the heatmap id
   * @returns {promise} - promise which resolves with data
   **/
  getHeatmap(caseId, execId) {
    var suffix = "Heatmap/getHeatmap"
    var url = this.base + suffix;
    var query = {};
    query.caseId = caseId;
    query.execId = execId;

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler)
  }
  /**
   * post heatmap
   * @param {object} json - the mark data
   * @returns {promise} - promise which resolves with response
   **/
  addHeatmap(json) {
    var suffix = "Heatmap/post"
    var url = this.base + suffix;

    return fetch(url, {
      method: "POST",
      credentials: "same-origin",
      mode: "cors",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(json)
    }).then(this.errorHandler)
  }
  /**
   * delete heatmap
   * @param {object} id - the heatmap object id
   * @param {object} slide - the associated slide
   * @returns {promise} - promise which resolves with response
   **/
  deleteHeatmap(id, slide) {
    var suffix = "Heatmap/delete"
    var url = this.base + suffix;
    var query = {
      id: id,
      slide: slide
    }
    return fetch(url + "?" + objToParamStr(query), {
      method: "DELETE",
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler)
  }

  /**
   * find overlays matching name and/or type
   * @param {string} [name] - the overlay, supporting regex match
   * @param {string} [slide] - the associated slide id
   * @returns {promise} - promise which resolves with data
   **/
  findOverlay(name, slide) {
    var suffix = "Overlay/find"
    var url = this.base + suffix;
    var query = {}
    if (name) {
      query.name = name
    }
    if (slide) {
      query.slide = slide
    }

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler)
  }

  /**
   * get overlay by id
   * @param {string} id - the overlay id
   * @returns {promise} - promise which resolves with data
   **/
  getOverlay(id) {
    var suffix = "Overlay/get"
    var url = this.base + suffix;
    var query = {
      'id': id
    }

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler)
  }

  /**
   * find overlays matching name and/or type
   * @param {string} [name] - the slide name
   * @param {string} [location] - the slide location, supporting regex match
   * @returns {promise} - promise which resolves with data
   **/
  findSlide(slide, specimen, study, location) {
    var suffix = "Slide/find"
    var url = this.base + suffix;
    var query = {}
    if (slide) {
      query.slide = slide
    }
    if (location) {
      query.location = location
    }
    if (specimen) {
      query.specimen = specimen
    }
    if (study) {
      query.study = study
    }

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler)
  }

  /**
   * get slide by id
   * @param {string} id - the slide id
   * @returns {promise} - promise which resolves with data
   **/
  getSlide(id) {
    var suffix = "Slide/get"
    var url = this.base + suffix;
    var query = {
      'id': id
    }

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler)
  }

  /**
   * find templates matching name and/or type
   * @param {string} [name] - the template name, supporting regex match
   * @param {string} [type] - the template type, supporting regex match
   * @returns {promise} - promise which resolves with data
   **/
  findTemplate(name, type) {
    var suffix = "Template/find"
    var url = this.base + suffix;
    var query = {}
    if (name) {
      query.name = name
    }
    if (type) {
      query.slide = slide
    }

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler)
  }

  /**
   * get template by id
   * @param {string} id - the template id
   * @returns {promise} - promise which resolves with data
   **/
  getTemplate(id) {
    var suffix = "Template/get"
    var url = this.base + suffix;
    var query = {
      'id': id
    }

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler)
  }

  /**
   * post data
   * @param {string} type - the datatype to post
   * @param {object} data - the data to post
   * @param {object} [query] - the query of url parameters
   * @returns {promise} - promise which resolves with data
   **/
  post(type, query, data) {
    var url = this.base + type + "/post";

    return fetch(url + "?" + objToParamStr(query), {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(data),
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    }).then(this.errorHandler)
  }

  /**
   * update data
   * @param {string} type - the datatype to get
   * @param {object} query - the query of url parameters
   * @param {object} data - the data to update
   * @returns {promise} - promise which resolves with data
   **/
  update(type, query, data) {
    var url = this.base + type + "/update";

    return fetch(url + "?" + objToParamStr(query), {
      method: "UPDATE",
      mode: "cors",
      body: JSON.stringify(data),
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    }).then(this.errorHandler)
  }

  /**
   * delete data
   * @param {string} type - the datatype to get
   * @param {object} query - the query of url parameters
   * @returns {promise} - promise which resolves with data
   **/
  delete(type, query) {
    var url = this.base + type + "/delete";

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "same-origin",
      mode: "cors"
    }).then(this.errorHandler)
  }
}

try {
  module.exports = Store;
} catch (e) {
  var a
}
