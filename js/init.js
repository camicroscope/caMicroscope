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
  var layersData = []
  mts.forEach(async function(mt){
    // create a layer
    let layer = camic.layers.getLayer(mt.name)
    // get marks
    let marks = await camic.store.getMarks(mt.name)
    // put marks on layer
    marks.forEach((mark => renderFeature(mt.name, marks, layer))
    // add to layersData
    let layerdata = {id: mt.name, name: mt.name, typeId:1, typeName: "Human Annotation"}
    layersData.push(layerData)
  })
  hms.forEach(function(hm){
    // create layer
    let layer = camic.layers.getLayer(hm.name)
    // render the heatmap
    simpleheat(camic.layers.delayers['hm.name'], hm.height, hm.width, 13000, 13000)
    let layerdata = {id: hm.name, name: hm.name, typeId:2, typeName: "Heatmap"}
    layersData.push(layerData)
  })
  // ensure all disabled
  camic.layers.visibleLayers = new Set([]);
  // put together to layerdata
  return layersData;
}

var layersData = getLayers()
