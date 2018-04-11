<?php
// to be used with base.php, $app defined

$templateUrl = $services['annotations'];

function getTemplate(){
  $fields['id'] = $app->request->params("id");
  $path = $templateUrl . "/query/retrieveTemplate";
  return bindaas("GET", $path, $fields);
}

// define routes
$app->get("/template/template", getTemplate);
?>
