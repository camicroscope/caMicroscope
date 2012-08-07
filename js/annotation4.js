IIPMooViewer.implement({ 
//Draw Markups
drawMarkups: function(type)
{
   //Create Markup Layer
   if($("createlayer")){$("createlayer").destroy();}
   var layer=new Element('div',{id:"createlayer",html:"",styles:{position:'absolute','z-index':1,left:this.canvas.style.left,top:this.canvas.style.top}}).inject(document.body);
   //Create Canvas on the Layer
   var canvas=new Element('canvas',{id:"myCanvas",width:this.wid+'px',height:this.hei+'px'}).inject(layer);
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
        //Save the Percentage Relative to the Picture
        x=x/this.wid;
        y=y/this.hei;
        w=w/this.wid;
        h=h/this.hei;
        var tip=prompt("Please Enter Some Descriptions","");
        if (tip!=null)
        {
                //Update Annotations
		this.annotations.push( {x:x,y:y,w:w,h:h,type:"rect",text:tip});  
                this.createAnnotations();
                //Save Annotations
                this.saveAnnotations();
        }
        //Remove Events and Destroy the Create Layer
	$("myCanvas").removeEvent('mousedown');
	$("myCanvas").removeEvent('mouseup');
	$("myCanvas").removeEvent('mousemove');
  	$("createlayer").destroy();
     }.bind(this));
     break;
     case "ellipse":
     //Draw Ellipse
     var started=false;
     var x,//start location x
          y,//start location y
          w,//width
          h;//height
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
        //Save the Percentage Relative to the Picture
        x=x/this.wid;
        y=y/this.hei;
        w=w/this.wid;
        h=h/this.hei;
        var tip=prompt("Please Enter Some Descriptions","");
        if (tip!=null)
        {
            //Update Annotations
	    this.annotations.push( {x:x,y:y,w:w,h:h,type:'ellipse',text:tip});   
            this.createAnnotations(); 
            //Save Annotations
            this.saveAnnotations();
        }
        //Remove Events and Destroy the Create Layer
	$("myCanvas").removeEvent('mousedown');
	$("myCanvas").removeEvent('mouseup');
	$("myCanvas").removeEvent('mousemove');
        $("createlayer").destroy();
     }.bind(this));
     break;
     case "pencil":
     //Draw Pencil
     var started=false;
     var pencil=[];//The Pencil Object
     var newpoly=[];//Every Stroke is treated as a Continous Polyline
     var numpoint=0;//Number of Points in Every Stroke
     var ctx=canvas.getContext("2d");
     canvas.addEvent('mousedown',function(e){ 
        started=true;
        newpoly.push( {"x":e.event.offsetX/this.wid,"y":e.event.offsetY/this.hei});//The percentage will be saved
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
        pencil.push(newpoly);//Push the Stroke to the Pencil Object
        newpoly=[];//Clear the Stroke
        numpoint=0;//Clear the Points
        //Remove Events and Destroy the Create Layer
	$("myCanvas").removeEvent('mousedown');
	$("myCanvas").removeEvent('mouseup');
	$("myCanvas").removeEvent('mousemove');
     });
    //Create the layer for Adding Text Descriptions.
    if($("tip")){$("tip").destroy();}
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
        this.saveAnnotations();
        //Remove Events and Destroy the Create Layer
	$("myCanvas").removeEvent('mousedown');
	$("myCanvas").removeEvent('mouseup');
	$("myCanvas").removeEvent('mousemove');
        $("createlayer").destroy();
        $("tip").destroy();
       }.bind(this));
     $("finish").addEvent('click',function(){ 
        //Remove Events and Destroy the Create Layer
	$("myCanvas").removeEvent('mousedown');
	$("myCanvas").removeEvent('mouseup');
	$("myCanvas").removeEvent('mousemove');
        $("createlayer").destroy();
        $("tip").destroy();
	});
     break;
     case "polyline":
        //Create Polylines
        var newpoly=[];//New Polyline
        var numpoint=0;//Number of Points
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
        //Create the layer for Adding Text Descriptions.
	if($("tip")){$("tip").destroy();}
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
        this.saveAnnotations();
        //Remove Events and Destroy the Create Layer
	$("myCanvas").removeEvent('mousedown');
	$("myCanvas").removeEvent('mouseup');
	$("myCanvas").removeEvent('mousemove');
        $("createlayer").destroy();
        $("tip").destroy();
       }.bind(this));
	$("finish").addEvent('click',function(){ 
        //Remove Events and Destroy the Create Layer
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
     var ratio=5.00;//One pixel equals to the length in real situation
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
		ctx.strokeStyle = "#ff0000";
		ctx.stroke();
                ctx.closePath();
		$("myCanvas").removeEvent('mousedown');
		$("myCanvas").removeEvent('mouseup');
		$("myCanvas").removeEvent('mousemove');
       	        $("createlayer").destroy();
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
                var screen=(Math.sqrt(this.wid*this.wid+this.hei*this.hei));
		var length=(Math.sqrt((x0-x1)*(x0-x1)+(y0-y1)*(y0-y1)))/screen*ratio+'mm';
                ruler.set({html:length,styles:{left:x1,top:y1}});
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
},
//Save Annotations
saveAnnotations:function()
{
      var IP="http://localhost";
      var jsonRequest = new Request.JSON({url: IP+'/bio/api/annot2.php', onSuccess: function(e){
		console.log("saved");
		}}).post({'annot':this.annotations});
}
});

IIPMooViewer.implement({
    initAnnotationTips: function () {
        this.annotationTip = null;
        this.annotationsVisible = !0;
        var a = this;
        this.annotations && (this.canvas.addEvent("mouseenter", function () {
            a.annotationsVisible && a.canvas.getElements("div.annotation").removeClass("hidden");
        }), this.canvas.addEvent("mouseleave", function () {
            a.annotationsVisible && a.canvas.getElements("div.annotation").addClass("hidden")
        }))
    },
    createAnnotations: function () {
        if (this.annotations) {
            var a = [], b;
            for (b in this.annotations) this.annotations[b].id = b, a.push(this.annotations[b]);
            if (0 != a.length) {
                a.sort(function (a, b) {
                    return b.w * b.h - a.w * a.h
                });
               //This part is for displaying SVG annotations
                if(this.annotationsVisible)
               {
		var svgHtml='<svg xmlns="http://www.w3.org/2000/svg" version="1.1">';
                for (b = 0; b < a.length; b++) if (this.wid * (parseFloat(a[b].x) + parseFloat(a[b].w)) > this.view.x && this.wid * parseFloat(a[b].x) < this.view.x + this.view.w && this.hei * (parseFloat(a[b].y) + parseFloat(a[b].h)) > this.view.y && this.hei * parseFloat(a[b].y) < this.view.y + this.view.h) {
                    var c = this, d = "annotation";
                    a[b].category && (d += " " + a[b].category);
		    switch (a[b].type)
		    {
			  case "rect":
			  svgHtml+='<rect x="'+this.wid*a[b].x+'" y="'+this.hei*a[b].y+'" width="'+this.wid*a[b].w+'" height="'+this.hei*a[b].h+'" stroke="black" stroke-width="2" fill="none"/>';
			  break;
			  case "ellipse":
		          var cx=parseFloat(a[b].x)+parseFloat(a[b].w)/2;
			  var cy=parseFloat(a[b].y)+parseFloat(a[b].h)/2;
			  var rx=parseFloat(a[b].w)/2;
			  var ry=parseFloat(a[b].h)/2;
			  svgHtml+='<ellipse cx="'+this.wid*cx+'" cy="'+this.hei*cy+'" rx="'+this.wid*rx+'" ry="'+this.hei*ry+'" style="fill:none;stroke:purple;stroke-width:1"/>';
                          break;
			  case "pencil":
	 		  var points=a[b].points;
			  var poly=String.split(points,';');
			  for (var k=0;k<poly.length;k++)
			  {
			     var p=String.split(poly[k],' ');
			     svgHtml+='<polyline points="';         
		             for (var j=0;j<p.length;j++)
		             {
				  point=String.split(p[j],',');
				  px=point[0]*this.wid;
				  py=point[1]*this.hei;
				  svgHtml+=px+','+py+' ';
		             }
			     svgHtml+='" style="fill:none;stroke:red;stroke-width:1"/>';
			  }
			  break;
			  case "polyline":
 			  var points=a[b].points;
			  var poly=String.split(points,';');
			  for (var k=0;k<poly.length;k++)
			  {
			     var p=String.split(poly[k],' ');
			     svgHtml+='<polyline points="';         
		             for (var j=0;j<p.length;j++)
		             {
				  point=String.split(p[j],',');
				  px=point[0]*this.wid;
				  py=point[1]*this.hei;
				  svgHtml+=px+','+py+' ';
		             }
			     svgHtml+='" style="fill:none;stroke:red;stroke-width:1"/>';
			  }
			  break;
		    }
                    d = (new Element("div", {
                        id: a[b].id,
                        "class": d,
                        styles: {
                            left: Math.round(this.wid * a[b].x),
                            top: Math.round(this.hei * a[b].y),
                            width: Math.round(this.wid * a[b].w),
                            height: Math.round(this.hei * a[b].h)
                        }
		    })).inject(this.canvas);
                    !1 == this.annotationsVisible && d.addClass("hidden");
                    "function" == typeof this.editAnnotation && (!0 == a[b].edit ? this.editAnnotation(d) : (c = this, d.addEvent("dblclick", function (a) {
                        (new DOMEvent(a)).stop();
                        c.editAnnotation(this)
                    })));
                    var e = a[b].text;
                    a[b].title && (e = "<h1>" + a[b].title + "</h1>" + e);
                    d.store("tip:text", e)
                }
		 svgHtml+='</svg>';
                 //inject the SVG Annotations to this.Canvas
           	 this.svg = (new Element("div", {
                 styles: {
                     position:"absolute",
                     left: 0,
                     top: 0,
                     width: '100%',
                     height: '100%'
                   },
	     	   html:svgHtml
	        })).inject(this.canvas);

               }
                this.annotationTip || (c = this, this.annotationTip = new Tips("div.annotation", {
                    className: "tip",
                    fixed: !0,
                    offset: {
                        x: 30,
                        y: 30
                    },
                    hideDelay: 300,
                    link: "chain",
                    onShow: function (a) {
                        a.setStyles({
                            opacity: a.getStyle("opacity"),
                            display: "block"
                        }).fade(0.9);
                        a.addEvents({
                            mouseleave: function () {
                                this.active = !1;
                                this.fade("out").get("tween").chain(function () {
                                    this.element.setStyle("display", "none")
                                })
                            },
                            mouseenter: function () {
                                this.active = !0
                            }
                        })
                    },
                    onHide: function (a) {
                        a.active || (a.fade("out").get("tween").chain(function () {
                            this.element.setStyle("display", "none")
                        }), a.removeEvents(["mouseenter", "mouseleave"]))
                    }
                }))
            }
        }
    },
    toggleAnnotations: function () {
        var a;
        if (a = this.canvas.getElements("div.annotation")) this.annotationsVisible ? (a.addClass("hidden"),
        this.annotationsVisible = !1, this.showPopUp(IIPMooViewer.lang.annotationsDisabled)) : (a.removeClass("hidden"), this.annotationsVisible = !0);
        //toggle the SVG as well, however this.svg.toggle();doesn't work:(
        if(this.svg.style.visibility!='hidden') this.svg.set({styles:{visibility:'hidden'}});
        else this.svg.set({styles:{visibility:'visible'}});
    },
    destroyAnnotations: function () {
        this.annotationTip && this.annotationTip.detach(this.canvas.getChildren("div.annotation"));
        if(this.svg)this.svg.destroy();
        this.canvas.getChildren("div.annotation").each(function (a) {
            a.eliminate("tip:text");
            a.destroy()
        })
    }
});
