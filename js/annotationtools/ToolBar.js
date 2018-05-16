/**
 * TOOLBAR
 * CAMICROSCOPE
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
            // var self= this

            jQuery.get('api/Data/getAlgorithmsForImage.php?iid=' + self.iid, function (data) {
                d = JSON.parse(data);

                goodalgo(d, null);
            });

            jQuery('#submitbtn').click(function () {
                var selKeys = jQuery('#tree').fancytree('getTree').getSelectedNodes();
                var param = '';
                for (i = 0; i < selKeys.length; i++) {
                    param = param + '&Val' + (i + 1).toString() + '=' + selKeys[i].title;
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

            /* space */
            this.spacer1 = jQuery('<img>', {
                'class': 'spacerButton inactive',
                'src': 'images/spacer_empty.svg'
            });
            tool.append(this.spacer1);

            /* Go lymphocytes, go segment curation */
            this.lymphbutton = jQuery('<img>', {
                'title': 'Lymphocyte & Plasma Cell Annotation App',
                'class': 'toolButton inactive',
                'src': 'images/Heatmap.svg'
            });
            tool.append(this.lymphbutton); // Lymphocyte Button
/*
            this.qualitybutton = jQuery('<img>', {
                'data-toggle': 'tooltip',
                'data-placement': 'bottom',
                'title': 'Segmentation Quality Heatmaps',
                'class': 'toolButton',
                'src': 'images/cellseg.svg'
            });

            tool.append(this.qualitybutton); // Lymphocyte Button
*/
            this.spacer1 = jQuery('<img>', {
                'class': 'spacerButton',
                'src': 'images/spacer.svg'
            });
            tool.append(this.spacer1);

            /*a link to segment curation application with this composite button */
            this.compositebutton = jQuery('<img>', {
                'data-toggle': 'tooltip',
                'data-placement': 'bottom',
                title: 'Segment Curation App',
                class: 'toolButton',
                src: 'images/composite.png',
                id: 'gotocompositebutton'
            });
            tool.append(this.compositebutton);

            /* space */
            tool.append(jQuery('<img>', {
                'class': 'spacerButton inactive',
                'src': 'images/spacer_empty.svg'
            }));

            /* App tools */
            this.filterbutton = jQuery('<img>', {
                'title': 'Filter Markups',
                'class': 'toolButton inactive',
                'src': 'images/filter.svg'
            });
            tool.append(this.filterbutton); // Filter Button

            this.analyticsbutton = jQuery('<img>', {
                'title': 'Image Analysis',
                'class': 'toolButton',
                'src': 'images/analyze.png'

            });
            tool.append(this.analyticsbutton);


            /* Annotation tools (re-add, comment) */

            this.rectbutton = jQuery('<img>', {
                'data-toggle': 'tooltip',
                'data-placement': 'bottom',
                title: 'Draw Rectangle',
                id: 'drawRectangle',
                class: 'toolButton firstToolButtonSpace',
                src: 'images/rect.svg'
            });
            tool.append(this.rectbutton);
            this.pencilbutton = jQuery('<img>', {
                'data-toggle': 'tooltip',
                'data-placement': 'bottom',
                'title': 'Draw Freeline',
                'class': 'toolButton',
                'src': 'images/pencil.svg'
            });
            tool.append(this.pencilbutton); // Pencil Tool

            this.rectbutton.on('click', function () {
                this.mode = 'rect';
                this.annotools.mode = 'rect';
                this.annotools.drawMarkups()
                // alert("Creation of markups is disabled on QuIP")
            }.bind(this));

            this.pencilbutton.on('click', function () {
                this.annotools.mode = 'pencil';
                jQuery('html,body').css('cursor', 'crosshair');
                this.annotools.drawMarkups();
            }.bind(this));

            this.sharebutton = jQuery('<img>', {
                'data-toggle': 'tooltip',
                'data-placement': 'bottom',
                'title': 'Share Current View',
                'class': 'toolButton',
                'src': 'images/share.svg'
            });

            tool.append(this.sharebutton);
            this.magnifierButton = jQuery('<img>', {
                'data-toggle': 'tooltip',
                'data-placement': 'bottom',
                'title': 'Toggle Spyglass',
                'class': 'toolButton',
                'src': 'images/SpyGlass.svg',
                'id': 'spyglass_toolbar_button'
            });
            // default invisible
            this.magnifierButton.css("display", "none");
            tool.append(this.magnifierButton);
            // it's ready
            var event = new Event("magnifier-button-loaded");
            document.dispatchEvent(event);

            // side split button
            this.sidesplitButton = jQuery('<img>', {
                'data-toggle': 'tooltip',
                'data-placement': 'bottom',
                'title': 'Toggle SideSplit',
                'class': 'toolButton',
                'src': 'images/sidesplit.svg',
                'id': 'sidesplit_toolbar_button'
            });
            tool.append(this.sidesplitButton);
            this.sidesplitButton.on('click', function(){
              var event = new Event("sidesplit");
              document.dispatchEvent(event);
            });

            /*
             * Event handlers for toolbar buttons
             */
            this.homebutton.on('click', function () {
                window.location.href = "/select.php";
            }.bind(this));

            /*
            this.lymphbutton.on('click', function () {
                var tissueId = this.iid;
                window.location.href = "/camicroscope/osdCamicroscope_Lymph.php?tissueId=" + tissueId;
            }.bind(this))
            */

            this.lymphbutton.on('click', function () {
                var tissueId = this.iid;
                var x1 = annotool.imagingHelper._viewportOrigin['x'];
                var y1 = annotool.imagingHelper._viewportOrigin['y'];
                var x2 = x1 + annotool.imagingHelper._viewportWidth;
                var y2 = y1 + annotool.imagingHelper._viewportHeight;
                var zoom = viewer.viewport.getZoom();

                var width, height;
                //get image width and height
                var url = 'api/Data/getImageInfoByCaseID.php?case_id=' + tissueId;
                //console.log(url);
                jQuery.get(url, function (data) {
                    //console.log(data);
                    try {
                        this_image = JSON.parse(data);
                        width = this_image[0].width;
                        height = this_image[0].height;
                        var x = parseInt(((x1 + x2) / 2.0) * width);
                        var y = parseInt(((y1 + y2) / 2.0) * height);
                        window.location.href = "/camicroscope/osdCamicroscope_Lymph.php?appid=lymph&tissueId=" + tissueId + "&x=" + x + "&y=" + y + "&zoom=" + zoom;
                    } catch (error) {
                        window.location.href = "/camicroscope/osdCamicroscope_Lymph.php?appid=lymph&tissueId=" + tissueId;
                    }
                })
            }.bind(this));
/*
            this.qualitybutton.on('click', function () {
                var tissueId = this.iid;
                var x1 = annotool.imagingHelper._viewportOrigin['x'];
                var y1 = annotool.imagingHelper._viewportOrigin['y'];
                var x2 = x1 + annotool.imagingHelper._viewportWidth;
                var y2 = y1 + annotool.imagingHelper._viewportHeight;
                var zoom = viewer.viewport.getZoom();

                var width, height;
                //get image width and height
                var url = 'api/Data/getImageInfoByCaseID.php?case_id=' + tissueId;
                //console.log(url);
                jQuery.get(url, function (data) {
                    //console.log(data);
                    try {
                        this_image = JSON.parse(data);
                        width = this_image[0].width;
                        height = this_image[0].height;
                        var x = parseInt(((x1 + x2) / 2.0) * width);
                        var y = parseInt(((y1 + y2) / 2.0) * height);
                        window.location.href = "/camicroscope/osdCamicroscope_Lymph.php?appid=qualheat&tissueId=" + tissueId + "&x=" + x + "&y=" + y + "&zoom=" + zoom;
                    } catch (error) {
                        window.location.href = "/camicroscope/osdCamicroscope_Lymph.php?appid=qualheat&tissueId=" + tissueId;
                    }
                })
            }.bind(this));
*/
            this.sharebutton.on('click', function () {
                // update the url
                LinkRequest();
                window.prompt("Share this link", window.location.href + "&" + camic_state.prefix + "=" + camic_state.encode(camic_state.vals));
            }.bind(this));


            this.filterbutton.on('click', function () {
                this.toggleAlgorithmSelector()
                // this.removeMouseEvents()
                // this.promptForAnnotation(null, "filter", this, null)
            }.bind(this));
            this.compositebutton.on('click', function () {
                this.mode = 'composite';
                var tissueId = this.iid;
                //window.location.href = "/camicroscope/osdCamicroscope_sc.php?tissueId="+tissueId;

                var x1 = annotool.imagingHelper._viewportOrigin['x'];
                var y1 = annotool.imagingHelper._viewportOrigin['y'];
                var x2 = x1 + annotool.imagingHelper._viewportWidth;
                var y2 = y1 + annotool.imagingHelper._viewportHeight;
                var zoom = viewer.viewport.getZoom();
                //zoom = parseInt(zoom);
                if (zoom < 1.0) {
                    zoom = 1.0;
                }
                var width, height;
                //get image width and height
                var url = 'api/Data/getImageInfoByCaseID.php?case_id=' + tissueId;
                //console.log(url);
                jQuery.get(url, function (data) {
                    //console.log(data);
                    try {
                        this_image = JSON.parse(data);
                        width = this_image[0].width;
                        height = this_image[0].height;
                        var x = parseInt(((x1 + x2) / 2.0) * width);
                        var y = parseInt(((y1 + y2) / 2.0) * height);
                        window.location.href = "/camicroscope/osdCamicroscope_sc.php?tissueId=" + tissueId + "&cancerType=quip&x=" + x + "&y=" + y + "&zoom=" + zoom;
                    } catch (error) {
                        window.location.href = "/camicroscope/osdCamicroscope_sc.php?tissueId=" + tissueId;
                    }
                })

            }.bind(this));

            this.analyticsbutton.on('click', function () {
                this.annotools.createWorkOrder()
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
            'text': 'caMicroscope'
        });
        tool.append(this.titleButton);

        this.iidbutton = jQuery('<p>', {
            'class': 'iidButton',
            'text': 'Display ID: ' + this.displayId
        });
        tool.append(this.iidbutton);


        if (this.annotationActive) {
            // empty block
        }
    };

});
