<?php 

$url = "imaging.cci.emory.edu:9099";
$url2 = "http://imaging.cci.emory.edu:9099/services/TCGABRCA_Dev";

return array(
    'auth_realm' => "$url/securityTokenService",
	
    'getAllAnnotations' => "$url2/Annotations/query/byUserAndImageID?iid=",
	
    'getAnnotationsSpatial' => "$url2/Annotations/query/byUserImageAndSpatialScope?iid=",

    'postAnnotation' => "$url2/Annotations/submit/singleAnnotation",
	
    'postJobParameters' => "$url2/AnalysisJobs/submit/singleJob",

    'getAllAnnotations' => "$url2/Annotations/query/getAnnotsByID?iid=",
	
	
    'deleteAnnotation' => "$url2/Annotations/delete/singleAnnotation?annotId=",

    'getDimensions' => "$url2/ImageMetaData/query/maxWidthAndHeightByIID?api_key=",

    'getFileLocation' => "$url2/ImageMetaData/query/fileLocationByIID?api_key=",

    'getMPP' => "$url2/ImageMetaData/query/MPPbyIID?api_key=",

    'fastcgi_server' => "/camicroscope/fastcgi-bin/iipsrv.fcgi"
	
    
);
?>
