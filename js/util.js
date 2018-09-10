const AnalyticsPanelContent = //'test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>'

         "<div class='separator'></div>"   
+          "<div ><input class='search' type='search'/><button class='search'><i class='material-icons md-24'>find_in_page</i></button></div>"      
+         "<div class='table_wrap'>"
+         "<table class='data_table'>"
+           "<tr><th>Job ID</th><th>Type</th><th>Status</th></tr>"
+           "<tr><td>11-08-00001</td><td>Algo-x1-x2-y1</td><td>Done</td></tr>"
+           "<tr><td>11-08-00002</td><td>Algo-x5-x3-y1</td><td>Done</td></tr>"
+           "<tr><td>11-08-00003</td><td>Algo-x2-x1-y1</td><td>Done</td></tr>"
+           "<tr><td>11-08-00004</td><td>Algo-x1-x1-y1</td><td>Done</td></tr>"
+           "<tr><td>11-08-00005</td><td>Algo-x6-x2-y1</td><td>Done</td></tr>"
+           "<tr><td>11-08-00006</td><td>Algo-x1-x1-y1</td><td>Done</td></tr>"
+           "<tr><td>11-08-00007</td><td>Algo-61-x2-y1</td><td>Done</td></tr>"
+           "<tr><td>11-08-00001</td><td>Algo-x1-x2-y1</td><td>Done</td></tr>"
+           "<tr><td>11-08-00002</td><td>Algo-x5-x3-y1</td><td>Done</td></tr>"
+           "<tr><td>11-08-00003</td><td>Algo-x2-x1-y1</td><td>Done</td></tr>"
+           "<tr><td>11-08-00004</td><td>Algo-x1-x1-y1</td><td>Done</td></tr>"
+         "</table>"
+         "</div>"
;


// the robust solution that mimics jQuery's functionality
function extend(){
    for(var i=1; i<arguments.length; i++)
        for(var key in arguments[i])
            if(arguments[i].hasOwnProperty(key))
                arguments[0][key] = arguments[i][key];
    return arguments[0];
}

/**
	remove /empty a DOM element
*/
function empty(elt){
	while(elt.firstChild) elt.removeChild(elt.firstChild)
}

/*
	ID generator
*/
function randomId(){
	// Math.random should be unique because of its seeding algorithm.
	// Convert it to base 36 (numbers + letters), and grab the first 9 characters
	// after the decimal.
	return `_${Math.random().toString(36).substr(2, 9)}`
}

function Debounce(func, wait = 16, immediate = true) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
		timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function hexToRgbA(hex, opacity = 1){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+`,${opacity})`;
    }
    throw new Error('Bad Hex');
}

function clickInsideElement( e, className ) {
  var el = e.srcElement || e.target || e.eventSource.canvas;

  if ( el.classList.contains(className) ) {
    return el;
  } else {
    while ( el = el.parentNode ) {
      if ( el.classList && el.classList.contains(className) ) {
        return el;
      }
    }
  }

  return false;
}

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
    vars[key] = value;
  });
  return vars;
}

function ImageFeaturesToVieweportFeatures(viewer, geometries){
  const rs = {
    type:'FeatureCollection',
    features:[]
  }
  for(let i = 0;i < geometries.features.length;i++){
    const feature = geometries.features[i];
    rs.features.push((covertToViewportFeature(viewer,feature)))
  }
  return rs;
}

function VieweportFeaturesToImageFeatures(viewer, geometries){
  geometries.features = geometries.features.map(feature =>{
    feature.geometry.coordinates[0] = feature.geometry.coordinates[0].map(point => {
      v_point = viewer.viewport.viewportToImageCoordinates(point[0],point[1]);
      return [v_point.x,v_point.y];
    })
    return feature;
  });
  return geometries;
}

function covertToViewportFeature(viewer, og){
  feature = {
    type:'Feature',
    properties:{
      style:{}
    },
    geometry:{
      type:"Polygon",
      coordinates:[[]]
    }
  
  };
  const points = og.geometry.coordinates[0];
  const path = og.geometry.path;
  for(let i = 0; i < points.length; i++){
    feature.geometry.coordinates[0] = og.geometry.coordinates[0].map(point => {
      v_point = viewer.viewport.imageToViewportCoordinates(point[0],point[1]);
      return [v_point.x,v_point.y];
    });
  }
  extend(feature.properties.style,og.properties.style); 
  return feature;
}

function covertToLayViewer(item,l){
  const typeName = item.provenance.analysis.source;
  const id = item.provenance.analysis.execution_id;
  const name = item.properties.annotations.name;
  const isShow = l&&l.includes(id)?true:false;
  if(!typeIds[typeName]) typeIds[typeName] = randomId();
  return {id:id,name:name,typeId:typeIds[typeName],typeName:typeName,isShow:isShow};
}

