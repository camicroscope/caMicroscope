<?php require '../../../authenticate.php';
//ini_set('display_errors', 'On');
//error_reporting(E_ALL | E_STRICT);


include_once("RestRequest.php");
require_once 'HTTP/Request2.php';

$config = require '../Configuration/config.php';
$getUrl =  $config['findUserByEmail'];

if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}
switch ($_SERVER['REQUEST_METHOD'])
{
	case 'GET':

   $email=$_GET["email"];
		
   $url  = $getUrl . "api_key=" . urlencode($api_key) . "&email=". $email;
	 $getRequest = new RestRequest($url,'GET');
   $getRequest->execute();
   $user = ($getRequest->responseBody);
   if($user)
      echo ($user);
   else
      echo "No user found.";

  break;      
}
?>
