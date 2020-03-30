// polyfill for Array.flat()
if (!Array.prototype.flat) {
  Array.prototype.flat = function() {
    var depth = arguments[0];
    depth = depth === undefined ? 1 : Math.floor(depth);
    if (depth < 1) return Array.prototype.slice.call(this);
    return (function flat(arr, depth) {
      var len = arr.length >>> 0;
      var flattened = [];
      var i = 0;
      while (i < len) {
        if (i in arr) {
          var el = arr[i];
          if (Array.isArray(el) && depth > 0)
            flattened = flattened.concat(flat(el, depth - 1));
          else flattened.push(el);
        }
        i++;
      }
      return flattened;
    })(this, depth);
  };
}

const AnalyticsPanelContent = //'test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>test<br>'
  "<div class='separator'></div>" +
  "<div ><input class='search' type='search'/><button class='search'><i class='material-icons md-24'>find_in_page</i></button></div>" +
  "<div class='table_wrap'>" +
  "<table class='data_table'>" +
  "<tr><th>Job ID</th><th>Type</th><th>Status</th></tr>" +
  "<tr><td>11-08-00001</td><td>Algo-x1-x2-y1</td><td>Done</td></tr>" +
  "<tr><td>11-08-00002</td><td>Algo-x5-x3-y1</td><td>Done</td></tr>" +
  "<tr><td>11-08-00003</td><td>Algo-x2-x1-y1</td><td>Done</td></tr>" +
  "<tr><td>11-08-00004</td><td>Algo-x1-x1-y1</td><td>Done</td></tr>" +
  "<tr><td>11-08-00005</td><td>Algo-x6-x2-y1</td><td>Done</td></tr>" +
  "<tr><td>11-08-00006</td><td>Algo-x1-x1-y1</td><td>Done</td></tr>" +
  "<tr><td>11-08-00007</td><td>Algo-61-x2-y1</td><td>Done</td></tr>" +
  "<tr><td>11-08-00001</td><td>Algo-x1-x2-y1</td><td>Done</td></tr>" +
  "<tr><td>11-08-00002</td><td>Algo-x5-x3-y1</td><td>Done</td></tr>" +
  "<tr><td>11-08-00003</td><td>Algo-x2-x1-y1</td><td>Done</td></tr>" +
  "<tr><td>11-08-00004</td><td>Algo-x1-x1-y1</td><td>Done</td></tr>" +
  "</table>" +
  "</div>";
const __ = {};
function loadScript(src, callback) {
  var script = document.createElement("script");
  script.src = src;
  script.type = "text/javascript";
  script.async = true;
  if (callback != null) {
    if (script.readyState) {
      // IE, incl. IE9
      script.onreadystatechange = function() {
        if (script.readyState == "loaded" || script.readyState == "complete") {
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {
      script.onload = function() {
        // Other browsers
        callback();
      };
    }
  }
  a = document.getElementsByTagName("script")[0];
  a.parentNode.insertBefore(script, a);
}
// the robust solution that mimics jQuery's functionality
function extend() {
  for (var i = 1; i < arguments.length; i++)
    for (var key in arguments[i])
      if (arguments[i].hasOwnProperty(key))
        arguments[0][key] = arguments[i][key];
  return arguments[0];
}

/**
    remove /empty a DOM element
*/
function empty(elt) {
  while (elt.firstChild) elt.removeChild(elt.firstChild);
}

/*
    ID generator
*/
function randomId() {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return `_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
}

function Debounce(func, wait = 16, immediate = true) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function hexToRgbA(hex, opacity = 1) {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return (
      "rgba(" +
      [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") +
      `,${opacity})`
    );
  }
  throw new Error("Bad Hex");
}

function getDistance(p1, p2, mppx, mppy) {
  // two points are same
  if (p1[0] == p2[0] && p1[1] == p2[1]) return 0;
  else if (p1[0] == p2[0]) {
    // vertical line
    return Math.abs(p1[1] - p2[1]) * mppy;
  } else if (p1[1] == p2[1]) {
    // horizontal line
    return Math.abs(p1[0] - p2[0]) * mppx;
  } else {
    const lx = Math.abs(p1[0] - p2[0]) * mppx;
    const ly = Math.abs(p1[1] - p2[1]) * mppy;
    return Math.sqrt(lx * lx + ly * ly);
  }
}

/**
 * calcuate the circumference of a polygon
 * @param  {Array} points describe a self-closed simple polygon (start and end points are same).
 * @param  {Number} mmpx micron per pixel in x-axis
 * @param  {Number} mmpy micron per pixel in y-axis
 * @return {Number}  circumference
 */
function getCircumference(points, mmpx, mmpy) {
  let length = 0;
  for (let i = 0; i < points.length - 1; i++) {
    length += getDistance(points[i], points[i + 1], mmpx, mmpy);
  }
  return length;
}

/**
 * polygon Area
 * @param  {Array} points describe a self-closed simple polygon (start and end points are same). [using Shoelace Formula]
 * @return the area of polygon
 */
function polygonArea(points) {
  let area = 0;
  let j = points.length - 2;
  for (let i = 0; i < points.length - 1; i++) {
    area += (points[j][0] + points[i][0]) * (points[j][1] - points[i][1]);
    // j is previous vertex to i
    j = i;
  }
  return Math.abs(area / 2);
}

function titleCase(str) {
  var splitStr = str.toLowerCase().split(" ");
  for (var i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(" ");
}
/**
 * isTwoLinesIntersect
 * @param  {Array}  l1 - [[a,b],[c,d]] start[x,y] and end[x,y] points
 * @param  {[type]}  l2 [[p,q],[r,s]]
 * @return {Boolean}
 */
// a = l1[0][0];
// b = l1[0][1];
// c = l1[1][0];
// d = l1[1][1];

// p = l2[0][0];
// q = l2[0][1];
// r = l2[1][0];
// s = l2[1][1];
function isTwoLinesIntersect(l1, l2) {
  var det, gamma, lambda;
  det =
    (l1[1][0] - l1[0][0]) * (l2[1][1] - l2[0][1]) -
    (l2[1][0] - l2[0][0]) * (l1[1][1] - l1[0][1]);
  if (det === 0) {
    return false;
  } else {
    lambda =
      ((l2[1][1] - l2[0][1]) * (l2[1][0] - l1[0][0]) +
        (l2[0][0] - l2[1][0]) * (l2[1][1] - l1[0][1])) /
      det;
    gamma =
      ((l1[0][1] - l1[1][1]) * (l2[1][0] - l1[0][0]) +
        (l1[1][0] - l1[0][0]) * (l2[1][1] - l1[0][1])) /
      det;
    return 0 < lambda && lambda < 1 && (0 < gamma && gamma < 1);
  }
}
/**
 * isSelfIntersect
 * @param  {Array} points describe a self-closed simple polygon (start and end points are same).
 * @return {Boolean} is self-intersecting?
 */
function isSelfIntersect(points) {
  for (let i = 0; i < points.length - 2; i++) {
    for (let j = i + 1; j < points.length - 1; j++) {
      if (
        isTwoLinesIntersect(
          [points[i], points[i + 1]],
          [points[j], points[j + 1]]
        )
      )
        return true;
    }
  }
  return false;
}

function hexToRgb(hex) {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return `rgb(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",")})`;
  }
  throw new Error("Bad Hex");
}
function rgbToHex(rgb) {
  rgb = rgb.match(
    /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i
  );
  return rgb && rgb.length === 4
    ? "#" +
        ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2)
    : "";
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
}

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

  for (var i = 0; i < steps; i++) {
    const rgbArray = interpolateColor(color1, color2, stepFactor * i);
    interpolatedColorArray.push(
      `rgb(${rgbArray[0]},${rgbArray[1]},${rgbArray[2]})`
    );
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
function interpolateNums(num1, num2, steps = 3) {
  const stepFactor = 1 / (steps - 1),
    rs = [];

  for (let i = 0; i < steps; i++) {
    rs.push(num1 + stepFactor * i * (num2 - num1));
  }

  return rs;
}

function clickInsideElement(e, className) {
  var el = e.srcElement || e.target || e.eventSource.canvas;

  if (el.classList.contains(className)) {
    return el;
  } else {
    while ((el = el.parentNode)) {
      if (el.classList && el.classList.contains(className)) {
        return el;
      }
    }
  }

  return false;
}

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
    m,
    key,
    value
  ) {
    vars[key] = value;
  });
  return vars;
}

function ImageFeaturesToVieweportFeatures(viewer, geometries) {
  const rs = {
    type: "FeatureCollection",
    features: []
  };
  var image = viewer.world.getItemAt(0);
  this.imgWidth = image.source.dimensions.x;
  this.imgHeight = image.source.dimensions.y;
  for (let i = 0; i < geometries.features.length; i++) {
    const feature = geometries.features[i];
    rs.features.push(covertToViewportFeature(imgWidth, imgHeight, feature));
  }
  return rs;
}

function VieweportFeaturesToImageFeatures(viewer, geometries) {
  var image = viewer.world.getItemAt(0);
  this.imgWidth = image.source.dimensions.x;
  this.imgHeight = image.source.dimensions.y;

  geometries.features = geometries.features.map(feature => {
    if(feature.geometry.type=="Point"){
      feature.geometry.coordinates = [
          Math.round(feature.geometry.coordinates[0] * imgWidth),
          Math.round(feature.geometry.coordinates[1] * imgHeight)];
      feature.bound.coordinates =[
        Math.round(feature.bound.coordinates[0] * imgWidth),
        Math.round(feature.bound.coordinates[1] * imgHeight)];
      return feature;
    }
    feature.geometry.coordinates[0] = feature.geometry.coordinates[0].map(
      point => {
        //v_point = viewer.viewport.viewportToImageCoordinates(point[0],point[1]);
        return [
          Math.round(point[0] * imgWidth),
          Math.round(point[1] * imgHeight)
        ];
      }
    );

    if (
      feature.bound &&
      feature.bound.coordinates &&
      feature.bound.coordinates[0]
    ) {
      feature.bound.coordinates[0] = feature.bound.coordinates[0].map(point => {
        //v_point = viewer.viewport.viewportToImageCoordinates(point[0],point[1]);
        return [
          Math.round(point[0] * imgWidth),
          Math.round(point[1] * imgHeight)
        ];
      });
    }
    return feature;
  });
  return geometries;
}

function VieweportFeaturesToImageFeaturesOLDMODEL(viewer, geometry) {
  var image = viewer.world.getItemAt(0);
  this.imgWidth = image.source.dimensions.x;
  this.imgHeight = image.source.dimensions.y;

  geometry.coordinates[0] = geometry.coordinates[0].map(point => {
    return [Math.round(point[0] * imgWidth), Math.round(point[1] * imgHeight)];
  });
  return geometry;
}

function covertToViewportFeature(width, height, og) {
  og.geometry.type
  feature = {
    type: "Feature",
    properties: {
      style: {},
      area: null,
      circumference: null
    },
    geometry: {
      type: og.geometry.type,
      coordinates: [[]]
    },
    bound: {
      type: og.geometry.type,
      coordinates: [[]]
    }
  };
  if(og.geometry.type=='Point'){
    let point = og.geometry.coordinates;
    feature.geometry.coordinates = [point[0] / width, point[1] / height];
    feature.bound.coordinates = [point[0] / width, point[1] / height];
    extend(feature.properties.style, og.properties.style);
    return feature;
  }
  let points = og.geometry.coordinates[0];
  const path = og.geometry.path;

  for (let i = 0; i < points.length; i++) {
    feature.geometry.coordinates[0] = og.geometry.coordinates[0].map(point => {
      //v_point = viewer.viewport.imageToViewportCoordinates(point[0],point[1]);
      return [point[0] / width, point[1] / height];
    });
  }
  points = og.bound;
  for (let i = 0; i < points.length; i++) {
    feature.bound.coordinates[0] = og.bound.map(point => {
      //v_point = viewer.viewport.imageToViewportCoordinates(point[0],point[1]);
      return [point[0] / width, point[1] / height];
    });
  }
  extend(feature.properties.style, og.properties.style);
  // add area
  feature.properties.area = og.properties.area;
  feature.properties.circumference = og.properties.circumference;
  if (og.properties.nommp) feature.properties.nommp = og.properties.nommp;
  if (og.properties.isIntersect)
    feature.properties.isIntersect = og.properties.isIntersect;
  return feature;
}

function isFunction(obj) {
  return typeof obj === "function" && typeof obj.nodeType !== "number";
}

function covertToLayViewer(item) {
  const typeName = item.source;
  const id = item.execution_id;
  // support 2.0 style annotation data in refactor
  const name = item.name || item.execution_id;

  //const isShow = l&&l.includes(id)?true:false;
  if (!typeIds[typeName]) typeIds[typeName] = randomId();
  // for segmentation
  if (item.source == "computer" && item.computation == "segmentation") {
    return {
      id: id,
      name: item.execution_id,
      typeId: typeIds[typeName],
      typeName: item.computation,
      data: null
    };
  }
  return {
    id: id,
    name: name,
    typeId: typeIds[typeName],
    typeName: typeName,
    data: null
  };
}

function eventFire(el, etype) {
  if (el.fireEvent) {
    el.fireEvent("on" + etype);
  } else {
    var evObj = document.createEvent("Events");
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}
function removeElement(array, id) {
  const index = array.findIndex(item => item.id == id);
  if (index > -1) {
    array.splice(index, 1);
    return true;
  }
  return false;
}

function redirect(url, text = '', sec = 5) {
  let timer = sec;
  if (!timer) {
    window.location.href = url;
  }
  setInterval(function() {
    if (Loading.instance && Loading.instance.parentNode) {
      Loading.text.textContent = `${text} ${timer}s.`;
    } else {
      Loading.open(document.body, `${text} ${timer}s.`);
    }
    // Hint Message for clients that page is going to redirect to Flex table in 5s
    timer--;
  }, 1000);
}
function getGrids(points, size) {
  const gridObject = {};
  points.forEach(p => {
    const np = getTopLeft(p, size);
    gridObject[`${np[0]}|${np[1]}`] = np;
  });
  const grids = [];
  for (let key in gridObject) {
    grids.push(gridObject[key]);
  }
  return grids;
}

function getTopLeft(point, size) {
  return [
    Math.floor(point[0] / size[0]) * size[0],
    Math.floor(point[1] / size[1]) * size[1]
  ];
}

function parseJwt(token) {
  if (!token) {
    return { name: "None" };
  } else {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  }
}
/**
 * detect IE/Edge
 *
 * @return {Boolean} true if the browser is IE/Edge
 */
function detectIE() {
  var ua = window.navigator.userAgent;
  // Test values; Uncomment to check result …

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

  // Edge 12 (Spartan)
  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

  // Edge 13
  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

  var msie = ua.indexOf("MSIE ");
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
  }

  var trident = ua.indexOf("Trident/");
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf("rv:");
    return parseInt(ua.substring(rv + 3, ua.indexOf(".", rv)), 10);
  }

  var edge = ua.indexOf("Edge/");
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf(".", edge)), 10);
  }

  // other browser
  return false;
}

function createWarningText(text) {
  const temp = `
 <div style='box-sizing:border-box;z-index:999;width:100%;position:absolute;bottom:0;color:#856404;background-color:#fff3cd;border-color:#ffeeba;padding:5px;display:flex;'>
 <div style='font-size:14px;flex:1;text-align:center;vertical-align:middle;align-items:center;display:flex;'><div style='margin:0 auto;'>${text}</div></div>
 <div class='material-icons' style='width:24px;height:24px;' onclick='document.body.removeChild(this.parentNode);'>close</div>
 </div>
 `;
  document.body.innerHTML += temp;
}

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2)
    return parts
      .pop()
      .split(";")
      .shift();
}

function getMinFootprint(imagingHelper, min = 7) {
  const max = new OpenSeadragon.Point(
    imagingHelper.physicalToDataX(min - 1),
    imagingHelper.physicalToDataY(min - 1)
  );
  const origin = new OpenSeadragon.Point(
    imagingHelper.physicalToDataX(0),
    imagingHelper.physicalToDataY(0)
  );
  const area = Math.floor((max.x - origin.x) * (max.y - origin.y));
  return area;
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
}

/** @lends OpenSeadragon.EventSource.prototype */
EventHandle.prototype = {
  events: {},
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
  addHandler: function(eventName, handler, userData) {
    var events = this.events[eventName];
    if (!events) {
      this.events[eventName] = events = [];
    }
    if (handler && isFunction(handler)) {
      events[events.length] = { handler: handler, userData: userData || null };
    }
  },

  /**
   * Remove a specific event handler for a given event.
   * @function
   * @param {String} eventName - Name of event for which the handler is to be removed.
   * @param {OpenSeadragon.EventHandler} handler - Function to be removed.
   */
  removeHandler: function(eventName, handler) {
    var events = this.events[eventName],
      handlers = [],
      i;
    if (!events) {
      return;
    }
    if ($.isArray(events)) {
      for (i = 0; i < events.length; i++) {
        if (events[i].handler !== handler) {
          handlers.push(events[i]);
        }
      }
      this.events[eventName] = handlers;
    }
  },

  /**
   * Remove all event handlers for a given event type. If no type is given all
   * event handlers for every event type are removed.
   * @function
   * @param {String} eventName - Name of event for which all handlers are to be removed.
   */
  removeAllHandlers: function(eventName) {
    if (eventName) {
      this.events[eventName] = [];
    } else {
      for (var eventType in this.events) {
        this.events[eventType] = [];
      }
    }
  },

  /**
   * Get a function which iterates the list of all handlers registered for a given event, calling the handler for each.
   * @function
   * @param {String} eventName - Name of event to get handlers for.
   */
  getHandler: function(eventName) {
    var events = this.events[eventName];
    if (!events || !events.length) {
      return null;
    }
    events = events.length === 1 ? [events[0]] : Array.apply(null, events);
    return function(source, args) {
      var i,
        length = events.length;
      for (i = 0; i < length; i++) {
        if (events[i]) {
          args.eventSource = source;
          args.userData = events[i].userData;
          events[i].handler(args);
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
  raiseEvent: function(eventName, eventArgs) {
    //uncomment if you want to get a log of all events
    //$.console.log( eventName );
    var handler = this.getHandler(eventName);

    if (handler) {
      if (!eventArgs) {
        eventArgs = {};
      }

      handler(this, eventArgs);
    }
  }
};

function getUserId() {
  let token_info = parseJwt(getCookie("token"));
  let uid = "";
  // pathdb with login
  if (
    token_info &&
    token_info.hasOwnProperty("drupal") &&
    token_info.drupal.hasOwnProperty("uid")
  ) {
    uid = token_info.drupal.uid;
  }
  // non-pathdb w login
  else if (token_info.sub) {
    uid = token_info.sub;
  }
  // no login, random id
  else {
    let rid = getCookie("randomId");
    // random id
    if (rid) {
      uid = rid;
    } else {
      uid = randomId();
      document.cookie = "randomId=" + uid + ";";
    }
  }
  return uid;
}

function getBounds(points) {
  let max, min;
  points.forEach(point => {
    if (!min && !max) {
      min = [point[0], point[1]];
      max = [point[0], point[1]];
    } else {
      min[0] = Math.min(point[0], min[0]);
      max[0] = Math.max(point[0], max[0]);
      min[1] = Math.min(point[1], min[1]);
      max[1] = Math.max(point[1], max[1]);
    }
  });
  return [
    [min[0], min[1]], // top-left
    [max[0], min[1]], //top-right
    [max[0], max[1]], // bottom-right
    [min[0], max[1]],
    [min[0], min[1]]
  ];
}

class Tracker {
  constructor(camic, slide, userId, period = 1) {
    this.__camic = camic;
    this.__viewer = camic.viewer;
    this.__period = period;
    this.__userId = userId;
    this.__slide = slide;

  }
  start() {
    if (!this.__time) {
      this.__time = setInterval(this.record.bind(this), this.__period * 1000);
    }
  }
  stop() {
    if (this.__time) clearInterval(this.__time);
  }

  record() {
    const viewer = this.__viewer;
    const center = viewer.viewport.getCenter();
    const { x, y } = viewer.viewport.viewportToImageCoordinates(
      center.x,
      center.y
    );
    const image_zoom = viewer.viewport.viewportToImageZoom(
      viewer.viewport.getZoom(true)
    );

    this.__camic.store.addLog({
      slide:this.__slide,
      user:this.__userId,
      x:Math.round(x),
      y:Math.round(y),
      z:image_zoom,
      time:new Date()
    });
  }
}
