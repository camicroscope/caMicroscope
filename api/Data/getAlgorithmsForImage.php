<?php require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';
$getUrl =  $config['algorithmsForImage'];

$api_key = '';

if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}
//$api_key = 'c0327219-68b2-4a40-9801-fc99e8e1e76f';
$api_key = '4fbb38a3-1821-436c-a44d-8d3bc5efd33e';

if(isset($_GET["iid"]))
{
    $iid=$_GET["iid"];
   
    $url  = $getUrl . "api_key=" . urlencode($api_key) . "&TCGAId=". $iid; 

    $getRequest = new RestRequest($url,'GET');
    $getRequest->execute();

   
    //Figure out how to parse reponse
    $annotationList = ($getRequest->responseBody);

    if($annotationList)
        echo ($annotationList);
    else
        echo "No annotations";


    
}


?>
