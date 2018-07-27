function callback(data,isDisplay){
  console.log('init.callBack')
  console.log(data);
  console.log(isDisplay);
  // ger names
  // add or remove from
  if (isDisplay){
    data.forEach((x)=>camic.layers.visibleLayers.add(x.name))
  } else {
    data.forEach((x)=>camic.layers.visibleLayers.delete(x.name))
  }
  camic.viewer.forceRedraw();
}


function getUrlVars() {
    console.log('init.getUrlVars')
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
// TODO include all core tools
var camic = new CaMic("main_viewer",getUrlVars().slide)
camic.loadImg()
 console.log('init.loadImg')
// get all layers
let isLoadMts = false;

async function getLayers(){

  var mts = await camic.store.getMarktypes()
  var hms = await camic.store.getHeatmaps()
  var retData = []
  mts.forEach(async function(mt){
    console.table(mt);
    // create a layer
    let layer = camic.layers.getLayer(mt.name)
    console.log(layer)
    // get marks
    let marks = await camic.store.getMarks(mt.name)
    console.log(marks);
    let ld = {"id": mt.name, "name": mt.name, "typeId":1, "typeName": "Human Annotation"}
    retData.push(ld);
    // put marks on layer
    marks.forEach(mark => {
      renderFeature(mt.name, mark, layer);
    })
    // add to layersData
    console.log('init.getLayers mts');
    isLoadMts = true;

  })
  hms.forEach(function(hm){
    console.table(hm);
    // create layer
    let layer = camic.layers.getLayer(hm.name)
    console.log(hm.name)
    // render the heatmap
    let dl = camic.layers.delayers[hm.name]
    console.log(dl);
    var size = viewer.world.getItemAt(0).getContentSize();
    let heat = simpleheat(dl, hm.height, hm.width, size.x, size.y)
    heat.data(hm.values).radius(10).max(500000).draw()
    let ld = {id: hm.name, name: hm.name, typeId:2, typeName: "Heatmap"}
    retData.push(ld)

  }.bind(this))
  // ensure all disabled
  camic.layers.visibleLayers = new Set([]);
  console.table(retData);
  return retData;
}
camic.viewer.addHandler('open', ()=>{


  console.log('camic open');
  getLayers().then(x=>{
    

  function isDataLoaded(){
    console.log('getLayers.....'+ isLoadMts);
    if(isLoadMts) {
      clearInterval(checkData);
      layersData=x;
      layer_manager = new LayersViewer({id:'overlayers',data:layersData,callback:callback });

    }
  }

  let checkData = setInterval(isDataLoaded, 3);
  }).catch(console.log)
})
