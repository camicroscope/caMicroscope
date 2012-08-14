var newtool=function(ele,iip)
{
	var element = $(ele);//The Element to Trigger Tool Slider
	if($("slider")) $("slider").destroy();
	var slider=new Element('div',{id:'slider','class':'slider',styles:"width:180px",html:''}).inject(element);
	var rectbutton=new Element('img',{'title':'rectangle','src':'images/rect.svg',
				   'events':{
		                        'click':function(){drawMarkups('rect',iip.canvas);},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);
	var ellipsebutton=new Element('img',{'title':'ellipse','src':'images/ellipse.svg',
				   'events':{
					'click':function(){drawMarkups('ellipse',iip.canvas);},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);
	var polybutton=new Element('img',{'title':'polyline','src':'images/poly.svg',
				   'events':{
					'click':function(){drawMarkups('polyline',iip.canvas);},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);
	var pencilbutton=new Element('img',{'title':'pencil','src':'images/pencil.svg',
				   'events':{
					'click':function(){drawMarkups('pencil',iip.canvas);},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);

	var measurebutton=new Element('img',{'title':'measure','src':'images/measure.svg',
				   'events':{
					'click':function(){drawMarkups('measure',iip.canvas);},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);
	var magnifybutton=new Element('img',{'title':'magnify','src':'images/magnify.svg',
				   'events':{
					'click':function(){magnify();},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);
	var hidebutton=new Element('img',{'title':'hide','src':'images/hide.svg',
				   'events':{
					'mouseenter':function(){this.addClass('selected');iip.svg.toggle();},
					'mouseleave':function(){this.removeClass('selected');},
					'click':function(){slider.destroy();}
					   }
					}).inject(slider);
};

var magnify=function()
{
   if($("magnify")) $("magnify").destroy();
   var magnify=new Element('div',{id:"magnify",'class':"magnify"});
   var content=new Element('div',{'class':"magnified_content",styles:{width:document.getSize().x,height:document.getSize().y}});
   content.set({html:document.body.innerHTML});
   content.inject(magnify);
   magnify.inject(document.body);
   magnify.makeDraggable({
   onDrag: function(draggable){
        var left=parseInt(magnify.style.left);
        var top=parseInt(magnify.style.top);
        var scale=2.0;
        magnify.set({'styles':{left:left,top:top}});
        content.set({'styles':{left:-scale*left,top:-scale*top}});
    },
    onDrop: function(draggable){
 	$("magnify").destroy();
    }
  });
}

