var IP='http://localhost';
function showImageMeta()
{
        myElement=$('imagePad');
        var Image = new Class({
	    initialize: function(age){
		this.patientAge = age;
	    }
	});
	var jsonRequest = new Request.JSON({url: IP+'/bio/api/test.php', onSuccess: function(imageList){
	for (var i=0;i<imageList.length;i++)
	{
	      var image = imageList[i];
              var imageElement=new Element('tr',{
              'class':'imageInfo',
              html:'<td>'+image["PatientName"]+'</td><td>'+image["PatientAge"]+'</td><td>'+image["ImageModality"]+'</td>',
	      events:{'click':function(){displayImage(image["ImageLocation"])},'mouseover':function(){highlight(this)}}
	      });
              imageElement.inject(myElement);
	}
	}}).get();
}
function highlight(selected)//lightlight the selected row.
{
$$('tr.imageInfo').setStyles({color: 'black'});
selected.style.color="blue";
}
function displayImage(imagelocation)//disply image according to the image location
{
   window.location="view3.html?"+imagelocation;
}

