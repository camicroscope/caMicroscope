<?php
require("./base.php");

$loaderUrl = $services['dataloader'];

$getImageDimensions = function () use ($app, $loaderUrl){
  $fields = array();
  $fields['TCGAId'] = $app->request->params("id");
  $path = "$loaderUrl/DataLoader/query/getDimensionsByIID";
  echo bindaas("GET", $path, $fields);
};

$retrieveImageLocation = function () use ($app, $loaderUrl){
  $fields = array();
  $fields['TCGAId'] = $app->request->params("id");
  $path = "$loaderUrl/DataLoader/query/getFileLocationByIID";
  echo bindaas("GET", $path, $fields);
};

$retrieveMpp = function () use ($app, $loaderUrl){
  $fields = array();
  $fields['TCGAId'] = $app->request->params("id");
  $path = "$loaderUrl/DataLoader/query/getMPPByIID";
  echo bindaas("GET", $path, $fields);
};

$allMetadata = function () use ($app, $loaderUrl){
  $fields = array();
  $fields['TCGAId'] = $app->request->params("id");
  $result = array();
  $path = "$loaderUrl/DataLoader/query/getDimensionsByIID";
  $result['dimensions'] = bindaas("GET", $path, $fields);
  $path = "$loaderUrl/DataLoader/query/getFileLocationByIID";
  $res =  bindaas("GET", $path, $fields);
  $result['location'] = $res;
  $path = "$loaderUrl/DataLoader/query/getMPPByIID";
  $result['mpp'] = bindaas("GET", $path, $fields);
  echo json_encode($result);
};

// define routes
$app->get("/", function() use($app){ echo '{"message":"Select a function."}';});
$app->get("/dimensions", $getImageDimensions);
$app->get("/location", $retrieveImageLocation);
$app->get("/mpp", $retrieveMpp);
$app->get("/metadata", $allMetadata);


$app->run();
?>
