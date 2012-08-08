window.addEvent('domready', function() {
        var myElement = $("meta");
	myElement.set('tween', {
	    duration: 'long',
	    transition: 'bounce:out',
	    link: 'cancel'
	});
	$('v_toggle').addEvent('mouseover',function(event){
	  event.stop();
	  if($("meta").style.height=='15px')
	  {     
		myElement.tween('height', 15, 100);
		var jsonRequest = new Request.JSON({url: IP+'/bio/api/image.php', onSuccess: function(imageList){
		moreImage(imageList,0);}}).get();
	  }
	  else
	  {
	     myElement.tween('height', 100, 15);
	     $("metadata").set('html','');
	  }
	});
});
function displayImage(url)//disply image according to the image location
{
   var url="viewer.html?"+url;
   window.location=url;
}
function moreImage(imageList,k)
{
	var metadata=$("metadata");
	$("metadata").set('html','');
	if(k>=9)
	{
	     var imageElement=new Element('div',{
		      'class':'imageInfo',
	              'style':'position:absolute;width:10%;left:2%',
		      html:'<<',
		      events:{'click':function(){moreImage(imageList,k-9);},'mouseenter':function(){this.addClass('imgselected')},'mouseleave':function(){this.removeClass('imgselected')}}
		      });
		imageElement.inject(metadata);
	}
	if(imageList.length<(k+9))
	{
		for (var i=k;i<imageList.length;i++)
		{
		      var image = imageList[i];
		      var imageElement=new Element('ul',{
                      'id':"iid="+image["iid"]+"&location="+image["ImageLocation"],
		      'class':'imageInfo',
	              'style':'position:absolute;width:10%;left:'+((i-k)*10+5)+'%',
		      html:'<li class="patientname">'+image["PatientName"]+'</li><li class="patientage">'+image["PatientAge"]+'</li><li class="modality">'+image["ImageModality"]+'</li>',
		      events:{'click':function(){displayImage(this.id);},'mouseenter':function(){this.addClass('imgselected')},'mouseleave':function(){this.removeClass('imgselected')}}
		      });
		      imageElement.inject(metadata);
		}
	}
	else
	{
	
		for (var i=k;i<(k+9);i++)
		{
		      var image = imageList[i];
		      var imageElement=new Element('ul',{
                      'id':"iid="+image["iid"]+"&location="+image["ImageLocation"],
		      'class':'imageInfo',
	              'style':'position:absolute;width:10%;left:'+((i-k)*10+5)+'%',
		      html:'<li class="patientname">'+image["PatientName"]+'</li><li class="patientage">'+image["PatientAge"]+'</li><li class="modality">'+image["ImageModality"]+'</li>',
		      events:{'click':function(){displayImage(this.id)},'mouseenter':function(){this.addClass('imgselected')},'mouseleave':function(){this.removeClass('imgselected')}}
		      });
		      imageElement.inject(metadata);
		}
	        var imageElement=new Element('div',{
		      'class':'imageInfo',
	              'style':'position:absolute;width:10%;left:95%',
		      html:'>>',
		      events:{'click':function(){moreImage(imageList,k+9);},'mouseenter':function(){this.addClass('imgselected')},'mouseleave':function(){this.removeClass('imgselected')}}
		      });
		imageElement.inject(metadata);
	}
}
