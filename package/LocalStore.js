// overwrite store with equivalent local functions
function init_LocalStore(){
  // requirements
  Object.byString = function(o, s) {
      s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
      s = s.replace(/^\./, '');           // strip a leading dot
      var a = s.split('.');
      for (var i = 0, n = a.length; i < n; ++i) {
          var k = a[i];
          if (k in o) {
              o = o[k];
          } else {
              return;
          }
      }
      return o;
  }

  function findInLocalStorage(type, query){
    let data = JSON.parse(window.localStorage.getItem(type))
    return data.filter(x=>{
      let matching = true;
      for (i in query){
        matching = matching && Object.byString(x, i) == query[i]
      }
      return matching
    })
  }

  function getInLocalStorage(type, id){
    let data = JSON.parse(window.localStorage.getItem(type))
    return data.filter(x=>x['_id'] == id)[0]
  }

  function putInLocalStorage(type, newData){
    let data = JSON.parse(window.localStorage.getItem(type))
    data.push(newData)
    window.localStorage.setItem(type, JSON.stringify(data))
    return newData
  }

  function removeFromLocalStorage(type, id){
    console.error('Delete operation currently unsupported')
    window.alert('Delete operation currently unsupported')
  }


  // replace impacted store functionality.
  Store.prototype.findMarkTypes = function(slide, name){
    return new Promise(function(res, rej){
      let query={}
      if (name){
        query['provenance.image.slide'] = slide
      }
      if(slide){
        query['provenance.analysis.execution_id']= name
      }
      let data = findInLocalStorage("mark", query)
      const unique = [...new Set(data.map(x => Object.byString(x,'provenance.analysis.execution_id')))];
      res(unique)
      // TODO!!!
    })
  }
  Store.prototype.findMark = function(slide, name){
    return new Promise(function(res, rej){
      let query = {}
      if (name){
        query['provenance.image.slide'] = slide
      }
      if(slide){
        query['provenance.analysis.execution_id']= name
      }
      res(findInLocalStorage('mark', query))
    })
  }
  Store.prototype.getMarkByIds = function(ids, slide){
    return new Promise(function(res, rej){
      data = []
      for (i in ids){
        data.push(...findInLocalStorage('mark', {'provenance.analysis.execution_id': ids[i]}))
      }
      res(data)
    })
  }
  Store.prototype.getMark = function(id){
    return new Promise(function(res, rej){
      res(getInLocalStorage("mark", id))
    })
  }
  Store.prototype.addMark = function(json){
    return new Promise(function(res, rej){
      // give it an that's probably semi-unique
      json['_id'] = json['_id'] || Date.now()
      res(putInLocalStorage('mark', json))
    })
  }
  Store.prototype.deleteMark = function(id,slide){
    return new Promise(function(res, rej){
      res(removeFromLocalStorage('mark', id))
    })
  }
  Store.prototype.findHeatmap = function(slide, name){
    return new Promise(function(res, rej){
      let query = {}
      if (name){
        query['provenance.image.slide'] = slide
      }
      if(slide){
        query['provenance.analysis.execution_id']= name
      }
      res(findInLocalStorage('heatmap', query))
    })
  }
  Store.prototype.getHeatmap = function(id){
    return new Promise(function(res, rej){
      res(getInLocalStorage("heatmap", id))
    })
  }
  Store.prototype.addHeatmap = function(json){
    // give it an that's probably semi-unique
    json['_id'] = json['_id'] || Date.now()
    return new Promise(function(res, rej){
      res(putInLocalStorage('heatmap', json))
    })
  }
  Store.prototype.deleteHeatmap = function(id,slide){
    return new Promise(function(res, rej){
      res(removeFromLocalStorage('heatmap', id))
    })
  }

  // import and export functions
  Store.prototype.export = function(type){
    return new Promise(function(res, rej){
      res(window.localStorage.getItem(type))
    })
  }
  // NOTE -- overwrites
  Store.prototype.import = function(type, data){
    return new Promise(function(res, rej){
      res(window.localStorage.setItem(type, data))
    })
  }
}

export default init_LocalStore
