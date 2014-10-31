<?php require '../../../authenticate.php';

ini_set('display_errors', 'On');

error_reporting(E_ALL | E_STRICT);

include_once("RestRequest.php");

$config = require '../Configuration/config.php';

$templateUrl = $config['retrieveTemplate'];

$api_key = $_SESSION['api_key'];

$url = $templateUrl . "?api_key=$api_key";
$templateRequest = new RestRequest($url,'GET');
$templateRequest->execute();
echo json_encode($templateRequest->responseBody);
?>

