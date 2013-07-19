<?php 

$url = "localhost:9099";

return array(
    'auth_realm' => "$url/securityTokenService",
	
    'getAllAnnotations' => "$url/services/annotations/Annotations/query/getAnnotsByID?iid=",
	
    'postAnnotation' => "$url/services/annotations/Annotations/submit/singleInput",
	
    'deleteAnnotation' => "$url/services/annotations/Annotations/delete/deleteById?annotId=",
	
    'getImage' => "$url/services/imageData/Images/query/retrieveMaxWidthAndHeight?Colorado_Code=",

    //'fastcgi_server' => "/camic/fastcgi-bin/iipsrv.fcgi"
    'fastcgi_server' => "/fastcgi-bin/iipsrv.fcgi"
	
    
);
?>
