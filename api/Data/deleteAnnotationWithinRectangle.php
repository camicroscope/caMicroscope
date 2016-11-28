
<?php require '../../../authenticate.php';
//ini_set('display_errors', 'On');
//error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';
$deleteUrl = $config['deleteAnnotationWithinRectangle'];
//$api_key = '';

if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}
//$api_key = 'c0327219-68b2-4a40-9801-fc99e8e1e76f';
//$api_key = '4fbb38a3-1821-436c-a44d-8d3bc5efd33e';
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
	
    $delUrl = $deleteUrl . "?api_key=".$api_key . "&id=".$id. "&case_id=".$case_id. "&subject_id=".$subject_id. "&execution_id=".$execution_id."&x1=".$x1. "&y1=".$y1. "&x2=".$x2. "&y2=".$y2;
    echo $delUrl;
    $curl = curl_init($delUrl);
    //Delete request
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
    curl_setopt($curl, CURLOPT_HEADER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json',"OAuth-Token: $token"));
    // Make the REST call, returning the result
    $response = curl_exec($curl);
    print_r($response);
    echo PHP_EOL;
    echo "Deleted!";
    //Delete ID
   break;    
}

?>

