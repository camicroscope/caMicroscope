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
const __ = { };
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
function hexToRgb(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return `rgb(${[(c>>16)&255, (c>>8)&255, c&255].join(',')})`;
    }
    throw new Error('Bad Hex');
}
function rgbToHex(rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "#" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

/**
 * interpolateColor generates the gradient colors from the color1 and color2
 * @param  {String} color1
 * @param  {String} color2
 * @param  {Number} factor
 * @return {Array}        the gradient color that bases on factor
 */
function interpolateColor(color1, color2, factor) {
   if (arguments.length < 3) { 
        factor = 0.5; 
    }
    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
};

/**
 * interpolateColors to interpolate between two colors completely
 * @param  {String} color1 the color should be in RGB format. e.g. rgb(255,255,255).
 * @param  {String} color2 
 * @param  {Number} steps how much colors in the result
 * @return {Array}        the gradient colors
 */
function interpolateColors(color1, color2, steps) {
    var stepFactor = 1 / (steps - 1),
        interpolatedColorArray = [];

    color1 = color1.match(/\d+/g).map(Number);
    color2 = color2.match(/\d+/g).map(Number);
    
    for(var i = 0; i < steps; i++) {
        const rgbArray = interpolateColor(color1, color2, stepFactor * i);
        interpolatedColorArray.push(`rgb(${rgbArray[0]},${rgbArray[1]},${rgbArray[2]})`);
    }

    return interpolatedColorArray;
}

/**
 * interpolateNums to interpolate between two colors completely
 * @param  {String} color1 the color should be in RGB format. e.g. rgb(255,255,255).
 * @param  {String} color2 
 * @param  {Number} steps how much colors in the result
 * @return {Array}        the gradient colors
 */
function interpolateNums(num1, num2, steps=3){
    const stepFactor = 1 / (steps - 1),
    rs = [];
    
    for(let i = 0; i < steps; i++) {
        rs.push(num1 + stepFactor * i * (num2 - num1));
    }

    return rs;
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
  var image = viewer.world.getItemAt(0);
  this.imgWidth = image.source.dimensions.x;
  this.imgHeight = image.source.dimensions.y;
  for(let i = 0;i < geometries.features.length;i++){
    const feature = geometries.features[i];
    rs.features.push((covertToViewportFeature(imgWidth,imgHeight,feature)))
  }
  return rs;
}

function VieweportFeaturesToImageFeatures(viewer, geometries){
  var image = viewer.world.getItemAt(0);
  this.imgWidth = image.source.dimensions.x;
  this.imgHeight = image.source.dimensions.y;

  geometries.features = geometries.features.map(feature =>{
    feature.geometry.coordinates[0] = feature.geometry.coordinates[0].map(point => {
      //v_point = viewer.viewport.viewportToImageCoordinates(point[0],point[1]);
      return [Math.round(point[0]*imgWidth),Math.round(point[1]*imgHeight)];
    })

    if(feature.bound&&feature.bound.coordinates && feature.bound.coordinates[0]){
      feature.bound.coordinates[0] = feature.bound.coordinates[0].map(point => {
        //v_point = viewer.viewport.viewportToImageCoordinates(point[0],point[1]);
        return [Math.round(point[0]*imgWidth),Math.round(point[1]*imgHeight)];
      })
    }
    return feature;
  });
  return geometries;
}

function VieweportFeaturesToImageFeaturesOLDMODEL(viewer, geometry){
  var image = viewer.world.getItemAt(0);
  this.imgWidth = image.source.dimensions.x;
  this.imgHeight = image.source.dimensions.y;

  geometry.coordinates[0] = geometry.coordinates[0].map(point => {
    return [Math.round(point[0]*imgWidth),Math.round(point[1]*imgHeight)];
  });
  return geometry;
}


function covertToViewportFeature(width, height, og){
  feature = {
    type:'Feature',
    properties:{
      style:{}
    },
    geometry:{
      type:"Polygon",
      coordinates:[[]]
    },
    bound:{
      type:"Polygon",
      coordinates:[[]]
    }
  };
  let points = og.geometry.coordinates[0];
  const path = og.geometry.path;

  for(let i = 0; i < points.length; i++){
    feature.geometry.coordinates[0] = og.geometry.coordinates[0].map(point => {
      //v_point = viewer.viewport.imageToViewportCoordinates(point[0],point[1]);
      return [point[0]/width,point[1]/height];
    });
  }
  points = og.bound;
  for(let i = 0; i < points.length; i++){
    feature.bound.coordinates[0] = og.bound.map(point => {
      //v_point = viewer.viewport.imageToViewportCoordinates(point[0],point[1]);
      return [point[0]/width,point[1]/height];
    });
  }
  extend(feature.properties.style,og.properties.style); 
  return feature;
}
function isFunction(obj){
  return typeof obj === "function" && typeof obj.nodeType !== "number";
}
function covertToLayViewer(item,l){
  const typeName = item.analysis.source;
  const id = item.analysis.execution_id;
  // support 2.0 style annotation data in refactor
  const name = item.analysis.name||item.analysis.execution_id;
  
  const isShow = l&&l.includes(id)?true:false;
  if(!typeIds[typeName]) typeIds[typeName] = randomId();
  return {id:id,name:name,typeId:typeIds[typeName],typeName:typeName,isShow:isShow};
}
function removeElement(array, id){
  const index = array.findIndex(item => item.id == id);
  if (index > -1) {
    array.splice(index, 1);
    return true;
  }
  return false;
}

function redirect(url ,text = '', sec = 5){
  let timer = sec;
  setInterval(function(){
    if(!timer) {
      window.location.href = url;
    }

    if(Loading.instance&&Loading.instance.parentNode){
      Loading.text.textContent = `${text} ${timer}s.`;
    }else{
      Loading.open(document.body,`${text} ${timer}s.`);
    }
    // Hint Message for clients that page is going to redirect to Flex table in 5s
    timer--;

  }, 1000);
}

/**
 * Taken from OpenSeadragon
 * @memberof OpenSeadragon
 * @see {@link http://openseadragon.github.io/}
 * 
 * @class EventHandle
 * @classdesc For use by classes which want to support custom, non-browser events.
 *
 * @memberof OpenSeadragon
 */
function EventHandle() {
//  this.events = {};
};

/** @lends OpenSeadragon.EventSource.prototype */
EventHandle.prototype = {
    events:{},
    /**
     * Add an event handler to be triggered only once (or a given number of times)
     * for a given event.
     * @function
     * @param {String} eventName - Name of event to register.
     * @param {OpenSeadragon.EventHandler} handler - Function to call when event
     * is triggered.
     * @param {Object} [userData=null] - Arbitrary object to be passed unchanged
     * to the handler.
     * @param {Number} [times=1] - The number of times to handle the event
     * before removing it.
     */
    addOnceHandler: function(eventName, handler, userData, times) {
        var self = this;
        times = times || 1;
        var count = 0;
        var onceHandler = function(event) {
            count++;
            if (count === times) {
                self.removeHandler(eventName, onceHandler);
            }
            handler(event);
        };
        this.addHandler(eventName, onceHandler, userData);
    },

    /**
     * Add an event handler for a given event.
     * @function
     * @param {String} eventName - Name of event to register.
     * @param {OpenSeadragon.EventHandler} handler - Function to call when event is triggered.
     * @param {Object} [userData=null] - Arbitrary object to be passed unchanged to the handler.
     */
    addHandler: function ( eventName, handler, userData ) {
        var events = this.events[ eventName ];
        if ( !events ) {
            this.events[ eventName ] = events = [];
        }
        if ( handler && isFunction( handler ) ) {
            events[ events.length ] = { handler: handler, userData: userData || null };
        }
    },

    /**
     * Remove a specific event handler for a given event.
     * @function
     * @param {String} eventName - Name of event for which the handler is to be removed.
     * @param {OpenSeadragon.EventHandler} handler - Function to be removed.
     */
    removeHandler: function ( eventName, handler ) {
        var events = this.events[ eventName ],
            handlers = [],
            i;
        if ( !events ) {
            return;
        }
        if ( $.isArray( events ) ) {
            for ( i = 0; i < events.length; i++ ) {
                if ( events[i].handler !== handler ) {
                    handlers.push( events[ i ] );
                }
            }
            this.events[ eventName ] = handlers;
        }
    },


    /**
     * Remove all event handlers for a given event type. If no type is given all
     * event handlers for every event type are removed.
     * @function
     * @param {String} eventName - Name of event for which all handlers are to be removed.
     */
    removeAllHandlers: function( eventName ) {
        if ( eventName ){
            this.events[ eventName ] = [];
        } else{
            for ( var eventType in this.events ) {
                this.events[ eventType ] = [];
            }
        }
    },

    /**
     * Get a function which iterates the list of all handlers registered for a given event, calling the handler for each.
     * @function
     * @param {String} eventName - Name of event to get handlers for.
     */
    getHandler: function ( eventName ) {
        var events = this.events[ eventName ];
        if ( !events || !events.length ) {
            return null;
        }
        events = events.length === 1 ?
            [ events[ 0 ] ] :
            Array.apply( null, events );
        return function ( source, args ) {
            var i,
                length = events.length;
            for ( i = 0; i < length; i++ ) {
                if ( events[ i ] ) {
                    args.eventSource = source;
                    args.userData = events[ i ].userData;
                    events[ i ].handler( args );
                }
            }
        };
    },
    /**
     * Trigger an event, optionally passing additional information.
     * @function
     * @param {String} eventName - Name of event to register.
     * @param {Object} eventArgs - Event-specific data.
     */
    raiseEvent: function( eventName, eventArgs ) {
        //uncomment if you want to get a log of all events
        //$.console.log( eventName );
        var handler = this.getHandler( eventName );

        if ( handler ) {
            if ( !eventArgs ) {
                eventArgs = {};
            }

            handler( this, eventArgs );
        }
    }
};
