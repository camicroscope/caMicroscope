<?php 

//session_start();

$cancerType = $_SESSION["cancerType"]; 
//echo $cancerType;

///new
$baseUrl = "http://localhost:9099";
$serviceUrl = "$baseUrl/services/" . $cancerType;
$templateUrl = "$baseUrl/services/caMicroscope_Templates";


//$serviceUrl = "$baseUrl/services/" + $cancerType;

$imageUrl = "$serviceUrl/ImageMetaData";
//$templateUrl = "$serviceUrl/AnnotationTemplate";
$markupUrl = "$serviceUrl/Annotations";

$analysisMetaDataUrl = "$serviceUrl/Analyses_MetaData";


$tempMarkupUrl = "http://localhost:9099/services/TCGABRCA_Dev";

return array(
    'auth_realm' => "$baseUrl/securityTokenService",
    /*
     * temp
     */
    'algorithmsForImage' => "$analysisMetaDataUrl/query/AlgorithmsForIID?",
    'deleteAnnotation' => "$markupUrl/delete/DeleteByOID",
    'postAlgorithmForImage' => "$analysisMetaDataUrl/submit/json?",
    'getMultipleAnnotations' => "$markupUrl/query/getMultipleMarkups?",
    'getPropertiesForMarkup' => "$markupUrl/query/getPropertiesForMarkup?",
    'getFileLocation' => "$imageUrl/query/getFileLocationForIID?api_key=",
    'getMPP' => "$imageUrl/query/getMPPForIID?api_key=",
    'retrieveTemplate' => "$templateUrl/AnnotationTemplate/query/retrieveTemplate",
    //'retrieveTemplate' => "$tempMarkupUrl/AnnotationTemplate/query/RetrieveTemplate",
    'getAllAnnotations' => "$tempMarkupUrl/Annotations/query/byUserAndImageID?iid=",
    'getAnnotationsSpatial' => "$serviceUrl/GeoJSONImageMetaData/query/getMarkups?",
    'getAnnotationSpatialFilter' => "$tempMarkupUrl/Annotations/query/allByFilter?iid=",
    'postAnnotation' => "$serviceUrl/Annotations/submit/json",
    'retrieveAnnotation' => "$tempMarkupUrl/Annotations/query/byAnnotId?annotId=",
    'postJobParameters' => "$tempMarkupUrl/AnalysisJobs/submit/singleJob",
    //'deleteAnnotation' => "$tempMarkupUrl/Annotations/delete/singleAnnotation?annotId=",
    'getDimensions' => "$imageUrl/query/getDimensionsByIID?api_key=",

    'fastcgi_server' => "/fcgi-bin/iipsrv.fcgi"
);


?>
