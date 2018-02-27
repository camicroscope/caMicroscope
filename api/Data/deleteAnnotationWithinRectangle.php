<?php require '../../../authenticate.php';
//ini_set('display_errors', 'On');
//error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';

$config = require '../Configuration/config.php';

$deleteUrl = $config['deleteAnnotationWithinRectangleClone'];
$getUrl    = $config['getAnnotationCountWithinRectangle'];

if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}

switch ($_SERVER['REQUEST_METHOD'])
{   case 'DELETE':
    echo "PHP Deleteing";
    echo PHP_EOL;
  
    $case_id=$_GET["case_id"];
    $subject_id=$_GET["subject_id"];
    $execution_id=$_GET["execution_id"];
	
    $x1 = $_GET["x1"];
    $y1 = $_GET["y1"];		
    $x2 = $_GET["x2"];
    $y2 = $_GET["y2"];
 
   //format the number with the same precision of number in Mongodb
    $x1 = number_format($x1,14);
    $y1 = number_format($y1,14);
    $x2 = number_format($x2,14);
    $y2 = number_format($y2,14);
  
    //$delta=0.000001;  
    //$x1 =$x1 + $delta;
    //$x2 =$x2 - $delta;
    //$y1 =$y1 + $delta;
    //$y2 =$y2 - $delta;
	
    //find deleted annotation number
    $url = $getUrl . "api_key=".$api_key . "&case_id=".$case_id. "&subject_id=".$subject_id. "&execution_id=".$execution_id."&x1=".$x1. "&y1=".$y1. "&x2=".$x2. "&y2=".$y2;  
    //echo $url;
    //echo PHP_EOL;
  
    $getRequest = new RestRequest($url, 'GET');  
    $getRequest->execute();
    $deletedAnnotationCount = json_decode($getRequest->responseBody);
    $deletedAnnotationCount= $deletedAnnotationCount->count; 
    //echo "PHP Deleted annotation count";
    //echo PHP_EOL;
    // echo $deletedAnnotationCount;
    //echo PHP_EOL;  
     
    if($deletedAnnotationCount > 0) {
       $delUrl = $deleteUrl . "?api_key=".$api_key . "&case_id=".$case_id. "&subject_id=".$subject_id. "&execution_id=".$execution_id."&x1=".$x1. "&y1=".$y1. "&x2=".$x2. "&y2=".$y2;
       //echo $delUrl;
       //echo PHP_EOL;
       $curl = curl_init($delUrl);
       //Delete request
       curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
       curl_setopt($curl, CURLOPT_HEADER, false);
       curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
       curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json',"OAuth-Token: $token"));
       // Make the REST call, returning the result
       $response = curl_exec($curl);
       // print_r($response);
       //echo PHP_EOL;
       echo "Deleted!";	  
     }
 
  break;    
}

?>

