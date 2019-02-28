function DummyStore(){
  console.log("this has run")
  Store.prototype.findSlideDummy = function(){
    return new Promise(function(res,rej){
      res({'json': function(){
        return [{ "_id" : { "$oid" : "5bb6861db8bb11ffeaa05b6d"} , "name" : "CMU1" , "location" : "/images/sample.svs" , "mpp" : 0.499}]
      }})
    })
  }
}

export default DummyStore
