<?php 


$baseUrl = "http://quip-data:9099";
$kueUrl  = "http://quip-jobs:3000";

$serviceUrl     = "$baseUrl/services/Camicroscope_DataLoader";
$annotationsUrl = "$baseUrl/services/Camicroscope_Annotations";

$lysdgdsfgsdgUrl= "$baseUrl/services/Lysfdgsdfgdsg";

$templateUrl    = "$baseUrl/services/caMicroscope_Templates";

$imageUrl = "$serviceUrl/DataLoader";

$dynamicServices = $serviceUrl;


//Optional Firebase
$firebase = "";
$firebase_key = "";

return array(
    'auth_realm' => "$baseUrl/securityTokenService",
   
    /* Markups */
    'algorithmsForImage'     => "$annotationsUrl/MarkupsForImages/query/MarkupsAvilableForImage?",
    
    'getMultipleAnnotations' => "$annotationsUrl/MarkupLoader/query/getMultipleMarkups?",
    'deleteMarkups'          => "$annotationsUrl/MarkupLoader/delete/deleteMultipleMarkups",
    'postAnnotation'         => "$annotationsUrl/MarkupLoader/submit/json",
    'getROI'                 => "$annotationsUrl/MarkupLoader/query/getROI",
    
    /*Bindaas API for back compatible */
     'postAlgorithmForImage'           => "$annotationsUrl/MarkupsForImages/submit/json",      
     'getMultipleAnnotationsClone'     => "$annotationsUrl/MarkupLoader/query/getMultipleMarkupsClone?",     
     'deleteAnnotation'                => "$annotationsUrl/MarkupLoader/delete/DeleteByOID",
     'deleteAnnotationWithinRectangle' => "$annotationsUrl/MarkupLoader/delete/deleteAnnotationWithinRectangle", 
	 
	 /* Template */
    'retrieveTemplate'      => "$templateUrl/AnnotationTemplate/query/retrieveTemplate",
    'retrieveTemplateClone' => "$templateUrl/AnnotationTemplate/query/retrieveTemplateClone",    
     

    /* Image */
    'getDimensions'   => "$imageUrl/query/getDimensionsByIID?api_key=",
    'getFileLocation' => "$imageUrl/query/getFileLocationByIID?api_key=",
    'getMPP'          => "$imageUrl/query/getMPPByIID?api_key=",
    'fastcgi_server'  => "/fcgi-bin/iipsrv.fcgi",
    
    
     /* Dynamic Services */
    'postWorkOrder' => "$dynamicServices/WorkOrders/submit/json",
    'kueUrl' => $kueUrl,

     'firebase'=> $firebase,
     'firebase_key'=> $firebase_key
);





?>
