<?php require '../../../authenticate.php';

include_once("CamicUtils.php");

$utils = new CamicUtils($_SESSION);
$tissueId = $_GET['imageId'];
$fileLocation = $utils->retrieveImageLocation($tissueId);
#$dzi = $utils->setUpSymLinks($fileLocation);
$dzi = $utils->setUpSVSImage($fileLocation);
$finalMpp = $utils->retrieveMpp($tissueId);
$returnArray = array();
array_push($returnArray,$finalMpp,$dzi);
echo json_encode($returnArray);
?>
