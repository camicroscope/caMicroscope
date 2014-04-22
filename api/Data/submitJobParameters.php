<?php require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';
$postUrl = $config['postJobParameters'];

$api_key = '';
if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}
		$newJob =$_POST["job"];
		$url = $postUrl . "?api_key=".$api_key;
		$newJob["username"] = $_SESSION['username'];
		$postRequest = new RestRequest($url,'POST',json_encode($newJob));
		$postRequest->execute();
		echo(json_encode($newJob));
?>
