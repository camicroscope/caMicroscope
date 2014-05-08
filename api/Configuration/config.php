<?php 

$url = "imaging.cci.emory.edu:9099/services/TCGABRCA_Dev";

return array(
    'auth_realm' => "$url/securityTokenService",
	
    'getAllAnnotations' => "$url/Annotations/query/byUserAndImageID?iid=",
	
    'getAnnotationsSpatial' => "$url/Annotations/query/byUserImageAndSpatialScope?iid=",

    'downloadAnnotations' => "$url/Annotations/query/byUserImageAndSpatial?iid=",

    'postAnnotation' => "$url/Annotations/submit/singleAnnotation",
	
    'postJobParameters' => "$url/AnalysisJobs/submit/singleJob",

    'deleteAnnotation' => "$url/Annotations/delete/singleAnnotation?annotId=",

    'getDimensions' => "$url/ImageMetaData/query/maxWidthAndHeghtByIID?api_key=",

    'getFileLocation' => "$url/ImageMetaData/query/fileLocationByIID?api_key=",

    'getMPP' => "$url/ImageMetaData/query/MPPbyIID?api_key=",

    'fastcgi_server' => "/camicdev/fastcgi-bin/iipsrv.fcgi"
	
    
);
?>
