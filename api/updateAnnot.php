<?php

    $config = require 'config.php';
    $api_key = '';
    if (!empty($_SESSION['api_key'])) {
        $api_key = $_SESSION['api_key'];
    }
    $postUrl = $config['postAnnotation'];
    $deleteUrl = $config['deleteAnnotation'];

    ini_set('display_errors', 'On');
    error_reporting(E_ALL | E_STRICT);
    include_once("RestRequest.php");

    $annotationList=$_POST["annot"];
    //$textToUpdate=$_GET["textToUpdate"];
    echo($annotationList[0]);
    $count = count($annotationList);
    $annot = $annotationList[$count-1];
    $annotId = $annot->annotId;
    print_r($annot);
    $url = "$deleteUrl" . "$annotId&api_key=$api_key";
    $deleteRequest = new RestRequest($url,'DELETE');
    $deleteRequest->execute();

    //$annot->text = $textToUpdate;
    $url2 = $postUrl;
    $postRequest = new RestRequest($url2,'POST',json_encode($annot));
    $postRequest->execute();
?>
