<?php require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';

$getUrl =  $config['getLymphocyteUserByEmailAndRole'];
$deleteUrl = $config['deleteLymphocyteSuperuser'];
$postUrl = $config['postSuperuserForLymphocytes'];

if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}

switch ($_SERVER['REQUEST_METHOD'])
{
    case 'GET':
        if(isset($_GET["email"]))
	    {
            $email = $_GET["email"];
            $role = $_GET["role"];
            
            $url  = $getUrl . "api_key=" . urlencode($api_key) . "&email=". urlencode($email) . "&role=". urlencode($role);

	        $getRequest = new RestRequest($url,'GET');
            $getRequest->execute();
           
	        //Parse response
	        $lymphocyteSuperuserInfo = ($getRequest->responseBody);

            if($lymphocyteSuperuserInfo) {
                echo ($lymphocyteSuperuserInfo);
            }else {
                echo "No data";
            }
        }
        
        break;
        
    case 'DELETE':
        echo "PHP Deleting\n";
    
        $email=$_GET["email"];
        $role=$_GET["role"];
        
        $delUrl = $deleteUrl . "api_key=".$api_key . "&email=".$email . "&role=".$role;
        echo $delUrl;
        $curl = curl_init($delUrl);

        //Delete request
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
        curl_setopt($curl, CURLOPT_HEADER, false);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: application/json',"OAuth-Token: $token"));

        // Make the REST call, returning the result
        $response = curl_exec($curl);
        print_r($response);
   
        break; 
        
    case 'POST':
        //echo "Posting!!!";
	    $superuserLymphInfo =$_POST;
	    $url = $postUrl . "api_key=".$api_key;
		
        //print_r($superuserLymphInfo);
        //print_r(json_encode($superuserLymphInfo), JSON_NUMERIC_CHECK);
        echo "posting data\n";
        echo $url;
        $ch = curl_init();
        $headers= array('Accept: application/json','Content-Type: application/json'); 
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);

        curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($superuserLymphInfo));
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
