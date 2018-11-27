function ParamPoly(urlvar){
  function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
  }
  // when document ready
  // get url variable

  //image_data.provenance.analysis.execution_id = "url"
  Store.prototype.findMark_raw = Store.prototype.findMark
  Store.prototype.findMarkTypes_raw = Store.prototype.findMarkTypes
  Store.prototype.findMarkbyIds_raw = Store.prototype.findMarkbyIds
  Store.prototype.findMark = function (ids, slide){
    // expecting feature collection so far
    let test_data = "%5B%7B%22type%22%3A%22Feature%22%2C%22properties%22%3A%7B%22style%22%3A%7B%22color%22%3A%22%237cfc00%22%2C%22lineCap%22%3A%22round%22%2C%22lineJoin%22%3A%22round%22%2C%22lineWidth%22%3A3%7D%7D%2C%22geometry%22%3A%7B%22type%22%3A%22Polygon%22%2C%22coordinates%22%3A%5B%5B%5B0%2C1.333075238564%5D%2C%5B0.9211833251318%2C1.333075238564%5D%2C%5B0.9211833251318%2C1.4056976389659%5D%2C%5B0.84856092473%2C1.4056976389659%5D%2C%5B0%2C1.333075238564%5D%5D%5D%7D%7D%2C%7B%22type%22%3A%22Feature%22%2C%22properties%22%3A%7B%22style%22%3A%7B%22color%22%3A%22%237cfc00%22%2C%22lineCap%22%3A%22round%22%2C%22lineJoin%22%3A%22round%22%2C%22lineWidth%22%3A3%7D%7D%2C%22geometry%22%3A%7B%22type%22%3A%22Polygon%22%2C%22coordinates%22%3A%5B%5B%5B0.0819138121014%2C1.2558071323124%5D%2C%5B0.987611451067%2C1.2558071323124%5D%2C%5B0.987611451067%2C1.9173119035902%5D%2C%5B0.0819138121014%2C1.9173119035902%5D%2C%5B0.0819138121014%2C1.2558071323124%5D%5D%5D%7D%7D%5D"
    //let image_data = JSON.parse(decodeURI(getUrlVars(urlvar)))
    let image_data = JSON.parse(decodeURIComponent(test_data))
    let dummy_mark = { "_id" : { "$oid" : "000"} , "provenance" : { "image" : { "slide" : "NO" , "slidename" : "NO"} , "analysis" : { "source" : "url" , "execution_id" : "URLPARAM"}} , "geometries" : { "type" : "FeatureCollection" , "features" : image_data}}
    return this.findMark_raw(ids, slide).then(x=>{
      x.push(dummy_mark)
      return x
    })
  }

  Store.prototype.findMarkTypes = function(slide, name){
    return this.findMarkTypes_raw(slide, name).then(x=>{
      let urltype = { "image" : { "slide" : "NO" , "slidename" : "NO"} , "analysis" : { "source" : "url" , "execution_id" : "URLPARAM"}}
      x.push(urltype)
      return x
    })
  }

  Store.prototype.findMarkbyIds = function(ids, slide){
    return this.findMarkbyIds_raw(ids, slide).then(x=>{
      if ("URLPARAM" in ids){
        // expecting feature collection so far
        let test_data = "%5B%7B%22type%22%3A%22Feature%22%2C%22properties%22%3A%7B%22style%22%3A%7B%22color%22%3A%22%237cfc00%22%2C%22lineCap%22%3A%22round%22%2C%22lineJoin%22%3A%22round%22%2C%22lineWidth%22%3A3%7D%7D%2C%22geometry%22%3A%7B%22type%22%3A%22Polygon%22%2C%22coordinates%22%3A%5B%5B%5B0%2C1.333075238564%5D%2C%5B0.9211833251318%2C1.333075238564%5D%2C%5B0.9211833251318%2C1.4056976389659%5D%2C%5B0.84856092473%2C1.4056976389659%5D%2C%5B0%2C1.333075238564%5D%5D%5D%7D%7D%2C%7B%22type%22%3A%22Feature%22%2C%22properties%22%3A%7B%22style%22%3A%7B%22color%22%3A%22%237cfc00%22%2C%22lineCap%22%3A%22round%22%2C%22lineJoin%22%3A%22round%22%2C%22lineWidth%22%3A3%7D%7D%2C%22geometry%22%3A%7B%22type%22%3A%22Polygon%22%2C%22coordinates%22%3A%5B%5B%5B0.0819138121014%2C1.2558071323124%5D%2C%5B0.987611451067%2C1.2558071323124%5D%2C%5B0.987611451067%2C1.9173119035902%5D%2C%5B0.0819138121014%2C1.9173119035902%5D%2C%5B0.0819138121014%2C1.2558071323124%5D%5D%5D%7D%7D%5D"
        //let image_data = JSON.parse(decodeURI(getUrlVars(urlvar)))
        let image_data = JSON.parse(decodeURIComponent(test_data))
        let dummy_mark = { "_id" : { "$oid" : "000"} , "provenance" : { "image" : { "slide" : "NO" , "slidename" : "NO"} , "analysis" : { "source" : "url" , "execution_id" : "URLPARAM"}} , "geometries" : { "type" : "FeatureCollection" , "features" : image_data}}
        x.push(dummy_mark)
      }
      return x
    })

  }
}

export default ParamPoly
