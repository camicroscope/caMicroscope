function ParamPoly(urlvar){

  console.warn("{ParamPoly} Loaded")
  function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
  }
  urlvar = urlvar || "passed"
  // when document ready
  // get url variable

  //image_data.provenance.analysis.execution_id = "url"
  Store.prototype.findMark_raw = Store.prototype.findMark
  Store.prototype.findMarkTypes_raw = Store.prototype.findMarkTypes
  Store.prototype.getMarkByIds_raw = Store.prototype.getMarkByIds
  Store.prototype.findMark = function (slide, name, specimen, study, footprint, source, x0, x1, y0, y1){
    if (!(urlvar in getUrlVars())){
      return this.findMark_raw(slide, name, specimen, study, footprint, source, x0, x1, y0, y1)
    } else {
      // expecting feature collection so far
      let image_data = JSON.parse(decodeURIComponent(getUrlVars()[urlvar]))
      let dummy_mark = { "_id" : { "$oid" : "000"} , "provenance" : { "image" : { "slide" : "NO" , "slidename" : "NO"} , "analysis" : { "source" : "url" , "execution_id" : "URLPARAM"}} , "geometries" : { "type" : "FeatureCollection" , "features" : image_data}}
      return this.findMark_raw(slide, name, specimen, study, footprint, source, x0, x1, y0, y1).then(x=>{
        x.push(dummy_mark)
        return x
      })
    }
  }

  Store.prototype.findMarkTypes = function(slide, name){
    if (!(urlvar in getUrlVars())){
      return this.findMarkTypes_raw(slide, name)
    } else {
      return this.findMarkTypes_raw(slide, name).then(x=>{
        let urltype = { "image" : { "slide" : "NO" , "slidename" : "NO"} , "analysis" : { "source" : "url" , "execution_id" : "URLPARAM"}}
        x.push(urltype)
        return x
      })
    }
  }

  Store.prototype.getMarkByIds = function(ids, slide, study, specimen, source, footprint, x0, x1, y0, y1){
    console.log(ids, slide, study, specimen, source, footprint, x0, x1, y0, y1)
    if (ids.includes('URLPARAM')){
      return this.getMarkByIds_raw(ids, slide, study, specimen, source, footprint, x0, x1, y0, y1).then(x=>{
        if (!(urlvar in getUrlVars())){
          return x
        } else {
          // expecting feature collection so far
          let image_data = JSON.parse(decodeURIComponent(getUrlVars()[urlvar]))
          let dummy_mark = { "_id" : { "$oid" : "000"} , "provenance" : { "image" : { "slide" : "NO" , "slidename" : "NO"} , "analysis" : { "source" : "url" , "execution_id" : "URLPARAM"}} , "geometries" : { "type" : "FeatureCollection" , "features" : image_data}}
          x.push(dummy_mark)
          console.log(x)
          return x
        }
      })
    } else {
      return this.getMarkByIds_raw(ids, slide, study, specimen, source, footprint, x0, x1, y0, y1)
    }
  }

}

export default ParamPoly
