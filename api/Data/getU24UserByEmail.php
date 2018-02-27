
<?php require '../../../authenticate.php';
//ini_set('display_errors', 'On');
//error_reporting(E_ALL | E_STRICT);

include_once("RestRequest.php");
require_once 'HTTP/Request2.php';

$config = require '../Configuration/config.php';

$getUrl    = $config['findUserByEmail'];
$deleteUrl = $config['deleteUserByEmail'];
$postUrl   = $config['postUser'];



if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}



//echo $getUrl;
switch ($_SERVER['REQUEST_METHOD'])
{
    case 'GET':

        if(isset($_GET["email"]))
        {
          $email=$_GET["email"];

          $getUrl  = $getUrl . "api_key=" . $api_key;
          $url = $getUrl . "&email=" . $email;
	      //echo $url;
          $getRequest = new RestRequest($url,'GET');
          $getRequest->execute();

          //Figure out how to parse reponse
         $u24_user = json_decode($getRequest->responseBody);
         
         if($u24_user)
             echo json_encode($u24_user);
         else
            echo "No user found";      
        }
      break;

  case 'DELETE':
    echo "PHP Deleteing";
    $d = file_get_contents("php://input");
     //print_r($d);
    
	$data = [];
    parse_str($d, $data); 
   
   //$data = json_decode($data);
    //print_r($data);
    
    $email = $data['email'];
    
    $delUrl = $deleteUrl . "api_key=".$api_key . "&email=".$email;
    //echo $delUrl;
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
		$u24_user =$_POST;
		$url = $postUrl . "?api_key=".$api_key;
		
        echo "posting data\n";
        echo $url;
        $ch = curl_init();
        $headers= array('Accept: application/json','Content-Type: application/json'); 
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);

        curl_setopt($ch, CURLOPT_POSTFIELDS,json_encode($u24_user, JSON_NUMERIC_CHECK));
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
