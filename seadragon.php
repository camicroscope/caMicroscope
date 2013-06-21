<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>

    <title>OpenSeadragon</title>

    <link rel='stylesheet' 
          type='text/css'
          media='screen'
          href='css/style.css'/>
    <link rel="stylesheet" type="text/css" media="all" href="css/annotools.css" />

    <script src="js/openseadragon.min.js"></script>
    <script type="text/javascript" src="js/mootools-core-1.4.5-full-nocompat-yc.js"></script>
    <script type="text/javascript" src="js/mootools-more-1.4.0.1-compressed.js"></script>
    <script src="js/annotools.js"></script>
</head>

<body>

    <div id="container">

        <div class="demoarea">
                <div id="example-xmlhttprequest-for-dzi" class="openseadragon">
                
                <div id="tool"></div>
                <script type="text/javascript">
                    OpenSeadragon({
                        id:            "example-xmlhttprequest-for-dzi",
                        prefixUrl:     "images/",
                        tileSources:   [
                            "/fastcgi-bin/iipsrv.fcgi?DeepZoom=/u01/app/oracle/images/NLSI0000063.tiff.dzi"
                        ]
                    });
                    var annotool=new annotools('tool',{left:'60px',top:'45px',canvas:'openseadragon-canvas',iid: ''});
                </script>
            </div>
        </div>

    </div>




</body>
</html>
