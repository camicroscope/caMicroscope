var IP="http://localhost";
var ratio=0.005;
//Ratio 1 pixels equals to how long(in mm) in real case
// Create svg annotations if they are contained within our current view
function showSVGAnnotations(iip,annot)
{
    //Clear annotation layer html
    var layer=$("annotlayer");
    //Set the width/height according to the iip view and iip wid/hei
    layer.set({html:"",styles:{position:'absolute','z-index':1,width:iip.wid+'px',height:iip.hei+'px',left:iip.canvas.style.left,top:iip.canvas.style.top}});
    var svgHtml='<svg xmlns="http://www.w3.org/2000/svg" version="1.1">';
    //svgHtml+='<g transform="translate('+iip.view.x+','+iip.view.y+')">';
    for( var i=0; i<annot.length; i++ ){
    // Check whether the annotation is within the iip view
    if( iip.wid*annot[i].annotx > iip.view.x &&
	iip.wid*annot[i].annotx < iip.view.x+iip.view.w &&
	iip.hei*annot[i].annoty > iip.view.y &&
	iip.hei*annot[i].annoty < iip.view.y+iip.view.h
	){
	       switch (annot[i].annotdetail.annotType)
	      {
		  case "rect":
		  svgHtml+='<rect onmouseover="edit(event,'+i+'); showText(\''+annot[i].annotdetail.text+'\')" onmouseout="clearText()" x="'+iip.wid*annot[i].annotdetail.x+'" y="'+iip.hei*annot[i].annotdetail.y+'" width="'+iip.wid*annot[i].annotdetail.w+'" height="'+iip.hei*annot[i].annotdetail.h+'" stroke="black" stroke-width="2" fill="'+annot[i].annotdetail.color+'"/>';
		  break;
		  case "circle":
		  svgHtml+='<circle onmouseover="showText(\''+annot[i].annotdetail.text+'\')" onmouseout="clearText()" cx="'+iip.wid*annot[i].annotdetail.x+'" cy="'+iip.hei*annot[i].annotdetail.y+'" r="'+iip.wid*annot[i].annotdetail.r+'" stroke="black" stroke-width="2" fill="'+annot[i].annotdetail.color+'"/>';
		  break;
		  case "polygon":
		  var points=annot[i].annotdetail.points;
		  p=String.split(points,' ');
		  svgHtml+='<polygon onmouseover="showText(\''+annot[i].annotdetail.text+'\')" onmouseout="clearText()" points="';
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
		  svgHtml+='<ellipse onmouseover="edit(event,'+i+'); showText(\''+annot[i].annotdetail.text+'\')" onmouseout="clearText()" cx="'+iip.wid*annot[i].annotdetail.cx+'" cy="'+iip.hei*annot[i].annotdetail.cy+'" rx="'+iip.wid*annot[i].annotdetail.rx+'" ry="'+iip.hei*annot[i].annotdetail.ry+'" style="fill:none;stroke:purple;stroke-width:2"/>';
		  break;
 		  case "polyline":
		  var points=annot[i].annotdetail.points;
		  p=String.split(points,' ');
		  svgHtml+='<polyline onmouseover="edit(event,'+i+');showText(\''+annot[i].annotdetail.text+'\')" onmouseout="clearText()" points="';
		  for (var j=0;j<p.length;j++)
		  {
		     point=String.split(p[j],',');
		     px=point[0]*iip.wid;
		     py=point[1]*iip.hei;
		     svgHtml+=px+','+py+' ';
		  }
		  svgHtml+='" style="fill:none;stroke:red;stroke-width:1"/>';
		  break;
		  case "pencil":
		  var points=annot[i].annotdetail.points;
		  poly=String.split(points,';');
		  for (var k=0;k<poly.length;k++)
		  {
		     p=String.split(poly[k],' ');
		     svgHtml+='<polyline onmouseover="edit(event,'+i+');showText(\''+annot[i].annotdetail.text+'\')" onmouseout="clearText()" points="';         
                     for (var j=0;j<p.length;j++)
                     {
			  point=String.split(p[j],',');
			  px=point[0]*iip.wid;
			  py=point[1]*iip.hei;
			  svgHtml+=px+','+py+' ';
                     }
		     svgHtml+='" style="fill:none;stroke:red;stroke-width:1"/>';
		  }
		  break;
		}
      }
    }
      svgHtml+='</svg>';
      layer.set({html:svgHtml});
      //this is one way for svg to be displayed.For more information, can refer to stackoverflow.com/questions/3642035
};

function create(iip,annot,type)
{
   var layer;
   var c;
   if($("createlayer")) 
   { 
     layer=$("createlayer");
     c=$("myCanvas");
   }
   else 
   {
      layer=new Element('div',{id:"createlayer",html:"",styles:{position:'absolute','z-index':1,left:iip.canvas.style.left,top:iip.canvas.style.top,visibility:'visible'}});
      layer.inject(document.body);
      c=new Element('canvas',{id:"myCanvas",style:"background-color:grey;opacity:0.6;position:absolute;z-index:2",width:iip.wid+'px',height:iip.hei+'px'});
      c.inject(layer);
   }
   switch (type)
  {
     case "rect":
    var started=false;
    var x,y,w,h;
    var ctx=c.getContext("2d");
    c.addEvent('mousedown',function(e){started=true;x=e.event.offsetX;y=e.event.offsetY;this.removeEvents('mousedown');});
    c.addEvent('mousemove',function(e){ 
    if(started){
          ctx.clearRect(0,0,c.width,c.height);
          x=Math.min(e.event.offsetX,x);
          y=Math.min(e.event.offsetY,y);
          w=Math.abs(e.event.offsetX-x);
          h=Math.abs(e.event.offsetY-y);
          ctx.strokeRect(x,y,w,h);
    	}
    });
    c.addEvent('mouseup',function(e){
        started= false;
        x=x/iip.wid;
        y=y/iip.hei;
        w=w/iip.wid;
        h=h/iip.hei;
        var tip=prompt("Please Enter Some Descriptions","");
        if ((tip!=null)&&(tip!=""))
        {
	    annot.push( {annotid:1,annotx:x,annoty:y,annotdetail:{annotType:"rect",x:x, y:y,w:w,h:h,color:"none",text:tip}});   
	    var jsonRequest = new Request.JSON({url: IP+'/bio/api/annot.php', onSuccess: function(e){
	    window.location.reload();}}).post({'annot':annot});
        }
        else
        {
            window.location.reload();
        }
        this.removeEvents('mouseup');
    });
     break;
     case "ellipse":
    var started=false;
    var x,y,w,h;
    var ctx=c.getContext("2d");
    c.addEvent('mousedown',function(e){started=true;x=e.event.offsetX;y=e.event.offsetY;this.removeEvents('mousedown');});
    c.addEvent('mousemove',function(e){ 
    if(started){
          ctx.clearRect(0,0,c.width,c.height);
          x=Math.min(e.event.offsetX,x);
          y=Math.min(e.event.offsetY,y);
          w=Math.abs(e.event.offsetX-x);
          h=Math.abs(e.event.offsetY-y);
          var kappa = .5522848;
	var ox = (w / 2) * kappa; // control point offset horizontal
	var oy = (h / 2) * kappa; // control point offset vertical
	var xe = x + w;          // x-end
	var ye = y + h;           // y-end
	var xm = x + w / 2;      // x-middle
	var ym = y + h / 2;       // y-middle

	ctx.beginPath();
	ctx.moveTo(x, ym);
	ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
	ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
	ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
	ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
	ctx.closePath();
	ctx.stroke();
    	}
    });
    c.addEvent('mouseup',function(e){
        started= false;
        var cx=(x+w/2)/iip.wid;
        var cy=(y+h/2)/iip.hei;
        var rx=(w/iip.wid)/2;
        var ry=(h/iip.hei)/2;
        var tip=prompt("Please Enter Some Descriptions","");
        if ((tip!=null)&&(tip!=""))
        {
		annot.push( {annotid:1,annotx:cx,annoty:cy,annotdetail:{annotType:"ellipse",cx:cx, cy:cy,rx:rx,ry:ry,color:"none",text:tip}});   
		var jsonRequest = new Request.JSON({url: IP+'/bio/api/annot.php', onSuccess: function(e){
		window.location.reload();
		}}).post({'annot':annot});
        }
        else
        {
            window.location.reload();
        }
        this.removeEvents('mouseup');
   
    });
     break;
     case "pencil":
   var started=false;
   var pencil=[];
   var newpoly=[];
   var numpoint=0;
   var ctx=c.getContext("2d");
   c.addEvent('mousedown',function(e){ 
        started=true;
        newpoly.push( {"x":e.event.offsetX/iip.wid,"y":e.event.offsetY/iip.hei});
	ctx.beginPath();
	ctx.moveTo(newpoly[numpoint].x*iip.wid, newpoly[numpoint].y*iip.hei);
	ctx.strokeStyle = "#ff0000";
	ctx.stroke();
        numpoint++;
    });
   c.addEvent('mousemove',function(e){ 
        if(started)
        {
	     newpoly.push( {"x":e.event.offsetX/iip.wid,"y":e.event.offsetY/iip.hei});

	     ctx.lineTo(newpoly[numpoint].x*iip.wid, newpoly[numpoint].y*iip.hei);
	     numpoint++;
	     ctx.stroke();
	}
    });
   c.addEvent('mouseup',function(e){ 
        started=false;
        pencil.push(newpoly);
        newpoly=[];
        numpoint=0;
    });
    $("tiplayer").set({html:'<input id="newtip" type="text" name="tip" placeholder="Add Tips"> <button id="save">save</button><button id="finish">finish/cancel</button>'});
    $("save").addEvent('click',function(){ 
	var text=$("newtip").value;
	var points="";
	for (var i=0;i<pencil.length;i++)
	{
            newpoly=pencil[i];
            for(j=0;j<newpoly.length;j++)
	    points+=newpoly[j].x+','+newpoly[j].y+' ';
            points=points.slice(0, -1)
            points+=';';
	} 
        points=points.slice(0,-1);
	annot.push( {annotid:i,annotx:pencil[0][0].x,annoty:pencil[0][0].y,annotdetail:{annotType:"pencil",points:points,color:"yellow",text:text}});   
	var jsonRequest = new Request.JSON({url: IP+'/bio/api/annot.php', onSuccess: function(e){
	window.location.reload();
	}}).post({'annot':annot});});

	$("finish").addEvent('click',function(){ 
	$("tiplayer").set({html:""});
	$("createlayer").set({styles:{visibility:'hidden'}});
	showSVGAnnotations(iip,annot); 
	$("annotlayer").set({styles:{visibility:'visible'}});});
     break;
     case "poly":
 //Clear annotation layer html
   var newpoly=[];
   var numpoint=0;
   c.addEvent('mousedown',function(e){ 
	var ctx=c.getContext("2d");
   	ctx.fillStyle="#FF0000";
        ctx.beginPath();
	ctx.arc(e.event.offsetX,e.event.offsetY,2,0,Math.PI*2,true);
	ctx.closePath();
	ctx.fill();
        newpoly.push( {"x":e.event.offsetX/iip.wid,"y":e.event.offsetY/iip.hei});
        if(numpoint>0)
        {
		ctx.beginPath();
		ctx.moveTo(newpoly[numpoint].x*iip.wid, newpoly[numpoint].y*iip.hei);
		ctx.lineTo(newpoly[numpoint-1].x*iip.wid, newpoly[numpoint-1].y*iip.hei);
		ctx.strokeStyle = "#ff0000";
		ctx.stroke();
	}
        numpoint++;
    });
	$("tiplayer").set({html:'<input id="newtip" type="text" name="tip" placeholder="Add Tips"> <button id="save">save</button><button id="finish">finish/cancel</button>'});
	$("save").addEvent('click',function(){ 
	var text=$("newtip").value;
	var points="";
	for (var i=0;i<numpoint-1;i++)
	{
	   points+=newpoly[i].x+','+newpoly[i].y+' ';
	} 
	points+=newpoly[i].x+','+newpoly[i].y;
	annot.push( {annotid:i,annotx:newpoly[0].x,annoty:newpoly[0].y,annotdetail:{annotType:"polyline",points:points,color:"yellow",text:text}});   
	var jsonRequest = new Request.JSON({url: IP+'/bio/api/annot.php', onSuccess: function(e){
	window.location.reload();
	}}).post({'annot':annot});});
	$("finish").addEvent('click',function(){ 
	$("tiplayer").set({html:""});
	$("createlayer").set({styles:{visibility:'hidden'}});
	showSVGAnnotations(iip,annot); 
	$("annotlayer").set({styles:{visibility:'visible'}});});
     break;
     case "measure":
     var started=false;
     var ctx=c.getContext("2d");
     var x0,y0,x1,y1;
     c.addEvent('mousedown',function(e){ 
       if (!started)
       {
		x0=e.event.offsetX;
		y0=e.event.offsetY;
                started=true;
       }
       else
       {
		x1=e.event.offsetX;
		y1=e.event.offsetY;
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
		ctx.strokeStyle = "#ff0000";
		ctx.stroke();
                ctx.closePath();
                alert((Math.sqrt((x0-x1)*(x0-x1)+(y0-y1)*(y0-y1)))*ratio+"mm");
                started=false;
	}
    });
    c.addEvent('mousemove',function(e){ 
       if ( started)
       {
          	ctx.clearRect(0,0,iip.wid,iip.hei);
		x1=e.event.offsetX;
		y1=e.event.offsetY;
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
		ctx.strokeStyle = "#ff0000";
		ctx.stroke();
                ctx.closePath();
                
       }
    });
    break;
  }
}
function showText(text)
{
   var tiplayer=$("tiplayer");
   var newtip=new Element('a',{ style:"color:red",html:text});
   newtip.inject(tiplayer);
}
function edit(e,i)
{
    $("editlayer").set({styles:{top:e.pageY,left:e.pageX}}); 
    $("deleteMarkup").addEvent('click',function(e){annot.splice(i,1);
						var jsonRequest = new Request.JSON({url: IP+'/bio/api/annot.php', onSuccess: function(e){
						window.location.reload();
						}}).post({'annot':annot});});  
    $("editAnnot").addEvent('click',function(e){
	$("tiplayer").set({html:'<input id="newtip" type="text" name="tip" placeholder="'+annot[i]["annotdetail"][0]["text"]+'"> <button id="update">Update</button>'}); 
        $("editlayer").toggle();
        $("update").addEvent('click',function(e){
	annot[i]["annotdetail"][0]["text"]=$("newtip").value; 
        var jsonRequest = new Request.JSON({url: IP+'/bio/api/annot.php', onSuccess: function(e){
						window.location.reload();
						}}).post({'annot':annot});
	});
    }); 
    $("cancel").addEvent('click',function(){  $("editlayer").toggle();});
    $("deleteMarkup").removeEvent('click');
    $("editAnnot").removeEvent('click');
}
function clearText()
{
  $("tiplayer").set({html:""});
}

