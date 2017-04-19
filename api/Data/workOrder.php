<?php 
    header('Content-Type: application/json');
    require '../../../authenticate.php';
    ini_set('display_errors', 'On');
    error_reporting(E_ALL | E_STRICT);
    include_once("RestRequest.php");
    require_once 'HTTP/Request2.php';
    $config = require '../Configuration/config.php';
    $api_key = '';  
    $orderingService = $config['kueUrl'];
    $postUrl = $config['postWorkOrder']; 
    if (!empty($_SESSION['api_key'])) {
        $api_key = $_SESSION['api_key'];
    }

    $kue = 'http://localhost:5001'; 
    //$api_key = 'c0327219-68b2-4a40-9801-fc99e8e1e76f';
    //$api_key = '4fbb38a3-1821-436c-a44d-8d3bc5efd33e';
    switch ($_SERVER['REQUEST_METHOD'])
    {
        case 'GET':
            $id = $_GET['id'];
            $kueUrl = $orderingService . '/job/'. $id;
            $ch = curl_init($kueUrl); 
            
            //Tell cURL that we want to send a POST request.
            //curl_setopt($ch, CURLOPT_POST, 1);
            
            //Attach our encoded JSON string to the POST fields.
            //curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
             
            //Set the content type to application/json
            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json')); 
                         
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          
            //Execute the request
            $result = curl_exec($ch);          
            echo ($result);           
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

            //$url = $postUrl . "?api_key=". $api_key;
            /*
            $kueUrl = "http://localhost:5001" . "/job";
            $postRequest = new RestRequest($kueUrl, 'POST', json_encode($workOrder));
            $postRequest->execute();
            //print_r($_POST);
            print_r(json_encode($workOrder));
            print_r($postRequest);
            //echo $url;
            //echo "done";
            */
  
            $workOrder = $_POST;
            $kueUrl = $orderingService . "/job";
            $postData = json_encode($workOrder);
            $ch = curl_init($kueUrl);

            
            //Tell cURL that we want to send a POST request.
            curl_setopt($ch, CURLOPT_POST, 1);
             
            //Attach our encoded JSON string to the POST fields.
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
             
            //Set the content type to application/json
            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json')); 
            
                       
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            
 
            //Execute the request
            $result = curl_exec($ch);          
            echo json_encode($result);
            //echo $result; 
            break;
    }
?>
