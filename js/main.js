var IP='http://localhost/bio';
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
