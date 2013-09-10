<?php session_start();
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");

$sessionId = session_id();
$tissueId = $_GET['tissueId'];
$config = require 'config.php';
$api_key = $_SESSION['api_key'];
$dataurl = $config['getFileLocation'];
$dataurl = $dataurl . $api_key . "&TCGAId=" . $tissueId;
$dataurl = str_replace(" ","%20",$dataurl);
$getDataRequest = new RestRequest($dataurl, 'GET');
$getDataRequest->execute();
$data = json_decode($getDataRequest->responseBody);
foreach($data[0] as $key => $value)
{
    $path = "/tmp/symlinks/" . $sessionId;
    
    $_SESSION['location'] = json_decode($value);
    if(!is_dir($path))
    {
	mkdir($path);
    }

    $symLocation = strrchr($value, '/');
    $fileNamewoEx = substr($symLocation,0, -5);
    if(is_dir($path . $fileNamewoEx))
    {
	$link = $path . $fileNamewoEx . "/" . $symLocation . ".dzi";
    }

    else
    {
	mkdir($path .  $fileNamewoEx);
	$symLocation = $path . $fileNamewoEx . "/" . $symLocation;
	symlink($value, $symLocation);
	symlink($symLocation, $symLocation . ".dzi");
	$link = $symLocation . ".dzi";
    }
}

echo(json_encode($link));
?>
