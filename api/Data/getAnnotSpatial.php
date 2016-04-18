<?php require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';
$getUrl =  $config['getAnnotationsSpatial'];
$postUrl = $config['postAnnotation'];

$api_key = '';

if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}
//$api_key = 'c0327219-68b2-4a40-9801-fc99e8e1e76f';
$api_key = '4fbb38a3-1821-436c-a44d-8d3bc5efd33e';
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
            $area = $_GET["footprint"];
        
           
            $url  = $getUrl . "api_key=" . urlencode($api_key) . "&CaseId=TCGA-02-0001-01Z-00-DX1&algorithmId=tammy-test:7&footprint=". urlencode($area) ."&x1=" .urlencode($x) . "&y1=" . urlencode($y) . "&x2=" . urlencode($x1) . "&y2=" . urlencode($y1) .  "&";

			$getRequest = new RestRequest($url,'GET');
            $getRequest->execute();


			//Figure out how to parse reponse
			$annotationList = ($getRequest->responseBody);

            if($annotationList)
                echo ($annotationList);
            else
                echo "No annotations";

            break;
            
        }
        break;
    case 'POST':
        echo "Posting!!!";
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
