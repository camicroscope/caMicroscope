<?php require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
$config = require '../Configuration/config.php';
$retrieveUrl =  $config['retrieveAnnotation'];

$api_key = '';
if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}
$annotId=$_GET["annotId"];
$url = $retrieveUrl . $annotId . "&api_key=$api_key";
$retrieveRequest = new RestRequest($url,'GET');
$retrieveRequest->execute();
echo json_encode($retrieveRequest->responseBody);
?>
