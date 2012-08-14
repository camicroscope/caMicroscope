var newtool=function(ele,iip)
{
	var element = $(ele);//The Element to Trigger Tool Slider
	if($("slider")) $("slider").destroy();
	var slider=new Element('div',{id:'slider','class':'slider',styles:"width:150px",html:''}).inject(element);
	var rectbutton=new Element('img',{'title':'rectangle','src':'images/rect.svg',
				   'events':{
		                        'click':function(){iip.drawMarkups('rect');},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);
	var ellipsebutton=new Element('img',{'title':'ellipse','src':'images/ellipse.svg',
				   'events':{
					'click':function(){iip.drawMarkups('ellipse');},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);
	var polybutton=new Element('img',{'title':'polyline','src':'images/poly.svg',
				   'events':{
					'click':function(){iip.drawMarkups('polyline');},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);
	var pencilbutton=new Element('img',{'title':'pencil','src':'images/pencil.svg',
				   'events':{
					'click':function(){iip.drawMarkups('pencil');},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);

	var measurebutton=new Element('img',{'title':'measure','src':'images/measure.svg',
				   'events':{
					'click':function(){iip.drawMarkups('measure');},
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
   var magnify=new Element('div',{id:"magnify",'class':"magnify"}).inject(document.body);
   iip.svg.hide();iip.canvas.getElements("div.annotation").hide();
   iip.canvas.getElements("img.layer0").addEvent('mousemove',function(e){ $("magnify").set({styles:{left:e.event.screenX-50,top:e.event.screenY-100},html:'<img width="200" src="'+this.src+'"/>'});});
   iip.canvas.addEvent('mousedown',function(){iip.svg.show();iip.canvas.getElements("div.annotation").show();if($("magnify")) $("magnify").destroy();});
}
