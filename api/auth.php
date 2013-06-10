<?php

require_once 'HTTP/Request2.php';
$config = require 'config.php';

$user     = $_REQUEST['username'];
$password = $_REQUEST['password'];


$realm = $config['auth_realm'];
$request = new HTTP_Request2("http://$user:$password@$realm");

try {
    $response = $request->send();
    if (200 == $response->getStatus()) {
        //echo $response->getBody();
		$json_output = json_decode($response->getBody());
		
		$_SESSION['username'] = $user;
		
		error_log(print_r($json_output->api_key, TRUE)); 
		error_log(print_r($_SESSION['username'], TRUE)); 
		header("Location: ../viewer.html?fileLocation=/data/images/NLSI0000063.tiff&&iid=AA00448 0002"); 
    } else {
        echo 'Unexpected HTTP status: ' . $response->getStatus() . ' ' .
             $response->getReasonPhrase();
    }
} catch (HTTP_Request2_Exception $e) {
    echo 'Error: ' . $e->getMessage();
}

?>