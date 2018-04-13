// need:
// ViewportCalibratedCanvas
// proxytools
// coordinateView (well, not really, but it'd be silly not to have)
// SideSplit

///////
// utils
function objToParamStr(obj) {
    var parts = [];
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          if (Array.isArray(obj[i])){
            // arrays are a list of strings with escaped quotes, surrounded by []
            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent("[" + obj[i].map((x)=>'\"' + x + '\"').toString() + "]"));
          } else {
            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
          }
        }
    }
    return parts.join("&");
}

function apiCall(callback, url, params){
  fetch(url + "?" + objToParamStr(params), {
    credentials: "same-origin"
  })
  .then((x)=> x.json())
  .then(function(response){
    callback(response);
  })
  .catch((x)=>console.warn(x));
}

class annotStore{
  /**
  * Annotation API Interactions
  * @param {string} id - the image id
  * @param {object} [options] - optional substitution for api urls
  */
  constructor(id, options){
    // image id
    this.id = id;
    // TODO cache??
    this.algDataUrl = options.algUrl || "api/Data/getMultipleAnnots.php";
    this.algListUrl = options.algListUrl || "api/Data/getAlgorithmsForImage.php";
  }

 /**
 * Get a list of avaliable algorithms for the image
 * @param {function} callback - callback for the result data
 */
 getAlgList(callback){
   var params = {"iid" : this.id}
   apiCall(callback, url, params);
 }

 /**
 * Get a list of avaliable algorithms for the image
 * @param {function} callback - callback for the result data
 */
 getAlgData(x1, y1, x2, y2, footprint, algs, callback){
   // sanitization/validation
   x1 = x1 < 0 ? 0 : x1;
   y1 = y1 < 0 ? 0 : y1;
   x2 = x2 < 0 ? 0 : x2;
   y2 = y2 < 0 ? 0 : y2;
   // set params object
   var params = {"iid": this.id, "x": x1, "x1": x2, "y" :y1, "y1": y2, "footprint": footprint, "algoritms": algs};
   apiCall(callback, url, params);
 }
}
// see https://github.com/birm/OSDragonDemos/blob/master/coordinated_draw_annotool.html
function drawFromList(data, context){
  data.forEach(function(annotation){
    let id = annotation.provenance.analysis.execution_id;
    let color = "red";
    let type = annotation.geometry.type;
    let coords = annotation.geometry.coordinates[0];
    if (type == "Polygon"){
      // start
      context.beginPath();
      let first = coords.splice(1,1);
      context.moveTo(first[0], first[1])
      coords.forEach(function(coord){
        let x = coord[0];
        let y = coord[1];
        context.lineTo(x,y);
        console.log(x + ", " + y)
      });
      context.stroke();
      // stop
    } else {
      console.warn("Don't know how to draw '" + type + "'");
    }
  })
}
// TODO something to tell the viewer to redraw on move/zoom/open

class annotations{
  constructor(id, viewer, context, imagingHelper, options){
    this.id = id;
    this.store = new annotStore(id, options);
    this.viewer = viewer;
    this.options = options;
    this.selection = [];
    this.context = context;
    // TODO imagingHelper needed?
  }

  // draw using current viewer state
  draw(){
    this.x1 = this.imagingHelper._viewportOrigin['x'];
    this.y1 = this.imagingHelper._viewportOrigin['y'];
    this.x2 = this.x1 + this.imagingHelper._viewportWidth;
    this.y2 = this.y1 + this.imagingHelper._viewportHeight;

    var max = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(9), this.imagingHelper.physicalToDataY(9));
    var origin = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(0), this.imagingHelper.physicalToDataY(0));
    var footprint = (max.x - origin.x) * (max.y - origin.y);

    this.store.getAlgData(x, y, x1, y1, footprint, this.selection, function(data){
      drawFromList(data, this.context);
    });
  }

  select(alg){
    if(this.selection.indexOf(alg) == -1 ){
      this.selection.push(alg);
    }
  }

  deselect(alg){
    let pos = this.selection.indexOf(alg)
    if(pos > -1 ){
      this.selection.splice(pos, 1);
    }
  }

}
