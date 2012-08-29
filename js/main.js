/*
Copyright (C) 2012 Shaohuan Li <shaohuan.li@gmail.com>, Ashish Sharma <ashish.sharma@emory.edu>
This file is part of Biomedical Image Viewer developed under the Google of Summer of Code 2012 program.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
var IP='http://170.140.138.125';
function showImageMeta()
{
        //show the image meta data
        myElement=$('imagePad');
        var Image = new Class({
	    initialize: function(age){
		this.patientAge = age;
	    }
	});
        //get image meta data from the URL
	var jsonRequest = new Request.JSON({url: IP+'/api/image.php', onSuccess: function(imageList){
	for (var i=0;i<imageList.length;i++)
	{
	      var image = imageList[i];
              var imageElement=new Element('tr',{
              'id':"iid="+image["iid"]+"&location="+image["ImageLocation"]+"&maxHeight="+image["maxHei"]+"&maxWidth="+image["maxWid"]+"&ratio="+image["ratio"],
              'class':'imageInfo',
              html:'<td>'+image["PatientName"]+'</td><td>'+image["PatientAge"]+'</td><td>'+image["ImageModality"]+'</td>',
	      events:{'click':function(){displayImage(this.id)},'mouseenter':function(){this.addClass('selected');},'mouseleave':function(){this.removeClass('selected');}}
	      });
              imageElement.inject(myElement);
	}
	}}).get();
}
function displayImage(url)//disply image according to the image location
{
   var url="viewer.html?"+url;
   window.location=url;
}
