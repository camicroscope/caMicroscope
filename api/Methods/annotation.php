<?php require '../../../authenticate.php';
include_once("../utils/RestRequest.php");
// annotation handles all interactions with annotations, GET, POST, or DELETE
// bindaas requirements:
// * MarkupsForImages
// * MarkupLoader

// null coalesce replacement function
function param_get(&$value, $default = null)
{
    return isset($value) ? $value : $default;
}


$services = require 'config.php';
$annotationsUrl = $services['annotations'];

// require api key is set
if (!empty($_SESSION['api_key'])) {
    $api_key = $_SESSION['api_key'];
} else {
  die();
}

// reuire request type
if(isset($_GET["type"])) {
    $type = $_GET["type"];
} else {
  echo "type required\n";
}

// all of these methods require id
if(isset($_GET["id"])) {
    $caseid = $_GET["id"];
} else {
  echo "id required\n";
}

// build url fields
$fields = array();

if ($_SERVER['REQUEST_METHOD'] == "GET"){
  // input - image id
  if ($type == "algorithms"){

    $fields['TCGAId'] = $caseid;
    $fields['api_key'] = $api_key;
    $url = "$annotationsUrl/MarkupsForImages/query/MarkupsAvilableForImage?" . http_build_query($fields, '', "&");
    $getRequest = new RestRequest($url, 'GET');
    $getRequest->execute();
    echo $getRequest->responseBody;
  }
  // input - image id
  elseif ($type == "rois"){
    $fields['id'] = $caseid;
    $fields['api_key'] = $api_key;
    $url = "$annotationsUrl/MarkupLoader/query/getROI?" . http_build_query($fields, '', "&");
    $getRequest = new RestRequest($url, 'GET');
    $getRequest->execute();
    echo $getRequest->responseBody;
    echo $url;
  }
  // input - view bounds, algorithm, footprint
  elseif ($type == "markups"){
    $fields['CaseId'] = $caseid;
    $fields['x1'] = param_get($_GET["x1"], 0);
    $fields['x2'] = param_get($_GET["x2"], 0);
    $fields['y1'] = param_get($_GET["y1"], 0);
    $fields['y2'] = param_get($_GET["y2"], 0);
    $fields['footprint'] = param_get($_GET["footprint"], 0);
    $fields['algorithms'] = param_get($_GET["algorithms"], "[]");
    $fields['api_key'] = $api_key;
    $url = "$annotationsUrl/MarkupLoader/query/getMultipleMarkups?" . http_build_query($fields, '', "&");
    $getRequest = new RestRequest($url, 'GET');
    $getRequest->execute();
    echo $getRequest->responseBody;
  } else {
    echo "unrecognized type\n";
  }
}


elseif ($_SERVER['REQUEST_METHOD'] == "POST"){
  // input - annotation list
  if ($type == "algorithms"){
    $fields['api_key'] = $api_key;
    http_build_query($fields, '', "&");
    $url = "$annotationsUrl/MarkupsForImages/submit/json?" . http_build_query($fields, '', "&");
    // TODO validate content, permissions
    // may not work, but just encode post data
    $data = json_encode($_POST);
    $postRequest = new RestRequest($url, 'POST', $data);
    $postRequest->execute();
    echo $postRequest->responseBody;
  }
  // input - annotation authorship
  elseif ($type == "markups"){

    $fields['api_key'] = $api_key;
    $url = "$annotationsUrl/MarkupLoader/submit/json?". http_build_query($fields, '', "&");
    // TODO validate content, permissions
    // may not work, but just encode post data
    $data = json_encode($_POST);
    $postRequest = new RestRequest($url, 'POST', $data);
    $postRequest->execute();
    echo $postRequest->responseBody;
  } else {
    echo "unrecognized type\n";
  }
}

elseif ($_SERVER['REQUEST_METHOD'] == "DELETE"){
  if ($type == "markups"){
    $fields['CaseId'] = $caseid;
    $fields['x1'] = param_get($_GET["x1"], 0);
    $fields['x2'] = param_get($_GET["x2"], 0);
    $fields['y1'] = param_get($_GET["y1"], 0);
    $fields['y2'] = param_get($_GET["y2"], 0);
    $fields['execution_id'] = param_get($_GET["execution_id"], "");
    $fields['api_key'] = $api_key;
    $url = "$annotationsUrl/MarkupLoader/delete/deleteMultipleMarkups?" . http_build_query($fields, '', "&");
    $deleteRequest = new RestRequest($url, 'DELETE');
    $deleteRequest->execute();
    echo $deleteRequest->responseBody;
  } else {
    echo "unrecognized type\n";
  }
}

else {
  // unrecognized verb
  echo "unrecognized verb";
}
?>
