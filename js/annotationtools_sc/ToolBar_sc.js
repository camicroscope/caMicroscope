/**
 * TOOLBAR
 * SEGMENTATION CURATION APP
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
            console.log("self.iid is: " + self.iid);

            jQuery.get('api/Data/getAlgorithmsForImage.php?iid=' + self.iid, function (data) {
                d = JSON.parse(data);
                // console.log("data before goodalgo is:"+data);
                // console.log("d before goodalgo is:"+d);
                goodalgo(d, null)
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

            this.rectbutton = jQuery('<img>', {
                title: 'Draw Rectangle',
                class: 'toolButton inactive',
                src: 'images/rect.svg',
                id: 'drawRectangleButton'
            });
            //tool.append(this.rectbutton)

            this.pencilbutton = jQuery('<img>', {
                'title': 'Draw Freeline',
                'class': 'toolButton inactive',
                'src': 'images/pencil.svg',
                'id': 'drawFreelineButton'
            });
            tool.append(this.pencilbutton); // Pencil Tool


            this.mergebutton1 = jQuery('<img>', {
                'title': 'Save ViewPort',
                'class': 'toolButton inactive',
                'src': 'images/merge1.png'
            });
            tool.append(this.mergebutton1); // Merge step 1

            this.mergebutton2 = jQuery('<img>', {
                'title': 'Save Rectangle And Delete Annotation(s) Within This Area',
                'class': 'toolButton inactive',
                'src': 'images/rect.svg',
                'id': 'mergeStep2Button'
            });
            tool.append(this.mergebutton2); // Merge step 2

            this.measurebutton = jQuery('<img>', {
                'title': 'Measurement Tool',
                'class': 'toolButton inactive',
                'src': 'images/measure.svg'
            });
            // tool.append(this.measurebutton)

            this.spacer3 = jQuery('<img>', {
                'class': 'spacerButton inactive',
                'src': 'images/spacer.svg'
            });
            tool.append(this.spacer3);

            this.mergebutton3 = jQuery('<img>', {
                'title': 'Generate Composite Dataset',
                'class': 'toolButton inactive',
                'src': 'images/merge2.png',
                'id': 'mergeStep3Button'
            });
            tool.append(this.mergebutton3); // Merge step 3

            this.hidebutton = jQuery('<img>', {
                'title': 'Show/Hide Markups',
                'class': 'toolButton inactive',
                'src': 'images/hide.svg'
            });
            // tool.append(this.hidebutton)


            this.spacer4 = jQuery('<img>', {
                'class': 'spacerButton inactive',
                'src': 'images/spacer.svg'
            });
            tool.append(this.spacer4);

            var image_source = 'images/unlock_icon.png';
            if (this.imageStatus == 'lock' || this.imageStatus == 'Lock')
                image_source = 'images/lock_icon.png';
            this.lockUnlockButton = jQuery('<img>', {
                'title': 'Lock or Unlock This Image by Super User',
                'class': 'toolButton inactive',
                'src': image_source
            });
            tool.append(this.lockUnlockButton);

            /* add a space before enabling */
            this.partialDownloadButton = jQuery('<img>', {
                'title': 'Download Partial Markups (Coming Soon)',
                'class': 'toolButton inactive',
                'src': 'images/partDownload.svg'
            });
            //tool.append(this.partialDownloadButton)  //Partial Download

            this.spacer5 = jQuery('<img>', {
                'class': 'spacerButton inactive',
                'src': 'images/spacer.svg'
            });
            // tool.append(this.spacer5);

            this.dotToolButton = jQuery('<img>', {
                'title': 'Dot Tool',
                'class': 'toolButton inactive',
                'src': 'images/analyze.png',
                'id': 'drawDotButton'
            });
            // tool.append(this.dotToolButton); // Dot Tool

            /*
             * Event handlers for toolbar buttons
             */
            this.homebutton.on('click', function () {
                this.mode = 'home';
                var tissueId = annotool.iid;
                var cancerType = annotool.cancerType;
                window.location.href = "/select.php";
            }.bind(this));


            this.micbutton.on('click', function () {
                var tissueId = this.iid;
                var x1 = annotool.imagingHelper._viewportOrigin['x'];
                var y1 = annotool.imagingHelper._viewportOrigin['y'];
                var x2 = x1 + annotool.imagingHelper._viewportWidth;
                var y2 = y1 + annotool.imagingHelper._viewportHeight;
                var zoom = viewer.viewport.getZoom();
                if (zoom < 1.0) zoom = 1.0;
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


            this.rectbutton.on('click', function () {
                //console.log(this.mode);
                if (this.annotools.mode == 'rect') {
                    this.setNormalMode();
                    //this.
                } else {
                    this.mode = 'rect';
                    this.annotools.mode = 'rect';
                    this.annotools.drawMarkups();
                    jQuery("canvas").css("cursor", "crosshair");
                    jQuery("#mergeStep2Button").removeClass("active"); // merge step 2 button
                    //console.log("added class");
                }
                // alert("Creation of markups is disabled on QuIP")
            }.bind(this));

            this.partialDownloadButton.on('click', function () {
                this.annotools.downloadROI();
            }.bind(this));

            this.pencilbutton.on('click', function () {
                if (typeof this.imageStatus == "undefined" || this.imageStatus == "unlock" || this.imageStatus == "Unlock" || this.imageStatus == "") {
                    this.mode = 'pencil';
                    this.annotools.mode = 'pencil';
                    this.annotools.drawMarkups();
                    if (this.annotools.filter_algorithm) {
                        jQuery("canvas").css("cursor", "crosshair");
                        jQuery("#drawFreelineButton").addClass("active");
                    }
                    else {
                        this.setNormalMode();
                        this.annotools.filter_algorithm = true;
                    }
                } else
                    alert("This image has been locked. Only super user can unlock this image!");
            }.bind(this));

            this.mergebutton1.on('click', function () {
                if (typeof this.imageStatus == "undefined" || this.imageStatus == "unlock" || this.imageStatus == "Unlock" || this.imageStatus == "") {
                    this.mode = 'normal';
                    this.annotools.mergeStep1();
                } else
                    alert("This image has been locked. Only super user can unlock this image!");
            }.bind(this));


            this.mergebutton2.on('click', function () {
                if (typeof this.imageStatus == "undefined" || this.imageStatus == "unlock" || this.imageStatus == "Unlock" || this.imageStatus == "") {
                    this.mode = 'merge_step2';
                    this.annotools.mode = 'rect';
                    this.annotools.drawMarkups();
                    if (this.annotools.filter_algorithm) {
                        jQuery("canvas").css("cursor", "crosshair");
                        jQuery("#mergeStep2Button").addClass("active");
                    } else {
                        this.setNormalMode();
                        this.annotools.filter_algorithm = true;
                    }
                } else
                    alert("This image has been locked. Only super user can unlock this image!");
            }.bind(this));


            this.mergebutton3.on('click', function () {
                this.annotools.generateCompositeDataset();
            }.bind(this));

            this.lockUnlockButton.on('click', function () {
                if (this.userType == "superUser") {
                    var src = this.lockUnlockButton.attr('src');
                    var newsrc = (src == 'images/lock_icon.png') ? 'images/unlock_icon.png' : 'images/lock_icon.png';
                    this.lockUnlockButton.attr('src', newsrc);
                    var status = "";
                    if (newsrc == 'images/unlock_icon.png') {
                        this.statusbutton.text('Status: Unlock');
                        status = "Unlock";
                    }
                    if (newsrc == 'images/lock_icon.png') {
                        this.statusbutton.text('Status: Lock');
                        status = "Lock";
                    }
                    this.annotools.imageStatusUpdate(status);
                    window.location.href = "/camicroscope/osdCamicroscope_sc.php?tissueId=" + this.iid;
                } else if (this.userType == "user") {
                    if (this.user_email == this.assignTo) { //this user is assigned to this image
                        var src = this.lockUnlockButton.attr('src');
                        if (src == 'images/unlock_icon.png') {//image status is unlock
                            this.lockUnlockButton.attr('src', 'images/lock_icon.png');
                            this.statusbutton.text('Status: Lock');
                            this.annotools.imageStatusUpdate("Lock");
                            window.location.href = "/camicroscope/osdCamicroscope_sc.php?tissueId=" + this.iid;
                        } else
                            alert("Only super user can activate this button!");
                    } else
                        alert("Only super user/assigned user can activate this button!");
                } else
                    alert("Only super user can activate this button!");
            }.bind(this));

            // Dot Tool start
            this.dotToolButton.on('click', function () {
                if (this.annotools.mode == 'dot') {
                    this.setNormalMode();
                } else {
                    this.mode = 'dot';
                    this.annotools.mode = 'dot';
                    this.annotools.drawDots();
                    jQuery("svg").css("cursor", "crosshair");
                    jQuery("#drawRectangleButton").removeClass("active");
                    jQuery("#drawFreelineButton").removeClass("active");
                    jQuery("#mergeStep2Button").removeClass("active"); // merge step 2 button
                    jQuery("#drawDotButton").addClass("active");
                }
            }.bind(this));
            // Dot Tool end

            /*
            // DUPE PENCIL BUTTON
            this.pencilbutton.on('click', function () {
                // if(this.annotools.mode == 'pencil'){
                //this.setNormalMode();
                // } else {
                //set pencil mode
                this.mode = 'pencil';
                this.annotools.mode = 'pencil';
                this.annotools.drawMarkups();
                jQuery("canvas").css("cursor", "crosshair");
                //jQuery("drawFreelineButton").css("opacity", 1);
                //jQuery("#drawRectangleButton").removeClass("active");
                //jQuery("#drawDotButton").removeClass("active");     // Dot Tool
                //jQuery("#mergeStep2Button").removeClass("active"); // merge step 2 button
                jQuery("#drawFreelineButton").addClass("active");
                //}

            }.bind(this));
            */

            this.measurebutton.on('click', function () {
                this.mode = 'measure';
                this.drawMarkups()
            }.bind(this));

            this.hidebutton.on('click', function () {
                this.annotools.toggleMarkups()
            }.bind(this));

            this.filterbutton.on('click', function () {
                this.toggleAlgorithmSelector()
                // this.removeMouseEvents()
                // this.promptForAnnotation(null, "filter", this, null)
            }.bind(this));

            this.partialDownloadButton.on('click', function () {
                this.annotools.downloadROI();
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

        this.colorMapButton = jQuery('<img>', {
            'class': 'colorMapButton',
            'title': 'ColorMap',
            'src': 'images/colors.svg'
        });
        tool.append(this.colorMapButton);

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
            'text': 'caMic Segment Curation App'
        });
        tool.append(this.titleButton);

        this.iidbutton = jQuery('<p>', {
            'class': 'iidButton',
            'text': 'Display ID: ' + this.displayId
        });
        tool.append(this.iidbutton);

        this.statusbutton = jQuery('<p>', {
            'class': 'statusButton',
            //if(this.imageStatus =='Lock')
            // 'text': 'Status: ' + 'Lock'
            //else if(this.imageStatus =='Unlock')
            'text': 'Status: ' + this.imageStatus
            //else
            //'text': 'Status: ' + ' '
        });
        tool.append(this.statusbutton);

        if (this.annotationActive) {
            // empty block
        }
    };
});
