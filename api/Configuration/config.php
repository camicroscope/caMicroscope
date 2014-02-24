<?php 

$url = "imaging.cci.emory.edu:9099";

return array(
    'auth_realm' => "$url/securityTokenService",
	
    'getAllAnnotations' => "$url/services/annotations/Annotations/query/getAnnotsByID?iid=",
	
    'postAnnotation' => "$url/services/annotations/Annotations/submit/singleInput",
	
    'deleteAnnotation' => "$url/services/annotations/Annotations/delete/deleteById?annotId=",

    'getDimensions' => "$url/services/TCGABreast/TCGABRCAImageMetaData/query/retrieveMaxWidthAndHeight?api_key=",

    'getFileLocation' => "$url/services/TCGABreast/TCGABRCAImageMetaData/query/retrieveFileLocation?api_key=",

    'fastcgi_server' => "/camic/fastcgi-bin/iipsrv.fcgi"
	
    
);
?>
