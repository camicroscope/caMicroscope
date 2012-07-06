 // Create annotations if they are contained within our current view
function showAnnotations(iip,annot)
{
    //Clear annotation layer html
    var layer=$("annotlayer");
    layer.set({html:""});
    //Create new annotation div
    var newannot=new Element('div',{style:"position:absolute;z-index:1"});
    //Set the width/height according to the iip view and iip wid/hei
    newannot.set({styles:{width:iip.wid+'px',height:iip.hei+'px',left:(iip.view.w-iip.wid)/2+'px',top:(iip.view.h-iip.hei)/2+'px'}});
    var svgHtml='<svg xmlns="http://www.w3.org/2000/svg" version="1.1">';
    for( var i=0; i<annot.length; i++ ){
    // Check whether the annotation is within the iip view
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
		  svgHtml+='<rect onmouseover="showText(\''+annot[i].annotdetail[k].text+'\')" onmouseout="clearText()" x="'+iip.wid*annot[i].annotdetail[k].x+'" y="'+(iip.hei+iip.view.y)*annot[i].annotdetail[k].y+'" width="'+iip.wid*annot[i].annotdetail[k].w+'" height="'+(iip.hei+iip.view.y)*annot[i].annotdetail[k].h+'" stroke="black" stroke-width="2" fill="'+annot[i].annotdetail[k].color+'"/>';
		  break;
		  case "circle":
		  svgHtml+='<circle onmouseover="showText(\''+annot[i].annotdetail[k].text+'\')" onmouseout="clearText()" cx="'+(iip.wid+iip.view.x)*annot[i].annotdetail[k].x+'" cy="'+(iip.hei+iip.view.y)*annot[i].annotdetail[k].y+'" r="'+(iip.wid+iip.view.x)*annot[i].annotdetail[k].r+'" stroke="black" stroke-width="2" fill="'+annot[i].annotdetail[k].color+'"/>';
		  break;
		  case "polygon":
		  var points=annot[i].annotdetail[k].points;
		  p=String.split(points,' ');
		  svgHtml+='<polygon onmouseover="showText(\''+annot[i].annotdetail[k].text+'\')" onmouseout="clearText()" points="';
		  for (var j=0;j<p.length;j++)
		  {
		     point=String.split(p[j],',');
		     px=point[0]*(iip.wid+iip.view.x);
		     py=point[1]*(iip.hei+iip.view.y);
		     svgHtml+=px+','+py+' ';
		  }
		  svgHtml+='" style="fill:lime;stroke:purple;stroke-width:1"/>';
		  break;
		  case "ellipse":
		  svgHtml+='<ellipse onmouseover="showText(\''+annot[i].annotdetail[k].text+'\')" onmouseout="clearText()" cx="'+(iip.wid+iip.view.x)*annot[i].annotdetail[k].cx+'" cy="'+(iip.hei+iip.view.y)*annot[i].annotdetail[k].cy+'" rx="'+(iip.wid+iip.view.x)*annot[i].annotdetail[k].rx+'" ry="'+(iip.hei+iip.view.y)*annot[i].annotdetail[k].ry+'" style="fill:yellow;stroke:purple;stroke-width:2"/>';
		  break;
		}
        }
      }
    }
      svgHtml+='</svg>';
      newannot.set({html:svgHtml});
      //this is one way for svg to be displayed.For more information, can refer to stackoverflow.com/questions/3642035
      newannot.inject(layer);
};

function editAnnotation(iip,annot,i)
{ 
}

function highlightAnnotation(iip,annot,i)
{
    //Clear annotation layer html
    var layer=$("annotlayer");
    layer.set({html:""});
    console.log(annot);
    console.log(i);
    i=i-1;
    //Create new annotation div
    var newannot=new Element('div',{style:"position:absolute;z-index:1"});
    //Set the width/height according to the iip view and iip wid/hei
    newannot.set({styles:{width:iip.wid+'px',height:iip.hei+'px',left:(iip.view.w-iip.wid)/2+'px',top:(iip.view.h-iip.hei)/2+'px'}});
    var svgHtml='<svg xmlns="http://www.w3.org/2000/svg" version="1.1">';
    // Check whether the annotation is within the iip view
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
		  svgHtml+='<rect onmouseover="showText(\''+annot[i].annnotdetail[k].text+'\')" onmouseout="clearText()" x="'+(iip.wid+iip.view.x)*annot[i].annotdetail[k].x+'" y="'+(iip.hei+iip.view.y)*annot[i].annotdetail[k].y+'" width="'+(iip.wid+iip.view.x)*annot[i].annotdetail[k].w+'" height="'+(iip.hei+iip.view.y)*annot[i].annotdetail[k].h+'" stroke="black" stroke-width="2" fill="'+annot[i].annotdetail[k].color+'"/>';
		  break;
		/*  case "circle":
		  svgHtml+='<circle onmouseover="showText(\''+annot[i].annotdetail[k].text+'\')" onmouseout="clearText()" cx="'+iip.wid*annot[i].annotdetail[k].x+'" cy="'+iip.hei*annot[i].annotdetail[k].y+'" r="'+iip.wid*annot[i].annotdetail[k].r+'" stroke="black" stroke-width="2" fill="'+annot[i].annotdetail[k].color+'"/>';
		  break;
		  case "polygon":
		  var points=annot[i].annotdetail[k].points;
		  p=String.split(points,' ');
		  svgHtml+='<polygon onmouseover="showText(\''+annot[i].annotdetail[k].text+'\')" onmouseout="clearText()" points="';
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
		  svgHtml+='<ellipse onmouseover="showText(\''+annot[i].annotdetail[k].text+'\')" onmouseout="clearText()" cx="'+iip.wid*annot[i].annotdetail[k].cx+'" cy="'+iip.hei*annot[i].annotdetail[k].cy+'" rx="'+iip.wid*annot[i].annotdetail[k].rx+'" ry="'+iip.hei*annot[i].annotdetail[k].ry+'" style="fill:yellow;stroke:purple;stroke-width:2"/>';
		  break;*/
		}
        }
      }
      svgHtml+='</svg>';
      newannot.set({html:svgHtml});
      //this is one way for svg to be displayed.For more information, can refer to stackoverflow.com/questions/3642035
      newannot.inject(layer);
}
function showText(text)
{
   var tiplayer=$("tiplayer");
   var newtip=new Element('a',{ style:"color:red",html:text});
   newtip.inject(tiplayer);
}
function clearText()
{
  $("tiplayer").set({html:""});
}

