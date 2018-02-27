<?php require '../../../authenticate.php';

ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);

include_once("RestRequest.php");
require_once 'HTTP/Request2.php';

$config = require '../Configuration/config.php';

$getUrl =  $config['getImageInfoByCaseID'];



if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}

if(isset($_GET["case_id"]))
{
    $case_id=$_GET["case_id"];
   
    $url  = $getUrl . urlencode($api_key) . "&case_id=". $case_id; 

    $getRequest = new RestRequest($url,'GET');
    $getRequest->execute();

   
    //Figure out how to parse reponse
    $imageInfo = ($getRequest->responseBody);

    if($imageInfo)
        echo ($imageInfo);
    else
        echo "No Image found";


    
}


?>
