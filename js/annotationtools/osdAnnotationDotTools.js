// Dot Annotation Tool (under development)
annotools.prototype.drawDots = function() {
	
    // alert('comming soon...');
    var self =this;
 
    var markup_svg = document.getElementById('markups');
    if (markup_svg) {
      // console.log("destroying")
      markup_svg.destroy();
    }

    var container = document.getElementsByClassName(this.canvas)[0]; // Get The Canvas Container
    // console.log(container);
    var width = parseInt(container.offsetWidth);
    var height = parseInt(container.offsetHeight);

    /* Why is there an ellipse in the center? */
    var svgHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + 'px" height="' + height + 'px" version="1.1" id="markups">';
    svgHtml += '<g id="groupcenter"/>';
    svgHtml += '<g id="origin">';
    var origin = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(.5, .5));
    svgHtml += '<ellipse id="originpt" cx="' + origin.x + '" cy="' + origin.y + '" rx="' + 4 + '" ry="' + 4 + '" style="display: none"/>';
    svgHtml += '</g>';
    svgHtml += '<g id="viewport" transform="translate(0,0)">';
    svgHtml += '</g>';

    this.svg = new Element('div', {
      styles: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
      },
      html: svgHtml
    }).inject(container);
    
    // d3 start
    var svgHtmlDot = d3.select('svg');
    var viewPort =  d3.select('#viewport');
   
    // group circle elements together
    var circleGroup = viewPort.append('g');
    
    //.on(action, fn) syntax for attaching an event listener to a DOM selection
    svgHtmlDot.on('click', function() {
        var creation = Date.now();    // the number of milliseconds since midnight January 1, 1970
        var coords = d3.mouse(this);
        var xPosition = Math.round(coords[0]);
        var yPosition = Math.round(coords[1]);
        console.log(xPosition + ' ' + yPosition);
        
        var svgCircle = circleGroup.append('circle')
        .attr('cx', xPosition)
        .attr('cy', yPosition)
        .attr('r', 4)
        .style('fill', '#ffff00')
        .attr('id', 'circle_' + creation)
        .on('contextmenu', function (d, i) {
            d3.event.preventDefault();
           // react on right-clicking;
           // removeCircle('circle_' + creation);
            d3.selectAll('g #' + 'circle_' + creation).remove();
        });
        
        var svgTooltip = svgCircle.append('title')    // tooltip with circle x, y
            .text(function() {
                return xPosition + ', ' + yPosition;	  
            });
    });
}


annotools.prototype.showDotTools = function() {
    
	// redirect
    window.location = 'http://129.49.249.191/camicroscope_alina/testaj/test.html';
	
}