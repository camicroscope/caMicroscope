//tmp values for testing; will be set up dynamically
var width      = 400,
    height     = 400,
    tileUri    = "https://ajasniew.github.io/images/LUAD_400_Det_ST_ASSG2/TCGA-L9-A444-01Z-00-DX1_appMag_40_241_136.png",
    radius     = 3;   // Change according to the size of the point
    fillColor  = "#ffff00";  //yellow
    hoverColor = "#ff2626";  //red

//dataset
var circleDataset = [];  //an array of circle objects

//setup the svg 
var svgHtmlDot = d3.select("#svgContainer")
        .append("svg:svg")
        .attr("width", width)
        .attr("height", height)
        .style("cursor", "crosshair");
    
    svgHtmlDot.append("svg:image")
        .attr("xlink:href", tileUri)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height);

//group circle elements together
var circleGroup = svgHtmlDot.append("g");
    
    //.on(action, fn) syntax for attaching an event listener to a DOM selection
    svgHtmlDot.on('click', function() {
        var coords = d3.mouse(this);
        console.log(coords);
        drawCircle(coords[0], coords[1], radius, fillColor);
    });

//draw circle element
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

//remove circle element
function removeCircle(id){
   d3.selectAll('g #' + id).remove();
}