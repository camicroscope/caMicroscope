<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
$annotationList=$_GET["annot"];
$textToUpdate=$_GET["textToUpdate"];
$count = count($annotationList);
$annot = $annotationList[$count-1];
$annot = $annot;
$annotId = $annot->annotId;
print_r($annot);
$url = 'http://localhost:9099/services/annotations/Annotations/delete/deleteById?annotId=' . $annotId;
$deleteRequest = new RestRequest($url,'DELETE');
$deleteRequest->execute();
$annot->text = $textToUpdate;
$url2 = 'http://localhost:9099/services/annotations/Annotations/submit/singleInput';
$count = count($annotationList);
$postRequest = new RestRequest($url2,'POST',json_encode($annot));
$postRequest->execute();
?>
