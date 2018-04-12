<?php
require("./base.php");

$templateUrl = $services['annotations'];

$getTemplate = function () use ($app){
  $fields['id'] = $app->request->params("id");
  $path = $templateUrl . "/query/retrieveTemplate";
  return bindaas("GET", $path, $fields);
}

// define routes
$app->get("/template/template", getTemplate);

$app->run();
?>
