<?php 

//session_start();

$cancerType = $_SESSION["cancerType"]; 
//echo $cancerType;

///new
$baseUrl = "http://172.17.0.1:9099";
$serviceUrl = "$baseUrl/services/" . $cancerType;
$templateUrl = "$baseUrl/services/caMicroscope_Templates";


//$serviceUrl = "$baseUrl/services/" + $cancerType;

$imageUrl = "$serviceUrl/ImageMetaData";
//$templateUrl = "$serviceUrl/AnnotationTemplate";
$markupUrl = "$serviceUrl/Annotations";

$mergeSegmentUrl = "$serviceUrl/MergeSegmentation";

$analysisMetaDataUrl = "$serviceUrl/Analyses_MetaData";


$tempMarkupUrl = "http://localhost:9099/services/TCGABRCA_Dev";

return array(
    'auth_realm' => "$baseUrl/securityTokenService",
    /*
     * temp
     */
    'algorithmsForImage' => "$analysisMetaDataUrl/query/AlgorithmsForIID?",
	//'algorithmsForImage' => "$analysisMetaDataUrl/query/AlgorithmsForIIDClone?",
    'deleteAnnotation' => "$markupUrl/delete/DeleteByOID",
	'deleteAnnotationWithinRectangle' => "$markupUrl/delete/deleteAnnotationWithinRectangle",
    'postAlgorithmForImage' => "$analysisMetaDataUrl/submit/json?",
    'getMultipleAnnotations' => "$markupUrl/query/getMultipleMarkupsClone?",
	'getMergeSegmentation' => "$mergeSegmentUrl/query/getMergeSegmentation?",
    'getPropertiesForMarkup' => "$markupUrl/query/getPropertiesForMarkup?",
	'getPropertiesForMarkupClone' => "$markupUrl/query/getPropertiesForMarkupClone?",
    'getFileLocation' => "$imageUrl/query/getFileLocationForIID?api_key=",
    'getMPP' => "$imageUrl/query/getMPPForIID?api_key=",
    //'retrieveTemplate' => "$templateUrl/AnnotationTemplate/query/retrieveTemplate",
	'retrieveTemplate' => "$templateUrl/AnnotationTemplate/query/retrieveTemplateClone",
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
