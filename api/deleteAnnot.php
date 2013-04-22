<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
$callList = file_get_contents("bindaasCalls");
$callArray = explode(',',$callList);
$deleteUrl = $callArray[2];
$annotId=$_GET["annotId"];
$url = $deleteUrl . $annotId;
echo $url;
//$url = 'http://localhost:9099/services/annotations/Annotations/delete/deleteById?annotId=' . $annotId;
$deleteRequest = new RestRequest($url,'DELETE');
$deleteRequest->execute();
echo success;
?>
