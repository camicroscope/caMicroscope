/**
 * TOOLBAR
 * LYMPHOCYTE APP
 */
$.getScript('shared/ToolBar.js', function () {

    /**
     * Create Buttons
     */
    ToolBar.prototype.createButtons = function () {

        // this.tool = jQ(this.source)
        var tool = jQuery('#' + 'tool'); // Temporary dom element while we clean up mootools
        var self = this;

        // Fetch algorithms for Image
        jQuery(document).ready(function () {
            // console.log(options)
            // var self= this

            jQuery.get('api/Data/getAlgorithmsForImage.php?iid=' + self.iid, function (data) {
                d = JSON.parse(data);

                // check version here start
                var max_ver = 0;
                for (var i = 0; i < d.length; i++) {
                    var n = {};

                    n.refKey = d[i].provenance.analysis_execution_id;
                    // console.log("n.refKey: " + n.refKey);
                    if (n.refKey.includes('lym_v')) {
                        var ver = parseInt(n.refKey.split('lym_v')[1].split('-')[0]);
                        if (ver > max_ver) {
                            max_ver = ver;
                        }
                    }
                }
                // console.log("version: " + max_ver);

                for (var i = 0; i < d.length; i++) {
                    var n = {};

                    n.refKey = d[i].provenance.analysis_execution_id;
                    // console.log("n.refKey: " + n.refKey);

                    if (n.refKey == 'lym_v' + max_ver + '-high_res' || n.refKey == 'lym_v' + max_ver + '-low_res' || n.refKey == 'humanmark') {
                        SELECTED_ALGORITHM_LIST.push(n.refKey);
                        SELECTED_ALGORITHM_KEYS.push(i);
                    }
                }

                goodalgo(d, null);
            });

            jQuery('#submitbtn').click(function () {
                var selKeys = jQuery('#tree').fancytree('getTree').getSelectedNodes();
                var param = '';
                for (i = 0; i < selKeys.length; i++) {
                    param = param + '&Val' + (i + 1).toString() + '=' + selKeys[i].title
                }
            });
        });

        tool.css({
            'position': 'absolute',
            'left': this.left,
            'top': this.top,
            'width': this.width,
            'height': this.height,
            'z-index': this.zindex
        });

        tool.addClass('annotools'); // Update Styles
        // this.tool.makeDraggable(); //Make it Draggable.

        /**
         * Set up Toolbar buttons
         */
        if (this.annotationActive) {

            /* Go home, go camicro */
            this.homebutton = jQuery('<img>', {
                title: 'QuIP Home',
                class: 'toolButton firstToolButtonSpace inactive',
                src: 'images/ic_home_white_24px.svg'
            });
            tool.append(this.homebutton);

            this.micbutton = jQuery('<img>', {
                title: 'caMicroscope',
                class: 'toolButton inactive',
                src: 'images/camic_vector.svg'
            });
            tool.append(this.micbutton);

            /* space */
            this.spacer1 = jQuery('<img>', {
                'class': 'spacerButton inactive',
                'src': 'images/spacer_empty.svg'
            });
            tool.append(this.spacer1);

            /* App tools */
            this.filterbutton = jQuery('<img>', {
                'title': 'Filter Markups',
                'class': 'toolButton inactive',
                'src': 'images/filter.svg'
            });
            tool.append(this.filterbutton); // Filter Button


            this.heatDownButton = jQuery('<img>', {
                'title': 'Decrease Opacity',
                'class': 'toolButton inactive',
                'src': 'images/Opacity_down.svg',
                'id': 'heatDownButton'
            });
            tool.append(this.heatDownButton);     // Button for decreasing opacity

            this.heatUpButton = jQuery('<img>', {
                'title': 'Increase Opacity',
                'class': 'toolButton inactive',
                'src': 'images/Opacity_up.svg',
                'id': 'heatUpButton'
            });
            tool.append(this.heatUpButton);	// Button for increasing opacity

            this.showWeightPanel = jQuery('<img>', {
                'title': 'Show Weight Panel',
                'class': 'toolButton inactive',
                'src': 'images/Heatmap.svg',
                'id': 'showWeightPanel'
            });
            tool.append(this.showWeightPanel);    // Button for showing the weight panel

            this.freeMarkupButton = jQuery('<img>', {
                'title': 'Free Line Markup',
                'class': 'toolButton inactive',
                'src': 'images/pencil.svg',
                'id': 'freeLineMarkupButton'
            });
            tool.append(this.freeMarkupButton); 	  // Markup Pencil Tool

            /* space - next thing unavailable atm */
            tool.append(jQuery('<img>', {
                'class': 'spacerButton inactive',
                'src': 'images/spacer_empty.svg'
            }));

            this.switchUserButton = jQuery('<img>', {
                'title': 'Switch User',
                'class': 'toolButton inactive',
                'src': 'images/switch_user.svg',
                'id': 'switchUserButton'
            });
            tool.append(this.switchUserButton);     // Button for switch user


            /*
             * Event handlers for toolbar buttons
             */
            this.homebutton.on('click', function () {
                window.location.href = "/select.php";
            }.bind(this));


            this.micbutton.on('click', function () {
                var tissueId = this.iid;
                var x1 = annotool.imagingHelper._viewportOrigin['x'];
                var y1 = annotool.imagingHelper._viewportOrigin['y'];
                var x2 = x1 + annotool.imagingHelper._viewportWidth;
                var y2 = y1 + annotool.imagingHelper._viewportHeight;
                var zoom = viewer.viewport.getZoom();
                var width, height;
                //get image width and height
                var url = 'api/Data/getImageInfoByCaseID.php?case_id=' + tissueId;
                jQuery.get(url, function (data) {
                    try {
                        this_image = JSON.parse(data);
                        width = this_image[0].width;
                        height = this_image[0].height;
                        var x = parseInt(((x1 + x2) / 2.0) * width);
                        var y = parseInt(((y1 + y2) / 2.0) * height);
                        window.location.href = "/camicroscope/osdCamicroscope.php?tissueId=" + tissueId + "&x=" + x + "&y=" + y + "&zoom=" + zoom;
                    } catch (error) {
                        window.location.href = "/camicroscope/osdCamicroscope.php?tissueId=" + tissueId;
                    }
                })
            }.bind(this));


            this.filterbutton.on('click', function () {
                this.toggleAlgorithmSelector()
                // this.removeMouseEvents()
                // this.promptForAnnotation(null, "filter", this, null)
            }.bind(this));

            this.heatUpButton.on('click', function () {
                this.annotools.heatmap_opacity = Math.min(1, this.annotools.heatmap_opacity + 0.1);
                this.annotools.getMultiAnnot();
            }.bind(this));

            this.heatDownButton.on('click', function () {
                this.annotools.heatmap_opacity = Math.max(0, this.annotools.heatmap_opacity - 0.1);
                this.annotools.getMultiAnnot();
            }.bind(this));

            this.switchUserButton.on('click', function () {
                if (this.annotools.lymphSuperuser) {
                    if (jQuery('#switchuserpanel').is(":visible"))
                        jQuery('#switchuserpanel').hide();
                    else
                        jQuery('#switchuserpanel').show();
                } else {
                    alert("You are not a super user. A super user can review and change other people's annotations. To apply for the super user privilege. please contact your QuIP app administrator.");
                }
            }.bind(this));

            this.showWeightPanel.on('click', function () {
                console.log('click on showing weight panel');
                if (jQuery('#weightpanel').is(":visible")) {
                    jQuery('#weightpanel').hide();
                }
                else {
                    console.log(this.annotools.heat_weight);
                    jQuery('#weightpanel').show();
                }
            }.bind(this));

            this.freeMarkupButton.on('click', function () {
                if (this.annotools.mode == 'free_markup') {
                    this.setNormalMode();
                } else {
                    //set pencil mode
                    this.annotools.mode = 'free_markup';
                    this.annotools.drawMarkups();

                    jQuery("canvas").css("cursor", "crosshair");
                    //jQuery("drawFreelineButton").css("opacity", 1);
                    jQuery("#drawRectangleButton").removeClass("active");
                    jQuery("#drawDotButton").removeClass("active");     // Dot Tool
                    jQuery("#drawFreelineButton").removeClass("active");
                    jQuery("#freeLineMarkupButton").addClass("active");
                    jQuery("#markuppanel").show();

                    // Check if being on moving mode --> switch to drawing mode
                    if (document.getElementById("rb_Moving").checked) {
                        console.log('do switching');
                        document.getElementById('rb_Moving').checked = false;
                        document.getElementById('LymPos').checked = true;
                    }
                }
            }.bind(this));


            var toolButtons = jQuery('.toolButton');
            toolButtons.each(function () {
                jQuery(this).on({
                    'mouseenter': function () {
                        // highlight button
                        this.addClass('selected')
                    },
                    'mouseleave': function () {
                        // un-highlight button
                        this.removeClass('selected')
                    }
                })
            })

        }

        this.ajaxBusy = jQuery('<img>', {
            'class': 'colorMapButton',
            'id': 'ajaxBusy',
            'style': 'scale(0.5, 1)',
            'src': 'images/progress_bar.gif'
        });
        tool.append(this.ajaxBusy);
        this.ajaxBusy.hide();

        this.titleButton = jQuery('<p>', {
            'class': 'titleButton',
            'id': 'titleButton',
            'text': 'caMic Lymphocyte App'
        });
        tool.append(this.titleButton);

        this.iidbutton = jQuery('<p>', {
            'class': 'iidButton',
            'text': 'Case ID: ' + this.iid
        });
        tool.append(this.iidbutton);

        if (this.annotationActive) {
            // empty block
        }
    };

});
