// NOTE:  this code is deprecated
var configDotTool = {
    defaultWidth: 500,
    defaultHeight: 500,
    caMicBaseUrl: 'http://129.49.249.191/camicroscope_alina/osdCamicroscope.php',
    defaultSubjectId: 'TCGA-55-8089-01Z-00-DX1',
    defaultCancerType: 'luad',
    defaultStartX: 8972,
    defaultStartY: 6122,
    iiifServerBaseUrl: 'http://129.49.249.191/fcgi-bin/iipsrv.fcgi?IIIF=',
    defaultFileName: '/home/data/tcga_data/luad/TCGA-55-8089-01Z-00-DX1.da4d99ff-4a7c-45a3-b79c-039c0c9e9712.svs/',
    defaultRadius: 3,
    defaultFillColor: '#ffff00',
    defaultHoverColor: '#ff2626'
};

// tile uri to IIP Image server (IIIF protocol)
var tileUri = configDotTool.iiifServerBaseUrl + configDotTool.defaultFileName
    + configDotTool.defaultStartX + ',' + configDotTool.defaultStartY + ','
    + configDotTool.defaultWidth + ',' + configDotTool.defaultHeight + "/full/0/default.jpg";

var radius     = configDotTool.defaultRadius,      // Change according to the size of the point
    fillColor  = configDotTool.defaultFillColor,   //yellow
    hoverColor = configDotTool.defaultHoverColor;  //red

// dataset
var circleDataset = [];  //an array of circle objects

var caMicUri = configDotTool.caMicBaseUrl + '?tissueId=' + configDotTool.defaultSubjectId + '&cancerType=' + 
	configDotTool.defaultCancerType + '&x=' + configDotTool.defaultStartX + '&y=' + configDotTool.defaultStartY;

$(document).ready(function() { 
    var link = $('<a>');
    link.attr('href', caMicUri);
    link.attr('title', 'View ROI in caMicroscope');
	link.attr('target', '_blank');
    link.text('View ROI in the whole slide image');
    link.addClass('link');
    
    $('#caMicLink').html(link);  
  });  

// set up the svg 
var svgHtmlDot = d3.select("#svgContainer")
    .append("svg:svg")
    .attr("width", configDotTool.defaultWidth)
    .attr("height", configDotTool.defaultHeight)
    .style("cursor", "crosshair");
    
    svgHtmlDot.append("image")
        .attr("id", "currentImage")
        .attr("xlink:href", tileUri)
	    .on("load", function(d) {                //get image size dynamically
            var currentImage = new Image();
                currentImage.onload = function() {
                    d3.select("#currentImage")
                    .attr("width", this.width)
                    .attr("height", this.height);
                }
                currentImage.src = tileUri;
            });
        

// group circle elements together
var circleGroup = svgHtmlDot.append("g");
    
    //.on(action, fn) syntax for attaching an event listener to a DOM selection
    svgHtmlDot.on("click", function() {
        var coords = d3.mouse(this);
        var xPosition = Math.round(coords[0]);
        var yPosition = Math.round(coords[1]);
        console.log(xPosition + " " + yPosition);
        drawCircle(xPosition, yPosition, radius, fillColor);
    });

// draw circle element
function drawCircle(x, y, size, color) {
    console.log('Drawing circle at', x, y, size);
    var creation = Date.now(); //the number of milliseconds since midnight January 1, 1970
    var svgCircle = circleGroup.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", size)
        .style("fill", fillColor)
        .attr("id", "circle_" + creation)
	    .on("mouseover", function(d) {
  	        d3.select(this).attr("r", radius).style("fill", hoverColor);
	    })                  
            .on("mouseout", function(d) {
  	        d3.select(this).attr("r", radius).style("fill", fillColor);
	    })
            .on("contextmenu", function (d, i) {
                d3.event.preventDefault();
               // react on right-clicking;
                removeCircle("circle_" + creation);
            });
	    
    var svgTooltip = svgCircle.append("title")  //tooltip with circle x, y
        .text(function() {
	    return x + ', ' + y;	  
	});
}

// remove circle element
function removeCircle(id) {
    d3.selectAll('g #' + id).remove();
}