 // Create annotations if they are contained within our current view
function showAnnotations(iip,annot)
{
    // Sort our annotations by size to make sure it's always possible to interact
    // with annotations within annotations
    if( !annot ) return;
    annot.sort( function(a,b){ return (b.w*b.h)-(a.w*a.h); } );

    for( var i=0; i<annot.length; i++ ){
       console.log(annot[i]);
       switch (annot[i].annotType)
      {
          case "rect": console.log("rect");
                 // Check whether iip annotation is within our view
      if( iip.wid*(annot[i].x+annot[i].w) > iip.view.x &&
	  iip.wid*annot[i].x < iip.view.x+iip.view.w &&
	  iip.hei*(annot[i].y+annot[i].h) > iip.view.y &&
	  iip.hei*annot[i].y < iip.view.y+iip.view.h
      ){
	var annotation = new Element('svg', {
         'id':'svg1',
          'xmlns': 'http://www.w3.org/2000/svg',
          'version':'1.1'
        }).inject( iip.canvas );
        var svg1=document.getElementById('svg1');
         var rect = new Element('rect', {
         'x':iip.wid*annot[i].x,
          'y':iip.hei*annot[i].y,
          'width': iip.wid*annot[i].w,
           'height':iip.hei*annot[i].h,
           'fill':annot[i].color,
           'stroke':'black'
        }).inject(svg1 );
      }
	break;
          case "circle":console.log("circle");
   console.log(annot[i]);
       switch (annot[i].annotType)
      {
          case "rect": console.log("rect");
                 // Check whether iip annotation is within our view
      if( iip.wid*(annot[i].x+annot[i].r) > iip.view.x &&
	  iip.wid*annot[i].x < iip.view.x+iip.view.w &&
	  iip.hei*(annot[i].y+annot[i].r) > iip.view.y &&
	  iip.hei*annot[i].y < iip.view.y+iip.view.h
      ){
	var annotation = new Element('svg', {
         'id':'svg2',
          'xmlns': 'http://www.w3.org/2000/svg',
          'version':'1.1'
        }).inject( iip.canvas );
        var svg1=document.getElementById('svg2');
         var circle = new Element('circle', {
         'x':iip.wid*annot[i].x+iip.wid*annot[i].r,
          'y':iip.hei*annot[i].y+iip.wid*annot[i].r,
          'r': iip.wid*annot[i].r,
          'fill':annot[i].color,
          'stroke':'black'
        }).inject(svg2 );
      }
	break;
          case "svg":console.log("svg");
	if ( iip.wid*annot[i].x> iip.view.x &&
	  iip.wid*annot[i].x < iip.view.x+iip.view.w &&
	  iip.hei*annot[i].y > iip.view.y &&
	  iip.hei*annot[i].y < iip.view.y+iip.view.h)
	{
           var annotation = new Element('img', {
          'class': 'annotation',
          'styles': {
            left: Math.round(iip.wid * annot[i].x),
            top: Math.round(iip.hei * annot[i].y ),
            width: iip.view.res/annot[i].res*annot[i].width
	  },
          'src': annot[i].svgsrc
        }).inject( iip.canvas );
	}
	break;
      }
    }
};
