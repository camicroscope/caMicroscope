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
* @param config - configuration options
* @param config.getUrls - collectop/type as key, url for get as value
* @param config.updateUrls- collectop/type as key, url for update as value
* @param config.postUrls- collectop/type as key, url for post as value
* @param config.deleteUrls- collectop/type as key, url for delete as value
**/
class Store{
  constructor(onfig){
    // config
    this.key = key || "";
    this.getUrls = config.getUrls;
    this.updateUrls = config.updateUrls;
    this.postUrls = config.postUrls;
    this.deleteUrls = config.deleteUrls;
    this.testmode = config.testmode || false;
  }
  /**
  * get data
  * @param {string} type - the datatype to get
  * @param {object} query - the query of url parameters
  * @returns {promise} - promise which resolves with data
  **/
  get(type, query){
    var url = this.getUrls[type];
    // api key for bindaas?
    return fetch(url + "?" + objToParamStr(query), {
            credentials: "same-origin",
            mode: "cors"
        }).then((x)=>x.json())
  }
  /**
  * post data
  * @param {string} type - the datatype to get
  * @param {object} query - the query of url parameters
  * @param {object} data - the data to post
  * @returns {promise} - promise which resolves with data
  **/
  post(type, query, data){
    var url = this.postUrls[type];
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
