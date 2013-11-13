<?php session_start();

include_once("CamicUtils.php");

$utils = new CamicUtils($_SESSION);
$tissueId = $_GET['tissueId'];
$fileLocation = $utils->retrieveImageLocation($tissueId);
$dzi = $utils->setUpSymLinks($fileLocation);
echo json_encode($dzi);
?>
