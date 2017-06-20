<?php 
  require '../../../authenticate.php';
  
//ini_set('display_errors', 'On');
//error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';

$config = require '../Configuration/config.php';
$getUrl =  $config['getMultipleMarkupsNew'];

if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}
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
			
      $algorithms_computer = urlencode($_GET["algorithms_computer"]);
			$algorithms_human = urlencode($_GET["algorithms_human"]);
			
      $getUrl  = $getUrl . "api_key=" . $api_key;
        
      $url = $getUrl . "&CaseId=" . $iid ."&x1=" . $x . "&y1=" . $y . "&x2=" . $x1 . "&y2=" . $y1 . "&footprint=" . $area . "&algorithms_computer=" . $algorithms_computer . "&algorithms_human=" . $algorithms_human;
           
		   //echo $url;
	       $getRequest = new RestRequest($url,'GET');
           $getRequest->execute();
           //print_r($url);            
           //print_r($getRequest);
	       //Figure out how to parse reponse
	       $annotationList = ($getRequest->responseBody);
      
            // print_r($annotationList);
            if($annotationList)
                echo ($annotationList);
            else
                echo "No annotations";
            
        }
?>
