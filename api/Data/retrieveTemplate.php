<?php require '../../../authenticate.php';

ini_set('display_errors', 'On');

error_reporting(E_ALL | E_STRICT);

include_once("RestRequest.php");

$config = require '../Configuration/config.php';

$templateUrl = $config['retrieveTemplateByName'];

$api_key = $_SESSION['api_key'];

$default_name='segment_curation';

if (!isset($_GET) || empty($_GET["app_name"]))
{
    $app_name=$default_name;
}
else { 
   $app_name=$_GET["app_name"];
}

$url = $templateUrl . "?api_key=$api_key" . "&app_name=$app_name";

//echo $url;
$templateRequest = new RestRequest($url,'GET');
$templateRequest->execute();
echo json_encode($templateRequest->responseBody);

?>

