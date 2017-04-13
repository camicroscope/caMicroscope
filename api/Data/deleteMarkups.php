<?php require '../../../authenticate.php';
//ini_set('display_errors', 'On');
//error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';
$getUrl =  $config['getPropertiesForMarkup'];
$deleteUrl = $config['deleteMarkups'];

if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}

switch ($_SERVER['REQUEST_METHOD'])
{
  case 'DELETE':
    echo "PHP Deleteing";
    $d = file_get_contents("php://input");
    print_r($d);
    $data = [];
    parse_str($d, $data); 
    //$data = json_decode($data);
    //print_r($data);
    
    $case_id = $data['case_id'];
    $execution_id = $data['execution_id'];
    $x1 = $data['x1'];
    $y1 = $data['y1'];    
    $x2 = $data['x2'];
    $y2 = $data['y2']; 

    $delUrl = $deleteUrl . "?api_key=".$api_key . "&CaseId=".$case_id . "&execution_id=".$execution_id . "&x1=".$x1 . "&y1=".$y1 . "&x2=".$x2 . "&y2=".$y2;
    //echo $delUrl;
    $curl = curl_init($delUrl);
    //Delete request
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
    curl_setopt($curl, CURLOPT_HEADER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json',"OAuth-Token: $token"));
    // Make the REST call, returning the result
    $response = curl_exec($curl);

	//check if there are any annotations with this execution_id
	$getMarkups = $config["getMultipleAnnotations"] ."api_key=".$api_key ."&CaseId=".$case_id . "&algorithms=['". $execution_id . "']&x1=0" . "&y1=0". "&x2=1". "&y2=1". "&footprint=0";
    $curl = curl_init($getMarkups);

    curl_setopt($curl, CURLOPT_HEADER, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json',"OAuth-Token: $token"));
    // Make the REST call, returning the result
    $response = json_decode(curl_exec($curl), true);
	echo "\n";
	//echo $response;
	echo count($response);
	$no_annotations = count($response);
	echo "\n";
	echo "number of annotations". $no_annotations;
	if($no_annotations == 0){
		//delete execution id
		echo "deleting";
		$deleteUrl= "http://quip-data:9099/services/Camicroscope_Annotations/MarkupsForImages/delete/deleteExecutionId"."?api_key=".$api_key . "&execution_id=".$execution_id;
			echo $deleteUrl;
			$curl = curl_init($deleteUrl);
			curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
			curl_setopt($curl, CURLOPT_HEADER, false);
			curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json',"OAuth-Token: $token"));
			// Make the REST call, returning the result
			$response = curl_exec($curl);
			print_r($response);

	}
    echo "Deleted!";

    //Delete ID
  break;    
}
?>
