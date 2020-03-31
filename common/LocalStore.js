// overwrite store with equivalent local functions
function init_LocalStore(){
  // requirements
  Store.prototype.db = idb.openDb("heatmap", 1, x=>{
    let recordStore = x.createObjectStore("heatmap", {autoIncrement : true});
  })
  console.warn("{localstore mods enabled}")
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

  function findInIDB(type, query){
    return new Promise((res,rej)=>{
      Store.prototype.db.then(x=>{
        var data = x.transaction(type).objectStore(type, 'readonly').getAll()
        data.then(data=>{
          res(data.filter(x=>{
            let matching = true;
            for (var i in query){
              matching = matching && Object.byString(x, i) == query[i]
            }
            return matching
          }))
        })
      }
    )
    })
  }

  function putInIDB(type, newData){
    Store.prototype.db.then(x=>{
          let tx = x.transaction(type, 'readwrite')
          var store = tx.objectStore(type)
          store.add(newData)
    })
    return newData
  }
  function removeFromIDB(type, id){
    console.warn("Some issues with Deleting a Single Heatmap in LocalStore")
    Store.prototype.db.then(x=>{
          let tx = x.transaction(type, 'readwrite')
          var store = tx.objectStore(type)
          store.delete(id)
    })
    return ""
  }
  function clearDBFromIDB(type){
    Store.prototype.db.then(x=>{
          let tx = x.transaction(type, 'readwrite')
          var store = tx.objectStore(type)
          store.clear(type)
    })
    return ""
  }

  function findInLocalStorage(type, query){
    let data = JSON.parse(window.localStorage.getItem(type))
    if (data){
      return data.filter(x=>{
        let matching = true;
        for (var i in query){
          matching = matching && Object.byString(x, i) == query[i]
        }
        return matching
      })
    } else {
      return []
    }

  }

  function getInLocalStorage(type, id){
    let data = JSON.parse(window.localStorage.getItem(type))
    if (data){
      return data.filter(x=>x['_id'] == id)[0]
    } else {
      return {}
    }

  }

  function putInLocalStorage(type, newData){
    let data = JSON.parse(window.localStorage.getItem(type))
    data = data || []
    data.push(newData)
    window.localStorage.setItem(type, JSON.stringify(data))
    return newData
  }

  function removeFromLocalStorage(type, id){
    console.log(id)
    let data = JSON.parse(window.localStorage.getItem(type))
    data = data || []
    let newData = data.filter(x=>x['_id']['$oid'] !== id)
    window.localStorage.setItem(type, JSON.stringify(newData))
    var diff = data.length - newData.length
    return {'deletedCount': diff , 'rowsAffected': diff}
  }



  // stange fixes for potential mismatches in validation version
  Store.prototype.validation = Store.prototype.validation || {}
  Store.prototype.filterBroken = Store.prototype.filterBroken || function(a,b){return a}
  // replace impacted store functionality.
  Store.prototype.findMarkTypes = function(slide, name){
    return new Promise(function(res, rej){
      let query={}
      if(name){
        query['provenance.analysis.execution_id']= name
      }
      if(slide){
        query['provenance.image.slide'] = slide
      }
      let data = findInLocalStorage("mark", query)
      if (data){
        const unique = [...new Set(data.map(x => Object.byString(x,'provenance.analysis')))];
        res(unique)
      } else {
        res([])
      }

      // TODO!!!
    })
  }

  Store.prototype.findMark = function(slide, name, footprint, source, x0, x1, y0, y1){
    return new Promise(function(res, rej){
      let query = {}
      if (name){
        query['provenance.image.slide'] = slide
      }
      if(slide){
        query['provenance.analysis.execution_id']= name
      }
      if(source){
        query['provenance.analysis.source']= source
      }
      res(findInLocalStorage('mark', query))
    }).then(x=>this.filterBroken(x,"mark"))
  }
  Store.prototype.getMarkByIds = function(ids, slide, source, footprint, x0, x1, y0, y1){
    return new Promise(function(res, rej){
      let data = []
      for (var i in ids){
        data.push(...findInLocalStorage('mark', {'provenance.analysis.execution_id': ids[i], 'provenance.image.slide': slide}))
      }
      res(data)
    }).then(x=>this.filterBroken(x,"mark"))
  }
  Store.prototype.getMark = function(id){
    return new Promise(function(res, rej){
      res(getInLocalStorage("mark", id))
    }).then(x=>this.filterBroken(x,"mark"))
  }
  Store.prototype.addMark = function(json){
    if (!this.validation.mark(json)){
      console.warn(this.validation.mark.errors)
    }
    return new Promise(function(res, rej){
      // give it an that's probably semi-unique
      json['_id'] = json['_id'] || {'$oid': Date.now()}
      res(putInLocalStorage('mark', json))
    })
  }
  Store.prototype.deleteMark = function(id, slide){
    return new Promise((res, rej)=>{
      res(removeFromLocalStorage('mark', id))
    })
  }
  Store.prototype.findHeatmap = function(slide, name){
    return new Promise(function(res, rej){
      let query = {}
      if(name){
        query['provenance.analysis.execution_id']= name
      }
      res(findInIDB('heatmap', query))
    }).then(x=>this.filterBroken(x,"heatmap"))
  }
  Store.prototype.findHeatmapType = function(slide, name){
    return new Promise(function(res, rej){
      let query = {}
      if(name){
        query['provenance.analysis.execution_id']= name
      }
      res(findInIDB('heatmap', query))
    }).then(x=>this.filterBroken(x,"heatmap"))
  }
  Store.prototype.getHeatmap = function(slide, execution_id){
    return new Promise(function(res, rej){
      let query = {}
      if(execution_id){
        query['provenance.analysis.execution_id']= execution_id
      }
      res(findInIDB('heatmap', query))
    }).then(x=>this.filterBroken(x,"heatmap"))
  }
  Store.prototype.addHeatmap = function(json){
    // give it an that's probably semi-unique
    if (!this.validation.heatmap(json)){
      console.warn(this.validation.heatmap.errors)
    }
    json['_id'] = json['_id'] || {'$oid': Date.now()}
    return new Promise(function(res, rej){
      res(putInIDB('heatmap', json))
    })
  }
  Store.prototype.deleteHeatmap = function(id,slide){
    return new Promise(function(res, rej){
      res(removeFromIDB('heatmap', id))
    })
  }
  Store.prototype.clearHeatmaps = function(){
    return new Promise(function(res, rej){
      res(clearDBFromIDB('heatmap'))
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
  Store.prototype.findSlide = function(slide, specimen, study, location){
    return new Promise(function(res, rej){
      let params = new URLSearchParams(document.location.search.substring(1));
      let slideId = params.get("slideId") || "local";
      let local_dummy = {
        '_id': {"$oid":slideId},
        'mpp': '0.001',
        'location': slideId,
        'name': slideId
      }
      res([local_dummy])
    })
  }
  Store.prototype.getSlide = function(id){
    return new Promise(function(res, rej){
      let params = new URLSearchParams(document.location.search.substring(1));
      let slideId = params.get("slideId") || "local";
      console.log(params)
      let local_dummy = {
        '_id': {"$oid":slideId},
        'mpp': '0.001',
        'location': slideId,
        'name': slideId
      }
      res(local_dummy)
    })
  }
  Store.prototype.findTemplate = function(name,type){
    let query = {}
    if (name){
      query.name = name
    }
    if (type){
      query.type = type
    }
    return new Promise(function(res, rej){
      res(findInLocalStorage("template", query))
    }).then(x=>this.filterBroken(x,"template"))
  }
  Store.prototype.getTemplate = function(id){
    return new Promise(function(res, rej){
      res(getInLocalStorage("template", id))
    }).then(x=>this.filterBroken(x,"template"))
  }
  Store.prototype.DownloadMarksToFile = function(){
      // downloads marks for the current slide only
      // make the browser download it
      let slide = $D.params.id // portable?
      slide = decodeURIComponent(slide) // fix for url fix
      let query = {}
      query['provenance.image.slide'] = slide
      let data = JSON.parse(window.localStorage.getItem("mark"))
      let text = ""
      if (data) {
        text = JSON.stringify(data.filter(x => {
          let matching = true;
          for (var i in query) {
            matching = matching && Object.byString(x, i) == query[i]
          }
          return matching
        }))
      }
      var element = document.createElement('a');
      var blob = new Blob([text], {type: "application/json"});
      var uri = URL.createObjectURL(blob);
      element.setAttribute('href', uri);
      element.setAttribute('download', "markups.json");
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  }
  Store.prototype.LoadMarksFromFile = function(){
    // loads marks for the current slide only, without replacement
    // open a file selector
    let slide = $D.params.id
    slide = decodeURIComponent(slide)
    var element = document.createElement('input');
    document.body.appendChild(element);
    element.setAttribute('type', "file")
    element.style.display = 'position: fixed; top: -100em';
    element.onchange = function(event) {
      var input = event.target;
      var reader = new FileReader();
      reader.onload = function() {
        var text = reader.result;
        try {
          let data = JSON.parse(text)
          console.log(data)
          data.forEach(x => {
            x.provenance.image.slide = slide
          })
          console.log($VALIDATION.mark)
          let data2 = JSON.parse(window.localStorage.getItem("mark"))
          data2 = data2 || []
          console.log(data2)
          data2 = data2.concat(data)
          data2 = data2.filter($VALIDATION.mark)
          console.log(data2)
          window.localStorage.setItem("mark", JSON.stringify(data2))
          if ($VALIDATION.mark.errors){
            console.error($VALIDATION.mark.errors)
          } else {
            window.location.reload()
          }

        } catch (e) {
          console.error(e)
        }
        console.log(text.substring(0, 200));
      };
      reader.readAsText(input.files[0]);
    };

    element.click();
    document.body.removeChild(element);
  }
  Store.prototype.updateHeatmapFields = function(slide, name, fields, setting){
    var query = {}
    if(name){
      query['provenance.analysis.execution_id']= name
    }
    console.log(setting, fields)
    return new Promise(function(res, rej){
      findInIDB('heatmap', query).then(x=>{
        var hm = x[0]
        removeFromIDB('heatmap', hm['_id']).then(y=>{
          hm.data = data
          res(putInIDB('heatmap', hm))
        })
      })
    })
  }

  Store.prototype.addHeatmapEdit = function(json){
    json['_id'] = json['_id'] || {'$oid': Date.now()}
    return new Promise(function(res, rej){
      res(putInIDB('heatmapEdit', json))
    })
  }

  Store.prototype.addLog = function(json){
    console.info("[LOG]", json)
  }

  Store.prototype.updateHeatmapEdit = function(user, slide, name, data){
    var query = {}
    if(name){
      query['provenance.analysis.execution_id']= name
    }
    return new Promise(function(res, rej){
      findInIDB('heatmapEdit', query).then(x=>{
        var hm = x[0]
        removeFromIDB('heatmapEdit', hm['id']).then(y=>{
          hm.data = data
          res(putInIDB('heatmapEdit', hm))
        })
      })
    })
  }

  Store.prototype.deleteHeatmapEdit = function(user,slide,name){
    var query = {}
    query.user = user
    if(name){
      query['provenance.analysis.execution_id']= name
    }
    return new Promise(function(res, rej){
      findInIDB('heatmapEdit', query).then(x=>{
        res(removeFromIDB('heatmapEdit', x[0]['_id']))
      })
    })
  }

  // default template
  let defaultTemplate = {
      "_id": "0",
      "type": "object",
      "id": "annotation-form",
      "name": "AnnotSchema",
      "description": "",
      "links": [],
      "additionalProperties": false,
      "properties": {
          "name": {
              "id": "a0",
              "title": "Identity Name",
              "type": "string",
              "required": true,
              "description": "note name"
              },"notes": {
              "id": "a1",
              "title": "Notes: ",
              "type": "string",
              "format":"textarea",
              "maxLength": 128
          }
      }
  }

  let defaultPens = [
    {
      title: "Lymph",
      value: "Lymph",
      children: [
        {
          title: "Positive",
          value: "Positive",
          children: [
            {
              title: 100,
              value: 100,
              color: "#ff6296",
              checked: true,
              data: {
                color: "#ff6296",
                mode: "grid",
                type: "Lymph-Positive",
                size: 100
              }
            },
            {
              title: "Point",
              value: "Point",
              color: "#ff6296",
              data: { color: "#ff6296", mode: "point", type: "Lymph-Positive" }
            }
          ]
        },
        {
          title: "Negative",
          value: "Negative",
          children: [
            {
              title: 100,
              value: 100,
              color: "#62ffcb",
              data: {
                color: "#62ffcb",
                mode: "grid",
                type: "Lymph-Negative",
                size: 100
              }
            },
            {
              title: "Point",
              value: "Point",
              color: "#62ffcb",
              data: {
                color: "#62ffcb",
                mode: "point",
                type: "Lymph-Negative"
              }
            }
          ]
        }
      ]
    },
    {
      title: "Neutrophil",
      value: "Neutrophil",
      children: [
        {
          title: "Positive",
          value: "Positive",
          color: "#ffcb62",
          data: {
            color: "#ffcb62",
            mode: "grid",
            type: "Neutrophil-Positive",
            size: 50
          }
        },
        {
          title: "Negative",
          value: "Negative",
          color: "#6296ff",
          data: {
            color: "#6296ff",
            mode: "grid",
            type: "Neutrophil-Negative",
            size: 50
          }
        }
      ]
    },
    {
      title: "Necrosis",
      value: "Necrosis",
      children: [
        {
          title: "Positive",
          value: "Positive",
          children: [
            {
              title: 100,
              value: 100,
              color: "#ff00d9",
              data: {
                color: "#ff00d9",
                mode: "grid",
                type: "Necrosis-Positive",
                size: 100
              }
            },
            {
              title: 500,
              value: 500,
              color: "#ff00d9",
              data: {
                color: "#ff00d9",
                mode: "grid",
                type: "Necrosis-Positive",
                size: 500
              }
            }
          ]
        },
        {
          title: "Negative",
          value: "Negative",
          children: [
            {
              title: 100,
              value: 100,
              color: "#00ff26",
              data: {
                color: "#00ff26",
                mode: "grid",
                type: "Necrosis-Negative",
                size: 100
              }
            },
            {
              title: 500,
              value: 500,
              color: "#00ff26",
              data: {
                color: "#00ff26",
                mode: "grid",
                type: "Necrosis-Negative",
                size: 500
              }
            }
          ]
        }
      ]
    },
    {
      title: "Tumor",
      value: "Tumor",
      children: [
        {
          title: "Positive",
          value: "Positive",
          children: [
            {
              title: 100,
              value: 100,
              color: "#790cff",
              data: {
                color: "#790cff",
                mode: "grid",
                type: "Tumor-Positive",
                size: 100
              }
            },
            {
              title: 300,
              value: 300,
              color: "#790cff",
              data: {
                color: "#790cff",
                mode: "grid",
                type: "Tumor-Positive",
                size: 300
              }
            },
            {
              title: 1000,
              value: 1000,
              color: "#790cff",
              data: {
                color: "#790cff",
                mode: "grid",
                type: "Tumor-Positive",
                size: 1000
              }
            },
            {
              title: 2000,
              value: 2000,
              color: "#790cff",
              data: {
                color: "#790cff",
                mode: "grid",
                type: "Tumor-Positive",
                size: 2000
              }
            }
          ]
        },
        {
          title: "Negative",
          value: "Negative",
          children: [
            {
              title: 100,
              value: 100,
              color: "#92ff0c",
              data: {
                color: "#92ff0c",
                mode: "grid",
                type: "Tumor-Negative",
                size: 100
              }
            },
            {
              title: 300,
              value: 300,
              color: "#92ff0c",
              data: {
                color: "#92ff0c",
                mode: "grid",
                type: "Tumor-Negative",
                size: 300
              }
            },
            {
              title: 1000,
              value: 1000,
              color: "#92ff0c",
              data: {
                color: "#92ff0c",
                mode: "grid",
                type: "Tumor-Negative",
                size: 1000
              }
            },
            {
              title: 2000,
              value: 2000,
              color: "#92ff0c",
              data: {
                color: "#92ff0c",
                mode: "grid",
                type: "Tumor-Negative",
                size: 2000
              }
            }
          ]
        }
      ]
    },
    {
      title: "Prostate",
      value: "Prostate",
      children: [
        {
          title: "Benign",
          value: "Benign",
          color: "#8dd3c7",
          checked: true,
          data: { color: "#8dd3c7", mode: "free", type: "Prostate-Benign" }
        },
        {
          title: "Gleason 3",
          value: "Gleason 3",
          color: "#ffffb3",
          data: { color: "#ffffb3", mode: "free", type: "Prostate-Gleason 3" }
        },
        {
          title: "Gleason 4",
          value: "Gleason 4",
          color: "#bebada",
          data: { color: "#bebada", mode: "free", type: "Prostate-Gleason 4" }
        },
        {
          title: "Gleason 5",
          value: "Gleason 5",
          color: "#fb8072",
          data: { color: "#fb8072", mode: "free", type: "Prostate-Gleason 5" }
        },
        {
          title: "Cancer NOS",
          value: "Cancer NOS",
          color: "#80b1d3",
          data: { color: "#80b1d3", mode: "free", type: "Prostate-Cancer NOS" }
        }
      ]
    },
    {
      title: "NSCLC",
      value: "NSCLC",
      children: [
        {
          title: "Benign",
          value: "Benign",
          color: "#fdb462",
          data: { color: "#fdb462", mode: "free", type: "NSCLC-Benign" }
        },
        {
          title: "Squamous CA",
          value: "Squamous CA",
          color: "#b3de69",
          data: { color: "#b3de69", mode: "free", type: "NSCLC-Squamous CA" }
        },
        {
          title: "Adeno CA (all)",
          value: "Adeno CA (all)",
          color: "#fccde5",
          data: { color: "#fccde5", mode: "free", type: "NSCLC-Adeno CA (all)" }
        },
        {
          title: "Acinar",
          value: "Acinar",
          color: "#d9d9d9",
          data: { color: "#d9d9d9", mode: "free", type: "NSCLC-Acinar" }
        },
        {
          title: "Lapidic",
          value: "Lapidic",
          color: "#bc80bd",
          data: { color: "#bc80bd", mode: "free", type: "NSCLC-Lapidic" }
        },
        {
          title: "Solid",
          value: "Solid",
          color: "#ccebc5",
          data: { color: "#ccebc5", mode: "free", type: "NSCLC-Solid" }
        },
        {
          title: "Papillary",
          value: "Papillary",
          color: "#ffed6f",
          data: { color: "#ffed6f", mode: "free", type: "NSCLC-Papillary" }
        },
        {
          title: "Micropapillary",
          value: "Micropapillary",
          color: "#6a3d9a",
          data: { color: "#6a3d9a", mode: "free", type: "NSCLC-Micropapillary" }
        }
      ]
    }
  ];
  // if no pen data, add our default
  let penConfig = JSON.parse(window.localStorage.getItem("penConfig"))
  if (!penConfig){
    penConfig=[];
    penConfig.push({config_name:"preset_label", configuration:defaultPens})
    window.localStorage.setItem("penConfig", JSON.stringify(penConfig))
  }

  Store.prototype.getConfigByName = function(name){
    if (name=="preset_label"){
      return new Promise(function(res, rej){
        res(penConfig)
      })
    } else {
      return new Promise(function(res, rej){
        res([])
      })
    }
  }

  // if no template, add our default
  let template_data = JSON.parse(window.localStorage.getItem("template"))
  if (!template_data){
    template_data=[];
    template_data.push(defaultTemplate)
    window.localStorage.setItem("template", JSON.stringify(template_data))
  }

}
