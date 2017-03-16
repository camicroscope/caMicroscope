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
  console.log(area)

  

  
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
  var case_id = this.iid;
  var cancerType = "none";
  
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

		var ROIs = [];

    for (var i = 0; i < annotations.length; i++) {
      var annotation = annotations[i]

      var id = '';
      
      if (annotation['_id'])
        id = annotation['_id']['$oid']
      var nativepoints = annotation.geometry.coordinates[0]

      // var offset = OpenSeadragon.getElementOffset(viewer.canvas)
      var algorithm_id = annotation.provenance.analysis.execution_id
      var color = algorithm_color[algorithm_id]
      var countNativepoints = 0;
      var countRectNativepoints = 4;

      // var svg = 
     // svgHtml += '<polygon class="annotationsvg" id="' + id + '" points="'
      console.log(annotation.provenance.analysis);
      if(annotation.provenance.analysis.source && annotation.provenance.analysis.source=="computer"){
        svgHtml += '<polygon  class="nucleussvg" id="' + id + '" points="' 
     }else  {  
	ROIs.push(annotation);
	console.log("here");
        svgHtml += '<polygon  class="" id="' + id + '" points="' }; 


      // svgHtml += '<polygon onclick="clickSVG(event)" class="annotationsvg" id="'+"poly"+i+'" points="'
      var polySVG = ''
      for (var k = 0; k < nativepoints.length; k++) {

        var polyPixelX = this.imagingHelper.logicalToPhysicalX(nativepoints[k][0])
        var polyPixelY = this.imagingHelper.logicalToPhysicalY(nativepoints[k][1])
        // svgHtml += nativepoints[k][0] + ',' + nativepoints[k][1] + ' '
        // polySVG += nativepoints[k][0] + ',' + nativepoints[k][1] + ' '
        svgHtml += polyPixelX + ',' + polyPixelY + ' '
        countNativepoints++;
      }
           
      //svgHtml += '" style="fill: transparent; stroke: lime; stroke-width:2.5"/>'
      if(color === undefined){
        color = 'lime';
      }
        
      if (countNativepoints === countRectNativepoints) {
          svgHtml += '" style="stroke:'+ color + '; stroke-width:1.0; fill-opacity:0.2"/>';
      }
      else {
          svgHtml += '" style="fill:transparent; stroke:'+color+ '; stroke-width:2.5"/>'
      }
    }
    console.log(ROIs);
    for(var i=0; i<ROIs.length; i++){
			var annotation = ROIs[i];	
      var id = '';
      
      if (annotation['_id'])
        id = annotation['_id']['$oid']
      var nativepoints = annotation.geometry.coordinates[0]

      // var offset = OpenSeadragon.getElementOffset(viewer.canvas)
      var algorithm_id = annotation.provenance.analysis.execution_id
      var color = algorithm_color[algorithm_id]
      var countNativepoints = 0;
      var countRectNativepoints = 4;

      // var svg = 
     // svgHtml += '<polygon class="annotationsvg" id="' + id + '" points="'
      if(annotation.provenance.analysis.source && annotation.provenance.analysis.source=="computer"){
        //svgHtml += '<polygon  class="nucleussvg" id="' + id + '" points="' 
     }else  {  
        svgHtml += '<polygon  class="annotationsvg" id="' + id + '" points="' }; 
				console.log("rendering ROI");

      // svgHtml += '<polygon onclick="clickSVG(event)" class="annotationsvg" id="'+"poly"+i+'" points="'
      var polySVG = ''
      for (var k = 0; k < nativepoints.length; k++) {

        var polyPixelX = this.imagingHelper.logicalToPhysicalX(nativepoints[k][0])
        var polyPixelY = this.imagingHelper.logicalToPhysicalY(nativepoints[k][1])
        // svgHtml += nativepoints[k][0] + ',' + nativepoints[k][1] + ' '
        // polySVG += nativepoints[k][0] + ',' + nativepoints[k][1] + ' '
        svgHtml += polyPixelX + ',' + polyPixelY + ' '
        countNativepoints++;
      }
           
      //svgHtml += '" style="fill: transparent; stroke: lime; stroke-width:2.5"/>'
      if(color === undefined){
        color = 'lime';
      }
        
      if (countNativepoints === countRectNativepoints) {
          svgHtml += '" style="stroke:'+ color + '; stroke-width:1.0; fill-opacity:0.2"/>';
      }
      else {
          svgHtml += '" style="fill:transparent; stroke:'+color+ '; stroke-width:2.5"/>'
      }	
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



  var ctrl = false;
  var alt = false;
  jQuery(document).keydown(function(event){
    //console.log("control");
    console.log(event.which);
    if(event.which == 17 || event.which == 91){//Ctrl key and left window key
      ctrl = true;
	}
   else if (event.which == 18 || event.which == 92){//Alt key and right window key
	  alt = true;	 
	}
  });
  jQuery(document).keyup(function(){
        ctrl = false;
		alt = false;
  });
  jQuery("#58891912e4b076b78cf2f81f").mousedown(function(e){
	console.log(e);
  });	
  jQuery(".annotationsvg").mousedown(function (event) {
        //console.log(event.which);
       
        if(ctrl){
          //console.log("double clicked");
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          //return false;
        } else if (alt){
          //console.log("double clicked");
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          //return false;
        }		
		else {
          return;
        }
		
        var panel = jQuery('#panel').show('slide')
        panel.html('');
        jQuery(".annotationsvg").css("opacity", 0.5);
        jQuery("#"+event.target.id).css("opacity", 1);
        var id = event.target.id
        var url = "api/Data/getROI.php?id="+id;
        console.log("id:"+url);
        console.log("id:"+id);
        var content = "<div id = 'panelHeader'> <h4>Annotation Details </h4></div>"
        + "<div id='panelBody'>";

        jQuery.get(url, function(d){
          var data = {}          
          try{
            data = JSON.parse(d)[0];
          } catch(e){
            console.log(e);
          }
          
		  console.log(data);
		  
          var features = [];
          var properties = {};
		  var algorithm="";
		  var coordinates=[];
		  
          try {
            if(data.properties.scalar_features)
              features=  data.properties.scalar_features[0].nv;
		  
            properties = data.properties.annotations;
			algorithm = data.algorithm;
			coordinates= data.geometry.coordinates[0];
			
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
         
		  if(ctrl)
             content += "<button class='btn-danger btn' id='deleteAnnot'><a href='#confirmDelete' rel='modal:open'>Delete</a></button>";
		  else if (alt)
			 content += "<button class='btn-danger btn' id='featureScape'>FeatureScape</button>"; 
		  
          content += "<button class='btn' id='cancelPanel'>Cancel</button>";
          content +="</div>";
		  
          var cancel = function () {           
            jQuery('#panel').hide('slide')
          }

          panel.html(content);

          jQuery("#cancelPanel").click(function(){cancel();});
		  
        if(ctrl){ // Ctrl key for deletion of human generated annotation
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
          })
		 };
		 
		if (alt){  //new code go here to handle Alt key for featureScape view
		   if(data.provenance.analysis.source == "human" || 1){
              jQuery("#featureScape").click(function(){ 
			  
              var execution_id= algorithm_id;
			  var this_case_id = case_id;
              var this_cancerType = cancerType ;
		  var x_min= coordinates[0][0];
		  var y_min= coordinates[0][1];			  
		  var x_max= coordinates[2][0];
		  var y_max= coordinates[2][1];
		  //var randval = Math.random();
		  var randval = 0.0001;
		  var featureScape_url="";	
		  
		  //var github_url="http://sbu-bmi.github.io/FeatureScapeApps/featurescape/?";
		  //var osprey_url="http://osprey.bmi.stonybrook.edu:3000?";
		  
		  var webhost_url="/featurescapeapps/featurescape/?";
		  
		  //var findAPI_host="http://129.49.249.191";
		  //var findAPI_port="4500";			  
		 // var findAPI_url=findAPI_host+":"+findAPI_port+"?";
		  
		  var findAPI_url=findAPIConfig.findAPI+":"+findAPIConfig.port+"?";
		  
		  var mongodb_query="limit=1000&find={";
		      mongodb_query +="\"provenance.analysis.source\":\"computer\","; 
		      mongodb_query+="\"randval\":{\"$gte\":"+randval+"},";
			  mongodb_query+="\"provenance.analysis.execution_id\":\""+execution_id+"\",";
		      mongodb_query+="\"provenance.image.case_id\":\""+this_case_id+"\",";
		      mongodb_query+="\"x\":{\"$gte\":"+x_min+",\"$lte\":"+x_max+"},";
		      mongodb_query+="\"y\":{\"$gte\":"+y_min+",\"$lte\":"+y_max+"}";
		      mongodb_query+="}&db=quip"+"&c="+this_cancerType;
		  
		  //featureScape_url=github_url+osprey_url+mongodb_query;
		  featureScape_url=webhost_url+findAPI_url+mongodb_query;
		  
		  console.log(featureScape_url);		   
		  window.open(featureScape_url,'_blank');			 
              jQuery("#panel").hide("slide");
              self.getMultiAnnot();	              		  
              });
            } else {
              alert("Can't view the featureScape of computer generated segments");
            }    
		 } ;//end of new code	
		  

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
