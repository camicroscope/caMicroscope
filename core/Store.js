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
 * @param [validation] - validation dict where keys are lowercase of types
 * @param [config] - configuration options, unused so far
 **/
class Store {
  constructor(base, validation, config) {
    this.base = base || "./data/";
    this.validation = validation || {};
    this.config = config;
  }
  /**
   * errorHandler: handle the error response, and clean
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
  filterBroken(data, type){
    if (Array.isArray(data)){
      if (this.validation[type.toLowerCase()]){
        return data.filter(this.validation[type])
      } else {
        return data
      }
    } else { // unlikely case?
      if (this.validation[type.toLowerCase()]){
        if (this.validation[type](data)){
          return data
        }else{
          return undefined
        }
      }
    }

  }
  /**
   * find marks matching slide and/or marktype
   * will search by slide field as exactly given and by the oid slide of that name
   * @param {string} [name] - the associated slide name
   * @param {string} [slide] - the associated marktype name, supporting regex match
   * @returns {promise} - promise which resolves with data
   **/
  findMark(slide, name, footprint, source, x0, x1, y0, y1) {
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
    return fetch(url + "?" + objToParamStr(query), {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler).then(x=>this.filterBroken(x, "mark"))

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
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler).then(x=>this.filterBroken(x, "mark"))
  }

  getMarkByIds(ids, slide, source, footprint, x0, x1, y0, y1) {
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

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler).then(x=>this.filterBroken(x, "mark"))
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
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler).then(x=>this.filterBroken(x, "mark"))
  }
  /**
   * post mark
   * @param {object} json - the mark data
   * @returns {promise} - promise which resolves with response
   **/
  addMark(json) {
    var suffix = "Mark/post"
    var url = this.base + suffix;
    if (this.validation.mark && !this.validation.mark(json)){
      console.warn(this.validation.mark.errors)
    }
    return fetch(url, {
      method: "POST",
      credentials: "include",
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
      credentials: "include",
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
    let suffix = "Mark/types"

    var query = {}
    //
    if(!slide) {
      console.error('Store.findMarkTypes needs slide ... ');
      return null;
    }
    // numeric->str coerce
    if ((parseInt(slide)==slide)||(parseFloat(slide)==slide)){
      query.slide = '"' + slide + '"'
    } else {
    query.slide = slide
    }
    if (name) {
      query.name = name
      suffix = "Mark/typesExec"
    }
    var url = this.base + suffix;
    return fetch(url + "?" + objToParamStr(query), {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)
  }

  findHeatmap(slide, name, subject, study) {
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
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler).then(x=>this.filterBroken(x, "heatmap"))
  }
  findHeatmapType(slide, name) {
    var suffix = "Heatmap/types"
    var url = this.base + suffix;
    var query = {}
    if (name) {
      query.name = name
    }
    if (slide) {
      query.slide = slide
    }
    return fetch(url + "?" + objToParamStr(query), {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler).then(x=>this.filterBroken(x, "heatmap"))
  }
  /**
   * get heatmap by id
   * @param {string} id - the heatmap id
   * @returns {promise} - promise which resolves with data
   **/
  getHeatmap(slide, name) {
    var suffix = "Heatmap/get"
    var url = this.base + suffix;
    var query = {};
    query.slide = slide;
    query.name = name;

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler).then(x=>this.filterBroken(x, "heatmap"))
  }
  /**
   * update Heatmap fields - threshold
   * @param {string} id - the heatmap id
   * @returns {promise} - promise which resolves with data
   **/
  // updateHeatmapThreshold(caseId, execId) {
  //   var suffix = "Heatmap/get"
  //   var url = this.base + suffix;
  //   var query = {};
  //   query.case = caseId;
  //   query.subject = caseId;
  //   query.exec = execId;

  //   return fetch(url + "?" + objToParamStr(query), {
  //     credentials: "include",
  //     mode: "cors"
  //   }).then(this.errorHandler).then(x=>this.filterBroken(x, "heatmap"))
  // }


  /**
   * post heatmap
   * @param {object} json - the mark data
   * @returns {promise} - promise which resolves with response
   **/
  addHeatmap(json) {
    var suffix = "Heatmap/post"
    var url = this.base + suffix;
    if (this.validation.heatmap && !this.validation.heatmap(json)){
      console.warn(this.validation.heatmap.errors)
    }
    return fetch(url, {
      method: "POST",
      credentials: "include",
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
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)
  }


  updateHeatmapFields(slide, name, fields, setting){
    var suffix = "Heatmap/threshold"
    var url = this.base + suffix;
    var query = {}


    if (slide) {
      query.slide = slide
    }

    if(name) {
      query.name = name
    }

    if(fields) {
      query.fields = fields
    }
    if(setting) {
      query.setting = setting
    }
    return fetch(url + "?" + objToParamStr(query), {
      method: "DELETE",
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)
  }

  /**
   * add a Heatmap Edit Data
   * @param {object} json - the heatmap edit data
   * @returns {promise} - promise which resolves with response
   *
   **/
  addHeatmapEdit(json) {
    var suffix = "HeatmapEdit/post"
    var url = this.base + suffix;
    // TODO check on valid
    // if (this.validation.mark && !this.validation.mark(json)){
    //   console.warn(this.validation.mark.errors)
    // }
    return fetch(url, {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(json)
    }).then(this.errorHandler)
  }

  updateHeatmapEdit(user, slide, name, data){
    var suffix = "HeatmapEdit/update"
    var url = this.base + suffix;
    var query = {}

    if (user) {
      query.user = user
    }

    if (slide) {
      query.slide = slide
    }

    if(name) {
      query.name = name
    }
    if(data) {
      query.data = data
    }

    return fetch(url + "?" + objToParamStr(query), {
      method: "DELETE",
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)
  }

  findHeatmapEdit(user, slide, name) {
    var suffix = "HeatmapEdit/find"
    var url = this.base + suffix;
    var query = {}
    if (user) {
      query.user = user
    }
    if (slide) {
      query.slide = slide
    }
    if(name) {
      query.name = name
    }
    return fetch(url + "?" + objToParamStr(query), {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)
  }
  /**
   * delete heatmap
   * @param {object} id - the heatmap object id
   * @param {object} slide - the associated slide
   * @returns {promise} - promise which resolves with response
   **/
  deleteHeatmapEdit(user, slide, name) {
    var suffix = "HeatmapEdit/delete"
    var url = this.base + suffix;
    var query = {};
    if (user) {
      query.user = user
    }
    if (slide) {
      query.slide = slide
    }

    if(name) {
      query.name = name
    }
    return fetch(url + "?" + objToParamStr(query), {
      method: "DELETE",
      credentials: "include",
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
      credentials: "include",
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
      credentials: "include",
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
    if (study) {
      query.study = study
    }
    if (specimen) {
      query.specimen = specimen
    }
    if (location) {
      query.location = location
    }

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)
  }
  /**
   * find By CollectionId
   * @param {string} [name] - the slide name
   * @param {string} [location] - the slide location, supporting regex match
   * @returns {promise} - promise which resolves with data
   **/
  findByCollectionId(cid) {
    var suffix = "Slide/findByCollectionId"
    var url = this.base + suffix;
    var query = {}
    query.cid = cid
    return fetch(url + "?" + objToParamStr(query), {
      credentials: "include",
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
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler).then(x=>this.filterBroken(x, "slide"))
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
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler).then(x=>this.filterBroken(x, "template"))
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
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler).then(x=>this.filterBroken(x, "template"))
  }

  /**
   * post mark
   * @param {object} json - the mark data
   * @returns {promise} - promise which resolves with response
   **/
  addLabel(json) {
    var suffix = "Labeling/post"
    var url = this.base + suffix;
    if (this.validation.labeling && !this.validation.labeling(json)){
      console.warn(this.validation.labeling.errors)
    }
    return fetch(url, {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(json)
    }).then(this.errorHandler)
  }

  /**
   * post mark
   * @param {object} json - the mark data
   * @returns {promise} - promise which resolves with response
   **/
  addLabelingAnnotation(json) {
    var suffix = "LabelingAnnotation/post"
    var url = this.base + suffix;
    if (this.validation.labeling && !this.validation.labeling(json)){
      console.warn(this.validation.labeling.errors)
    }
    return fetch(url, {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(json)
    }).then(this.errorHandler)
  }

  /**
   * get mark by id
   * @param {string} id - the mark id
   * @returns {promise} - promise which resolves with data
   **/
  getLabel(id) {
    var suffix = "Labeling/get"
    var url = this.base + suffix;
    var query = {
      'id': id
    }

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler).then(x=>this.filterBroken(x, "mark"))
  }

  findLabel(label, slide, type) {
    var suffix = "Labeling/find";
    var url = this.base + suffix;
    var query = {}
    if(label) query.labelId = label;
    if(slide) query.slideId = slide;
    if(type) query.labelType = type;

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler).then(x=>this.filterBroken(x, "labeling"))    
  }

  findLabelByIds(ids, slide, type) {
    if (!Array.isArray(ids)) {
      return {
        hasError: true,
        message: 'args are illegal'
      }
    }
    var bySlideId
    var suffix = "Labeling/mutiFindByIds"
    var url = this.base + suffix;
    var query = {}
    var stringifiedIds = ids.map(id => `"${id}"`).join(',');
    query.labelId = `[${stringifiedIds}]`;
    if(slide) query.slideId = slide;
    if(type) query.labelType = type;

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler).then(x=>this.filterBroken(x, "labeling"))
  }

  findAllLabelsWithoutAnnotations(){// return top 50
    var suffix = "Labeling/findAllLabelsWithoutAnnotations"
    var url = this.base + suffix;
    return fetch(url, {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler).then(x=>this.filterBroken(x, "labeling"))    
  }
  addLabelsAnnotation(slide, label, annotationIds){
    if (!Array.isArray(annotationIds) || !slide || !label) {
      return {
        hasError: true,
        message: 'args are illegal'
      }
    }    

    var suffix = "Labeling/addAnnotations"
    var url = this.base + suffix;
    var query = {}
    query.slide = slide
    query.label = label
    
    var stringifiedIds = annotationIds.map(id => `"${id}"`).join(',');
    query.annotationIds = `[${stringifiedIds}]`;
        

    return fetch(url + "?" + objToParamStr(query), {
      method: "DELETE",
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)    
  }

  pushLabelAnnotationId(labelId, annotationId){

    if (!labelId || !annotationId) {
      return {
        hasError: true,
        message: 'args are illegal'
      }
    }

    var suffix = "Labeling/pushLabelAnnotationId"
    var url = this.base + suffix;
    var query = {}
    query.id = labelId
    query.annotationId = annotationId
    
    return fetch(url + "?" + objToParamStr(query), {
      method: "DELETE",
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)

  }

  countByCreator(){
    var suffix = "Labeling/countByCreator"
    var url = this.base + suffix;
    return fetch(url, {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)
  }

  countBySlide(){
    var suffix = "Labeling/countBySlide"
    var url = this.base + suffix;
    return fetch(url, {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)
  }
  
  countByLabelType(){
    var suffix = "Labeling/countByLabelType"
    var url = this.base + suffix;
    return fetch(url, {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)
  }

  countAllLabels(){
    var suffix = "Labeling/countAllByType"
    var url = this.base + suffix;
    var query = {}
    query.type = 'label'
    return fetch(url + "?" + objToParamStr(query), {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)
  }

  allLabelSheet(type){
    var suffix = "Labeling/allLabelSheet"
    var url = this.base + suffix;
    var query = {}
    query.type = type
    return fetch(url+ "?" + objToParamStr(query), {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)    
  }

  getAllUsers(){
    var suffix = "Auth/list"
    var url = this.base + suffix
    return fetch(url, {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)
  }
  /**
   * add a log item
   ** @param {object} json - the log data
   * @returns {promise} - promise which resolves with data
   **/
  addLog(json){
    var suffix = "Log/post"
    var url = this.base + suffix;
    return fetch(url, {
      method: "POST",
      credentials: "include",
      mode: "cors",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(json)
    }).then(this.errorHandler)
  }
  
  findLabelingByTypeOrCreator(slide, type, creator){
    if (!slide) {
      return {
        hasError: true,
        message: 'args are illegal'
      }
    }
    var suffix = "Labeling/findLabelingByTypeOrCreator"
    var url = this.base + suffix;
    var query = {}
    query.slideId = slide;
    if(type) query.computation = type;
    if(creator) query.creator = creator;

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)
  }
  
  findLabelingAnnotationByTypeOrCreator(slide, type, creator){
    if (!slide) {
      return {
        hasError: true,
        message: 'args are illegal'
      }
    }
    var suffix = "LabelingAnnotation/findByTypeOrCreator"
    var url = this.base + suffix;
    var query = {}
    query.slideId = slide;
    if(type) query.computation = type;
    if(creator) query.creator = creator;

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)
  }

  countSimpleAnnotationBySlideAndCreator(creator,nameList){
    if (!Array.isArray(nameList) || !creator) {
      return {
        hasError: true,
        message: 'args are illegal'
      }
    }
    var suffix = "LabelingAnnotation/countSimpleAnnotationBySlideAndCreator"
    var url = this.base + suffix;
    var query = {}
    var stringifiedNames = nameList.map(name => `"${name}"`).join(',');
    query.name = `[${stringifiedNames}]`;
    query.creatorId = creator;

    return fetch(url + "?" + objToParamStr(query), {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)
  }

  getAllCollections(name){
    var suffix = "Collection/getAllCollections"
    var url = this.base + suffix;
    var query = {}
    if(name) query.name = name
    return fetch(url+ "?" + objToParamStr(query), {
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)    
  }

  findCollectionById(id){
    var suffix = "Collection/findCollectionById"
    var url = this.base + suffix;
    var query = {}
    query.id = id
    return fetch(url+ "?" + objToParamStr(query), {
      credentials: "include",
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
      credentials: "include",
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
      credentials: "include",
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
      credentials: "include",
      mode: "cors"
    }).then(this.errorHandler)
  }
}

try {
  module.exports = Store;
} catch (e) {
  var a
}
