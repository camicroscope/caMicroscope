<?php require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';
$getUrl =  $config['getMultipleAnnotations'];
$postUrl = $config['postAnnotation'];

$api_key = '';

if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}
//$api_key = 'c0327219-68b2-4a40-9801-fc99e8e1e76f';
$api_key = '4fbb38a3-1821-436c-a44d-8d3bc5efd33e';

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
            $area = $_GET["footprint"]; 
            $algorithms = urlencode($_GET["algorithms"]);
            $getUrl  = $getUrl . "api_key=" . $api_key;
            

            $url = $getUrl . "&CaseId=" . $iid ."&x1=" . $x . "&y1=" . $y . "&x2=" . $x1 . "&y2=" . $y1 . "&footprint=" . $area . "&algorithms=" . $algorithms;

			$getRequest = new RestRequest($url,'GET');
            $getRequest->execute();


			//Figure out how to parse reponse
			$annotationList = ($getRequest->responseBody);

            if($annotationList)
                echo ($annotationList);
            else
                echo "No annotations";


            
        }

?>
