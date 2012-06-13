var Spectrum = new Class({

  initialize: function(container){

    $(container).set('html', '<h2 title="<h2>Spectral Reflectance</h2>Click on any point within the image to see<br/>the spectral reflectance for that point">Spectral Reflectance</h2><h3>(click on a point on image to display)</h3><img id="loading" src="images/loading.gif"/><span id="Y0">0%</span><span id="Y50">50%</span><span id="Y100">100%</span><br/><span id="X0">400</span><span id="X50">600</span><span id="X100">800</span><br/>wavelength (nm)' );

    this.canvas = new Canvas({
      id: 'cid',
      width: $(container).getSize().x * 0.8,
	height: $(container).getSize().y * 0.75 - $$('div#'+container+' h2').getSize()[0].y*2
    });
    this.canvas.injectBefore($('Y0'));

    this.canvas.setStyle('margin-left',15);
    var cleft = this.canvas.getPosition().x;
    var cright = cleft + this.canvas.width;
    var ctop = this.canvas.getPosition().y;
    var cbottom = ctop + this.canvas.height;

    $('Y0').setStyle('left', cleft - $('Y0').getSize().x - 5);
    $('Y0').setStyle('top', cbottom - $('Y0').getSize().x/2 );
    $('Y50').setStyle('left', cleft - $('Y50').getSize().x - 5);
    $('Y50').setStyle('top', cbottom - this.canvas.height/2 - $('Y50').getSize().x/2 );
    $('Y100').setStyle('left', cleft - $('Y100').getSize().x - 5);
    $('Y100').setStyle('top', ctop - $('Y100').getSize().y/2);

    $('X0').setStyle('left',cleft - $('X0').getSize().x/2);
    $('X50').setStyle('left',cleft + this.canvas.width/2-$('X50').getSize().x/2);
    $('X100').setStyle('left',cleft + this.canvas.width-$('X100').getSize().x/2);

    $('loading').setStyles({
	left: this.canvas.getPosition().x + (this.canvas.getSize().x / 2) - 16,
	top: this.canvas.getPosition().y + (this.canvas.getSize().y / 2) - 16 
    });
    this.drawGrid();
  },

  drawGrid: function(){
    var ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height );
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(128,128,128)";
    ctx.beginPath();

    // Draw the axes
    ctx.moveTo(0,0);
    ctx.lineTo(0,this.canvas.height);
    ctx.lineTo(this.canvas.width,this.canvas.height);
    ctx.stroke();

    // Draw a grid
    ctx.beginPath();
    ctx.lineWidth = 1;

    var i, j;
    for(i=1;i<10;i++){
      ctx.moveTo(i*this.canvas.width/10,this.canvas.height);
      ctx.lineTo(i*this.canvas.width/10,0);
    }

    for(j=1;j<10;j++){
      ctx.moveTo(0,j*this.canvas.height/10);
      ctx.lineTo(this.canvas.width,j*this.canvas.height/10);
    }
    ctx.stroke();

  },

  interpolate: function( y1, y2, x ){
    var mu2 = (1-Math.cos(x*Math.PI))/2;
    return(y1*(1-mu2)+y2*mu2);
  },

    cubicInterpolate: function( y0, y1, y2, y3, x ){

	var a0,a1,a2,a3,mu2;

	mu2 = x*x;
	a0 = y3 - y2 - y0 + y1;
	a1 = y0 - y1 - a0;
	a2 = y2 - y0;
	a3 = y1;
	return(a0*x*mu2+a1*mu2+a2*x+a3);
    },

  plot: function(data){

    // Clear the canvas and redraw our grid
    this.drawGrid();

    var ctx = this.canvas.getContext('2d');

    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(0,this.canvas.height - data[0][1] * this.canvas.height);

    var n = data.length;
    var i;

    var min_x = data[0][0];
    var min_y = data[0][1];
    var max_x = data[0][0];
    var max_y = data[0][1];

    // Get our max and mins
    for (var i=0; i<n; i++) {
      if (data[i][0] > max_x) max_x = data[i][0];
      if (data[i][0] < min_x) max_x = data[i][0];
      if (data[i][1] > max_y) max_y = data[i][1];
      if (data[i][1] < min_y) min_y = data[i][1];
    }
    if( max_y < 0.75 ) max_y *= 1.33;

      // Convert points to coords and draw a line
      for( i=0; i<n; i++ ){
          var x = (data[i][0] - min_x) * this.canvas.width/min_x;
          var y = this.canvas.height - data[i][1] * this.canvas.height/max_y;
	  ctx.lineTo( x, y );
      }
      ctx.stroke();

    // Convert points to coords and draw circles at each point
    ctx.beginPath();
    for( i=0; i<n; i++ ){
      var x = (data[i][0] - min_x) * this.canvas.width/min_x;
      var y = this.canvas.height - data[i][1] * this.canvas.height/max_y;
      ctx.beginPath();
      ctx.arc( x, y, 1.5, 0, 2*Math.PI, true );
      ctx.fill();
    }


    // Now draw an interpolated line
/*    for( i=1; i<n-2; i++ ){
      var left = data[i][0];
      var right = data[i+1][0];
      for( j=0; j<1; j+=0.1 ){
	  var s = this.cubicInterpolate( data[i-1][1], data[i][1], data[i+1][1], data[i+2][1], j );
	var x = Math.round((data[i][0]+j*40 - min_x) * this.canvas.width/min_x);
	var y = Math.round(this.canvas.height - s * this.canvas.height/max_y);
	ctx.lineTo( x, y );
      }
    }
*/
    ctx.stroke();

    // Set our Y axis labels
    var cleft = this.canvas.getPosition().x;
    $('Y100').set('html', Math.round(max_y*100)+'%');
    $('Y100').setStyle('left', cleft - $('Y100').getSize().x - 5);
    $('Y50').set('html', Math.round(max_y*50)+'%');

    $('Y100').setStyle('left', cleft - $('Y100').getSize().x - 5);
    $('Y50').set('html', Math.round(max_y*50)+'%');
    $('Y50').setStyle('left', cleft - $('Y50').getSize().x - 5);
  }

});

