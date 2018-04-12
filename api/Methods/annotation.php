<?php
require("./base.php");
// to be used with base.php, $app defined

$annotationsUrl = $services['annotations'];
// get with $app->request->params("pathState")

function getAlgs(){
  $fields = array();
  $fields['TCGAId'] = $app->request->params("id");
  $path = "$annotationsUrl/MarkupsForImages/query/MarkupsAvilableForImage";
  return bindaas("GET", $path, $fields);
}

// TODO this doesn't belong here in annots, move it
function getRois(){
  $fields = array();
  $fields['id'] = $app->request->params("id");
  $path = "$annotationsUrl/MarkupLoader/query/getROI";
  return bindaas("GET", $path, $fields);
}

function getMarkups(){
  $fields = array();
  $fields['CaseId'] = $app->request->params("id");
  $fields['x1'] = param_get($app->request->params("x1"), 0);
  $fields['x2'] = param_get($app->request->params("x2"), 0);
  $fields['y1'] = param_get($app->request->params("y1"), 0);
  $fields['y2'] = param_get($app->request->params("y2"), 0);
  $fields['footprint'] = param_get($app->request->params("footprint"), 0);
  $fields['algorithms'] = param_get($app->request->params("algorithms"), "[]");
  $path = "$annotationsUrl/MarkupLoader/query/getMultipleMarkups";
  return bindaas("GET", $path, $fields);
}

function postMarkups(){
  $fields = array();
  // TODO this isn't how id is done for bindaas post I think
  $fields['id'] = $app->request->params("id");
  $body = $request->getBody();
  // TODO validate body?
  $path = "$annotationsUrl/MarkupLoader/submit/json";
  return bindaas("POST", $path, $fields, $body);
}

function postAlgs(){
  $fields = array();
  // TODO this isn't how id is done for bindaas post I think
  $fields['id'] = $app->request->params("id");
  $body = $request->getBody();
  // TODO validate body?
  $path = "$annotationsUrl/MarkupsForImages/submit/json";
  return bindaas("POST", $path, $fields, $body);
}

function deleteMarkups(){
  $fields = array();
  $fields['CaseId'] = $app->request->params("id");
  $fields['x1'] = param_get($app->request->params("x1"), 0);
  $fields['x2'] = param_get($app->request->params("x2"), 0);
  $fields['y1'] = param_get($app->request->params("y1"), 0);
  $fields['y2'] = param_get($app->request->params("y2"), 0);
  $fields['footprint'] = param_get($app->request->params("footprint"), 0);
  $fields['algorithms'] = param_get($app->request->params("algorithms"), "[]");
  $path = "$annotationsUrl/MarkupsForImages/submit/json";
  return bindaas("POST", $path, $fields);
}

// define routes
$app->get("/algorithms", getAlg);
$app->get("/rois", getRois);
$app->get("/markups", getMarkups);
$app->post("/algorithms", postAlgs);
$app->post("/markups", postMarkups);
$app->delete("/markups", deleteMarkups);

$app->run();

?>
