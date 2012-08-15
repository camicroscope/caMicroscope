var color='purple';
var newtool=function(ele,iip)
{
	var element = $(ele);//The Element to Trigger Tool Slider
	if($("slider")) $("slider").destroy();
	var slider=new Element('div',{id:'slider','class':'slider',html:''}).inject(element);
	var rectbutton=new Element('img',{'title':'rectangle','width':'19px','src':'images/rect.svg',
				   'events':{
		                        'click':function(){iip.drawMarkups('rect');},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);
	var ellipsebutton=new Element('img',{'title':'ellipse','width':'19px','src':'images/ellipse.svg',
				   'events':{
					'click':function(){iip.drawMarkups('ellipse');},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);
	var polybutton=new Element('img',{'title':'polyline','width':'19px','src':'images/poly.svg',
				   'events':{
					'click':function(){iip.drawMarkups('polyline');},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);
	var pencilbutton=new Element('img',{'title':'pencil','width':'19px','src':'images/pencil.svg',
				   'events':{
					'click':function(){iip.drawMarkups('pencil');},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);
	var colorbutton=new Element('img',{'title':'Change Color','width':'19px','src':'images/color.svg',
				   'events':{
		                        'click':function(){selectColor(slider);},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);
	var measurebutton=new Element('img',{'title':'measure','width':'19px','src':'images/measure.svg',
				   'events':{
					'click':function(){iip.drawMarkups('measure');},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);
	var magnifybutton=new Element('img',{'title':'magnify','width':'19px','src':'images/magnify.svg',
				   'events':{
					'click':function(){magnify();},
					'mouseenter':function(){this.addClass('selected');},
					'mouseleave':function(){this.removeClass('selected');}
					   }
					}).inject(slider);
	var hidebutton=new Element('img',{'title':'hide','width':'19px','src':'images/hide.svg',
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
var selectColor=function(element)
{
	if($("color")) $("color").destroy();
	var colorContainer=new Element('div',{id:'color'}).inject(element);
        var blackColor=new Element('img',{'width':'19px','height':'19px','title':'black',	
				'styles':{'background-color':'black'},
				'events':{'mouseeneter':function(){this.addClass('selected');},
					  'mouseleave':function(){this.removeClass('selected');},
                                           'click':function(){color='black';$("color").destroy();}
					 }}).inject(colorContainer);
	var redColor=new Element('img',{'width':'19px','height':'19px','title':'Default',
				'styles':{'background-color':'red'},
				'events':{'mouseeneter':function(){this.addClass('selected');},
					  'mouseleave':function(){this.removeClass('selected');},
                                           'click':function(){color='red';$("color").destroy();}
					 }}).inject(colorContainer);
	var blueColor=new Element('img',{'width':'19px','height':'19px','title':'blue',	
				'styles':{'background-color':'blue'},
				'events':{'mouseeneter':function(){this.addClass('selected');},
					  'mouseleave':function(){this.removeClass('selected');},
                                           'click':function(){color='blue';$("color").destroy();}
					 }}).inject(colorContainer);
	var greenColor=new Element('img',{'width':'19px','height':'19px','title':'lime',	
				'styles':{'background-color':'lime'},
				'events':{'mouseeneter':function(){this.addClass('selected');},
					  'mouseleave':function(){this.removeClass('selected');},
                                           'click':function(){color='lime';$("color").destroy();}
					 }}).inject(colorContainer);
	var purpleColor=new Element('img',{'width':'19px','height':'19px','title':'purple',	
				'styles':{'background-color':'purple'},
				'events':{'mouseeneter':function(){this.addClass('selected');},
					  'mouseleave':function(){this.removeClass('selected');},
                                           'click':function(){color='purple';$("color").destroy();}
					 }}).inject(colorContainer);
	var orangeColor=new Element('img',{'width':'19px','height':'19px','title':'orange',	
				'styles':{'background-color':'orange'},
				'events':{'mouseeneter':function(){this.addClass('selected');},
					  'mouseleave':function(){this.removeClass('selected');},
                                           'click':function(){color='orange';$("color").destroy();}
					 }}).inject(colorContainer);
	var yellowColor=new Element('img',{'width':'19px','height':'19px','title':'yellow',	
				'styles':{'background-color':'yellow'},
				'events':{'mouseeneter':function(){this.addClass('selected');},
					  'mouseleave':function(){this.removeClass('selected');},
                                           'click':function(){color='yellow';$("color").destroy();}
					 }}).inject(colorContainer);
	var pinkColor=new Element('img',{'width':'19px','height':'19px','title':'pink',	
				'styles':{'background-color':'pink'},
				'events':{'mouseeneter':function(){this.addClass('selected');},
					  'mouseleave':function(){this.removeClass('selected');},
                                           'click':function(){color='pink';$("color").destroy();}
					 }}).inject(colorContainer);
        
}

