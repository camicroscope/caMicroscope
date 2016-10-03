// Dot Annotation Tool (under development)
annotools.prototype.drawDots = function() {
	
    // alert('comming soon...');

    var annotools = this;
    var pointsArr = [];
	
    var container = document.getElementsByClassName(this.canvas)[0]; // get the Canvas Container
    // console.log(container);
	
    var left = parseInt(container.offsetLeft),
        top = parseInt(container.offsetTop),
        width = parseInt(container.offsetWidth),
        height = parseInt(container.offsetHeight);
    console.log("left: " + left + " top: " + top + " width: " + width + " height: " + height);
    if ( left < 0 ) {
        left = 0;
        width = window.innerWidth;
    } // see if the container is outside the current viewport
    if ( top < 0 ) {
        top = 0;
        height = window.innerHeight;
    }
	
    this.drawLayer.hide();
    this.magnifyGlass.hide();  // hide the Magnifying Tool
        
        
    var markup_svg = document.getElementById('markups');
    if (markup_svg) {
        // console.log("destroying")
        markup_svg.destroy();
    }
	
    if (this.svg) {
        this.svg.html = '';
        this.svg.destroy();
    }
	
    /* svgHtml */
    var svgHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + 'px" height="' + height + 'px" version="1.1" id="markups" style="border: 2px solid #ffff00">';
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
	
    // prevent zoom when the SVG overlay is clicked
    jQuery('#markups').mousedown(function (event) {
        //console.log(event.which);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    });
    
    // d3.js
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
		    .style('cursor', 'pointer')
            .attr('id', 'circle_' + creation)
            .on('contextmenu', function (d, i) {
                d3.event.preventDefault();
                // react on right-clicking;
                // removeCircle('circle_' + creation);
                d3.selectAll('g #' + 'circle_' + creation).remove();
            });
        
        var svgTooltip = svgCircle.append('title')    // tooltip - circle x, y
            .text(function() {
                return xPosition + ', ' + yPosition;	  
            });
    });
	

    // panel
    var panel = jQuery('#panel').show();
        panel.html(function () {
            return "<div id='panelHeader'><h4> Dot Annotation Tool </h4></div><div id='panelBody'> <ul><li>&nbsp;</li><li>&nbsp;</li><li>&nbsp;</li><li>&nbsp;</li></ul><br /><button class='btn' id='cancelDots'>Cancel</button></div>";
        });

    jQuery('#cancelDots').click(function () {
        jQuery('#panel').hide();
        annotools.drawLayer.hide();
	    annotools.svg.hide();
        annotools.addMouseEvents();
        jQuery("#drawDotButton").removeClass("active");
    });
	
}


// @deprecated
annotools.prototype.showDotTools = function() {
    
    // redirect
    window.location = 'http://129.49.249.191/camicroscope_alina/testaj/test.html';
	
}