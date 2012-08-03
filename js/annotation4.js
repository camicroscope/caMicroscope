IIPMooViewer.implement({ drawMarkups: function(type)
{
   if($("createlayer")){$("createlayer").destroy();}
   var layer=new Element('div',{id:"createlayer",html:"",styles:{position:'absolute','z-index':1,left:this.canvas.style.left,top:this.canvas.style.top,visibility:'visible'}}).inject(document.body);
   var canvas=new Element('canvas',{id:"myCanvas",width:this.wid+'px',height:this.hei+'px'}).inject(layer);
   switch (type)
  {
     case "rect":
    var started=false;
    var x,y,w,h;
    var ctx=canvas.getContext("2d");
    canvas.addEvent('mousedown',function(e){started=true;x=e.event.offsetX;y=e.event.offsetY;});
    canvas.addEvent('mousemove',function(e){ 
    if(started){
          ctx.clearRect(0,0,canvas.width,canvas.height);
          x=Math.min(e.event.offsetX,x);
          y=Math.min(e.event.offsetY,y);
          w=Math.abs(e.event.offsetX-x);
          h=Math.abs(e.event.offsetY-y);
          ctx.strokeRect(x,y,w,h);
    	}
    });
    canvas.addEvent('mouseup',function(e){
        started= false;
        x=x/this.wid;
        y=y/this.hei;
        w=w/this.wid;
        h=h/this.hei;
        var tip=prompt("Please Enter Some Descriptions","");
        if (tip!=null)
        {
		this.annotations.push( {x:x,y:y,w:w,h:h,type:"rect",text:tip});   
                this.createAnnotations();
        }
	$("myCanvas").removeEvent('mousedown');
	$("myCanvas").removeEvent('mouseup');
	$("myCanvas").removeEvent('mousemove');
  	$("createlayer").destroy();
    }.bind(this));
     break;
     case "ellipse":
    var started=false;
    var x,y,w,h;
    var ctx=canvas.getContext("2d");
    canvas.addEvent('mousedown',function(e){started=true;x=e.event.offsetX;y=e.event.offsetY;});
    canvas.addEvent('mousemove',function(e){ 
    if(started){
        ctx.clearRect(0,0,canvas.width,canvas.height);
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
    canvas.addEvent('mouseup',function(e){
        started= false;
        x=x/this.wid;
        y=y/this.hei;
        w=w/this.wid;
        h=h/this.hei;
        var tip=prompt("Please Enter Some Descriptions","");
        if (tip!=null)
        {
	    this.annotations.push( {x:x,y:y,w:w,h:h,type:'ellipse',text:tip});   
            this.createAnnotations(); 
        }
	$("myCanvas").removeEvent('mousedown');
	$("myCanvas").removeEvent('mouseup');
	$("myCanvas").removeEvent('mousemove');
        $("createlayer").destroy();
    }.bind(this));
     break;
     case "pencil":
   var started=false;
   var pencil=[];
   var newpoly=[];
   var numpoint=0;
   var ctx=canvas.getContext("2d");
   canvas.addEvent('mousedown',function(e){ 
        started=true;
        newpoly.push( {"x":e.event.offsetX/this.wid,"y":e.event.offsetY/this.hei});
	ctx.beginPath();
	ctx.moveTo(newpoly[numpoint].x*this.wid, newpoly[numpoint].y*this.hei);
	ctx.strokeStyle = "#ff0000";
	ctx.stroke();
        numpoint++;
    }.bind(this));
   canvas.addEvent('mousemove',function(e){ 
        if(started)
        {
	     newpoly.push( {"x":e.event.offsetX/this.wid,"y":e.event.offsetY/this.hei});
	     ctx.lineTo(newpoly[numpoint].x*this.wid, newpoly[numpoint].y*this.hei);
	     numpoint++;
	     ctx.stroke();
	}
    }.bind(this));
   canvas.addEvent('mouseup',function(e){ 
        started=false;
        pencil.push(newpoly);
        newpoly=[];
        numpoint=0;
    });
    var tiplayer=new Element('div',{id:'tip','class':'tiplayer',html:'<input id="newtip" type="text" name="tip" placeholder="Add Tips"> <button id="save">save</button><button id="finish">Cancel</button>'}).inject(document.body);
    $("save").addEvent('click',function(){ 
        var x,y,w,h;
        x=pencil[0][0].x;
        y=pencil[0][0].y;
        var maxdistance=0;
	var tip=$("newtip").value;
	var points="";
	for (var i=0;i<pencil.length;i++)
	{
            newpoly=pencil[i];
            for(j=0;j<newpoly.length;j++)
            {
	   	 points+=newpoly[j].x+','+newpoly[j].y+' ';
                 if (((newpoly[j].x-x)*(newpoly[j].x-x)+(newpoly[j].y-y)*(newpoly[j].y-y))>maxdistance)
                 {
                     maxdistance=((newpoly[j].x-x)*(newpoly[j].x-x)+(newpoly[j].y-y)*(newpoly[j].y-y));
                     w=Math.abs(newpoly[j].x-x);
                     h=Math.abs(newpoly[j].y-y);
                 }
            }
            points=points.slice(0, -1)
            points+=';';
	} 
        points=points.slice(0,-1);
	this.annotations.push( {x:x,y:y,w:w,h:h,type:"pencil",points:points,text:tip}); 
        this.createAnnotations(); 
	$("myCanvas").removeEvent('mousedown');
	$("myCanvas").removeEvent('mouseup');
	$("myCanvas").removeEvent('mousemove');
        $("createlayer").destroy();
        $("tip").destroy();
       }.bind(this));
	$("finish").addEvent('click',function(){ 
	$("myCanvas").removeEvent('mousedown');
	$("myCanvas").removeEvent('mouseup');
	$("myCanvas").removeEvent('mousemove');
        $("createlayer").destroy();
        $("tip").destroy();
	});
     break;
     case "polyline":
 //Clear annotation layer html
   var newpoly=[];
   var numpoint=0;
   canvas.addEvent('mousedown',function(e){ 
	var ctx=canvas.getContext("2d");
   	ctx.fillStyle="#FF0000";
        ctx.beginPath();
	ctx.arc(e.event.offsetX,e.event.offsetY,2,0,Math.PI*2,true);
	ctx.closePath();
	ctx.fill();
        newpoly.push( {"x":e.event.offsetX/this.wid,"y":e.event.offsetY/this.hei});
        if(numpoint>0)
        {
		ctx.beginPath();
		ctx.moveTo(newpoly[numpoint].x*this.wid, newpoly[numpoint].y*this.hei);
		ctx.lineTo(newpoly[numpoint-1].x*this.wid, newpoly[numpoint-1].y*this.hei);
		ctx.strokeStyle = "#ff0000";
		ctx.stroke();
	}
        numpoint++;
    }.bind(this));
	var tiplayer=new Element('div',{id:'tip','class':'tiplayer',html:'<input id="newtip" type="text" name="tip" placeholder="Add Tips"> <button id="save">save</button><button id="finish">Cancel</button>'}).inject(document.body);
	$("save").addEvent('click',function(){ 
        var x,y,w,h;
        x=newpoly[0].x;
        y=newpoly[0].y;
        var maxdistance=0;
	var tip=$("newtip").value;
	var points="";
	for (var i=0;i<numpoint-1;i++)
	{
	   points+=newpoly[i].x+','+newpoly[i].y+' ';
	} 
	points+=newpoly[i].x+','+newpoly[i].y;
	w=Math.abs(newpoly[i].x-x);
        h=Math.abs(newpoly[i].y-y);
	this.annotations.push( {x:x,y:y,w:w,h:h,type:"polyline",points:points,text:tip}); 
        this.createAnnotations(); 
	$("myCanvas").removeEvent('mousedown');
	$("myCanvas").removeEvent('mouseup');
	$("myCanvas").removeEvent('mousemove');
        $("createlayer").destroy();
        $("tip").destroy();
       }.bind(this));
	$("finish").addEvent('click',function(){ 
	$("myCanvas").removeEvent('mousedown');
	$("myCanvas").removeEvent('mouseup');
	$("myCanvas").removeEvent('mousemove');
        $("createlayer").destroy();
        $("tip").destroy();
	});
     break;
     case "measure":
     var started=false;
     var ctx=canvas.getContext("2d");
     var x0,y0,x1,y1;
     var ratio=0.05;
     canvas.addEvent('mousedown',function(e){ 
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
    canvas.addEvent('mousemove',function(e){ 
       if ( started)
       {
          	ctx.clearRect(0,0,this.wid,this.hei);
		x1=e.event.offsetX;
		y1=e.event.offsetY;
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
		ctx.strokeStyle = "#ff0000";
		ctx.stroke();
                ctx.closePath();
                
       }
    }.bind(this));
    break;
  }
}
});
