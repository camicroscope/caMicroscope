<?php require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';
$getUrl =  $config['getHeatmapData'];
$postUrl = $config['postDataForHeatmap'];


if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}


switch ($_SERVER['REQUEST_METHOD'])
{

    case 'GET':
        if(isset($_GET["case_id"]) && isset($_GET["exec_id"]))
	    {
            $case_id=$_GET["case_id"];
            $exec_id=$_GET["exec_id"];
			
            $url  = $getUrl . "api_key=" . urlencode($api_key) . "&case_id=". urlencode($case_id) ."&exec_id=" .urlencode($exec_id);
	        $getRequest = new RestRequest($url,'GET');
            $getRequest->execute();
           
	        //Parse reponse
	        $heatmapInfo = ($getRequest->responseBody);

            if($heatmapInfo)
                echo ($heatmapInfo);
            else
                echo "No heatmap data";
            
        }
        break;
        
    case 'POST':
        //echo "Posting!!!";
	    $heatmapInfo =$_POST;
	    $url = $postUrl . "api_key=".$api_key;
		
        //print_r($lymphocyteHeatmapInfo);
        //print_r(json_encode($lymphocyteHeatmapInfo), JSON_NUMERIC_CHECK);
        echo "posting data\n";
        echo $url;
        $ch = curl_init();
        $headers= array('Accept: application/json','Content-Type: application/json'); 
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);

        curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($heatmapInfo, JSON_NUMERIC_CHECK));
        $result = curl_exec($ch);
        if($result === false){
            $result =  curl_error($ch);
        }
        curl_close($ch);

        echo $result;

        echo "done";
	    break;
}
?>
