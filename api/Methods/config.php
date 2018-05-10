<?php
if (file_exists('../../../config.php')) {
    $config = require '../../../config.php';
}
else {
    $config = ['dataHost' => 'quip-data:9099',
               'kueHost' => 'quip-jobs:3000'];
}

$baseUrl = "http://" . $config['dataHost'];
$kueUrl = "http://" . $config['kueHost'];

// list of services
return array(
  'dataloader' => "$baseUrl/services/Camicroscope_DataLoader" ,
  'annotations' => "$baseUrl/services/Camicroscope_Annotations",
  'template' => "$baseUrl/services/caMicroscope_Templates",
  'kue' => $kueUrl
);
?>
