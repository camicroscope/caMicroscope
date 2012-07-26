var IP="http://localhost";
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
function createPolyline(iip,annot)
{
    //Clear annotation layer html
   var newpoly=[];
   var numpoint=0;
   var layer=$("createlayer");
   layer.set({html:"",styles:{position:'absolute','z-index':1,left:iip.canvas.style.left,top:iip.canvas.style.top,visibility:'visible'}});
   var c=new Element('canvas',{id:"myCanvas",style:"background-color:grey;opacity:0.6;position:absolute;z-index:2",width:iip.wid+'px',height:iip.hei+'px'});
   c.inject(layer);
   $("myCanvas").addEvent('click',function(e){ 
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
}
function showText(text)
{
   var tiplayer=$("tiplayer");
   var newtip=new Element('a',{ style:"color:red",html:text});
   newtip.inject(tiplayer);
}
function edit(e,i)
{
    $("editlayer").set({styles:{top:e.pageY,left:e.pageX,visibility:'visible'}}); 
    $("deleteMarkup").addEvent('click',function(e){annot.splice(i,1);
						var jsonRequest = new Request.JSON({url: IP+'/bio/api/annot.php', onSuccess: function(e){
						window.location.reload();
						}}).post({'annot':annot});});  
    $("editAnnot").addEvent('click',function(e){
	$("tiplayer").set({html:'<input id="newtip" type="text" name="tip" placeholder="'+annot[i]["annotdetail"][0]["text"]+'"> <button id="update">Update</button>'}); 
        $("editlayer").set({styles:{visibility:'hidden'}});
        $("update").addEvent('click',function(e){
	annot[i]["annotdetail"][0]["text"]=$("newtip").value; 
        var jsonRequest = new Request.JSON({url: IP+'/bio/api/annot.php', onSuccess: function(e){
						window.location.reload();
						}}).post({'annot':annot});
	});
    }); 
    $("cancel").addEvent('click',function(){  $("editlayer").set({styles:{visibility:'hidden'}}); });
}
function clearText()
{
  $("tiplayer").set({html:""});
}
function createPencil(iip,annot)
{
    //Clear annotation layer html
   var started=false;
   var pencil=[];
   var newpoly=[];
   var numpoint=0;
   var layer=$("createlayer");
   layer.set({html:"",styles:{position:'absolute','z-index':1,left:iip.canvas.style.left,top:iip.canvas.style.top,visibility:'visible'}});
   var c=new Element('canvas',{id:"myCanvas",style:"background-color:grey;opacity:0.6;position:absolute;z-index:2",width:iip.wid+'px',height:iip.hei+'px'});
   c.inject(layer);
   var ctx=c.getContext("2d");
   $("myCanvas").addEvent('mousedown',function(e){ 
        started=true;
        newpoly.push( {"x":e.event.offsetX/iip.wid,"y":e.event.offsetY/iip.hei});
	ctx.beginPath();
	ctx.moveTo(newpoly[numpoint].x*iip.wid, newpoly[numpoint].y*iip.hei);
	ctx.strokeStyle = "#ff0000";
	ctx.stroke();
        numpoint++;
    });
   $("myCanvas").addEvent('mousemove',function(e){ 
        if(started)
        {
	     newpoly.push( {"x":e.event.offsetX/iip.wid,"y":e.event.offsetY/iip.hei});
	     ctx.lineTo(newpoly[numpoint].x*iip.wid, newpoly[numpoint].y*iip.hei);
	     numpoint++;
	     ctx.stroke();
	}
    });
   $("myCanvas").addEvent('mouseup',function(e){ 
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
}
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
};

//Create Pencil Tool
/*function createPencil(iip,annot)
{
  //Clear annotation layer html
  var layer=$("createlayer");
  var 
  var context,canvas;
  // The active tool instance.
  var tool;
  var tool_default = 'pencil';

  function init () {
    layer.set({styles:{position:'absolute','z-index':1,left:iip.canvas.style.left,top:iip.canvas.style.top,visibility:'visible'}});
    canvas=new Element('canvas',{id:"myCanvas",style:"background-color:grey;opacity:0.6;position:absolute;z-index:2",width:iip.wid+'px',height:iip.hei+'px'});
    canvas.inject(layer);
    context = canvas.getContext('2d');
    if (!context) {
      alert('Error: failed to getContext!');
      return;
    }
    var tool_select = $("rect");
    tool_select.addEventListener('change', ev_tool_change, false);

    // Activate the default tool.
    if (tools[tool_default]) {
      tool = new tools[tool_default]();
      tool_select.value = tool_default;
    }

    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
  }

  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
  function ev_canvas (ev) {
    if (ev.layerX || ev.layerX == 0) { // Firefox
      ev._x = ev.layerX;
      ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }

    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }
  }

  // The event handler for any changes made to the tool selector.
  function ev_tool_change (ev) {
    if (tools[this.value]) {
      tool = new tools[this.value]();
    }
  }


  // This object holds the implementation of each drawing tool.
  var tools = {};

  // The drawing pencil.
  tools.pencil = function () {
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (ev) {
        context.beginPath();
        context.moveTo(ev._x, ev._y);
        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (ev) {
      if (tool.started) {
        context.lineTo(ev._x, ev._y);
        context.stroke();
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
      }
    };
  };
  init();

};*/
//Create Rectangle Tool
function createRect(iip,annot)
{
  //Clear annotation layer html
  var layer=$("createlayer");
  var context,canvas;
  // The active tool instance.
  var tool;
  var tool_default = 'rect';

  function init () {
    layer.set({styles:{position:'absolute','z-index':1,left:iip.canvas.style.left,top:iip.canvas.style.top,visibility:'visible'}});
    canvas=new Element('canvas',{id:"myCanvas",style:"background-color:grey;opacity:0.6;position:absolute;z-index:2",width:iip.wid+'px',height:iip.hei+'px'});
    canvas.inject(layer);
    context = canvas.getContext('2d');
    if (!context) {
      alert('Error: failed to getContext!');
      return;
    }
    var tool_select = $("rect");
    tool_select.addEventListener('change', ev_tool_change, false);

    // Activate the default tool.
    if (tools[tool_default]) {
      tool = new tools[tool_default]();
      tool_select.value = tool_default;
    }

    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
  }

  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
  function ev_canvas (ev) {
    if (ev.layerX || ev.layerX == 0) { // Firefox
      ev._x = ev.layerX;
      ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }

    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }
  }

  // The event handler for any changes made to the tool selector.
  function ev_tool_change (ev) {
    if (tools[this.value]) {
      tool = new tools[this.value]();
    }
  }

  // This object holds the implementation of each drawing tool.
  var tools = {};
  // The rectangle tool.
  tools.rect = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      var x = Math.min(ev._x,  tool.x0),
          y = Math.min(ev._y,  tool.y0),
          w = Math.abs(ev._x - tool.x0),
          h = Math.abs(ev._y - tool.y0);

      context.clearRect(0, 0, canvas.width, canvas.height);

      if (!w || !h) {
        return;
      }

      context.strokeRect(x, y, w, h);
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        tool.w=ev._x-tool.x0;
        tool.h=ev._y-tool.y0;
        var x=tool.x0/iip.wid;
        var y=tool.y0/iip.hei;
        var w=tool.w/iip.wid;
        var h=tool.h/iip.hei;
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
      }
    };
  };

  init();

};

//Create Ellipse Tool
function createEllipse(iip,annot)
{
  //Clear annotation layer html
  var layer=$("createlayer");
  var context,canvas;
  // The active tool instance.
  var tool;
  var tool_default = 'ellipse';

  function init () {
    layer.set({styles:{position:'absolute','z-index':1,left:iip.canvas.style.left,top:iip.canvas.style.top,visibility:'visible'}});
    canvas=new Element('canvas',{id:"myCanvas",style:"background-color:grey;opacity:0.6;position:absolute;z-index:2",width:iip.wid+'px',height:iip.hei+'px'});
    canvas.inject(layer);
    context = canvas.getContext('2d');
    if (!context) {
      alert('Error: failed to getContext!');
      return;
    }
    var tool_select = $("ellipse");
    tool_select.addEventListener('change', ev_tool_change, false);

    // Activate the default tool.
    if (tools[tool_default]) {
      tool = new tools[tool_default]();
      tool_select.value = tool_default;
    }

    // Attach the mousedown, mousemove and mouseup event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
  }

  // The general-purpose event handler. This function just determines the mouse 
  // position relative to the canvas element.
  function ev_canvas (ev) {
    if (ev.layerX || ev.layerX == 0) { // Firefox
      ev._x = ev.layerX;
      ev._y = ev.layerY;
    } else if (ev.offsetX || ev.offsetX == 0) { // Opera
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }

    // Call the event handler of the tool.
    var func = tool[ev.type];
    if (func) {
      func(ev);
    }
  }

  // The event handler for any changes made to the tool selector.
  function ev_tool_change (ev) {
    if (tools[this.value]) {
      tool = new tools[this.value]();
    }
  }

  // This object holds the implementation of each drawing tool.
  var tools = {};
  // The rectangle tool.
  tools.ellipse = function () {
    var tool = this;
    this.started = false;

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev) {
      if (!tool.started) {
        return;
      }

      var x = Math.min(ev._x,  tool.x0),
          y = Math.min(ev._y,  tool.y0),
          w = Math.abs(ev._x - tool.x0),
          h = Math.abs(ev._y - tool.y0);

      context.clearRect(0, 0, canvas.width, canvas.height);

      if (!w || !h) {
        return;
      }
	var kappa = .5522848;
	var ox = (w / 2) * kappa; // control point offset horizontal
	var oy = (h / 2) * kappa; // control point offset vertical
	var xe = x + w;          // x-end
	var ye = y + h;           // y-end
	var xm = x + w / 2;      // x-middle
	var ym = y + h / 2;       // y-middle

	context.beginPath();
	context.moveTo(x, ym);
	context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
	context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
	context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
	context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
	context.closePath();
	context.stroke();
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        tool.w=ev._x-tool.x0;
        tool.h=ev._y-tool.y0;
        var cx=(tool.x0+tool.w/2)/iip.wid;
        var cy=(tool.y0+tool.h/2)/iip.hei;
        var rx=(tool.w/iip.wid)/2;
        var ry=(tool.h/iip.hei)/2;
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
      }
    };
  };

  init();

};


