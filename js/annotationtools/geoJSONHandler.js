annotools.prototype.generateGeoTemplate = function () {
  console.log(this.iid)
  var case_id = this.iid
  var geoJSONTemplate = {
    'type': 'Feature',
    'parent_id': 'self',
    'randval': Math.random(),
    'geometry': {
      'type': 'Polygon',
      'coordinates': []
    },
    'normalized': true,
    'object_type': 'annotation', // nucleus?
    'properties': {
      'scalar_features': [],
      'annotations': []
    },
    'footprint': 10000,
    'provenance': {
      'analysis': {
        'execution_id': 'test'
      },
      'image': {
        'case_id': case_id
      }
    },
    'date': Date.now()
  }
  return geoJSONTemplate
}

annotools.prototype.convertRectToGeo = function (annotation) {
  console.log(annotation)

  var origin = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(annotation.x), this.imagingHelper.physicalToDataY(annotation.y))
  var max = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(annotation.x + annotation.w), this.imagingHelper.physicalToDataY(annotation.y + annotation.h))
  console.log(annotation.x)
  console.log(annotation.y)
  console.log(annotation.w)
  console.log(annotation.h)
  console.log(origin)
  console.log(max)
  var area = (max.x - origin.x) * (max.y - origin.y)
  console.log('area: ' + area)
  var coordinates = []
  var x = annotation.x
  var y = annotation.y
  var w = annotation.w
  var h = annotation.h
  var geoAnnot = this.generateGeoTemplate()
  coordinates.push([])
  // coordinates[0].push([])
  coordinates[0].push([x, y])
  coordinates[0].push([x + w, y])
  coordinates[0].push([x + w, y + h])
  coordinates[0].push([x, y + h])
  geoAnnot.x = x
  geoAnnot.y = y
  geoAnnot.geometry.coordinates = coordinates
  // console.log(geoAnnot)
  return geoAnnot
}

annotools.prototype.convertPencilToGeo = function (annotation) {
  var origin = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(annotation.x), this.imagingHelper.physicalToDataY(annotation.y))
  var max = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(annotation.x + annotation.w), this.imagingHelper.physicalToDataY(annotation.y + annotation.h))
  console.log(annotation.x)
  console.log(annotation.y)
  console.log(annotation.w)
  console.log(annotation.h)
  console.log(origin)
  console.log(max)
  var area = (max.x - origin.x) * (max.y - origin.y)
  console.log('area: ' + area)
  var points = annotation.points
  var p = points.split(' ')
  var geocoords = []

  for (var i = 0; i < p.length; i++) {
    var pt = p[i].split(',')
    var ptx = +pt[0]
    var pty = +pt[1]
    geocoords.push([ptx, pty])
  }
  console.log(this)
  var geojson = this.generateGeoTemplate()
  var coordinates = []
  coordinates.push([])
  geojson.geometry = {}
  geojson.geometry.coordinates = [geocoords]

  // set x, y and width and height
  geojson.x = annotation.x
  geojson.y = annotation.y
  // geojson.w = annotation.w
  // geojson.h = annotation.h

  // console.log(geojson)
  return geojson
}

/*
var convertGeo = function(points){
    var p = points.split(' ')
    var geocoords = []
    for(var i=0; i< p.length; i++){
        var pt = p[i].split(',')
        var ptx = +pt[0]
        var pty = +pt[1]
        geocoords.push([ptx,pty])
    }
    var geojson = {}
    geojson.geometry = {}
    geojson.geometry.coordinates = [geocoords]
    //console.log(geojson)
    return geojson
}

console.log("geeeojssssononnnn")
annotools.prototype.convertAnnotationsToGeoJSON = function() {
    geoJSONs = []
    var annotations = this.annotations
    //console.log("Geeo")
    
    for(var i in annotations) {
        
        var annotation = annotations[i]
        //console.log(annotation)

        var points = annotation.points
        if(points) { //is a polygon
            //console.log(points)
            geo = convertGeo(points)
            geoJSONs.push(geo);        
        
        }
    }
    //console.log(geoJSONs)
    return geoJSONs
    console.log(geoJSONs)
}
*/

function endProfile (startTime) {
  // nvar t2 = performance.now()
  // console.log(startTime)
  // console.log(t2)
  // console.log("Total time: "+ (t2-startTime))
}

annotools.prototype.generateCanvas = function (annotations) {
  // console.log(annotation)
  // var annotation = annotations[ii]
  var annotations = this.annotations
  if (annotations) {
    var markup_svg = document.getElementById('markups')
    if (markup_svg) {
      // console.log("destroying")
      markup_svg.destroy()
    }
    // console.log(annotations.length)
    // console.log(this.canvas)
    var container = document.getElementsByClassName(this.canvas)[0].childNodes[0] // Get The Canvas Container
    // console.log(container)
    var context = container.getContext('2d')
    context.fillStyle = '#f00'
    // console.log(nativepoints)
    // var container = document.getElementsByClassName(this.cavas)[0]
    // console.log(container)
    var width = parseInt(container.offsetWidth)
    var height = parseInt(container.offsetHeight)
    /* Why is there an ellipse in the center? */
    /*
    var svgHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + 'px" height="' + height + 'px" version="1.1" id="markups">'
        svgHtml += '<g id="groupcenter"/>'
        svgHtml += '<g id="origin">'
        var origin = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5,.5))
        svgHtml += '<ellipse id="originpt" cx="' + origin.x + '" cy="' + origin.y + '" rx="' + 4 + '" ry="' + 4  + '" style="display: none"/>'
        svgHtml += '</g>'
        svgHtml += '<g id="viewport" transform="translate(0,0)">'
    */
    for (var i = 0; i < annotations.length; i++) {
      var annotation = annotations[i]
      var nativepoints = annotation.geometry.coordinates[0]

      var offset = OpenSeadragon.getElementOffset(viewer.canvas)
      // svgHtml += '<polygon id="'+Math.random()+'" points="'
      // var polySVG = ""

      if (nativepoints.length > 2) {
        context.beginPath()
        var x0 = this.imagingHelper.logicalToPhysicalX(nativepoints[0][0])
        var x1 = this.imagingHelper.logicalToPhysicalY(nativepoints[0][1])
        context.moveTo(x0, x1)
      }
      for (var k = 1; k < nativepoints.length; k++) {
        var px = this.imagingHelper.logicalToPhysicalX(nativepoints[k][0])
        var py = this.imagingHelper.logicalToPhysicalY(nativepoints[k][1])

        context.lineTo(px, py)
      }
      context.strokeStyle = 'blue'
      context.stokeWidth = 6
      context.closePath()
      context.stroke()
    }
  }
}
/*
var clickSVG = function(evt, annotation){
    //var a = annotation
    return function(){
        console.log("hey")
    }
}()
*/

annotools.prototype.generateSVG = function (annotations) {
  // console.log(annotation)
  // var annotation = annotations[ii]
  var annotations = this.annotations
  if (annotations) {
    var markup_svg = document.getElementById('markups')
    if (markup_svg) {
      // console.log("destroying")
      markup_svg.destroy()
    }

    // console.log(annotations.length)
    var container = document.getElementsByClassName(this.canvas)[0] // Get The Canvas Container
    // console.log(nativepoints)
    // var container = document.getElementsByClassName(this.cavas)[0]
    // console.log(container)
    var width = parseInt(container.offsetWidth)
    var height = parseInt(container.offsetHeight)
    /* Why is there an ellipse in the center? */
    var svgHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + 'px" height="' + height + 'px" version="1.1" id="markups">'
    svgHtml += '<g id="groupcenter"/>'
    svgHtml += '<g id="origin">'
    var origin = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5, .5))
    svgHtml += '<ellipse id="originpt" cx="' + origin.x + '" cy="' + origin.y + '" rx="' + 4 + '" ry="' + 4 + '" style="display: none"/>'
    svgHtml += '</g>'
    svgHtml += '<g id="viewport" transform="translate(0,0)">'

    for (var i = 0; i < annotations.length; i++) {
      var annotation = annotations[i]
      // console.log(annotation["_id"]["$oid"])
      var id = ''
      if (annotation['_id'])
        id = annotation['_id']['$oid']
      // console.log(annotation)
      var nativepoints = annotation.geometry.coordinates[0]

      // var offset = OpenSeadragon.getElementOffset(viewer.canvas)
      var algorithm_id = annotation.provenance.analysis.execution_id
      var color = algorithm_color[algorithm_id]

      // var svg = 
      svgHtml += '<polygon  class="annotationsvg" id="' + id + '" points="'

      // svgHtml += '<polygon onclick="clickSVG(event)" class="annotationsvg" id="'+"poly"+i+'" points="'
      var polySVG = ''
      for (var k = 0; k < nativepoints.length; k++) {
        // console.log(nativepoints[k][0])
        var polyPixelX = this.imagingHelper.logicalToPhysicalX(nativepoints[k][0])
        var polyPixelY = this.imagingHelper.logicalToPhysicalY(nativepoints[k][1])
        // svgHtml += nativepoints[k][0] + ',' + nativepoints[k][1] + ' '
        // polySVG += nativepoints[k][0] + ',' + nativepoints[k][1] + ' '
        svgHtml += polyPixelX + ',' + polyPixelY + ' '
      }

      svgHtml += '" style="fill: transparent; stroke:'+color+'; stroke-width:2.5"/>'
    // svgHtml += '" style="fill:yellow; stroke:'+color+ '; stroke-width:25"/>'
    }

    this.svg = new Element('div', {
      styles: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
      },
      html: svgHtml
    }).inject(container)
  }

  jQuery('.annotationsvg').mousedown(function (event) {
    console.log('annotation mousedown')
    switch (event.which) {
      case 3:
        console.log('right clicked')
        var panel = jQuery('#panel').show('slide')
        console.log(event.target.id)
        var id = event.target.id
        // jQuery("#panel").hide("slide")
        break
    }
  })
}

annotools.prototype.displayGeoAnnots = function () {
  var geoJSONs = this.annotations
  if (this.annotVisible) {
    // var renderStartTime = performance.now()
    this.generateSVG(geoJSONs)
    // var renderEndTime = performance.now()
    var renderStartTime = 9
    var renderEndTime = 23
  }
}
