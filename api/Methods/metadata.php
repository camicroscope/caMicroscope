<?php
// to be used with base.php, $app defined

$loaderUrl = $services['dataloader'];

function getImageDimensions(){
  $fields = array();
  $fields['TCGAId'] = $app->request->params("id");
  $path = "$loaderUrl/DataLoader/query/getDimensionsByIID";
  return bindaas("GET", $path, $fields);
}

function retrieveImageLocation(){
  $fields = array();
  $fields['TCGAId'] = $app->request->params("id");
  $path = "$loaderUrl/DataLoader/query/getFileLocationByIID";
  $res =  bindaas("GET", $path, $fields);
  // TODO this is messy, test a cleanup
  foreach ($res[0] as $key => $value) {
      $link = str_replace("tiff", "svs", $value);
      $link = $link . ".dzi";
  }
  return $link;
}

function retrieveMpp(){
  $fields = array();
  $fields['TCGAId'] = $app->request->params("id");
  $path = "$loaderUrl/DataLoader/query/getMPPByIID";
  return bindaas("GET", $path, $fields);
}

function allMetadata(){
  $fields = array();
  $fields['TCGAId'] = $app->request->params("id");
  $result = array();
  $path = "$loaderUrl/DataLoader/query/getDimensionsByIID";
  $result['dimensions'] = bindaas("GET", $path, $fields);
  $path = "$loaderUrl/DataLoader/query/getFileLocationByIID";
  $res =  bindaas("GET", $path, $fields);
  // TODO this is messy, test a cleanup
  foreach ($res[0] as $key => $value) {
      $link = str_replace("tiff", "svs", $value);
      $link = $link . ".dzi";
  }
  $result['location'] = $link;
  $path = "$loaderUrl/DataLoader/query/getMPPByIID";
  $result['mpp'] = bindaas("GET", $path, $fields);
  return json_encode($result);
}

// define routes
$app->get("/metadata/dimensions", getImageDimensions);
$app->get("/metadata/location", retrieveImageLocation);
$app->get("/metadata/mpp", retrieveMpp);
$app->get("/metadata/metadata", allMetadata);

?>
