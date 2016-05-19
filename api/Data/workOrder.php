<?php 
    require '../../../authenticate.php';
    ini_set('display_errors', 'On');
    error_reporting(E_ALL | E_STRICT);
    include_once("RestRequest.php");
    require_once 'HTTP/Request2.php';
    $config = require '../Configuration/config.php';
    $api_key = '';  

    $postUrl = $config['postWorkOrder']; 
    if (!empty($_SESSION['api_key'])) {
        $api_key = $_SESSION['api_key'];
    }
    //$api_key = 'c0327219-68b2-4a40-9801-fc99e8e1e76f';
    //$api_key = '4fbb38a3-1821-436c-a44d-8d3bc5efd33e';
    switch ($_SERVER['REQUEST_METHOD'])
    {
        case 'GET':

            break;
        case 'POST':
            /*
            //echo "Posting!!!";
            $annotationList =$_POST["annot"];
            $url = $postUrl . "?api_key=".$api_key;
            $count = count($annotationList);
            $newestAnnot = $annotationList[$count-1];
            $newestAnnot["username"] = $_SESSION['username'];
            $newestAnnot["loc"][0] = (float)$newestAnnot["loc"][0];
            $newestAnnot["loc"][1] = (float)$newestAnnot["loc"][1];
            $postRequest = new RestRequest($url,'POST',json_encode($newestAnnot));
            $postRequest->execute();
            echo(json_encode($newestAnnot));
            */
            $workOrder = $_POST;
            $workOrder["username"] = $_SESSION["username"];
            $url = $postUrl . "?api_key=". $api_key;
            $postRequest = new RestRequest($url, 'POST', json_encode($workOrder));
            $postRequest->execute();
            print_r($_POST);
            echo $url;
            echo "done";
            break;
    }
?>
