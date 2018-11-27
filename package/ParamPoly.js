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
  Store.prototype.findMark = function (ids, slide){
    if (false && !urlvar in getUrlVars()){
      return x
    } else {
      // expecting feature collection so far
      let test_data = "%5B%7B%22type%22%3A%22Feature%22%2C%22properties%22%3A%7B%22style%22%3A%7B%22color%22%3A%22%237cfc00%22%2C%22lineJoin%22%3A%22round%22%2C%22lineCap%22%3A%22round%22%2C%22lineWidth%22%3A%223%22%7D%7D%2C%22geometry%22%3A%7B%22type%22%3A%22Polygon%22%2C%22coordinates%22%3A%5B%5B%5B0.41901278965160904%2C0.46352632426705814%5D%2C%5B0.5108849144359678%2C0.46352632426705814%5D%2C%5B0.5108849144359678%2C0.531138817079019%5D%2C%5B0.41901278965160904%2C0.531138817079019%5D%2C%5B0.41901278965160904%2C0.46352632426705814%5D%5D%5D%7D%2C%22bound%22%3A%7B%22type%22%3A%22Polygon%22%2C%22coordinates%22%3A%5B%5B%5B0.41901278965160904%2C0.46352632426705814%5D%2C%5B0.5108849144359678%2C0.46352632426705814%5D%2C%5B0.5108849144359678%2C0.531138817079019%5D%2C%5B0.41901278965160904%2C0.531138817079019%5D%2C%5B0.41901278965160904%2C0.46352632426705814%5D%5D%5D%7D%7D%2C%7B%22type%22%3A%22Feature%22%2C%22properties%22%3A%7B%22style%22%3A%7B%22color%22%3A%22%237cfc00%22%2C%22lineJoin%22%3A%22round%22%2C%22lineCap%22%3A%22round%22%2C%22lineWidth%22%3A%223%22%7D%7D%2C%22geometry%22%3A%7B%22type%22%3A%22Polygon%22%2C%22coordinates%22%3A%5B%5B%5B0.4753939713652375%2C0.5039590442210546%5D%2C%5B0.5497452508361979%2C0.5039590442210546%5D%2C%5B0.5497452508361979%2C0.5592170948248499%5D%2C%5B0.4753939713652375%2C0.5592170948248499%5D%2C%5B0.4753939713652375%2C0.5039590442210546%5D%5D%5D%7D%2C%22bound%22%3A%7B%22type%22%3A%22Polygon%22%2C%22coordinates%22%3A%5B%5B%5B0.4753939713652375%2C0.5039590442210546%5D%2C%5B0.5497452508361979%2C0.5039590442210546%5D%2C%5B0.5497452508361979%2C0.5592170948248499%5D%2C%5B0.4753939713652375%2C0.5592170948248499%5D%2C%5B0.4753939713652375%2C0.5039590442210546%5D%5D%5D%7D%7D%5D"
      let image_data = JSON.parse(decodeURIComponent(test_data))
      let dummy_mark = { "_id" : { "$oid" : "000"} , "provenance" : { "image" : { "slide" : "NO" , "slidename" : "NO"} , "analysis" : { "source" : "url" , "execution_id" : "URLPARAM"}} , "geometries" : { "type" : "FeatureCollection" , "features" : image_data}}
      return this.findMark_raw(ids, slide).then(x=>{
        x.push(dummy_mark)
        return x
      })
    }
  }

  Store.prototype.findMarkTypes = function(slide, name){
    if (false && !urlvar in getUrlVars()){
      return x
    } else {
      return this.findMarkTypes_raw(slide, name).then(x=>{
        let urltype = { "image" : { "slide" : "NO" , "slidename" : "NO"} , "analysis" : { "source" : "url" , "execution_id" : "URLPARAM"}}
        x.push(urltype)
        return x
      })
    }
  }

  Store.prototype.getMarkByIds = function(ids, slide){
    console.log(ids, slide)
    if (ids.includes('URLPARAM')){
      return this.getMarkByIds_raw(ids, slide).then(x=>{
        if (false && !urlvar in getUrlVars()){
          return x
        } else {
          // expecting feature collection so far
          let test_data = "%5B%7B%22type%22%3A%22Feature%22%2C%22properties%22%3A%7B%22style%22%3A%7B%22color%22%3A%22%237cfc00%22%2C%22lineJoin%22%3A%22round%22%2C%22lineCap%22%3A%22round%22%2C%22lineWidth%22%3A%223%22%7D%7D%2C%22geometry%22%3A%7B%22type%22%3A%22Polygon%22%2C%22coordinates%22%3A%5B%5B%5B0.41901278965160904%2C0.46352632426705814%5D%2C%5B0.5108849144359678%2C0.46352632426705814%5D%2C%5B0.5108849144359678%2C0.531138817079019%5D%2C%5B0.41901278965160904%2C0.531138817079019%5D%2C%5B0.41901278965160904%2C0.46352632426705814%5D%5D%5D%7D%2C%22bound%22%3A%7B%22type%22%3A%22Polygon%22%2C%22coordinates%22%3A%5B%5B%5B0.41901278965160904%2C0.46352632426705814%5D%2C%5B0.5108849144359678%2C0.46352632426705814%5D%2C%5B0.5108849144359678%2C0.531138817079019%5D%2C%5B0.41901278965160904%2C0.531138817079019%5D%2C%5B0.41901278965160904%2C0.46352632426705814%5D%5D%5D%7D%7D%2C%7B%22type%22%3A%22Feature%22%2C%22properties%22%3A%7B%22style%22%3A%7B%22color%22%3A%22%237cfc00%22%2C%22lineJoin%22%3A%22round%22%2C%22lineCap%22%3A%22round%22%2C%22lineWidth%22%3A%223%22%7D%7D%2C%22geometry%22%3A%7B%22type%22%3A%22Polygon%22%2C%22coordinates%22%3A%5B%5B%5B0.4753939713652375%2C0.5039590442210546%5D%2C%5B0.5497452508361979%2C0.5039590442210546%5D%2C%5B0.5497452508361979%2C0.5592170948248499%5D%2C%5B0.4753939713652375%2C0.5592170948248499%5D%2C%5B0.4753939713652375%2C0.5039590442210546%5D%5D%5D%7D%2C%22bound%22%3A%7B%22type%22%3A%22Polygon%22%2C%22coordinates%22%3A%5B%5B%5B0.4753939713652375%2C0.5039590442210546%5D%2C%5B0.5497452508361979%2C0.5039590442210546%5D%2C%5B0.5497452508361979%2C0.5592170948248499%5D%2C%5B0.4753939713652375%2C0.5592170948248499%5D%2C%5B0.4753939713652375%2C0.5039590442210546%5D%5D%5D%7D%7D%5D"
          //let image_data = JSON.parse(decodeURI(getUrlVars(urlvar)))
          let image_data = JSON.parse(decodeURIComponent(test_data))
          let dummy_mark = { "_id" : { "$oid" : "000"} , "provenance" : { "image" : { "slide" : "NO" , "slidename" : "NO"} , "analysis" : { "source" : "url" , "execution_id" : "URLPARAM"}} , "geometries" : { "type" : "FeatureCollection" , "features" : image_data}}
          x.push(dummy_mark)
          console.log(x)
          return x
        }
      })
    } else {
      return this.getMarkByIds_raw(ids, slide)
    }
  }

}

export default ParamPoly
