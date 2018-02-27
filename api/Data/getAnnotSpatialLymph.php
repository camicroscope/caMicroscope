<?php require '../../../authenticate.php';
//ini_set('display_errors', 'On');
//error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';
$getUrl =  $config['getAnnotationsSpatialLymph'];
$postUrl = $config['postAnnotation'];

$algorithmsForImage = $config['algorithmsForImage'];
$postAlgorithmForImage = $config['postAlgorithmForImageLymph'];


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
    //echo "Posting!!!";
    $url = $postUrl . "?api_key=".$api_key; 
    //print_r($url);
    //echo "\n";
    $newAnnotation = $_POST;
    //print_r($_POST);
    $POSTsecret =  $_POST['properties']['annotations']['secret'];

    $secrets = array(
      "human1" => "humantest", // secret => username
      "prod1" => "humanProd",
      "mark1" => "humanmark"	// Added by Vu to make a human marking document on MongoDB
    );

    $authorized = false;
    $newExecutionId = "";
    foreach($secrets as $secret => $username){
      if($POSTsecret === $secret){
        //set execution_id as $username
        $newAnnotation['provenance']['analysis']['execution_id'] = $username;
        $newExecutionId = $username;
        $authorized = true;
        $jsonAnnotation = json_encode($newAnnotation, JSON_NUMERIC_CHECK);
        //print_r(json_encode($newAnnotation));
          
        //save case_id and subject_id as string all the time      
	    $anotherjson=json_decode ($jsonAnnotation);
        $case_id=$anotherjson->provenance->image->case_id;
        settype($case_id, "string");
        $anotherjson->provenance->image->case_id = $case_id;
        $subject_id=$anotherjson->provenance->image->subject_id;
        settype($subject_id, "string");
        $anotherjson->provenance->image->subject_id = $subject_id;
        $jsonAnnotation = json_encode($anotherjson);
        //end save case_id and subject_id as string all the time

        $postRequest = new RestRequest($url, 'POST', $jsonAnnotation);
        $postRequest->execute();
        //echo "success";
      } 
    }
     $executionExists = False;
    if($authorized == false){
      echo "unauthorized";
    } else {

      //check if executionID exists
      $url = $algorithmsForImage . "api_key=".$api_key;
      $iid = $newAnnotation['provenance']['image']['case_id'];

      $url = $url . "&TCGAId=" . $iid;
    
      $getExecutionIDs = new RestRequest($url, 'GET');
      $getExecutionIDs->execute();
      //echo $url;
      $executionIDs = json_decode($getExecutionIDs->responseBody);
      //print_r($executionIDs);
    

      for($i=0; $i< count($executionIDs); $i++){
        //echo $i;
        $executionId = $executionIDs[$i]->provenance->analysis_execution_id;
        //echo "\n";
        //echo $executionId;
        //echo $newExecutionId;
        //echo strcmp($executionId, $newExecutionId);
        if(strcmp($newExecutionId, $executionId) == 0){
          //echo "setting true";
          $executionExists = True;
        }
      }


      if($executionExists == True){
        //echo "execution id exists";
      } else {
        //echo "new execution id";
        //POST this new executionID
        $provenanceData = new stdClass();
        $provenanceData->title = $newExecutionId;
        $provenanceData->provenance = new stdClass();
        $provenanceData->provenance->analysis_execution_id = $newExecutionId;
        $provenanceData->provenance->type = "human";

        $provenanceData->image->case_id = $iid;
        $provenanceData->image->subject_id = $newAnnotation["provenance"]["image"]["subject_id"];

        $url = $postAlgorithmForImage . "api_key=".$api_key;
        //echo $url;
        $json = json_encode($provenanceData);
        $postRequest = new RestRequest($url, 'POST', $json);
        $postRequest->execute();
      }
  
    }

      //echo "success";

      //print_r($provenanceData);
		break;
}
?>
