/*
Copyright (C) 2012 Shaohuan Li <shaohuan.li@gmail.com>, Ashish Sharma <ashish.sharma@emory.edu>
This file is part of Biomedical Image Viewer developed under the Google of Summer of Code 2012 program.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
var IP="http://170.140.138.125";
window.addEvent('domready', function() {
        //Add The Image meta data slider at the bottom
        var myElement = $("meta");
        //Add a Horizontal line at the bottom
        myElement.set({html:'<hr id="v_toggle"/><div id="metadata"></div>'});
        myElement.addClass("vslider");
	myElement.set('tween', {
	    duration: 'long',
	    transition: 'bounce:out',
	    link: 'cancel'
	});
	$('v_toggle').addEvent('mouseover',function(event){
	  event.stop();
	  if($("meta").style.height=='15px')
	  {     
                //Slide Up
		myElement.tween('height', 15, 100);
                //Get the Image Data
		var jsonRequest = new Request.JSON({url: IP+'/api/image.php', onSuccess: function(imageList){
		moreImage(imageList,0);}}).get();
	  }
	  else
	  {
		//Slide Down
		myElement.tween('height', 100, 15);
		$("metadata").set('html','');
	  }
	});
});
function gup( name )//Parse the URL 
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}
function displayImage(url)//disply image according to the image location
{
   var url="viewer.html?"+url;
   window.location=url;
}
function moreImage(imageList,k)//Get More Images
{
	var metadata=$("metadata");
	$("metadata").set('html','');
	if(k>=9)
	{
             //Previous Image Set Controller
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
                //Display the Image Meta Data
		for (var i=k;i<imageList.length;i++)
		{
		      var image = imageList[i];
		      var imageElement=new Element('ul',{
                      'id':"iid="+image["iid"]+"&location="+image["ImageLocation"]+"&maxHeight="+image["maxHei"]+"&maxWidth="+image["maxWid"]+"&ratio="+image["ratio"],
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
                      'id':"iid="+image["iid"]+"&location="+image["ImageLocation"]+"&maxHeight="+image["maxHei"]+"&maxWidth="+image["maxWid"]+"&ratio="+image["ratio"],
		      'class':'imageInfo',
	              'style':'position:absolute;width:10%;left:'+((i-k)*10+5)+'%',
		      html:'<li class="patientname">'+image["PatientName"]+'</li><li class="patientage">'+image["PatientAge"]+'</li><li class="modality">'+image["ImageModality"]+'</li>',
		      events:{'click':function(){displayImage(this.id)},'mouseenter':function(){this.addClass('imgselected')},'mouseleave':function(){this.removeClass('imgselected')}}
		      });
		      imageElement.inject(metadata);
		}
                //Next Image Set Controller
	        var imageElement=new Element('div',{
		      'class':'imageInfo',
	              'style':'position:absolute;width:10%;left:95%',
		      html:'>>',
		      events:{'click':function(){moreImage(imageList,k+9);},'mouseenter':function(){this.addClass('imgselected')},'mouseleave':function(){this.removeClass('imgselected')}}
		      });
		imageElement.inject(metadata);
	}
}
