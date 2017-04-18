annotools.prototype.generateGeoTemplate = function () {
  
  var case_id = this.iid
  var subject_id = case_id.substr(0,12);
  if(subject_id.substr(0,4) != "TCGA"){
    subject_id = "";
  }

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
        'execution_id': 'humantest',
        'study_id': "",
        'source': "human",
        'computation': 'segmentation'
      },
      'image': {
        'case_id': case_id,
        'subject_id': subject_id
      }
    },
    'date': Date.now()
  }
  return geoJSONTemplate
}

annotools.prototype.convertRectToGeo = function (annotation) {
 

  var origin = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(annotation.x), this.imagingHelper.physicalToDataY(annotation.y))
  var max = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(annotation.x + annotation.w), this.imagingHelper.physicalToDataY(annotation.y + annotation.h))





  /* Compute footprint(area)*/
  var physicalX1 = this.imagingHelper.logicalToPhysicalX(annotation.x);
  var physicalY1 = this.imagingHelper.logicalToPhysicalY(annotation.y);
  var physicalX2 = this.imagingHelper.logicalToPhysicalX(annotation.x + annotation.w);
  var physicalY2 = this.imagingHelper.logicalToPhysicalY(annotation.y + annotation.h);

  var helper = this.imagingHelper;
  var dataX1 = helper.physicalToDataX(physicalX1);
  var dataY1 = helper.physicalToDataY(physicalY1);
  var dataX2 = helper.physicalToDataX(physicalX2);
  var dataY2 = helper.physicalToDataY(physicalY2);


  var area = (dataX2 - dataX1)*(dataY2-dataY1);


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
  geoAnnot.y = y;
  geoAnnot.footprint = area;
  geoAnnot.geometry.coordinates = coordinates

  return geoAnnot
}

annotools.prototype.convertPencilToGeo = function (annotation) {
  var origin = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(annotation.x), this.imagingHelper.physicalToDataY(annotation.y))
  var max = new OpenSeadragon.Point(this.imagingHelper.physicalToDataX(annotation.x + annotation.w), this.imagingHelper.physicalToDataY(annotation.y + annotation.h))

  /* Compute footprint(area)*/
  var physicalX1 = this.imagingHelper.logicalToPhysicalX(annotation.x);
  var physicalY1 = this.imagingHelper.logicalToPhysicalY(annotation.y);
  var physicalX2 = this.imagingHelper.logicalToPhysicalX(annotation.x + annotation.w);
  var physicalY2 = this.imagingHelper.logicalToPhysicalY(annotation.y + annotation.h);

  var helper = this.imagingHelper;
  var dataX1 = helper.physicalToDataX(physicalX1);
  var dataY1 = helper.physicalToDataY(physicalY1);
  var dataX2 = helper.physicalToDataX(physicalX2);
  var dataY2 = helper.physicalToDataY(physicalY2);


  var area = Math.abs((dataX2 - dataX1))*Math.abs((dataY2-dataY1));

  

  
  var points = annotation.points
  var p = points.split(' ')
  var geocoords = []

  for (var i = 0; i < p.length; i++) {
    var pt = p[i].split(',')
    var ptx = +pt[0]
    var pty = +pt[1]
    geocoords.push([ptx, pty])
  }
 
  var geojson = this.generateGeoTemplate()
  var coordinates = []
  coordinates.push([])
  geojson.geometry = {}
  geojson.geometry.coordinates = [geocoords]
  geojson.footprint = area;
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

    return geojson
}


annotools.prototype.convertAnnotationsToGeoJSON = function() {
    geoJSONs = []
    var annotations = this.annotations

    
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
  //var intersect_label = this.calculateIntersect();
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
  //var intersect_label = this.calculateIntersect();
  console.log(this.heat_weight);
  var self =this;
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

    highres = false;
    for (var i = 0; i < annotations.length; i++) {
        if (annotations[i].footprint < 100000)
        {
            highres = true;
            break;
        }
    }

    if (this.imagingHelper._viewportWidth * this.imagingHelper._viewportHeight > 0.06)
        highres = false;

    smth_or_not = highres;
    if (smth_or_not) {
        smoothed_anno = this.heatmap_smoothing(1, 0.01 + 2 * Math.pow(this.heat_weight[2], 2));
    }

    var intersect_label = this.calculateIntersect(highres);

    for (var i = 0; i < annotations.length; i++) {
      if (smth_or_not)
        var smoothed = smoothed_anno[i]
      var annotation = annotations[i]
      if (((highres == false) && (annotation.footprint <= 100000)) || ((highres == true) && (annotation.footprint > 100000)))
        if (annotation.object_type == 'heatmap_multiple')
            continue;

      if (annotation.object_type == 'marking')
      {
        if (annotation.properties.annotations.mark_type == 'LymPos' || annotation.properties.annotations.mark_type == 'LymNeg')
        {
            //continue;
        }

        if (annotation.properties.annotations.username != this.username)
            continue;
      }
 
      if (this.lymheat == false)
      {
	    if ((annotation.object_type == 'marking') && (annotation.properties.annotations.mark_type == 'LymPos' || annotation.properties.annotations.mark_type == 'LymNeg'))
	    {
		  continue;
	    }
	    if (annotation.object_type == 'heatmap' || annotation.object_type == 'heatmap_multiple')
	    {
		  continue;
	    }
      }

      var id = '';
      
      if (annotation['_id'])
        id = annotation['_id']['$oid']
      // console.log(annotation)
      var nativepoints = annotation.geometry.coordinates[0]

      // var offset = OpenSeadragon.getElementOffset(viewer.canvas)
      var algorithm_id = annotation.provenance.analysis.execution_id
      var color = algorithm_color[algorithm_id]

      // var svg = 
      //svgHtml += '<polygon  class="annotationsvg" id="' + id + '" points="'
      svgHtml += '<polyline  class="annotationsvg" id="' + id + '" points="'

      // svgHtml += '<polygon onclick="clickSVG(event)" class="annotationsvg" id="'+"poly"+i+'" points="'
      var polySVG = ''
      for (var k = 0; k < nativepoints.length; k++) {

        var polyPixelX = this.imagingHelper.logicalToPhysicalX(nativepoints[k][0])
        var polyPixelY = this.imagingHelper.logicalToPhysicalY(nativepoints[k][1])
        // svgHtml += nativepoints[k][0] + ',' + nativepoints[k][1] + ' '
        // polySVG += nativepoints[k][0] + ',' + nativepoints[k][1] + ' '
        svgHtml += polyPixelX + ',' + polyPixelY + ' '
      }

      //svgHtml += '" style="fill: transparent; stroke: lime; stroke-width:2.5"/>'
      if(color === undefined)
        color = 'lime'
      //svgHtml += '" style="fill:transparent; stroke:'+color+ '; stroke-width:2.5"/>'
      //svgHtml += '" style="fill:' + '#feedde' + ';fill-opacity: 0.6;stroke-width:0"/>';
      //console.log(this.heatmap_opacity);
      //console.log(this.imagingHelper._viewportWidth);
      switch (annotation.object_type)
      {
	case 'heatmap':
		//console.log('case heatmap');
		//var heatmapIndex = parseInt(parseInt((annotation.properties.metric_value * 10))/2.5);
		var heatmapIndex = parseInt(parseInt(((1-annotation.properties.metric_value) * 10))/2.5);
		var heatcolor = this.heatmapColor[heatmapIndex];
		svgHtml += '" style="fill:' + heatcolor.toString() + ';fill-opacity: ' + this.heatmap_opacity + ';stroke-width:0"/>';
		break;
	case 'heatmap_multiple':
        if (smth_or_not) {
		  var lym_score = smoothed;
        } else {
		  var lym_score = annotation.properties.multiheat_param.metric_array[0];
        }
		var nec_score = annotation.properties.multiheat_param.metric_array[1];
		var nec_weight = this.heat_weight[1];
		var lym_weight = 1-this.heat_weight[0];

		var lym_color_index = lym_score >= lym_weight ? 2 : 0;
		var nec_color_index = nec_score >= nec_weight ? 1 : 0;
		var lym_checked = document.getElementById('cb1').checked;
		var nec_checked = document.getElementById('cb2').checked;

		// Added for temp weight boxes
		lym_checked = (document.getElementById('LymSe').checked || document.getElementById('BothSe').checked);
		nec_checked = (document.getElementById('NecSe').checked || document.getElementById('BothSe').checked);


		selected_heatmap = this.heatmapColor[0];
		selected_opacity = this.heatmap_opacity;

		if (intersect_label[i] != 0)
		{
			switch (intersect_label[i])
			{
			case -1: svgHtml += '" style="fill:' + this.heatmapColor[4] + ';fill-opacity: ' + this.heatmap_opacity + ';stroke-width:0"/>'; break;
			case 1: svgHtml += '" style="fill:' + this.heatmapColor[3] + ';fill-opacity: ' + this.heatmap_opacity + ';stroke-width:0"/>'; break;
			}
		}
		else
		{
			if (lym_checked == true && nec_checked == false)
			{
				selected_heatmap = this.heatmapColor[lym_color_index];
				//svgHtml += '" style="fill:' + this.heatmapColor[lym_color_index] + ';fill-opacity: ' + this.heatmap_opacity + ';stroke-width:0"/>';
			}

			if (lym_checked == false && nec_checked == true)
			{
				selected_heatmap = this.heatmapColor[nec_color_index];
				//svgHtml += '" style="fill:' + this.heatmapColor[nec_color_index] + ';fill-opacity: ' + this.heatmap_opacity + ';stroke-width:0"/>';
			}

			if (lym_checked == true && nec_checked == true)
			{
				selected_heatmap = this.heatmapColor[lym_color_index*(1-nec_color_index)];
				//svgHtml += '" style="fill:' + this.heatmapColor[lym_color_index*(1-nec_color_index)] + ';fill-opacity: ' + this.heatmap_opacity + ';stroke-width:0"/>';
			}

			if (lym_checked == false && nec_checked == false)
			{
				selected_heatmap = this.heatmapColor[0];
				//svgHtml += '" style="fill:' + this.heatmapColor[0] + ';fill-opacity: ' + this.heatmap_opacity + ';stroke-width:0"/>';
			}
		}
		
		if (selected_heatmap == this.heatmapColor[0])
		{
			selected_opacity = 0.2;
		}

		svgHtml += '" style="fill:' + selected_heatmap + ';fill-opacity: ' + selected_opacity + ';stroke-width:0"/>';
		/*
		var combo = lym_score;
		if (nec_score >= (1-this.heat_weight1))
		{
			combo = 0;
		}
		var heatmapIndex = parseInt(parseInt((combo * 10))/2.5);
        var heatcolor = this.heatmapColor[heatmapIndex];
        svgHtml += '" style="fill:' + heatcolor.toString() + ';fill-opacity: ' + this.heatmap_opacity + ';stroke-width:0"/>';
		*/
                break;
	
	case 'marking':
		var line_color = '';
		var stroke_width = 2.5;
		switch (annotation.properties.annotations.mark_type)
		{
			case 'LymPos': line_color = 'red'; stroke_width = 2.5*annotation.properties.annotations.mark_width; break;
			case 'LymNeg': line_color = 'blue'; stroke_width = 2.5*annotation.properties.annotations.mark_width; break;
			case 'TumorPos': line_color = 'orange'; break;
			case 'TumorNeg': line_color = 'lime'; break;
		}
		//svgHtml += '" style="fill:transparent; stroke:'+line_color+ '; stroke-width:2.5"/>'
		svgHtml += '" style="fill:transparent; stroke:'+line_color+ '; stroke-width:' + stroke_width + '"/>';
		break;
	default:
		svgHtml += '" style="fill:transparent; stroke:'+color+ '; stroke-width:2.5"/>'
      }
      /*
      if (annotation.object_type === 'heatmap')
      {
      	var heatmapIndex = parseInt(parseInt((annotation.properties.metric_value * 10))/2.5);
      	var heatcolor = this.heatmapColor[heatmapIndex];
      	svgHtml += '" style="fill:' + heatcolor.toString() + ';fill-opacity: ' + this.heatmap_opacity + ';stroke-width:0"/>';
      }
      else
      {
	svgHtml += '" style="fill:transparent; stroke:'+color+ '; stroke-width:2.5"/>'
      }
      */
    }

    //Debug
    //console.log(svgHtml);

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



  var ctrl = false;
  jQuery(document).keydown(function(event){
    //console.log("control");
    //console.log(event);
    if(event.which == 17 || event.which == 91)
      ctrl = true;

  });
  jQuery(document).keyup(function(){
        ctrl = false;
  });
  jQuery('.annotationsvg').mousedown(function (event) {
        //console.log(event.which);
        if(ctrl){
          //console.log("double clicked");
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          //return false;
        } else {
          return;
        }
        var panel = jQuery('#panel').show('slide')
        panel.html('');
        jQuery(".annotationsvg").css("opacity", 0.5);
        jQuery("#"+event.target.id).css("opacity", 1);
        var id = event.target.id
        var url = "api/Data/getProperties.php?id="+id;
        var content = "<div id = 'panelHeader'> <h4>Annotation Details </h4></div>"
        + "<div id='panelBody'>";

        jQuery.get(url, function(d){
          var data = {}
          
          try{
            data = JSON.parse(d)[0];
          } catch(e){
            console.log(e);
          }
          //console.log(data);
          var features = [];
          var properties = {};
          try {
            if(data.properties.scalar_features)
              features=  data.properties.scalar_features[0].nv;
            properties = data.properties.annotations;
          } catch(e){
            console.log(e);
          }
          for(var i in properties){
            
            if(i == "secret"){

            } else {
              var line = "<div class='markupProperty'><strong>"+i+"</strong>: " + properties[i]+"</div>";
              content+=line;
            }
          
          }

          for(var i =0; i< features.length; i++){
            var feature = features[i];
            var line = "<div class='markupFeature'><div class='markupFeatureName'>"+feature.name +"</div> <div class='markupFeatureValue'>"+feature.value+"</div></div>";
            content+=line;
          }

          content += "<button class='btn-danger btn' id='deleteAnnot'><a href='#confirmDelete' rel='modal:open'>Delete</a></button>";
          content += "<button class='btn' id='cancelPanel'>Cancel</button>";
          content +="</div>";
          var cancel = function () {
           
            jQuery('#panel').hide('slide')

          }

          panel.html(content);


          jQuery("#cancelPanel").click(function(){cancel();});

          jQuery("#deleteAnnot").click(function(e) {
            
            //$("#confirmDelete").css(
            //console.log(data.provenance.analysis.source);
            if(data.provenance.analysis.source == "human"){
              jQuery("#confirmDeleteButton").click(function(){
                var secret = jQuery("#deleteSecret").val();
                var payload = {
                  "id": id,
                  "secret": secret
                }
              
                jQuery.ajax({
                  url: 'api/Data/getProperties.php?id='+id,
                  type: 'DELETE',
                  data:(payload),
                  success: function(data){
                    console.log(data);
                    jQuery("#panel").hide("slide");
                    self.getMultiAnnot();
                  }
                });
              });
            } else {
              alert("Can't delete computer generated segments");
            }
          });

        });
    
  })



  /*
  jQuery('.annotationsvg').mousedown(function (event) {
   
    switch (event.which) {
      case 3:


        var panel = jQuery('#panel').show('slide')
        panel.html('');

        var id = event.target.id
        var url = "api/Data/getProperties.php?id="+id;
        var content = "<div id = 'panelHeader'> <h4>Annotation Details </h4></div>"
    + "<div id='panelBody'>";

        jQuery.get(url, function(data){
          
          var data = JSON.parse(data)[0];
          var properties = data.properties.annotations;
          for(var i in properties){
            
            if(i == "secret"){

            } else {
              var line = "<div class='markupProperty'><strong>"+i+"</strong>: " + properties[i]+"</div>";
              content+=line;
            }
          
          }
          content += "<button class='btn' id='cancelPanel'>Cancel</button>";
          content +="</div>";
          var cancel = function () {
           
            jQuery('#panel').hide('slide')

          }

          panel.html(content);


          jQuery("#cancelPanel").click(function(){cancel();});



        });
        // jQuery("#panel").hide("slide")
        break
    }
  })
  */
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
