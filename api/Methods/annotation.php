<?php
// to be used with base.php, $app defined

$annotationsUrl = $services['annotations'];
// get with $app->request->params("pathState")

function getAlgs(){
  $request = Slim::getInstance()->request();
  $fields = array();
  $fields['TCGAId'] = $request->params("id");
  $path = "$annotationsUrl/MarkupsForImages/query/MarkupsAvilableForImage";
  return bindaas("GET", $path, $fields);
}

// TODO this doesn't belong here in annots, move it
function getRois(){
  $request = Slim::getInstance()->request();
  $fields = array();
  $fields['id'] = $request->params("id");
  $path = "$annotationsUrl/MarkupLoader/query/getROI";
  return bindaas("GET", $path, $fields);
}

function getMarkups(){
  $request = Slim::getInstance()->request();
  $fields = array();
  $fields['CaseId'] = $request->params("id");
  $fields['x1'] = param_get($request->params("x1"), 0);
  $fields['x2'] = param_get($request->params("x2"), 0);
  $fields['y1'] = param_get($equest->params("y1"), 0);
  $fields['y2'] = param_get($request->params("y2"), 0);
  $fields['footprint'] = param_get($request->params("footprint"), 0);
  $fields['algorithms'] = param_get($request->params("algorithms"), "[]");
  $path = "$annotationsUrl/MarkupLoader/query/getMultipleMarkups";
  return bindaas("GET", $path, $fields);
}

function postMarkups(){
  $request = Slim::getInstance()->request();
  $fields = array();
  // TODO this isn't how id is done for bindaas post I think
  $fields['id'] = $request->params("id");
  $body = $request->getBody();
  // TODO validate body?
  $path = "$annotationsUrl/MarkupLoader/submit/json";
  return bindaas("POST", $path, $fields, $body);
}

function postAlgs(){
  $request = Slim::getInstance()->request();
  $fields = array();
  // TODO this isn't how id is done for bindaas post I think
  $fields['id'] = $request->params("id");
  $body = $request->getBody();
  // TODO validate body?
  $path = "$annotationsUrl/MarkupsForImages/submit/json";
  return bindaas("POST", $path, $fields, $body);
}

function deleteMarkups(){
  $request = Slim::getInstance()->request();
  $fields = array();
  $fields['CaseId'] = $request->params("id");
  $fields['x1'] = param_get($request->params("x1"), 0);
  $fields['x2'] = param_get($request->params("x2"), 0);
  $fields['y1'] = param_get($request->params("y1"), 0);
  $fields['y2'] = param_get($request->params("y2"), 0);
  $fields['footprint'] = param_get($request->params("footprint"), 0);
  $fields['algorithms'] = param_get($request->params("algorithms"), "[]");
  $path = "$annotationsUrl/MarkupsForImages/submit/json";
  return bindaas("POST", $path, $fields);
}

// define routes
$app->get("/annotation/algorithms", getAlgs);
$app->get("/annotation/rois", getRois);
$app->get("/annotation/markups", getMarkups);
$app->post("/annotation/algorithms", postAlgs);
$app->post("/annotation/markups", postMarkups);
$app->delete("/annotation/markups", deleteMarkups);

?>
