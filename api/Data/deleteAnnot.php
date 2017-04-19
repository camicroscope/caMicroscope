<?php require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
$config = require '../Configuration/config.php';
$deleteUrl =  $config['deleteAnnotation'];

$api_key = '';
if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}
$annotId=$_GET["annotId"];
$url = $deleteUrl . $annotId . "&api_key=$api_key";
$deleteRequest = new RestRequest($url,'DELETE');
$deleteRequest->execute();
echo json_encode($deleteRequest->getDecodedResponse());
?>
