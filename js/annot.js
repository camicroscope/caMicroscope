
/* Extend IIPMooViewer to handle annotations
 */
IIPMooViewer.implement({

  /* Initialize canvas events for our annotations
   */
  initAnnotationTips: function() {

    this.annotationTip = null;
    this.annotationsVisible = true;

    // Use closure for mouseenter and mouseleave events
    var _this = this;

    // Display / hide our annotations if we have any
    if( this.annotations ){
      this.canvas.addEvent( 'mouseenter', function(){
        if( _this.annotationsVisible ){
	  _this.canvas.getElements('div.annotation').removeClass('hidden');
	}
      });
      this.canvas.addEvent( 'mouseleave', function(){
	if( _this.annotationsVisible ){
	  _this.canvas.getElements('div.annotation').addClass('hidden');
	}
      });
    }
  },


  /* Create annotations if they are contained within our current view
   */
  createAnnotations: function() {

    // Sort our annotations by size to make sure it's always possible to interact
    // with annotations within annotations
    if( !this.annotations ) return;
    this.annotations.sort( function(a,b){ return (b.w*b.h)-(a.w*a.h); } );

    for( var i=0; i<this.annotations.length; i++ ){

      // Check whether this annotation is within our view
      if( this.wid*(this.annotations[i].x+this.annotations[i].w) > this.view.x &&
	  this.wid*this.annotations[i].x < this.view.x+this.view.w &&
	  this.hei*(this.annotations[i].y+this.annotations[i].h) > this.view.y &&
	  this.hei*this.annotations[i].y < this.view.y+this.view.h
	  // Also don't show annotations that entirely fill the screen
	  //	  (this.hei*this.annotations[i].x < this.view.x && this.hei*this.annotations[i].y < this.view.y &&
	  //	   this.wid*(this.annotations[i].x+this.annotations[i].w) > this.view.x+this.view.w && 
      ){

	var cl = 'annotation';
	if( this.annotations[i].category ) cl += ' ' + this.annotations[i].category;
	var annotation = new Element('div', {
          'class': cl,
          'styles': {
            left: Math.round(this.wid * this.annotations[i].x),
            top: Math.round(this.hei * this.annotations[i].y ),
	    width: Math.round( this.wid * this.annotations[i].w ),
	    height: Math.round( this.hei * this.annotations[i].h )
	  }
        }).inject( this.canvas );

	if( this.annotationsVisible==false ) annotation.addClass('hidden');

	var text = this.annotations[i].text;
	if( this.annotations[i].title ) text = '<h1>'+this.annotations[i].title+'</h1>' + text;
        annotation.store( 'tip:text', text );
      }
    }


    if( !this.annotationTip ){
      var _this = this;
      this.annotationTip = new Tips( 'div.annotation', {
        className: 'tip', // We need this to force the tip in front of nav window
	fixed: true,
	offset: {x:30,y:30},
	hideDelay: 300,
	link: 'chain',
        onShow: function(tip,el){

	  // Fade from our current opacity to 0.9
	  tip.setStyles({
	    opacity: tip.getStyle('opacity'),
	    display: 'block'
	  }).fade(0.9);

	  // Prevent the tip from fading when we are hovering on the tip itself and not
	  // just when we leave the annotated zone
	  tip.addEvents({
	    'mouseleave':  function(){
	       this.active = false;
	       this.fade('out').get('tween').chain( function(){ this.element.setStyle('display','none'); });
	    },
	    'mouseenter': function(){ this.active = true; }
	  })
        },
        onHide: function(tip, el){
	  if( !tip.active ){
	    tip.fade('out').get('tween').chain( function(){ this.element.setStyle('display','none'); });
	    tip.removeEvents(['mouseenter','mouseleave']);
	  }
        }
      });
    }

  },


  /* Toggle visibility of any annotations
   */
  toggleAnnotations: function() {
    var els;
    if( els = this.canvas.getElements('div.annotation') ){
      if( this.annotationsVisible ){
	els.addClass('hidden');
	this.annotationsVisible = false;
	this.showPopUp( IIPMooViewer.lang.annotationsDisabled );
      }
      else{
	els.removeClass('hidden');
	this.annotationsVisible = true;
      }
    }
  },


  /* Destroy our annotations
   */
  destroyAnnotations: function() {
    if( this.annotationTip ) this.annotationTip.detach( this.canvas.getChildren('div.annotation') );
    this.canvas.getChildren('div.annotation').each(function(el){
      el.eliminate('tip:text');
      el.destroy();
    });
  }


});