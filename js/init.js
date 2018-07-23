function callback(data,isDisplay){
  console.log(data);
  console.log(isDisplay);
  // ger names
  // add or remove from
  if (isDisplay){
    data.forEach((x)=>camic.layers.visibleLayers.add(x.name))
  } else {
    data.forEach((x)=>camic.layers.visibleLayers.delete(x.name))
  }

}


function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
// TODO include all core tools
var camic = new CaMic("main_viewer",getUrlVars().slide)
camic.loadImg()

// get all layers
async function getLayers(){
  var mts = await camic.store.getMarktypes()
  var hms = await camic.store.getHeatmaps()
  var retData = []
  mts.forEach(async function(mt){
    // create a layer
    let layer = camic.layers.getLayer(mt.name)
    // get marks
    let marks = await camic.store.getMarks(mt.name)
    let ld = {"id": mt.name, "name": mt.name, "typeId":1, "typeName": "Human Annotation"}
    retData.push(ld);
    // put marks on layer
    marks.forEach(mark => {
      renderFeature(mt.name, mark, layer);
    })
    // add to layersData

  })
  hms.forEach(function(hm){
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
  return retData;
}
var layersData, layerData, layer_manager
camic.viewer.addHandler('open', ()=>{
  getLayers().then(x=>{
    layersData=x;
    console.log(layersData);
    layer_manager = new LayersViewer({id:'overlayers',data:layersData,callback:callback });
    console.log(layer_manager);
  }).catch(console.log)
})
