 // Create annotations if they are contained within our current view
function showAnnotations(iip,annot)
{
    $("layer").set({styles:{width:iip.wid+'px',height:iip.hei+'px',left:(iip.view.w-iip.wid)/2+'px',top:(iip.view.h-iip.hei)/2+'px'}});
    if( !annot ) return;
    annot.sort( function(a,b){ return (b.w*b.h)-(a.w*a.h); } );
    var svgHtml='<svg xmlns="http://www.w3.org/2000/svg" version="1.1">';
    for( var i=0; i<annot.length; i++ ){
       switch (annot[i].annotType)
      {
          case "rect":
          // Check whether iip annotation is within our view
	  if( iip.wid*(annot[i].x+annot[i].w) > iip.view.x &&
	      iip.wid*annot[i].x < iip.view.x+iip.view.w &&
	      iip.hei*(annot[i].y+annot[i].h) > iip.view.y &&
	      iip.hei*annot[i].y < iip.view.y+iip.view.h
	  ){
           svgHtml+='<rect x="'+iip.wid*annot[i].x+'" y="'+iip.hei*annot[i].y+'" width="'+iip.wid*annot[i].w+'" height="'+iip.wid*annot[i].h+'" stroke="black" stroke-width="2" fill="'+annot[i].color+'"/>';
	  }
	  break;
          case "circle":
	  if( iip.wid*(annot[i].x+annot[i].r) > iip.view.x &&
	      iip.wid*annot[i].x < iip.view.x+iip.view.w &&
	      iip.hei*(annot[i].y+annot[i].r) > iip.view.y &&
	      iip.hei*annot[i].y < iip.view.y+iip.view.h
	   ){
	    svgHtml+='<circle cx="'+iip.wid*annot[i].x+'" cy="'+iip.hei*annot[i].y+'" r="'+iip.wid*annot[i].r+'" stroke="black" stroke-width="2" fill="'+annot[i].color+'"/>';
	    }
	  break;
          case "polygon":
          var points=annot[i].points;
          p=String.split(points,' ');
          svgHtml+='<polygon points="';
          for (var j=0;j<p.length;j++)
          {
             point=String.split(p[j],',');
             px=point[0]*iip.wid;
             py=point[1]*iip.hei;
             svgHtml+=px+','+py+' ';
	  }
	  svgHtml+='" style="fill:lime;stroke:purple;stroke-width:1"/>';
          break;
          case "ellipse":
          svgHtml+='<ellipse cx="'+iip.wid*annot[i].cx+'" cy="'+iip.hei*annot[i].cy+'" rx="'+iip.wid*annot[i].rx+'" ry="'+iip.hei*annot[i].ry+'" style="fill:yellow;stroke:purple;stroke-width:2"/>';
          break;
          case "svg":console.log("svg");
	 if ( iip.wid*annot[i].x> iip.view.x &&
	  iip.wid*annot[i].x < iip.view.x+iip.view.w &&
	  iip.hei*annot[i].y > iip.view.y &&
	  iip.hei*annot[i].y < iip.view.y+iip.view.h)
	{
	}
	break;
      }
    }
      svgHtml+='</svg>';
      $("layer").set({html:svgHtml});
};
