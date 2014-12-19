<?php require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';
$getUrl =  $config['getAnnotationSpatialFilter'];
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
			$x = $_GET["x"];
			if($x < 0)
			    $x = 0.0;
			$y = $_GET["y"];
			if($y < 0)
			    $y = 0.0;
			$x1 = $_GET["x1"];
			$y1 = $_GET["y1"];
			$url = $getUrl . $iid ."&X1=" . $x . "&Y1=" . $y . "&X2=" . $x1 . "&Y2=" . $y1 . "&text.Author=" . $_GET["author"] . "&text.Grade=" . $_GET["grade"] . "&text.Multi=" . $_GET["multi"] .  "&api_key=".$api_key;	
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
