<?php require '../../../authenticate.php';

include_once("CamicUtils.php");

$utils = new CamicUtils($_SESSION);
$tissueId = $_GET['imageId'];
echo $tissueId;
$fileLocation = $utils->retrieveImageLocation($tissueId);
echo $fileLocation;
$dzi = $utils->setUpSymLinks($fileLocation);
echo $dzi;
$finalMpp = $utils->retrieveMpp($tissueId);
$returnArray = array();
array_push($returnArray,$finalMpp,$dzi);
#echo json_encode($returnArray);
?>
