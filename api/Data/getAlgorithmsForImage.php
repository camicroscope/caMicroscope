<?php require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';
$getUrl =  $config['algorithmsForImage'];



if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}
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
