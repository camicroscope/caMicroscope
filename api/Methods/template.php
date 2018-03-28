<?php require '../../../authenticate.php';
// template handles templates, GET only
// bindaas requirements:
// * Camicroscope_Annotations or analgous - retrieveTemplate endpoint
ini_set('display_errors', 'On');

error_reporting(E_ALL | E_STRICT);

include_once("../utils/RestRequest.php");

$services = require 'config.php';

$templateUrl = $services['annotations'] . "/query/retrieveTemplate";

$api_key = $_SESSION['api_key'];

$url = $templateUrl . "?api_key=$api_key";
//echo $url;
$templateRequest = new RestRequest($url,'GET');
$templateRequest->execute();
echo json_encode($templateRequest->responseBody);
?>
