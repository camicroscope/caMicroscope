<?php require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';
$getUrl =  $config['getLymphocyteData'];
$postUrl = $config['postDataForLymphocytes'];

$api_key = '';

if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}
//$api_key = 'c0327219-68b2-4a40-9801-fc99e8e1e76f';
$api_key = '4fbb38a3-1821-436c-a44d-8d3bc5efd33e';
switch ($_SERVER['REQUEST_METHOD'])
{
//curl -v -H "Content-Type: application/json" -X GET "http://quip-data:9099/services/Camicroscope_Annotations/Lymphocytes/query/getLymphocytes?username=alina&case_id=xyz"


	case 'GET':
		if(isset($_GET["case_id"]))
		{
            $case_id=$_GET["case_id"];
            $username = $_GET["username"];
			
            $url  = $getUrl . "api_key=" . urlencode($api_key) . "&case_id=". urlencode($case_id) ."&username=" .urlencode($username);

			$getRequest = new RestRequest($url,'GET');
            $getRequest->execute();
           
			//Parse reponse
			$annotationList = ($getRequest->responseBody);

            if($annotationList)
                echo ($annotationList);
            else
                echo "No annotations";

            break;
            
        }
        break;
        
    case 'POST':
        //echo "Posting!!!";
		$annotationList =$_POST;
		$url = $postUrl . "?api_key=".$api_key;
		//$count = count($annotationList);
		//$newestAnnot = $annotationList[$count-1];
		//$newestAnnot["username"] = $_SESSION['username'];
		//$newestAnnot["loc"][0] = (float)$newestAnnot["loc"][0];
		//$newestAnnot["loc"][1] = (float)$newestAnnot["loc"][1];
        //print_r($annotationList);
        //print_r(json_encode($annotationList), JSON_NUMERIC_CHECK);
        echo "posting data\n";
        echo $url;
        $ch = curl_init();
        $headers= array('Accept: application/json','Content-Type: application/json'); 
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);

        curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($annotationList, JSON_NUMERIC_CHECK));
        $result = curl_exec($ch);
        if($result === false){
            $result =  curl_error($ch);
        }
        curl_close($ch);

        echo $result;

		//$postRequest = new RestRequest($url,'POST',json_encode($annotationList), JSON_NUMERIC_CHECK);
		//$postRequest->execute();
        //print_r($postRequest);
		//echo(json_encode($newestAnnot));
        echo "done";
		break;
}
?>
