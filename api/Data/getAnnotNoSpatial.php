<?php require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';
$getUrl =  $config['getAllAnnotations'];
$postUrl = $config['postAnnotation'];

$api_key = '';
if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}
switch ($_SERVER['REQUEST_METHOD'])
{
	case 'GET':
		if(isset($_GET["iid"]))
		{
			$iid=$_GET["iid"];
			$url = $getUrl . $iid . "&username=" . $_SESSION['username'] . "&api_key=".$api_key;	
			$getRequest = new RestRequest($url,'GET');
			$getRequest->execute();
			//Figure out how to parse reponse
			$annotationList = json_decode($getRequest->responseBody);
			
			if(json_encode($annotationList) == null)
				echo json_encode("NoAnnotations");
			else
				echo json_encode($annotationList);
			break;
		}
	case 'POST':
		$annotationList =$_POST["annot"];
		$url = $postUrl . "?api_key=".$api_key;
		$count = count($annotationList);
		$newestAnnot = $annotationList[$count-1];
		$newestAnnot["username"] = $_SESSION['username'];
		$newestAnnot["loc"][0] = (float)$newestAnnot["loc"][0];
		$newestAnnot["loc"][1] = (float)$newestAnnot["loc"][1];
		$postRequest = new RestRequest($url,'POST',json_encode($newestAnnot));
		$postRequest->execute();
		echo(json_encode($newestAnnot));

		break;
}
?>
