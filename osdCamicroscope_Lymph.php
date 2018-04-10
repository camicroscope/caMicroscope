<?php
/**
 * Lymphocyte App
 */
include 'shared/osdHeader.php';
?>
<script>
var _USERNAME = "<?php echo filter_var($_SESSION["email"], FILTER_SANITIZE_EMAIL); ?>";
</script>

<!-- ANNOTATION -->
    <script src="js/annotationtoolslymph/annotools-openseajax-handler-lymph.js"></script>
    <script src="js/annotationtoolslymph/ToolBar_Lymph.js"></script>
    <script src="js/annotationtoolslymph/AnnotationStore_Lymph.js"></script>
    <script src="js/annotationtoolslymph/osdAnnotationTools_Lymph.js"></script>
    <script src="js/annotationtoolslymph/osdAnnotationTools_Marking.js"></script>
    <script src="js/annotationtoolslymph/geoJSONHandler_Lymph.js"></script>
<!-- /ANNOTATION -->

        <div id="tool"></div>
        <div id="panel"></div>

        <div id="weightpanel">
            <a href='#'><div id='closeWeightPanel'><img src='images/ic_close_white_24px.svg' title='Close' alt="Close X" height="16" width="16"></div></a>
            <div id="bar1" class="bar" align="right"><div id="slide1" class="slide"></div></div>
            <label class="lb_heatmap"><input type="checkbox" id="cb1" checked> Lymphocyte Sensitivity</label>
            <div id="bar2" class="bar" align="right"><div id="slide2" class="slide"></div></div>
            <label class="lb_heatmap"><input type="checkbox" id="cb2" checked> Necrosis Specificity</label>
            <div id="bar3" class="bar" align="right"><div id="slide3" class="slide"></div></div>
            <label class="lb_heatmap"><input type="checkbox" id="cb3" checked> Smoothness</label><br><p>
	        <button type="button" class="btn_heatmap" id="btn_revertWeight">Revert Weights</button>
            <br><p>
            <input type="radio" name="weighttype" value="LymSe" id="LymSe"> <label for="LymSe" class=radio_markup>Lymphocyte Prediction</label> <br>
            <input type="radio" name="weighttype" value="NecSe" id="NecSe"> <label for="NecSe" class=radio_markup>Necrosis Prediction</label> <br>
            <input type="radio" name="weighttype" value="BothSe" id="BothSe" checked> <label for="BothSe" class=radio_markup>Lym Prediction with Nec Filtering</label> <br>
            <button type="button" class="btn_heatmap" id="btn_saveHeatmapWeight">Finalize</button>
            <button type="button" class="btn_heatmap" id="btn_heatmapweight_help">&#x2753</button>
        </div>

        <div id="qualitypanel">
            <a href='#'><div id='closeQualityPanel'><img src='images/ic_close_white_24px.svg' title='Close' alt="Close X" height="16" width="16"></div></a>
	    <div id="qslider"></div>
	    <p>
	    <button type="button" class="btn_heatmap" id="myReset">Reset</button> 
            <button type="button" class="btn_heatmap" id="btn_saveHeatmapQuality">Finalize</button>
            <button type="button" class="btn_heatmap" id="btn_heatmapquality_help">&#x2753</button>
        </div>

        <div id="markuppanel">
			<a href='#'><div id='closeMarkupPanel'><img src='images/ic_close_white_24px.svg' title='Close' alt="Close X" height="16" width="16"></div></a>
			<!--
            <input type="radio" name="marktype" value="LymPos" checked="checked" id="LymPos" class="radio_markup" color="red" linewidth=1 lineaffect=1>
            <label for="LymPos" class=radio_markup> (1) LymPos (draw thin line)</label><br>
            <input type="radio" name="marktype" value="LymNeg" id="LymNeg" class="radio_markup" color="blue" linewidth=1 lineaffect=1>
            <label for="LymNeg" class=radio_markup> (2) LymNeg (draw thin line)</label><br><p><p>
            <input type="radio" name="marktype" value="LymPosBig" id="LymPosBig" class="radio_markup" color="red" linewidth=6 lineaffect=2>
            <label for="LymPosBig" class=radio_markup> (3) LymPos (draw thick line)</label><br>
            <input type="radio" name="marktype" value="LymNegBig" id="LymNegBig" class="radio_markup" color="blue" linewidth=6 lineaffect=2>
            <label for="LymNegBig" class=radio_markup> (4) LymNeg (draw thick line)</label><br><p><p>
            <input type="radio" name="marktype" value="TumorPos" id="TumorPos" class="radio_markup" color="orange" linewidth=1 lineaffect=1>
            <label for="TumorPos" class=radio_markup> (5) TumorPos (draw polygon)</label><br>
            <input type="radio" name="marktype" value="TumorNeg" id="TumorNeg" class="radio_markup" color="lime" linewidth=1 lineaffect=1>
            <label for="TumorNeg" class=radio_markup> (6) TumorNeg (draw polygon)</label><br><p><p>
            -->

			<?php
				$string = file_get_contents("customized/lymph/markup_types.json");
				$json_data = json_decode($string, true);
				$a = 'NA';
				$selected_idx = 1;
				foreach ($json_data as $key1 => $value1) {
					$load_caption = $json_data[$key1]["caption"];
					$load_dbname = $json_data[$key1]["DBName"];
					$load_color = $json_data[$key1]["color"];
					$load_linewidth = $json_data[$key1]["linewidth"];
					$load_lineaffect = $json_data[$key1]["lineaffect"];

					if (strcmp($load_caption, 'NULL') == 0)
					{
						echo '<p><p>';
					}
					else
					{
						echo '<input type="checkbox" name="markvisualized" id="' . $load_dbname . '_visualized' . '" checked> &nbsp &nbsp';
						if ($selected_idx == 1) {
							echo '<input type="radio" name="marktype" value="' . $load_dbname . '" id="' . $load_dbname . '" class="radio_markup" ' . 'color="' . $load_color . '" linewidth=' . $load_linewidth . ' lineaffect=' . $load_lineaffect . ' checked>';
						} else {
							echo '<input type="radio" name="marktype" value="' . $load_dbname . '" id="' . $load_dbname . '" class="radio_markup" ' . 'color="' . $load_color . '" linewidth=' . $load_linewidth . ' lineaffect=' . $load_lineaffect . '>';
						}
						$selected_idx = $selected_idx + 1;
						$temp = '<label for="abc" class=radio_markup> ' . $load_caption . '</label><br>';
						//$temp = '<label class=radio_markup> ' . $load_caption . '</label><br>';
						echo $temp;
					}
				}
			?>
            <p><p>
            &nbsp &nbsp &nbsp <input type="radio" name="marktype" value="Moving" id="rb_Moving" class="radio_markup">
            <label for="rb_Moving" class=radio_markup> Save then Navigate</label><br>
            <button type="button" class="btn_mark" id="btn_savemark">Save</button>
            <button type="button" class="btn_mark" id="btn_undomark" >Cancel</button>
            <button type="button" class="btn_mark" id="btn_mark_help">&#x2753</button>
        </div>

        <div id="qualitymarkuppanel">
            <a href='#'><div id='closeQualityMarkupPanel'><img src='images/ic_close_white_24px.svg' title='Close' alt="Close X" height="16" width="16"></div></a>
            <input type="radio" name="marktype" value="AlgoA" checked="checked" id="AlgoA" class="radio_markup">
            <label for="AlgoA" class=radio_markup> (1) AlgoA (draw thin line)</label><br>
            <input type="radio" name="marktype" value="AlgoB" id="AlgoB" class="radio_markup">
            <label for="AlgoB" class=radio_markup> (2) AlgoB (draw thin line)</label><br><p><p>
            <input type="radio" name="marktype" value="AlgoABig" id="AlgoABig" class="radio_markup">
            <label for="AlgoABig" class=radio_markup> (3) AlgoA (draw thick line)</label><br>
            <input type="radio" name="marktype" value="AlgoBBig" id="AlgoBBig" class="radio_markup">
            <label for="AlgoBBig" class=radio_markup> (4) AlgoB (draw thick line)</label><br><p><p>
            <input type="radio" name="marktype" value="AlgoAPoly" id="AlgoAPoly" class="radio_markup">
            <label for="AlgoAPoly" class=radio_markup> (5) AlgoA (draw polygon)</label><br>
            <input type="radio" name="marktype" value="AlgoBPoly" id="AlgoBPoly" class="radio_markup">
            <label for="AgloBPoly" class=radio_markup> (6) AlgoB (draw polygon)</label><br><p><p>
            <button type="button" class="btn_mark" id="btn_savequalmark">Save</button>
            <button type="button" class="btn_mark" id="btn_undoqualmark" >Cancel</button>
            <button type="button" class="btn_mark" id="btn_qualmark_help">&#x2753</button>
        </div>

        <div id="div_weight_locked" style="display: none;">Free</div>
        <div id="div_quality_locked" style="display: none;">Free</div>

        <div id="switchuserpanel"><a href='#'><div id='closeSwitchUser'><img src='images/ic_close_white_24px.svg' title='Close' alt="Close X" height="16" width="16"></div></a>
            <h6><img src="images/switch_user.svg" alt="Switch user" height="30" width="30"> Change username to:</h6><br />
        </div>

        <div id="algosel"><div id="tree"></div></div>
            <div class="demoarea">
                <div id="viewer" class="openseadragon"></div>
            </div>
        <div id="navigator"></div>

        </div>
        <div id="confirmDelete" style="display:none">
          <p> Please enter the secret: <input id="deleteSecret" type="password" /> <a href="#confirmDelete" rel="modal:close"><button id="confirmDeleteButton">Delete</button></a></p>
        </div>
        <script type="text/javascript">
          $.noConflict();
          var annotool = null;
	  var appid = <?php echo json_encode($_GET['appid']); ?>;
          var tissueId = <?php echo json_encode($_GET['tissueId']); ?>;
  	var slider = document.getElementById('qslider');
  	var myRange = {
  	    'min': [0],
  	    'max': [100]
  	};  
        var qualthresholds;
        if (typeof qualthreshols == 'undefined') {
                console.log("Reset Weights");
	  	qualthresholds = {
			'low': 30,
			'median': 50,
			'high': 70
		};
        }
  	var filter5 = function (value,type) {
  	    var mvalue = value/10;
  	    var eoval = mvalue % 2;
  	    if (eoval != 0) {
  	        return 2;
  	    } else {
  	        return 1;
  	    }
  	}
  	
  	noUiSlider.create(slider, {
  	  start: [qualthresholds.low,qualthresholds.high],
  	  step: 1,
  	  connect: true,
  	  tooltips: true,
  	  format: wNumb({
  	  decimals: 0
  	  }),
  	  range: myRange,
        });
                 
          var cancerType = "<?php echo $_SESSION["cancerType"] ?>";
          //console.log(cancerType);
          var imagedata = new OSDImageMetaData({imageId:tissueId});
          //console.log(tissueId);
          //console.log(imagedata);
          //console.log(tissueId);

          var MPP = imagedata.metaData[0];
          console.log(MPP);
            //console.log(imagedata);
          var fileLocation = imagedata.metaData[1];//.replace("tcga_data","tcga_images");
          //console.log(fileLocation);

          var viewer = new OpenSeadragon.Viewer({
                id: "viewer",
                prefixUrl: "images/",
                showNavigator:  true,
                navigatorPosition:   "BOTTOM_RIGHT",
                //navigatorId: "navigator",
                zoomPerClick: 2,
                //zoomPerScroll: 1,
                animationTime: 0.75,
                maxZoomPixelRatio: 2,
                visibilityRatio: 1,
                constrainDuringPan: true
          });
            //console.log(viewer.navigator);
            //var zoomLevels = viewer.zoomLevels({
            //  levels:[0.001, 0.01, 0.2, 0.1,  1]
            //});

            viewer.addHandler("open", addOverlays);
            viewer.clearControls();
            viewer.open("<?php print_r($config['fastcgi_server']); ?>?DeepZoom=" + fileLocation);
            var imagingHelper = new OpenSeadragonImaging.ImagingHelper({viewer: viewer});
            imagingHelper.setMaxZoom(2);
            //console.log(this.MPP);
            viewer.scalebar({
              type: OpenSeadragon.ScalebarType.MAP,
              pixelsPerMeter: (1/(parseFloat(this.MPP["mpp-x"])*0.000001)),
              xOffset: 5,
              yOffset: 10,
              stayInsideImage: true,
              color: "rgb(150,150,150)",
              fontColor: "rgb(100,100,100)",
              backgroundColor: "rgba(255,255,255,0.5)",
              barThickness: 2
            });

          //console.log(viewer);

          function isAnnotationActive() {
              // isAnnotationActive called from osdAnnotationTools.js
              this.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

              this.isFirefox = typeof InstallTrigger !== 'undefined';

              //this.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0; // Fix Safari check.
              var browser = navigator.userAgent;
              this.isSafari = (browser.search("Safari") >= 0 && browser.search("Chrome") < 0);

              this.isEdge = (browser.search("Edge") >= 0);

              this.isChrome = !!window.chrome && !this.isOpera && !this.isEdge;

              this.isIE = /*@cc_on!@*/false || !!document.documentMode;

              this.annotationActive = !( this.isIE || this.isOpera);
              return this.annotationActive;
          }


    function addOverlays() {
        var annotationHandler = new AnnotoolsOpenSeadragonHandler(viewer, {});
        var sessionUsername = <?php echo '"' . $_SESSION['email'] . '"' ?>;
        //var sessionUsername = 'test@gmail.com';
        annotool= new annotools({
                canvas:'openseadragon-canvas',
                iid: tissueId,
            	displayId: tissueId,
                viewer: viewer,
                annotationHandler: annotationHandler,
                mpp:MPP,
                username: sessionUsername
            });
        var toolBar = new ToolBar('tool', {
            left:'0px',
            top:'0px',
            height: '48px',
            width: '100%',
            iid: tissueId,
            displayId: tissueId,
            annotool: annotool,
            viewer: viewer

        });

        annotool.toolBar = toolBar;
        annotationHandler.annotool = annotool;
        annotationHandler.toolbar = toolBar;
        toolBar.createButtons();

        /*Pan and zoom to point*/
        var bound_x = <?php echo json_encode($_GET['x']); ?>;
        var bound_y = <?php echo json_encode($_GET['y']); ?>;
        var zoom = <?php echo json_encode($_GET['zoom']); ?> || viewer.viewport.getMaxZoom();
        zoom =Number(zoom); //convert zoom to number if it is string

        jQuery("#panel").hide();
        jQuery("#weightpanel").hide();
        jQuery("#qualitypanel").hide();
        jQuery("#markuppanel").hide();
        jQuery("#qualitymarkuppanel").hide();
        jQuery("#switchuserpanel").hide();
        
        var mySlider = jQuery("#qslider")[0];
        mySlider.noUiSlider.on("set", function (values,handle) {    
            a = mySlider.noUiSlider.get();
            console.log(a);
	    if(handle == 0) {
		qualthresholds.low = parseInt(a[0]);
	    } else {
		qualthresholds.high = parseInt(a[1]);
	    }
	    qualthresholds.median = qualthresholds.low + (( qualthresholds.high - qualthresholds.low )/2);
        });

        var myReset = jQuery("#myReset");

        myReset.on("click", function () {
            mySlider.noUiSlider.reset();
        });

        /* Close weight panel */
        jQuery('#closeWeightPanel').click(function (e) {
	        e.preventDefault();
            jQuery("#weightpanel").hide('slide');
        });
        
        /* Close quality panel */
        jQuery('#closeQualityPanel').click(function (e) {
	    e.preventDefault();
            console.log("Closing quality panel");
            jQuery("#qualitypanel").hide('slide');
        });
        
        /* Close TumorPosmarkup panel */
        jQuery('#closeMarkupPanel').click(function (e) {
	        e.preventDefault();
            annotool.mode = 'normal';
            jQuery("canvas").css("cursor", "default");
            jQuery("#freeLineMarkupButton").removeClass("active");
            jQuery("#markuppanel").hide('slide');
            annotool.drawLayer.hide();
            annotool.addMouseEvents();
        });
                 
        /* Close Quality`markup panel */
        jQuery('#closeQualityMarkupPanel').click(function (e) {
	        e.preventDefault();
            annotool.mode = 'normal';
            jQuery("canvas").css("cursor", "default");
            jQuery("#freeLineMarkupButton").removeClass("active");
            jQuery("#qualitymarkuppanel").hide('slide');
            annotool.drawLayer.hide();
            annotool.addMouseEvents();
        });
                 
        var getArgs = location.search.substr(1).split("&").reduce((o,i)=>(u=decodeURIComponent,[k,v]=i.split("="),o[u(k)]=v&&u(v),o),{});
        if (getArgs.appid == "qualheat") {
           jQuery("p.titleButton")[0].innerHTML = "caMic Segmentation Quality App";
        }

        if(bound_x && bound_y){
            var ipt = new OpenSeadragon.Point(+bound_x, +bound_y);
            var vpt = viewer.viewport.imageToViewportCoordinates(ipt);
            viewer.viewport.panTo(vpt);
            viewer.viewport.zoomTo(zoom);
        } else {
            console.log("bounds not specified");
        }
    }

    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
            ;
            });
        };
    }

    /*Zoom to location*/
    /*
        x: 19483.04157968738
        y: 22274.643967801494
    */
    /*
        x: 13083.041579687379
        y: 19609.643967801494
    */

</script>
<?php include 'shared/osdFooter.php'; ?>
