/**
* deterministically converts a string to a color via hash
* @param str - the string to convert
* @returns color - the color associated with it
**/
var stringToColor = function(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colorlist = ['#1b9e77', '#d95f02', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'];
    return colorlist[Math.abs(hash) % colorlist.length];
}

/**
* renders a polygon onto a layer or canvas
* @param context - the canvas context or layer
* @param points - a list of coordinates, each in form [x,y]
**/
function renderPoly(context, points){
  context.moveTo(points[0][0], points[0][1]);
  context.lineTo(points[0][0], points[0][1]);
  context.beginPath();
  console.log(points)
  points.slice(1).forEach(function(coord) {
      let x = coord[0];
      let y = coord[1];
      context.lineTo(x, y);
  });
  context.lineTo(points[0][0], points[0][1]);
  context.closePath();
  context.stroke();
}
/**
* renders a geojson featurecollection
* @pram id - the id of the item to render
* @param data - geojson featurecollection
* @param context -the canvas context or layer
**/
function renderFeatureCollection(id, data, context){
  data.features.forEach((x)=>renderFeature(id, x, context))
}

/**
* renders a geojson featurecollection
* @pram id - the id of the item to render
* @param feature - geojson feature
* @param context -the canvas context or layer
**/
function renderFeature(id, feature, context) {
    context.__clear_queue();
    let color = stringToColor(id);
    context.strokeStyle = color;
    let type = feature.geometry.type;
    console.log(type)
    if (!type || type == "Polygon") {
        let polys = feature.geometry.coordinates;
        polys.forEach((points)=>renderPoly(context, points))
    } else if (type == "MultiPolygon"){
        let polylist = feature.geometry.coordinates;
        polylist.forEach((polys)=>polys.forEach((points)=>renderPoly(context, points)))
    } else{
        console.warn("Don't know how to render '" + type + "'");
    }
}

var Render = {};
Render.renderFeature = renderFeature;
Render.renderFeatureCollection = renderFeatureCollection;
Render.renderPoly = renderPoly;
Render.stringToColor = stringToColor;

try{
  module.exports = Render;
}
catch(e){
  var a
}
