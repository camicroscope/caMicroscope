<?php 


///new
$baseUrl = "http://127.0.0.1:9099";
$serviceUrl = "$baseUrl/services/Camicroscope3-QA";

$imageUrl = "$serviceUrl/ImageMetaData";

$templateUrl = "$serviceUrl/AnnotationTemplate";
$markupUrl = "$serviceUrl/Annotations";

$dynamicServices = $serviceUrl;
$firebase = "https://test-8f679.firebaseio.com/camicroscopeStates";
$firebase_key = "kweMPSAo4guxUXUodU0udYFhC27yp59XdTEkTSJ4";

$tempMarkupUrl = "http://localhost:9099/services/TCGABRCA_Dev";

return array(
    'auth_realm' => "$baseUrl/securityTokenService",
    /*
     * temp
     */
    'algorithmsForImage' => "$serviceUrl/Provenance/query/getAlgorithmsForImage?",
    'getMultipleAnnotations' => "$serviceUrl/Markups/query/getMultipleMarkups?",
    //'getMultipleAnnotations' => "http://172.17.0.2:9099/services/Camicroscope_Annotations/MarkupLoader/query/getMultipleMarkups?",


    'firebase' => $firebase,
    'firebase_key' => $firebase_key,
    'retrieveTemplate' => "$serviceUrl/AnnotationTemplate/query/retrieveTemplate",
    'getAllAnnotations' => "$tempMarkupUrl/Annotations/query/byUserAndImageID?iid=",
    'getAnnotationsSpatial' => "$serviceUrl/GeoJSONImageMetaData/query/getMarkups?",
    'getAnnotationSpatialFilter' => "$tempMarkupUrl/Annotations/query/allByFilter?iid=",
    'postAnnotation' => "$serviceUrl/Markups/submit/json",
    'retrieveAnnotation' => "$tempMarkupUrl/Annotations/query/byAnnotId?annotId=",
    'postJobParameters' => "$tempMarkupUrl/AnalysisJobs/submit/singleJob",
    'deleteAnnotation' => "$tempMarkupUrl/Annotations/delete/singleAnnotation?annotId=",
    'getDimensions' => "$imageUrl/query/getDimensionsByIID?api_key=",
    'getFileLocation' => "$imageUrl/query/getFileLocationByIID?api_key=",
    'getMPP' => "$imageUrl/query/getMPPByIID?api_key=",
    'fastcgi_server' => "/fastcgi-bin/iipsrv.fcgi",
    'postWorkOrder' => "$dynamicServices/WorkOrders/submit/json"
);


?>
