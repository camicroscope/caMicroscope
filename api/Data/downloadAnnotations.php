<?php require '../../../authenticate.php';
ini_set('display_errors', 'On');
error_reporting(E_ALL | E_STRICT);
include_once("RestRequest.php");
require_once 'HTTP/Request2.php';
$config = require '../Configuration/config.php';
$getUrl =  $config['downloadAnnotations'];

$api_key = '';
if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
}
		if(isset($_GET["iid"]))
		{
			header('Content-Disposition: attachment; filename="style.css"');
			header("Content-Transfer-Encoding: ascii");
			header('Expires: 0');
			header('Pragma: no-cache');
			$iid=$_GET["iid"];
			$x = $_GET["x"];
			if($x < 0)
			    $x = 0.0;
			$y = $_GET["y"];
			if($y < 0)
			    $y = 0.0;
			$x1 = $_GET["x1"];
			$y1 = $_GET["y1"];
			$url = $getUrl . $iid ."&X1=" . $x . "&Y1=" . $y . "&X2=" . $x1 . "&Y2=" . $y1 . "&username=" . $_SESSION['username'] . "&api_key=".$api_key;	

			print file_get_contents("http://" . $url);
			echo json_encode("success");
			#$getRequest = new RestRequest($url,'GET');
			#$getRequest->execute();
		}
?>
