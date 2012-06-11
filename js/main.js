var IP = "http://localhost";
//============================ get image metadata list ====================================
function getImageList(callback)//get the json data from the URL
{
    
    var url = IP+"/bio/api/image.php";
    var jqxhr = $.getJSON(url, function(data) 
    {
        handleImageListData(data,callback);
    })
  
    .error(function() { 
        console.log("Fails in get image meta data"); 
        imageList  = new Array();
        callback(imageList); 
    })
}
function handleImageListData(data,callback)//get the javascript object from the json data
{
    imageList  = new Array();
    imageListArray = data;
    for (var i=0;i<imageListArray.length;i++)
    {
        var image = imageListArray[i];
        var temp = new Object();
        temp.PatientName = image["PatientName"];
        temp.PatientAge = image["PatientAge"];
        temp.ImageModality = image["ImageModality"];
        temp.ImageLocation = image["ImageLocation"];
        imageList[i] = temp;
    }
    callback(imageList);
}

function showImageMeta(imageList)//Show each image meta data in a row
{
   for (i=0;i<imageList.length;i++)
   {
       $('#imagePad').append('<tr class="imageInfo" onmouseover="highlight(this)" onclick="displayImage(\''+imageList[i]["ImageLocation"]+'\')"><td>'+imageList[i]["PatientName"]+"</td><td>"+imageList[i]["PatientAge"]+"</td><td>"+imageList[i]["ImageModality"]+"</td></tr>");
   }
}
function highlight(x)//lightlight the selected row.
{
$('.imageInfo').css("color","black" );
x.style.color="blue";
}
function displayImage(imagelocation)//disply image according to the image location
{
   console.log(imagelocation);
}