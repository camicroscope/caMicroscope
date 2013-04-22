<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
$callList = file_get_contents("bindaasCalls");
$callArray = explode(',',$callList);
$getUrl =  $callArray[0];
$postUrl = $callArray[1];
switch ($_SERVER['REQUEST_METHOD'])
{
	case 'GET':
		if(isset($_GET["iid"]))
		{
			$iid=$_GET["iid"];
			$url = $getUrl . $iid;	
			//$url = 'http://localhost:9099/services/annotations/Annotations/query/getAnnotsByID?iid=' . $iid;
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
		$url = $postUrl;
		//$url = 'http://localhost:9099/services/annotations/Annotations/submit/singleInput';
		$count = count($annotationList);
		$newestAnnot = $annotationList[$count-1];
		print_r($newestAnnot);
		$postRequest = new RestRequest($url,'POST',json_encode($newestAnnot));
		$postRequest->execute();
		break;
}
?>
