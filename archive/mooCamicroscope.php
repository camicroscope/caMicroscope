<?php require '../authenticate.php';
if(!isset($_SESSION['username']) || empty($_SESSION['username'])) {
echo '<pre>';
var_dump($_SESSION);
echo '</pre>';
}
else {
?>

	<!DOCTYPE html>
	<html lang="en" >

	 <head>
	  <meta charset="utf-8" />
	  <meta name="DC.creator" content="Ruven Pillay &lt;ruven@users.sourceforge.netm&gt;"/>
	  <meta name="DC.title" content="IIPMooViewer 2.0: HTML5 High Resolution Image Viewer"/>
	  <meta name="DC.subject" content="IIPMooViewer; IIPImage; Visualization; HTML5; Ajax; High Resolution; Internet Imaging Protocol; IIP"/>
	  <meta name="DC.description" content="IIPMooViewer is an advanced javascript HTML5 image viewer for streaming high resolution scientific images"/>
	  <meta name="DC.rights" content="Copyright &copy; 2003-2012 Ruven Pillay"/>
	  <meta name="DC.source" content="http://iipimage.sourceforge.net"/>
	  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
	  <meta name="apple-mobile-web-app-capable" content="yes" />
	  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	  <meta http-equiv="X-UA-Compatible" content="IE=9" />
	  <link rel="stylesheet" type="text/css" media="all" href="css/iip.css" />
	  <link rel="stylesheet" type="text/css" media="all" href="css/annotools.css" />
	  <link rel="stylesheet" type="text/css" media="all" href="css/bootstrap.css" />
	<!--[if lt IE 10]>
	  <link rel="stylesheet" type="text/css" media="all" href="css/ie.compressed.css" />
	<![endif]-->

	  <link rel="shortcut icon" href="images/iip-favicon.png" />
	  <link rel="apple-touch-icon" href="images/iip.png" />

	  <title>IIPMooViewer 2.0 :: HTML5 High Resolution Image Viewer</title>
	  <script type="text/javascript" src="js/mootools/mootools-core-1.4.5-full-nocompat-yc.js"></script>
	  <script type="text/javascript" src="js/mootools/mootools-more-1.4.0.1-compressed.js"></script>
          <script src="js/dependencies/jquery.js"></script>
    
	  <script type="text/javascript" src="js/dependencies/iipmooviewer-2.0.js"></script>
	  <script type="text/javascript" src="js/dependencies/MD5.js"></script>
	  <script type="text/javascript" src="js/imagemetadatatools/mooImageMetadata.js"></script>
	  <script type="text/javascript" src="js/annotationtools/mooAnnotationTools.js"></script>

	  <script>
	    var server='/camicroscope/fastcgi-bin/iipsrv.fcgi';
	    // The *full* image path on the server. This path does *not* need to be in the web
	    // server root directory. On Windows, use Unix style forward slash paths without
	    // the "c:" prefix
	      function getURLParameter(name) {
		 return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
	    } 

	    function gup( name )
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
	    

	    var tissueId = gup("tissueId");
	    
	    //var iid = "<?php print_r($_REQUEST['iid']); ?>";
	    console.log(tissueId);
	    
	    var imagedata=new ImageMetadata({imageId:tissueId});
	    var MaxDimension = imagedata.metaData[0];
	    var temp = imagedata.metaData[1];
	    var temp2 = temp[0];
	    var image = temp2["File Location"];
    var annotool=new Annotations('tool',{left:'60px',width: '270px',height:'30px',top:'45px',canvas:'canvas',iid:tissueId,MaxDimension:MaxDimension});
    if(gup('maxWidth'))annotool.maxWidth=gup('maxWidth');
    if(gup('maxHeight'))annotool.maxHeight=gup('maxHeight');
    if(gup('ratio'))annotool.ratio=gup('ratio');
    console.log("Test");
    // Copyright or information message
    var credit = '&copy; copyright or information message';
    var iip= new IIPMooViewer( "viewer", {
				image: image,
				server: server,
				credit: credit
			    });
  </script>
  <style type="text/css">
    body{
	height: 100%;
	padding: 0;
	margin: 0;
    }
    div#viewer{
	height: 100%;
	min-height: 100%;
	width: 100%;
	position: absolute;
	top: 0;
	left: 0;
	margin: 0;
	padding: 0;
    }	
  </style>

 </head>

 <body>
   <div id="im"></div>
   <div id="viewer"></div>
   <div id="tool"></div>
   <input type="hidden" id="username" name="username" value="<? print_r($_SESSION['username']); ?>" />
   <div id="meta" class="slider" style="position:absolute;width:100%;height:15px;bottom:0%;color:white;z-index:5">
        <hr id="v_toggle"/>
        <div id="metadata"></div>
   </div>
 </body>
</html>
<?php } ?>
