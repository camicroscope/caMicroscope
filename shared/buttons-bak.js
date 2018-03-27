//ToolBar.prototype.createButtons = function () {

    /* BOOKMARK */
    this.bookmarkButton = jQuery('<img>', {
        title: 'Bookmark/Share current state',
        class: 'toolButton',
        src: 'images/ic_insert_link_white_24dp_1x.png'
    });
    tool.append(this.bookmarkButton);

    this.bookmarkButton.on('click', function () {
        console.log('bookmark');

        // Get ViewPort
        var bounds = viewer.viewport.getBounds();
        console.log(bounds);

        // Get Filters
        var filters = [];
        jQuery('#selected li').each(function () {
            var id = this.id;
            var filter = hashTable[id];
            // filters.push(filter.generatedFilter.getFilter())
            var f = {};
            var filterName = filter.name;
            var filterVal = filter.generatedFilter.getParams();
            f.name = filterName;
            f.value = filterVal;
            filters.push(f)
            // sync &= filter.generatedFilter.sync
        });
        console.log(filters);

        var state = {
            'state': {
                'filters': filters,
                'viewport': bounds,
                'pan': viewer.viewport.getCenter(),
                'zoom': viewer.viewport.getZoom(),
                'tissueId': this.annotools.iid
            }
        };
        console.log(state);

        // var bookmarkURLDiv = jQuery.create('<div>').addClass('bookmarkURLDiv')
        var bookmarkURLDiv = jQuery('#bookmarkURLDiv');
        bookmarkURLDiv.html('');
        var input = jQuery('<input>');
        var submit = jQuery('<button>');
        submit.html("Close");
        bookmarkURLDiv.append(input);
        bookmarkURLDiv.append(submit);
        bookmarkURLDiv.show();

        jQuery.ajax({
            'type': 'POST',
            //'url': 'https://test-8f679.firebaseio.com/camicroscopeStates.json?auth=kweMPSAo4guxUXUodU0udYFhC27yp59XdTEkTSJ4',
            'url': 'api/Data/loadState.php',
            'data': JSON.stringify(state),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (data) {
                console.log('posted!');
                console.log(data);
                var url = 'http://dragon.cci.emory.edu/camicroscope3/osdCamicroscope.php?tissueId=TCGA-02-0001&stateID=' + data.name;
                console.log(url);
                input.val(url);
                input.select()
            }
        });

        submit.on("click", function () {
            bookmarkURLDiv.hide();
        });

    }.bind(this));


    /* COLORMAP */
    // Replaced by ajaxBusy
    this.colorMapButton = jQuery('<img>', {
        'class': 'colorMapButton',
        'title': 'ColorMap',
        'src': 'images/colors.svg'
    });
    tool.append(this.colorMapButton);


    /* DOT TOOL */
    this.dotToolButton = jQuery('<img>', {
        title: 'Dot Tool',
        class: 'toolButton inactive',
        src: 'images/analyze.png',
        id: 'drawDotButton'
    });
    tool.append(this.dotToolButton); // Dot Tool

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


    /* ELLIPSE */
    this.ellipsebutton = jQuery('<img>', {
        title: 'Draw Ellipse',
        class: 'toolButton',
        src: 'images/ellipse.svg'
    });
    tool.append(this.ellipsebutton);

    this.ellipsebutton.on('click', function () {
        // this.mode = 'ellipse'
        // this.annotools.mode = 'ellipse'
        // this.annotools.drawMarkups()
        alert('Creation of markups is disabled on QuIP')
    }.bind(this));


    /* VIEW RESULTS */
    this.filterImgButton = jQuery('<img>', {
        title: 'View Results',
        class: 'toolButton',
        src: 'images/insta.png'
    });
    tool.append(this.filterImgButton);

    this.filterImgButton.on('click', function () {
        this.FilterTools.showFilterControls()
    }.bind(this));


    /* FULL DOWNLOAD */
    this.fullDownloadButton = jQuery('<img>', {
        title: 'Download All Markups (Coming Soon)',
        class: 'toolButton',
        src: 'images/fullDownload.svg'
    });
    tool.append(this.fullDownloadButton);


    /* TOGGLE VIEW MARKUPS */
    this.hidebutton = jQuery('<img>', {
        title: 'Show/Hide Markups',
        class: 'toolButton',
        src: 'images/hide.svg'
    });
    tool.append(this.hidebutton);

    this.hidebutton.on('click', function () {
        this.annotools.toggleMarkups()
    }.bind(this));


    /* MEASUREMENT TOOL */
    this.measurebutton = jQuery('<img>', {
        title: 'Measurement Tool',
        class: 'toolButton',
        src: 'images/measure.svg'
    });
    tool.append(this.measurebutton);

    this.measurebutton.on('click', function () {
        this.mode = 'measure';
        this.drawMarkups()
    }.bind(this));


    /* PARTIAL DOWNLOAD */
    this.partialDownloadButton = jQuery('<img>', {
        title: 'Download Partial Markups (Coming Soon)',
        class: 'toolButton',
        //class: 'toolButton inactive',
        src: 'images/partDownload.svg'
    });
    tool.append(this.partialDownloadButton);  //Partial Download

    this.partialDownloadButton.on('click', function () {
        this.annotools.downloadROI();
    }.bind(this));


    /* DRAW FREELINE */
    this.pencilbutton = jQuery('<img>', {
        title: 'Draw Freeline',
        class: 'toolButton inactive',
        src: 'images/pencil.svg',
        id: 'drawFreelineButton'
    });
    tool.append(this.pencilbutton); // Pencil Tool

    // event handler camicro:
    this.pencilbutton.on('click', function () {
        this.annotools.mode = 'pencil';
        this.annotools.drawMarkups()
        // alert("Creation of markups is disabled on QuIP")
    }.bind(this));

    // event handler sc:
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


    /* RECTANGLE */
    this.rectbutton = jQuery('<img>', {
        title: 'Draw Rectangle',
        id: 'drawRectangle',
        class: 'toolButton firstToolButtonSpace',
        //class: 'toolButton inactive',
        src: 'images/rect.svg'
    });
    tool.append(this.rectbutton);

    // event handler camicro:
    this.rectbutton.on('click', function () {
        this.mode = 'rect';
        this.annotools.mode = 'rect';
        this.annotools.drawMarkups()
        // alert("Creation of markups is disabled on QuIP")
    }.bind(this));

    // event handler sc:
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

    /* OLD SC HOME */
    this.homebutton = jQuery('<img>', {
        title: 'caMicroscope Home',
        class: 'toolButton firstToolButtonSpace inactive',
        src: 'images/home.png',
        id: 'gotohomebutton'
    });
    tool.append(this.homebutton);


//};

