 // Create svg annotations if they are contained within our current view
function showSVGAnnotations(iip,annot)
{
    //Clear annotation layer html
    var layer=$("annotlayer");
    layer.set({html:""});
    //Create new annotation div
    var newannot=new Element('div',{style:"position:absolute;z-index:1"});
    //Set the width/height according to the iip view and iip wid/hei
    newannot.set({styles:{width:iip.wid+'px',height:iip.hei+'px',left:(iip.view.w-iip.wid)/2+'px',top:(iip.view.h-iip.hei)/2+'px'}});
    var svgHtml='<svg xmlns="http://www.w3.org/2000/svg" version="1.1">';
    //svgHtml+='<g transform="translate('+iip.view.x+','+iip.view.y+')">';
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
		  svgHtml+='<rect onmouseover="showText(\''+annot[i].annotdetail[k].text+'\')" onmouseout="clearText()" x="'+Math.round(iip.wid*annot[i].annotdetail[k].x)+'" y="'+Math.round(iip.hei*annot[i].annotdetail[k].y)+'" width="'+Math.round(iip.wid*annot[i].annotdetail[k].w)+'" height="'+Math.round(iip.hei*annot[i].annotdetail[k].h)+'" stroke="black" stroke-width="2" fill="'+annot[i].annotdetail[k].color+'"/>';
                  console.log(iip.wid*annot[i].annotdetail[k].x);
		  console.log(iip.hei*annot[i].annotdetail[k].y);
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
    i=i.split("_")[1];
    //Clear annotation layer html
    var layer=$("annotlayer");
    layer.set({html:""});
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
		  svgHtml+='<rect onmouseover="showText(\''+annot[i].annotdetail[k].text+'\')" onmouseout="clearText()" x="'+Math.round(iip.wid*annot[i].annotdetail[k].x)+'" y="'+Math.round(iip.hei*annot[i].annotdetail[k].y)+'" width="'+Math.round(iip.wid*annot[i].annotdetail[k].w)+'" height="'+Math.round(iip.hei*annot[i].annotdetail[k].h)+'" stroke="black" stroke-width="2" fill="'+annot[i].annotdetail[k].color+'"/>';
                  console.log(iip.wid*annot[i].annotdetail[k].x);
		  console.log(iip.hei*annot[i].annotdetail[k].y);
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

 // Create canvas annotations if they are contained within our current view
function showCanvasAnnotations(iip,annot)
{
    //Clear annotation layer html
    var layer=$("annotlayer");
    layer.set({html:""});
    //Create new annotation div
    var newannot=new Element('canvas',{id:"mycanvas",style:"position:absolute;z-index:1"});
    //Set the width/height according to the iip view and iip wid/hei
    newannot.set({styles:{width:iip.wid+'px',height:iip.hei+'px',left:Math.round((iip.view.w-iip.wid)/2)+'px',top:Math.round((iip.view.h-iip.hei)/2)+'px'}});
    newannot.inject(layer);
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
		  var ctx=newannot.getContext("2d");
		  ctx.fillStyle=annot[i].annotdetail[k].color;
		  ctx.fillRect(10,20,30,21);
		 // try to use the relavent coordinates, however,something went wrong with the coordinate system
                 // will need to fix that later
		 /*
		  var x=Math.round(iip.wid*annot[i].annotdetail[k].x);
                  var y=Math.round(iip.hei*annot[i].annotdetail[k].y);
                  var w=Math.round(iip.wid*annot[i].annotdetail[k].w);
		  var h=Math.round(iip.hei*annot[i].annotdetail[k].h);
                  console.log(x+' '+y+' '+w+' '+h+' ');
  		  ctx.fillRect(x,y,w,h); */
		  break;
		  case "circle":
                  var ctx=newannot.getContext("2d");
		  ctx.fillStyle=annot[i].annotdetail[k].color;
		  ctx.beginPath();
		  ctx.arc(70,18,15,0,Math.PI*2,true);
		  ctx.closePath();
		  ctx.fill();
		  break;
		  case "polygon":
		  var ctx=newannot.getContext("2d");
		  ctx.fillStyle=annot[i].annotdetail[k].color;
                  ctx.beginPath();
		  ctx.moveTo(120,30);
		  ctx.lineTo(150,50);
		  ctx.lineTo(130,20);
		  ctx.stroke();
		  ctx.closePath();
		  ctx.fill();
                  break;
		  case "ellipse":
		  drawEllipse(ctx, 10, 20, 50, 40);
		  break;
		}
        }
      }
    }
};

function drawEllipse(ctx, x, y, w, h) {
  var kappa = .5522848;
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w,           // x-end
      ye = y + h,           // y-end
      xm = x + w / 2,       // x-middle
      ym = y + h / 2;       // y-middle

  ctx.beginPath();
  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  ctx.closePath();
  ctx.stroke();
}

