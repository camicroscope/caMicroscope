<?php require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';
$getUrl =  $config['getLymphocyteDataByCaseId'];


if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}


if(isset($_GET["case_id"])) {
    $case_id=$_GET["case_id"];
            
    $url  = $getUrl . "api_key=" . urlencode($api_key) . "&case_id=". urlencode($case_id);

    $getRequest = new RestRequest($url,'GET');
    $getRequest->execute();
           
    //Parse reponse
    $lymphocyteInfo = ($getRequest->responseBody);

    if($lymphocyteInfo)
        echo ($lymphocyteInfo);
    else
        echo "No lymphocyte data";
  
}
        
?>
