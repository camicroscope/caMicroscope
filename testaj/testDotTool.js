//tmp values for testing; will be setup dynamically
var width     = 500,
    height    = 500,
    tileUri   = "https://ajasniew.github.io/images/ImageGeneral/TCGA-DU-7309-01Z-00-DX1_52577_21739_400_400-1-0_Ex3.PNG",
    radius    = 3;   // Change according to the size of the point
    fillColor = "red";

//setup the svg 
var svgHtmlDot = d3.select("#svgContainer")
        .append("svg:svg")
        .attr("width", width)
        .attr("height", height)
        .style("cursor", "crosshair");
    
    svgHtmlDot.append("svg:image")
        .attr("xlink:href", tileUri)
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", width)
        .attr("height", height);
    
    //.on(action, fn) syntax for attaching an event listener to a DOM selection
    svgHtmlDot.on('click', function() {
        var coords = d3.mouse(this);
        console.log(coords);
        drawCircle(coords[0], coords[1], radius, fillColor);
    });

//draw circle element
function drawCircle(x, y, size, color) {
    console.log('Drawing circle at', x, y, size);
    var svgCircle = svgHtmlDot.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", size)
        .style("fill", fillColor)
        .on("contextmenu", function (d, i) {
            d3.event.preventDefault();
           // react on right-clicking;
        });
}