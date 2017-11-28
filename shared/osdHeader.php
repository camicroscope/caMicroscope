<?php
// Start/continue session
session_start();

require '../authenticate.php';
$config = require 'api/Configuration/config.php';

// Set session variables
if (isset($_GET["cancerType"])) {
    $cancerType = $_GET["cancerType"];
    $_SESSION["cancerType"] = "u24_" . $cancerType;
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>[caMicroscope OSD][Subject: <?php echo json_encode($_GET['tissueId']); ?>
        ][User: <?php echo $_SESSION["name"]; ?>]</title>

    <!-- CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
          integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" media="all" href="css/annotools.css"/>
    <link rel="stylesheet" type="text/css" media="all" href="css/simplemodal.css"/>
    <link rel="stylesheet" type="text/css" media="all" href="css/ui.fancytree.min.css"/>
    <link rel="stylesheet" type="text/css" media="all"
          href="https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.7.0/jquery.modal.css"/>
    <link rel="stylesheet" type="text/css" media="all" href="css/multiheattools.css"/>

    <!-- JAVASCRIPT -->
    <script
            src="https://code.jquery.com/jquery-3.2.1.min.js"
            integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="
            crossorigin="anonymous"></script>
    <!-- script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script -->
    <!-- script src="js/dependencies/jquery.js"></script -->

    <!--JSON Form dependencies-->
    <script src="js/dependencies/underscore.js"></script>
    <script src="js/dependencies/jsonform.js"></script>
    <script src="js/dependencies/jsv.js"></script>
    <!--End JSON Form dependencies-->

    <script src="/js/config.js"></script>

    <!--script src="js/openseadragon/openseadragon-bin-1.0.0/openseadragon.js"></script-->
    <script src="js/openseadragon/openseadragon-bin-2.3.1/openseadragon.js"></script>
    <script src="js/openseadragon/openseadragon-imaginghelper.min.js"></script>
    <script src="js/openseadragon/openseadragon-scalebar.js"></script>
    <script src="js/openseadragon/openseadragonzoomlevels.js"></script>

    <script src="js/mootools/mootools-core-1.4.5-full-nocompat-yc.js"></script>
    <script src="js/mootools/mootools-more-1.4.0.1-compressed.js"></script>

    <!--script src="js/annotationtools/annotools-openseajax-handler.js"></script-->

    <script src="js/imagemetadatatools/osdImageMetadata.js"></script>

    <!--script src="js/annotationtools/ToolBar.js"></script-->
    <!--script src="js/annotationtools/AnnotationStore.js"></script-->
    <!--script src="js/annotationtools/osdAnnotationTools.js"></script-->
    <!--script src="js/annotationtools/geoJSONHandler.js"></script-->

    <script src="js/dependencies/MD5.js"></script>

    <script src="http://code.jquery.com/ui/1.11.2/jquery-ui.min.js"></script>

    <!--Filtering Tools-->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/camanjs/4.1.2/caman.full.js"></script>
    <script src="js/filteringtools/openseadragon-filtering.js"></script>
    <script src="js/filteringtools/spinner-slider.js"></script>
    <script src="js/filteringtools/spinner.js"></script>
    <script src="js/filteringtools/FilterTools.js"></script>
    <!--End Filtering Tools-->

    <script src="js/dependencies/jquery.fancytree-all.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.7.0/jquery.modal.js"></script>
    <script src="js/dependencies/simplemodal.js"></script>
    <script src="js/dependencies/d3.js"></script>
    <script src="shared/overlay_image_test.js"></script>

    <style type="text/css">
        .openseadragon {
            height: 100%;
            min-height: 100%;
            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
            margin: 0;
            padding: 0;
            background-color: #E8E8E8;
            border: 1px solid black;
            color: white;
        }

        .navWindow {
            position: absolute;
            z-index: 10001;
            right: 0;
            bottom: 0;
            border: 1px solid yellow;
        }

        .controls textarea {
            height: 50px;
        }

        .modal a.close-modal {
            top: 0;
            right: 0;
        }

    </style>
</head>
<body>
