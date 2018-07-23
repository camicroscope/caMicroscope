// requires: Api_Utils
// METHODS HERE RETURN PROMISES
// for test server
try{
  var fetch = require('node-fetch');
}catch(e){
  var b;
}

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

class Store{
  constructor(config){
    // config
    this.slideUrl = config.slideUrl || "http://localhost:3001/slide"
    this.marktypeUrl = config.marktypeUrl || "http://localhost:3001/marktype"
    this.markUrl = config.markUrl || "http://localhost:3001/marking"
    this.heatmapUrl = config.heatmapUrl || "http://localhost:3001/heatmap"
  }
  setId(id){
    this.slideId = id;
  }

  getSlide(){
    var url = this.slideUrl + "/one";
    var params = {id: this.slideId};
    return fetch(url + "?" + objToParamStr(params), {
            credentials: "same-origin"
        }).then((x)=>x.json())
  }

  getMarktypes(){
    var url = this.marktypeUrl;
    var params = {slide: this.slideId};
    return fetch(url + "?" + objToParamStr(params), {
            credentials: "same-origin"
        }).then((x)=>x.json())
  }

  getHeatmaps(){
    var url = this.heatmapUrl;
    var params = {slide: this.slideId};
    return fetch(url + "?" + objToParamStr(params), {
            credentials: "same-origin"
        }).then((x)=>x.json())
  }

  getMarks(marktypes){
    var markPromiseList = [];
    var url = this.markUrl;
    for (var i in marktypes){
      var params = {"properties.marktype": marktypes[i]}
      markPromiseList.push(
        fetch(url + "?" + objToParamStr(params), {
              credentials: "same-origin"
      }).then((x)=>x.json())
    )
    }
    return Promise.all(markPromiseList)
  }
  getMarkById(markId){
    var url = this.markUrl + "/one";
    var params = {id: markId};
    return fetch(url + "?" + objToParamStr(params), {
            credentials: "same-origin"
        }).then((x)=>x.json())
  }
}

try{
  module.exports = Store;
}
catch(e){
  var a
}
