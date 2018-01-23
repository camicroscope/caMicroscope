<?php
require '../../../authenticate.php';

include_once("RestRequest.php");
require_once 'HTTP/Request2.php';

$config = require '../Configuration/config.php';
$getUrl = $config['getOverlayTiles'];

if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}

if (isset($_GET["iid"])) {

    // get url parameters
    $iid = $_GET["iid"];
    $algorithms = urlencode($_GET["algorithms"]);

    // build query
    $getUrl = $getUrl . "api_key=" . $api_key;

    $url = $getUrl . "&CaseId=" . $iid . "&algorithms=" . $algorithms;

    // execute query
    $getRequest = new RestRequest($url, 'GET');
    $getRequest->execute();

    // return value
    $annotationList = ($getRequest->responseBody);

    if ($annotationList)
        echo($annotationList);
    else
        echo "No annotations";

}
