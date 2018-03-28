<?php require '../../../authenticate.php';
// annotation handles all interactions with annotations, GET, POST, or DELETE
// bindaas requirements:
// * ??
$services = require 'config.php';
$annotationsUrl = $services['annotations'];
// GET
"$annotationsUrl/MarkupsForImages/query/MarkupsAvilableForImage?"
"$annotationsUrl/MarkupLoader/query/getMultipleMarkups?"
"$annotationsUrl/MarkupLoader/query/getROI"

// POST
"$annotationsUrl/MarkupLoader/submit/json"
"$annotationsUrl/MarkupsForImages/submit/json"

// DELETE
"$annotationsUrl/MarkupLoader/delete/deleteMultipleMarkups",
?>
