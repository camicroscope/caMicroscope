<?php require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';
$getUrl =  $config['getLymphocyteSuperusers'];


if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}


if(isset($_GET["lymph_superuser"])) {
    $lymph_superuser=$_GET["lymph_superuser"];
            
    $url  = $getUrl . "api_key=" . urlencode($api_key) . "&lymph_superuser=". urlencode($lymph_superuser);

    $getRequest = new RestRequest($url,'GET');
    $getRequest->execute();
           
    //Parse response
    $lymphocyteSuperuserInfo = ($getRequest->responseBody);

    if($lymphocyteSuperuserInfo)
        echo ($lymphocyteSuperuserInfo);
    else
        echo "No data";
  
}
        
?>