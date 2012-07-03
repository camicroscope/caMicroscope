 // Create annotations if they are contained within our current view
function showAnnotations(iip,annot)
{
    $("layer").set({styles:{width:iip.wid+'px',height:iip.hei+'px',left:(iip.view.w-iip.wid)/2+'px',top:(iip.view.h-iip.hei)/2+'px'}});
    if( !annot ) return;
    annot.sort( function(a,b){ return (b.w*b.h)-(a.w*a.h); } );
    var svgHtml='<svg xmlns="http://www.w3.org/2000/svg" version="1.1">';
    for( var i=0; i<annot.length; i++ ){
    // Check whether iip annotation is within our view
    if( iip.wid*annot[i].annotx > iip.view.x &&
	iip.wid*annot[i].annotx < iip.view.x+iip.view.w &&
	iip.hei*annot[i].annoty > iip.view.y &&
	iip.hei*annot[i].annoty < iip.view.y+iip.view.h
	){
       for(var k=0;k<annot[i].annotdetail.length;k++)
      {
	       switch (annot[i].annotdetail[k].annotType)
	      {
		  case "rect":
		   svgHtml+='<rect x="'+iip.wid*annot[i].annotdetail[k].x+'" y="'+iip.hei*annot[i].annotdetail[k].y+'" width="'+iip.wid*annot[i].annotdetail[k].w+'" height="'+iip.wid*annot[i].annotdetail[k].h+'" stroke="black" stroke-width="2" fill="'+annot[i].annotdetail[k].color+'"/>';
		  break;
		  case "circle":
		    svgHtml+='<circle cx="'+iip.wid*annot[i].annotdetail[k].x+'" cy="'+iip.hei*annot[i].annotdetail[k].y+'" r="'+iip.wid*annot[i].annotdetail[k].r+'" stroke="black" stroke-width="2" fill="'+annot[i].annotdetail[k].color+'"/>';
		  break;
		  case "polygon":
		  var points=annot[i].annotdetail[k].points;
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
		  svgHtml+='<ellipse cx="'+iip.wid*annot[i].annotdetail[k].cx+'" cy="'+iip.hei*annot[i].annotdetail[k].cy+'" rx="'+iip.wid*annot[i].annotdetail[k].rx+'" ry="'+iip.hei*annot[i].annotdetail[k].ry+'" style="fill:yellow;stroke:purple;stroke-width:2"/>';
		  break;
		  case "svg":console.log("svg");
		  break;
		}
        }
      }
    }
      svgHtml+='</svg>';
      $("layer").set({html:svgHtml});
};
