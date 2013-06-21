<?php session_start();

require_once 'HTTP/Request2.php';
$config = require 'config.php';

$user     = $_REQUEST['username'];
$password = $_REQUEST['password'];


$realm = $config['auth_realm'];
$request = new HTTP_Request2("http://$user:$password@$realm");

try {
    $response = $request->send();
    if (200 == $response->getStatus()) {
	$json_output = json_decode($response->getBody());
	$_SESSION['username'] = $user;
	$_SESSION['api_key'] = $json_output->api_key;
	error_log(print_r($json_output->api_key, TRUE)); 
	error_log(print_r($_SESSION['username'], TRUE)); 
	header("Location: ../viewer.php?fileLocation=/u01/app/oracle/images/NLSI0000063.tiff&iid=AA00448 0002&username=".$user); 
    } else {
        echo 'Unexpected HTTP status: ' . $response->getStatus() . ' ' .
             $response->getReasonPhrase();
    }
} catch (HTTP_Request2_Exception $e) {
    echo 'Error: ' . $e->getMessage();
}

?>
