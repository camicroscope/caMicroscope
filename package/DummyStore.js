function DummyStore(){
  console.log("this has run")
  Store.prototype.findSlideDummy = function(){
    return new Promise(function(res,rej){
      data = [{ "_id" : { "$oid" : "5bb6861db8bb11ffeaa05b6d"} , "name" : "CMU1" , "location" : "/images/sample.svs" , "mpp" : 0.499}]
      x = {'json': x=>data}
      res(x)
    })
  }
}

export default DummyStore
