<?php
$baseUrl = "http://quip-data:9099";
$kueUrl = "http://quip-jobs:3000";

// list of services
return array(
  'dataloader' => "$baseUrl/services/Camicroscope_DataLoader" ,
  'annotations' => "$baseUrl/services/Camicroscope_Annotations",
  'template' => "$baseUrl/services/caMicroscope_Templates",
  'kue' => $kueUrl
);
?>
