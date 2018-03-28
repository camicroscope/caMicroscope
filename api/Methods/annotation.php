<?php require '../../../authenticate.php';
// annotation handles all interactions with annotations, GET, POST, or DELETE
// bindaas requirements:
// * MarkupsForImages
// * MarkupLoader

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
  die();
}

if ($_SERVER['REQUEST_METHOD'] == "GET"){
  // input - image id
  if ($type == "algorithms"){
    "$annotationsUrl/MarkupsForImages/query/MarkupsAvilableForImage?"
  }
  // input - image id
  elseif ($type == "rois"){
    "$annotationsUrl/MarkupLoader/query/getROI"
  }
  // input - view bounds, algorithm, footprint
  elseif ($type == "markups"){
    "$annotationsUrl/MarkupLoader/query/getMultipleMarkups?"
  }
}


elseif ($_SERVER['REQUEST_METHOD'] == "POST"){
  // input - annotation list
  if ($type == "algorithms"){
    "$annotationsUrl/MarkupsForImages/submit/json"
  }
  // input - annotation authorship
  elseif ($type == "markups"){
    "$annotationsUrl/MarkupLoader/submit/json"
  }
}

elseif ($_SERVER['REQUEST_METHOD'] == "DELETE"){
  elseif ($type == "markups"){
    "$annotationsUrl/MarkupLoader/delete/deleteMultipleMarkups"
  }
}

else {
  die();
}
?>
