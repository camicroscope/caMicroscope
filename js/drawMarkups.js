var ratio=0.005;//One pixel equals to the length in real situation
var maxWidth=4000;
var maxHeight=800;
IIPMooViewer.implement({ 
//Draw Markups
drawMarkups: function(type)
{
   container=this.canvas;
   //Create Markup Layer
   if($("createlayer"))
   {
        //Remove Events and Destroy the Create Layer
	$("myCanvas").removeEvent('mousedown');
	$("myCanvas").removeEvent('mouseup');
	$("myCanvas").removeEvent('mousemove');
  	$("createlayer").destroy();
   }
   var left=parseInt(container.style.left),
   top=parseInt(container.style.top),
   width=parseInt(container.style.width),
   height=parseInt(container.style.height),
   oleft=left,
   otop=top,
   owidth=width,
   oheight=height;
   if (left<0){left=0;width=window.innerWidth;}
   if (top<0){top=0;height=window.innerHeight;}
   var layer=new Element('div',{id:"createlayer",html:"",styles:{position:'absolute','z-index':1,left:left,top:top}}).inject(document.body);
   //Create Canvas on the Layer
   var canvas=new Element('canvas',{id:"myCanvas",width:width,height:height}).inject(layer);
   var ctx=canvas.getContext("2d");
   //Draw Markups on Canvas
   switch (type)
  {
      case "rect":
      //Draw Rectangles
      var started=false;
      var x,//start location x
          y,//start location y
          w,//width
          h;//height
      canvas.addEvent('mousedown',function(e){started=true;x=e.event.offsetX;y=e.event.offsetY;});
      canvas.addEvent('mousemove',function(e){ 
      if(started){
	  ctx.clearRect(0,0,canvas.width,canvas.height);
	  x=Math.min(e.event.offsetX,x);
	  y=Math.min(e.event.offsetY,y);
	  w=Math.abs(e.event.offsetX-x);
	  h=Math.abs(e.event.offsetY-y);
	  ctx.strokeStyle = color;
	  ctx.strokeRect(x,y,w,h);
    	}
      });
      canvas.addEvent('mouseup',function(e){
        started= false;
        //Save the Percentage Relative to the Picture
        x=(x+left-oleft)/owidth;
        y=(y+top-otop)/oheight;
        w=w/owidth;
        h=h/oheight;
        var tip=prompt("Please Enter Some Descriptions","");
        if (tip!=null)
        {
                //Update Annotations
		this.annotations.push({x:x,y:y,w:w,h:h,type:"rect",text:tip,color:color});  
                saveAnnotations(this.iid,this.annotations);this.updateAnnotations();this.drawMarkups(type);
        }
     }.bind(this));
     break;
     case "ellipse":
     //Draw Ellipse
     var started=false;
     var x,//start location x
          y,//start location y
          w,//width
          h;//height
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
	ctx.strokeStyle = color;
	ctx.stroke();
    	}
     });
     canvas.addEvent('mouseup',function(e){
        started= false;
        //Save the Percentage Relative to the Picture
        x=(x+left-oleft)/owidth;
        y=(y+top-otop)/oheight;
        w=w/owidth;
        h=h/oheight;
        var tip=prompt("Please Enter Some Descriptions","");
        if (tip!=null)
        {
                //Update Annotations
		this.annotations.push( {x:x,y:y,w:w,h:h,type:"ellipse",text:tip,color:color});  
                saveAnnotations(this.iid,this.annotations);this.updateAnnotations();this.drawMarkups(type);
        }
     }.bind(this));
     break;
     case "pencil":
     //Draw Pencil
     var started=false;
     var pencil=[];//The Pencil Object
     var newpoly=[];//Every Stroke is treated as a Continous Polyline
     canvas.addEvent('mousedown',function(e){ 
        started=true;
        newpoly.push( {"x":e.event.offsetX,"y":e.event.offsetY});//The percentage will be saved
	ctx.beginPath();
	ctx.moveTo(e.event.offsetX, e.event.offsetY);
	ctx.strokeStyle = color;
	ctx.stroke();
     });
     canvas.addEvent('mousemove',function(e){ 
       if(started)
       {
	     newpoly.push( {"x":e.event.offsetX,"y":e.event.offsetY});
	     ctx.lineTo(e.event.offsetX,e.event.offsetY);
	     ctx.stroke();
	}
      });
     canvas.addEvent('mouseup',function(e){ 
        started=false;
        pencil.push(newpoly);//Push the Stroke to the Pencil Object
        newpoly=[];//Clear the Stroke
        numpoint=0;//Clear the Points
	var tip=prompt("Please Enter Some Descriptions","");
	var x,y,w,h;
        x=pencil[0][0].x;
        y=pencil[0][0].y;
        var maxdistance=0;
	var points="";
	for (var i=0;i<pencil.length;i++)
	{
            newpoly=pencil[i];
            for(j=0;j<newpoly.length;j++)
            {
	   	 points+=(newpoly[j].x+left-oleft)/owidth+','+(newpoly[j].y+top-otop)/oheight+' ';
                 if (((newpoly[j].x-x)*(newpoly[j].x-x)+(newpoly[j].y-y)*(newpoly[j].y-y))>maxdistance)
                 {
                     maxdistance=((newpoly[j].x-x)*(newpoly[j].x-x)+(newpoly[j].y-y)*(newpoly[j].y-y));
                     w=Math.abs(newpoly[j].x-x)/owidth;
                     h=Math.abs(newpoly[j].y-y)/oheight;
                 }
            }
            points=points.slice(0, -1)
            points+=';';
	} 
        points=points.slice(0,-1);
        x=(x+left-oleft)/owidth;
        y=(y+top-otop)/oheight;
	if (tip!=null)
        {
	        this.annotations.push( {x:x,y:y,w:w,h:h,type:"pencil",points:points,text:tip,color:color}); 
		saveAnnotations(this.iid,this.annotations);this.updateAnnotations();this.drawMarkups(type);
        }
     }.bind(this));
     break;
     case "polyline":
        //Create Polylines
        var newpoly=[];//New Polyline
        var numpoint=0;//Number of Points
        canvas.addEvent('mousedown',function(e){ 
   	ctx.fillStyle=color;
        ctx.beginPath();
	ctx.arc(e.event.offsetX,e.event.offsetY,2,0,Math.PI*2,true);
	ctx.closePath();
	ctx.fill();
        newpoly.push( {"x":e.event.offsetX,"y":e.event.offsetY});
        if(numpoint>0)
        {
		ctx.beginPath();
		ctx.moveTo(newpoly[numpoint].x, newpoly[numpoint].y);
		ctx.lineTo(newpoly[numpoint-1].x, newpoly[numpoint-1].y);
		ctx.strokeStyle = color;
		ctx.stroke();
	}
        numpoint++;
        });
        canvas.addEvent('dblclick',function(e){
	
	ctx.beginPath();
	ctx.moveTo(newpoly[numpoint-1].x, newpoly[numpoint-1].y);
	ctx.lineTo(newpoly[0].x, newpoly[0].y);
	ctx.strokeStyle = color;
	ctx.stroke();
	var x,y,w,h;
        x=newpoly[0].x;
        y=newpoly[0].y;
        var maxdistance=0;
	var tip=prompt("Please Enter Some Descriptions","");
	var points="";
	for (var i=0;i<numpoint-1;i++)
	{
	   points+=(newpoly[i].x+left-oleft)/owidth+','+(newpoly[i].y+top-otop)/oheight+' ';
 	   if (((newpoly[i].x-x)*(newpoly[i].x-x)+(newpoly[i].y-y)*(newpoly[i].y-y))>maxdistance)
                 {
                     maxdistance=((newpoly[i].x-x)*(newpoly[i].x-x)+(newpoly[i].y-y)*(newpoly[i].y-y));
                     w=Math.abs(newpoly[i].x-x)/owidth;
                     h=Math.abs(newpoly[i].y-y)/oheight;
                 }

	} 
	points+=(newpoly[i].x+left-oleft)/owidth+','+(newpoly[i].y+top-otop)/oheight;
        x=(x+left-oleft)/owidth;
        y=(y+top-otop)/oheight;
        if(tip!=null)
        {
		this.annotations.push( {x:x,y:y,w:w,h:h,type:"polyline",points:points,text:tip,color:color}); 
		saveAnnotations(this.iid,this.annotations);this.updateAnnotations();this.drawMarkups(type); 
        }}.bind(this));
     break;
     case "measure":
     var started=false;
     var x0,y0,x1,y1;
     var length;
     var ruler=new Element('div',{id:'ruler',styles:{background:'black',position:'absolute',color:'white',width:'200px'}});;
     canvas.addEvent('mousedown',function(e){ 
       if (!started)
       {
		x0=e.event.offsetX;
		y0=e.event.offsetY;
                started=true;
                ruler.inject(this.canvas);
       }
       else
       {
		x1=e.event.offsetX;
		y1=e.event.offsetY;
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
		ctx.strokeStyle = color;
		ctx.stroke();
                ctx.closePath();
		var tip=prompt("Save This?",length);
 		if(tip!=null)
    	        {
		        x=(x0+left-oleft)/owidth;
	       	        y=(y0+top-otop)/oheight;
                        w=Math.abs(x1-x0)/owidth;
                        h=Math.abs(y1-y0)/oheight;
                        points=(x1+left-oleft)/owidth+","+(y1+top-otop)/oheight;
			this.annotations.push( {x:x,y:y,w:w,h:h,type:"line",points:points,text:tip,color:color}); 
			saveAnnotations(this.iid,this.annotations);this.updateAnnotations();this.drawMarkups(type); 
     		}
                started=false;
		$("ruler").destroy();
	}
    }.bind(this));
    canvas.addEvent('mousemove',function(e){ 
       if ( started)
       {
          	ctx.clearRect(0,0,this.wid,this.hei);
		x1=e.event.offsetX;
		y1=e.event.offsetY;
                var maxLength=(Math.sqrt(maxWidth*maxWidth+maxHeight*maxHeight));
                var screen=(Math.sqrt(owidth*owidth+oheight*oheight));
	        length=((Math.sqrt((x0-x1)*(x0-x1)+(y0-y1)*(y0-y1)))/screen)*maxLength*ratio+'mm';
                ruler.set({html:length,styles:{left:x1+left-oleft+10,top:y1+top-otop}});
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
		ctx.strokeStyle = color;
		ctx.stroke();
                ctx.closePath();
       }
    }.bind(this));
    break;
  }
}
});
