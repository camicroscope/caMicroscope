<?php 


///new
$baseUrl = "dragon.cci.emory.edu";
$serviceUrl = "$baseUrl/services/TCGA";

$imageUrl = "$serviceUrl/ImageData";
$templateUrl = "$serviceUrl/AnnotationTemplate";
$markupUrl = "$serviceUrl/Annotations";


$tempMarkupUrl = "http://localhost:9099/services/TCGABRCA_Dev";

return array(
    'auth_realm' => "$baseUrl/securityTokenService",
    /*
     * temp
     */
    'algorithmsForImage' => "http://dragon.cci.emory.edu:9099/services/quip/Analysis2/query/CompletedAlgorithms?",
    'getMultipleAnnotations' => "$serviceUrl/GeoJSONImageMetaData/query/getMultipleMarkups?",
    'retrieveTemplate' => "$tempMarkupUrl/AnnotationTemplate/query/RetrieveTemplate",
    'getAllAnnotations' => "$tempMarkupUrl/Annotations/query/byUserAndImageID?iid=",
    'getAnnotationsSpatial' => "$serviceUrl/GeoJSONImageMetaData/query/getMarkups?",
    'getAnnotationSpatialFilter' => "$tempMarkupUrl/Annotations/query/allByFilter?iid=",
    'postAnnotation' => "$tempMarkupUrl/Annotations/submit/singleAnnotation",
    'retrieveAnnotation' => "$tempMarkupUrl/Annotations/query/byAnnotId?annotId=",
    'postJobParameters' => "$tempMarkupUrl/AnalysisJobs/submit/singleJob",
    'deleteAnnotation' => "$tempMarkupUrl/Annotations/delete/singleAnnotation?annotId=",
    'getDimensions' => "$imageUrl/query/getDimensionsByIID?api_key=",
    'getFileLocation' => "http://dragon.cci.emory.edu/services/TCGA/GeoJSONMetaData/query/getFileLocationByIID?api_key=",
    'getMPP' => "http://dragon.cci.emory.edu/services/TCGA/GeoJSONImageMetaData/query/getMPPByIID?api_key=",
    'fastcgi_server' => "/fcgi-bin/iipsrv.fcgi"
);


?>
