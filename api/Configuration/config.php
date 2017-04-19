<?php 

$baseUrl = "http://quip-data:9099";
$kueUrl = "http://quip-jobs:3000";

$serviceUrl     = "$baseUrl/services/Camicroscope_DataLoader";
$annotationsUrl = "$baseUrl/services/Camicroscope_Annotations";
$imageUrl       = "$serviceUrl/DataLoader";

$dynamicServices = $serviceUrl;

$templateUrl    = "$baseUrl/services/caMicroscope_Templates";

//$firebase = "https://test-8f679.firebaseio.com/camicroscopeStates";
//$firebase_key = "kweMPSAo4guxUXUodU0udYFhC27yp59XdTEkTSJ4";

//Optional Firebase
$firebase = "";
$firebase_key = "";

return array(
    'auth_realm' => "$baseUrl/securityTokenService",
    /*
     * temp
     */
    'algorithmsForImage' => "$annotationsUrl/MarkupsForImages/query/MarkupsAvilableForImage?",
    'getMultipleAnnotations' => "$annotationsUrl/MarkupLoader/query/getMultipleMarkups?",
    'getROI' => "$annotationsUrl/MarkupLoader/query/getROI", //Featurescape URL.
    'deleteMarkups' => "$annotationsUrl/MarkupLoader/delete/deleteMultipleMarkups",
    'firebase' => $firebase,
    'firebase_key' => $firebase_key,
    'retrieveTemplate' => "$serviceUrl/AnnotationTemplate/query/retrieveTemplate",
    'getAllAnnotations' => "$tempMarkupUrl/Annotations/query/byUserAndImageID?iid=",
    'getAnnotationsSpatial' => "$serviceUrl/GeoJSONImageMetaData/query/getMarkups?",
    'getAnnotationSpatialFilter' => "$tempMarkupUrl/Annotations/query/allByFilter?iid=",
    'postAnnotation' => "$annotationsUrl/MarkupLoader/submit/json",
    'retrieveAnnotation' => "$tempMarkupUrl/Annotations/query/byAnnotId?annotId=",
    'postJobParameters' => "$tempMarkupUrl/AnalysisJobs/submit/singleJob",
    'deleteAnnotation' => "$tempMarkupUrl/Annotations/delete/singleAnnotation?annotId=",
    
    /* Lymphocyte */
    'postAlgorithmForImage' => "$annotationsUrl/MarkupsForImages/submit/json?",
    'getAnnotationsSpatialLymph' => "$serviceUrl/GeoJSONImageMetaData/query/getMarkups?",
    'getMultipleAnnotationsWithAttr' => "$annotationsUrl/MarkupLoader/query/getMultipleMarkupsWithAttr?",
    
   /*Bindaas API for back compatible */
     'postAlgorithmForImage'           => "$annotationsUrl/MarkupsForImages/submit/json",  
     'getMultipleAnnotationsClone'     => "$annotationsUrl/MarkupLoader/query/getMultipleMarkupsClone?",     
     'deleteAnnotation'                => "$annotationsUrl/MarkupLoader/delete/DeleteByOID", 
     'deleteAnnotationWithinRectangle' => "$annotationsUrl/MarkupLoader/delete/deleteAnnotationWithinRectangle",
     'deleteAnnotationWithinRectangleClone' => "$annotationsUrl/MarkupLoader/delete/deleteAnnotationWithinRectangleClone",     
     'getPropertiesForMarkupClone'          => "$annotationsUrl/MarkupLoader/query/getPropertiesForMarkupClone?",     
    
    /* Template */
    'retrieveTemplate'      => "$templateUrl/AnnotationTemplate/query/retrieveTemplate",
    'retrieveTemplateClone' => "$templateUrl/AnnotationTemplate/query/retrieveTemplateClone",
    
    /* Image */	
    'getDimensions' => "$imageUrl/query/getDimensionsByIID?api_key=",
    'getFileLocation' => "$imageUrl/query/getFileLocationByIID?api_key=",
    'getMPP' => "$imageUrl/query/getMPPByIID?api_key=",
    'fastcgi_server' => "/fcgi-bin/iipsrv.fcgi",
  
	 /* Dynamic Services */														 
    'postWorkOrder' => "$dynamicServices/WorkOrders/submit/json",
    'kueUrl' => $kueUrl
);





?>
