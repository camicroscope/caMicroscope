/*
var convertGeo = function(points){
    var p = points.split(' ');
    var geocoords = []
    for(var i=0; i< p.length; i++){
        var pt = p[i].split(',');
        var ptx = +pt[0];
        var pty = +pt[1];
        geocoords.push([ptx,pty])
    }
    var geojson = {}
    geojson.geometry = {};
    geojson.geometry.coordinates = [geocoords];
    //console.log(geojson);
    return geojson;
}


console.log("geeeojssssononnnn");
annotools.prototype.convertAnnotationsToGeoJSON = function() {
    geoJSONs = [];
    var annotations = this.annotations;
    //console.log("Geeo");
    
    for(var i in annotations) {
        
        var annotation = annotations[i];
        //console.log(annotation);

        var points = annotation.points;
        if(points) { //is a polygon
            //console.log(points);
            geo = convertGeo(points);
            geoJSONs.push(geo);        
        
        }
    }
    //console.log(geoJSONs);
    return geoJSONs;
    console.log(geoJSONs);
}
*/

function endProfile(startTime){
    var t2 = performance.now();
    //console.log(startTime);
    //console.log(t2)
    //console.log("Total time: "+ (t2-startTime));
}


annotools.prototype.generateCanvas = function(annotations) {
    //console.log(annotation);
    //var annotation = annotations[ii];
    var annotations = this.annotations;
    if (annotations){
    var markup_svg = document.getElementById("markups");
    if (markup_svg) {
        //console.log("destroying");
        markup_svg.destroy()
    }
    //console.log(annotations.length);
    //console.log(this.canvas);
    var container = document.getElementsByClassName(this.canvas)[0].childNodes[0]; //Get The Canvas Container
    //console.log(container);
    var context = container.getContext('2d');
    context.fillStyle = "#f00";
        //console.log(nativepoints);
    //var container = document.getElementsByClassName(this.cavas)[0];
    //console.log(container);
    var width = parseInt(container.offsetWidth);
    var height = parseInt(container.offsetHeight);
    /* Why is there an ellipse in the center? */
    /*
    var svgHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + 'px" height="' + height + 'px" version="1.1" id="markups">';
        svgHtml += '<g id="groupcenter"/>';
        svgHtml += '<g id="origin">';
        var origin = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5));
        svgHtml += '<ellipse id="originpt" cx="' + origin.x + '" cy="' + origin.y + '" rx="' + 4 + '" ry="' + 4  + '" style="display: none"/>';
        svgHtml += '</g>';
        svgHtml += '<g id="viewport" transform="translate(0,0)">';
    */
    for(var i=0; i < annotations.length; i++){
        var annotation = annotations[i];
        var nativepoints = annotation.geometry.coordinates[0];

        var offset = OpenSeadragon.getElementOffset(viewer.canvas);
        //svgHtml += '<polygon id="'+Math.random()+'" points="';
        //var polySVG = ""

        if(nativepoints.length > 2){
            context.beginPath();
            var x0 = this.imagingHelper.logicalToPhysicalX(nativepoints[0][0]);
            var x1  = this.imagingHelper.logicalToPhysicalY(nativepoints[0][1]);
            context.moveTo(x0, x1);
        }
        for(var k=1; k< nativepoints.length; k++){
            var px = this.imagingHelper.logicalToPhysicalX(nativepoints[k][0]);
            var py = this.imagingHelper.logicalToPhysicalY(nativepoints[k][1]);

            context.lineTo(px, py);
        }
        context.strokeStyle = 'blue';
        context.stokeWidth = 6;
        context.closePath();
        context.stroke();
    }
    }
}
    /*
    var clickSVG = function(evt, annotation){
        //var a = annotation;
        return function(){
            console.log("hey");
        };
    }();
    */

var clickSVG = function(e){
    console.log(".....");
}


annotools.prototype.generateSVG = function(annotations){ 
    //console.log(annotation);
    //var annotation = annotations[ii];
    var annotations = this.annotations;
    if (annotations){
    var markup_svg = document.getElementById("markups");
    if (markup_svg) {
        //console.log("destroying");
        markup_svg.destroy()
    }

    //console.log(annotations.length);
    var container = document.getElementsByClassName(this.canvas)[0]; //Get The Canvas Container
    //console.log(nativepoints);
    //var container = document.getElementsByClassName(this.cavas)[0];
    //console.log(container);
    var width = parseInt(container.offsetWidth);
    var height = parseInt(container.offsetHeight);
    /* Why is there an ellipse in the center? */
    var svgHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + 'px" height="' + height + 'px" version="1.1" id="markups">';
        svgHtml += '<g id="groupcenter"/>';
        svgHtml += '<g id="origin">';
        var origin = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5));
        svgHtml += '<ellipse id="originpt" cx="' + origin.x + '" cy="' + origin.y + '" rx="' + 4 + '" ry="' + 4  + '" style="display: none"/>';
        svgHtml += '</g>';
        svgHtml += '<g id="viewport" transform="translate(0,0)">';
  
    for(var i=0; i < annotations.length; i++){
        var annotation = annotations[i];
        var nativepoints = annotation.geometry.coordinates[0];

        var offset = OpenSeadragon.getElementOffset(viewer.canvas);
        
        //var svg = 
        svgHtml += '<polygon  class="annotationsvg" id="'+"poly"+i+'" points="';

        //svgHtml += '<polygon onClick="clickSVG()" class="annotationsvg" id="'+"poly"+i+'" points="';
        var polySVG = ""
        for(var k = 0; k < nativepoints.length; k++) {      
            //console.log(nativepoints[k][0]);
            var polyPixelX = this.imagingHelper.logicalToPhysicalX(nativepoints[k][0]);
            var polyPixelY = this.imagingHelper.logicalToPhysicalY(nativepoints[k][1]);
            //svgHtml += nativepoints[k][0] + ',' + nativepoints[k][1] + ' ';
            //polySVG += nativepoints[k][0] + ',' + nativepoints[k][1] + ' ';
            svgHtml += polyPixelX + ',' + polyPixelY + ' ';

        }
        //console.log(polySVG);
        
        svgHtml += '" style="fill:transparent; stroke:lime; stroke-width:2.5"/>';
    }
        this.svg = new Element("div", {
            styles: {
                position: "absolute",
                left: 0,
                top: 0,
                width: '100%',
                height: '100%'
            },
            html: svgHtml
        }).inject(container);
    }
//    console.log(svgHtml);
    jQuery(".annotationsvg").mousedown(function(event){
         event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();       
    });
    /*
    jQuery(".annotationsvg").mouseup(function(event){
         event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();       
    });
    */
    jQuery(".annotationsvg").unbind("click").click(function(event){
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();



        alert("annotation");

    });
}



annotools.prototype.handleGeoJSON = function(startTime) {

    var geoJSONs = this.annotations;
    //geoJSONs = this.convertAnnotationsToGeoJSON();
    //this.geoannotations = geoJSONs;
    //this.convertAllGeoToNative();

    //this.displayGeoJSONAnnot();
    //
   
    var renderStartTime = performance.now();
    this.generateSVG(geoJSONs);
    var renderEndTime = performance.now();
    //console.log("Rendering time: " + (renderEndTime - renderStartTime));

    //endProfile(startTime);
    //console.log(geoJSONs);
    //this.geoJSONtoSVG(geoJSONAnnotation[0]); 
    //this.generateSVG(geoJSONAnnotation[0]);
    //console.log(geoJSONAnnotation[0]);

}
/*
annotools.prototype.convertGeoToNative = function (geoannotation) {
    var points = geoannotation.geometry.coordinates[0];
    //console.log(points);
    var nativePoints = [];
    for(var i=0; i<points.length; i++){
        px = points[i][0];
        py = points[i][0]
        var polyPoint = new OpenSeadragon.Point(parseFloat(px), parseFloat(py));
        var pointX = this.imagingHelper.logicalToPhysicalX(polyPoint.x)
        var pointY = this.imagingHelper.logicalToPhysicalY(polyPoint.y);
        nativePoints.push([pointX, pointY]);
    }
    //console.log(nativePoints);
    geoannotation.geometry.coordinates = [nativePoints];
    return geoannotation;
    
}
annotools.prototype.convertAllGeoToNative = function() {
    var self = this;
    var annotations = this.annotations;
    for(var i = 0; i < annotations.length; i++){
        this.annotations[i] = this.convertGeoToNative(annotations[i]);
    }
    //console.log(this.geoannotations);
}
*/



/*
annotools.prototype.geoJSONtoSVG = function(geoJSONAnnotation) {
    var coordinates = geoJSONAnnotation.geometry.coordinates;
    //Convert to native
    var points = coordinates[0];
    var osdpoints = []
    for(var k = 0; k < points.length; k++) {
        var polypoint = new OpenSeadragon.Point(points[k][0], points[k][1]);
        osdpoints.push(polypoint);
    }
    this.nativepoints = osdpoints;
    //console.log(osdpoints);

}
*/

