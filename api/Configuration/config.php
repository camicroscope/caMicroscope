<?php 

$url = "imaging.cci.emory.edu:9099";

return array(
    'auth_realm' => "$url/securityTokenService",
	
    'getAllAnnotations' => "$url/services/TCGABreast/TCGAAnnotations/query/getAnnotsByID?iid=",
	
    'getAnnotationsSpatial' => "$url/services/TCGABreast/TCGAAnnotations/query/getAnnotsByIDSpatial?iid=",

    'postAnnotation' => "$url/services/TCGABreast/TCGAAnnotations/submit/singleInput",
	
    'postJobParameters' => "$url/services/TCGABreast/TCGAJobManager/submit/singleInput",

    'deleteAnnotation' => "$url/services/TCGABreast/TCGAAnnotations/delete/deleteById?annotId=",

    'getDimensions' => "$url/services/TCGABreast/TCGABRCAImageMetaData/query/retrieveMaxWidthAndHeight?api_key=",

    'getFileLocation' => "$url/services/TCGABreast/TCGABRCAImageMetaData/query/retrieveFileLocation?api_key=",

    'getMPP' => "$url/services/TCGABreast/TCGABRCAImageMetaData/query/retrieveMPP?api_key=",

    'fastcgi_server' => "/camicroscope/fastcgi-bin/iipsrv.fcgi"
	
    
);
?>
