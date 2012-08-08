var IP='http://170.140.138.125';
function showImageMeta()
{
        myElement=$('imagePad');
        var Image = new Class({
	    initialize: function(age){
		this.patientAge = age;
	    }
	});
	var jsonRequest = new Request.JSON({url: IP+'/bio/api/image.php', onSuccess: function(imageList){
	for (var i=0;i<imageList.length;i++)
	{
	      var image = imageList[i];
              var imageElement=new Element('tr',{
              'id':"iid="+image["iid"]+"&location="+image["ImageLocation"],
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
