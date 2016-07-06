<?php 


require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';
$firebase =  $config['firebase'];
$firebase_key = $config['firebase_key'];

//$api_key = '';
if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}
switch ($_SERVER['REQUEST_METHOD'])
{
	case 'GET':
		if(isset($_GET["stateID"]))
		{
			$state_id=$_GET["stateID"];
			//$url = $getUrl . $iid . "&username=" . $_SESSION['username'] . "&api_key=".$api_key;	
            $url = $firebase  . "/". $state_id.".json?auth=". $firebase_key;
            echo $url;
			$getRequest = new RestRequest($url,'GET');
			$getRequest->execute();
			//Figure out how to parse reponse
			$state = json_decode($getRequest->responseBody);
			
			if(json_encode($state) == null)
				echo json_encode("No state associated with this ID");
			else
				echo json_encode($state);
			break;
		}
	case 'POST':
		$state =$_POST["annot"];
		$url = $firebase ."json?auth=".$firebase_key;
		//$count = count($annotationList);
		//$newestAnnot = $annotationList[$count-1];
		//$newestAnnot["username"] = $_SESSION['username'];
		//$newestAnnot["loc"][0] = (float)$newestAnnot["loc"][0];
		//$newestAnnot["loc"][1] = (float)$newestAnnot["loc"][1];
		$postRequest = new RestRequest($url,'POST',json_encode($newestAnnot));
		$postRequest->execute();
        echo $postRequest;


		break;
}
?>
