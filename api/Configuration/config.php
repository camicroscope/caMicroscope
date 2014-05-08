<?php 

$url = "imaging.cci.emory.edu:9099";

return array(
    'auth_realm' => "$url/securityTokenService",
	
<<<<<<< HEAD
<<<<<<< HEAD
    'getAllAnnotations' => "$url/Annotations/query/byUserAndImageID?iid=",
=======
    'getAllAnnotations' => "$url/services/TCGABreast/TCGAAnnotations/query/getAnnotsByID?iid=",
>>>>>>> parent of dd57d61... Job submit button complete. Select region for analysis and add to job manager queue.
	
    'getAnnotationsSpatial' => "$url/services/TCGABreast/TCGAAnnotations/query/getAnnotsByIDSpatial?iid=",

<<<<<<< HEAD
    'postAnnotation' => "$url/services/TCGABreast/TCGAAnnotations/submit/singleInput",
=======
    'postAnnotation' => "$url/Annotations/submit/singleAnnotation",
>>>>>>> parent of 11757e6... Added PhP scripts and code for download annotations button.
	
    'postJobParameters' => "$url/services/TCGABreast/TCGAJobManager/submit/singleInput",

<<<<<<< HEAD
    'deleteAnnotation' => "$url/Annotations/delete/singleAnnotation?annotId=",
=======
    'getAllAnnotations' => "$url/services/annotations/Annotations/query/getAnnotsByID?iid=",
	
    'postAnnotation' => "$url/services/annotations/Annotations/submit/singleInput",
	
    'deleteAnnotation' => "$url/services/annotations/Annotations/delete/deleteById?annotId=",
>>>>>>> polydev
=======
    'deleteAnnotation' => "$url/services/TCGABreast/TCGAAnnotations/delete/deleteById?annotId=",
>>>>>>> parent of dd57d61... Job submit button complete. Select region for analysis and add to job manager queue.

    'getDimensions' => "$url/services/TCGABreast/TCGABRCAImageMetaData/query/retrieveMaxWidthAndHeight?api_key=",

    'getFileLocation' => "$url/services/TCGABreast/TCGABRCAImageMetaData/query/retrieveFileLocation?api_key=",

    'getMPP' => "$url/services/TCGABreast/TCGABRCAImageMetaData/query/retrieveMPP?api_key=",

    'fastcgi_server' => "/camicroscope/fastcgi-bin/iipsrv.fcgi"
	
    
);
?>
