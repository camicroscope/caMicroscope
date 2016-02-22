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
$api_key = 'c0327219-68b2-4a40-9801-fc99e8e1e76f';
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
        
            //$url = "http://imaging.cci.emory.edu:9099/services/TCGA/GeoJSONImageMetaData/query/getMarkups?api_key=c0327219-68b2-4a40-9801-fc99e8e1e76f&CaseId=TCGA-02-0001-01Z-00-DX1&algorithmId=tammy-test:7&footprint=100&x1=0&y1=0&x2=1&y2=1&";
            $getUrl = "http://imaging.cci.emory.edu:9099/services/TCGA/GeoJSONImageMetaData/query/getMarkups?";
            //$url = $getUrl . "CaseId=TCGA-02-0001-01Z-00-DX1&algorithmId=tammy-test:7&footprint=1000&x1=" . $x . "&y1=" . $y . "&x2=" . $x1 . "&y2=" . $y1 . "&api_key=".$api_key; 
            //$url = "http://imaging.cci.emory.edu:9099/services/TCGA/GeoJSONImageMetaData/query/getMarkups?api_key=c0327219-68b2-4a40-9801-fc99e8e1e76f&CaseId=TCGA-02-0001-01Z-00-DX1&algorithmId=tammy-test:7&footprint=1000&x1=0&y1=0&x2=1&y2=1&";
            //
            $url  = $getUrl . "api_key=" . urlencode($api_key) . "&CaseId=TCGA-02-0001-01Z-00-DX1&algorithmId=tammy-test:7&footprint=". urlencode($area) ."&x1=" .urlencode($x) . "&y1=" . urlencode($y) . "&x2=" . urlencode($x1) . "&y2=" . urlencode($y1) .  "&";
            //echo $url;
            //echo $url; 
            //echo $url;
            //echo "\n";
            //echo $url;
            //$url = "http://imaging.cci.emory.edu:9099/services/TCGA/GeoJSONImageMetaData/query/getMarkups?api_key=".urlencode("c0327219-68b2-4a40-9801-fc99e8e1e76f") . "&CaseId=" . urlencode("TCGA-02-0001-01Z-00-DX1")."&algorithmId=".urlencode("tammy-test:7")."&footprint=600&x1=".urlencode(0.10507895504353985)."&y1=".urlencode(0.5130209798076383)."&x2=".urlencode(0.10516228490479564)."&y2=".urlencode(0.5131615951403341);
            //$url = "http://imaging.cci.emory.edu:9099/services/TCGA/GeoJSONImageMetaData/query/getMarkups\?api_key\=c0327219-68b2-4a40-9801-fc99e8e1e76f\&CaseId\=TCGA-02-0001-01Z-00-DX1\&algorithmId\=tammy-test:7\&footprint\=100\&x1\=0\&y1\=0\&x2\=1\&y2\=1\&";
            //echo $url;
            //$url= "http://imaging.cci.emory.edu:9099/services/TCGABRCA_Dev/Annotations/query/byUserImageAndSpatialScope?iid=TCGA-A1-A0SD&X1=0&Y1=0&X2=1&Y2=1&username=lastlegion@gmail.com&api_key=f2de541f-79ba-4d5f-8cf2-4c0e865d229f";
            //$url = $getUrl . $iid ."&X1=" . $x . "&Y1=" . $y . "&X2=" . $x1 . "&Y2=" . $y1 . "&username=" . $_SESSION['username'] . "&api_key=".$api_key;
            //
            /*
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            $data = curl_exec($ch);
            curl_close($ch);
            */
			$getRequest = new RestRequest($url,'GET');
            $getRequest->execute();
            //echo "----";
            //print_r($getRequest);
			//Figure out how to parse reponse
			$annotationList = ($getRequest->responseBody);
            //echo json_encode(json_decode($getRequest->responseBody));
            //print_r($getRequest->responseInfo);
            //echo "---\n";
            //print_r($getRequest->responseBody);
            //echo "---\n";
            //echo $data;
            //echo $annotationList;
            if($annotationList)
                echo ($annotationList);
            else
                echo "No annotations";
            /*  
			if(json_encode($annotationList) == null)
				echo json_encode("NoAnnotations");
			else
				echo json_encode($annotationList);
             */
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
