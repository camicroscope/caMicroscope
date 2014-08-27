<?php
require '../../../authenticate.php';
include_once("CamicUtils.php");

$utils = new CamicUtils($_SESSION);
$tissueId = $_GET["imageId"];

$finalDimension = $utils->getImageDimensions($tissueId);
$fileLocation = $utils->retrieveImageLocation($tissueId);


$returnArray = array();
array_push($returnArray, $finalDimension, $fileLocation);

echo json_encode($returnArray);
?>
