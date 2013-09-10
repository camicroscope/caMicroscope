<?php session_start();
ini_set('display_errors','On');
error_reporting(E_ALL);
include_once("RestRequest.php");
$config = require 'config.php';
$getDimensionsUrl = $config['getDimensions'];
$locationUrl = $config['getFileLocation'];
$imageId = $_GET["imageId"];
$api_key = '';
if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}

$locationUrl = $locationUrl . $api_key . "&TCGAId=" . $imageId;


$url = $getDimensionsUrl . $imageId . "&api_key=" . $api_key;
error_log("#########################################" . $url);
$getLocationRequest = new RestRequest($locationUrl,'GET');
$getLocationRequest->execute();
$fileLocation = json_decode($getLocationRequest->responseBody);
$getRequest = new RestRequest($url,'GET');
$getRequest->execute();
$dimensionList = json_decode($getRequest->responseBody);
$finalDimension;
foreach($dimensionList as $singleDimension)
{
	$finalDimension = $singleDimension;
	break;
}

error_log($finalDimension->width);
error_log($finalDimension->height);

$returnArray = array();
array_push($returnArray, $finalDimension, $fileLocation);
if(json_encode($finalDimension) == null)
	echo json_encode("NoAnnotations");
else
	echo json_encode($returnArray);
?>
