<?php
require("./base.php");

$loaderUrl = $services['dataloader'];
$basekueUrl = $services['kue'];

$getOrder = function () use ($app, $basekueUrl){
  $id =  $app->request->params("id");
  $kueUrl = $basekueUrl . '/job/'. $id;
  $ch = curl_init($kueUrl);
  curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  //Execute the request
  $result = curl_exec($ch);
  echo $result;
}

$postOrder = function () use ($app, $basekueUrl){
  $kueUrl = $basekueUrl . "/job";
  // TODO does this work using raw body?
  $postData = $request->getBody();
  //$postData = json_encode($workOrder);
  $ch = curl_init($kueUrl);
  //Tell cURL that we want to send a POST request.
  curl_setopt($ch, CURLOPT_POST, 1);
  //Attach our encoded JSON string to the POST fields.
  curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
  //Set the content type to application/json
  curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $result = curl_exec($ch);
  echo json_encode($result);
}

$app->get("/", function() use($app){ echo '{"message":"Select a function."}';});
$app->get("/workOrder/workOrder", $getOrder);
$app->post("/workOrder/workOrder", $postOrder);


$app->run();
?>
