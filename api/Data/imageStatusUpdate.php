<?php require '../../../authenticate.php';
//ini_set('display_errors', 'On');
//error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';

$config = require '../Configuration/config.php';

$updateUrl = $config['imageStatusUpdate'];


if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}

//print_r($_SERVER['REQUEST_METHOD']);

switch ($_SERVER['REQUEST_METHOD'])
{   case 'GET':
    //print_r("PHP updateing");
    //echo PHP_EOL;
  
    $case_id=$_GET["case_id"];
    $status=$_GET["status"];	
    //echo $case_id;
    //echo $status;
    $updateUrl = $updateUrl . "api_key=".$api_key . "&case_id=".$case_id. "&status=".$status;
    //echo $updateUrl;
    //echo PHP_EOL;
    $curl = curl_init($updateUrl);
    //Delete request
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
    curl_setopt($curl, CURLOPT_HEADER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json',"OAuth-Token: $token"));
       // Make the REST call, returning the result
    $response = curl_exec($curl);
    print_r($response);
    //echo PHP_EOL;
    //echo "updated!";	    
 
  break;    
}

?>
