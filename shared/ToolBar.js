/**
 * Get option values for "tool" element, else set default values.
 *
 * @param element
 * @param options
 * @constructor
 */
var ToolBar = function (element, options) {
    // console.log(options)
    this.annotools = options.annotool;
    // console.log(this.annotools)
    this.FilterTools = options.FilterTools;
    this.source = element; // The Tool Source Element
    this.top = options.top || '0px';
    this.left = options.left || '150px'; // The Tool Location
    this.height = options.height || '30px';
    this.width = options.width || '270px';
    this.zindex = options.zindex || '100'; // To Make Sure The Tool Appears in the Front

    this.iid = options.iid || null;
    this.cancerType = options.cancerType;
    this.annotationActive = isAnnotationActive()
};

/**
 * Print message to console.
 * @param msg
 */
ToolBar.prototype.showMessage = function (msg) {
    console.log(msg)
};

ToolBar.prototype.algorithmSelector = function () {
    var self = this;
    var ftree;
    xxx = []
};


var available_colors = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];

var algorithm_color = {};

function goodalgo(data, status) {
    // console.log(data)

    var blob = [];
    for (i = 0; i < data.length; i++) {
        var n = {};

        data[i].title = data[i].provenance.analysis_execution_id;

        n.title = "<div class='colorBox' style='background:" + available_colors[i] + "'></div>" + data[i].title;
        n.key = i.toString();
        n.refKey = data[i].provenance.analysis_execution_id;
        n.color = available_colors[i % available_colors.length];
        //algorithm_color[data[i].provenance.analysis_execution_id] = available_colors[i%7]
        algorithm_color[data[i].provenance.analysis_execution_id] = available_colors[i % available_colors.length];
        blob.push(n)
    }
    ftree = jQuery('#tree').fancytree({
        source: [{
            title: 'Algorithms', key: '1', folder: true,
            children: blob,
            expanded: true
        }],
        minExpandLevel: 1, // 1: root node is not collapsible
        activeVisible: true, // Make sure, active nodes are visible (expanded).
        aria: false, // Enable WAI-ARIA support.
        autoActivate: true, // Automatically activate a node when it is focused (using keys).
        autoCollapse: false, // Automatically collapse all siblings, when a node is expanded.
        autoScroll: false, // Automatically scroll nodes into visible area.
        clickFolderMode: 4, // 1:activate, 2:expand, 3:activate and expand, 4:activate (dblclick expands)
        checkbox: true, // Show checkboxes.
        debugLevel: 2, // 0:quiet, 1:normal, 2:debug
        disabled: false, // Disable control
        focusOnSelect: false, // Set focus when node is checked by a mouse click
        generateIds: false, // Generate id attributes like <span id='fancytree-id-KEY'>
        idPrefix: 'ft_', // Used to generate node id´s like <span id='fancytree-id-<key>'>.
        icons: true, // Display node icons.
        keyboard: true, // Support keyboard navigation.
        keyPathSeparator: '/', // Used by node.getKeyPath() and tree.loadKeyPath().
        quicksearch: false, // Navigate to next node by typing the first letters.
        selectMode: 2, // 1:single, 2:multi, 3:multi-hier
        tabbable: true, // Whole tree behaves as one single control
        titlesTabbable: false, // Node titles can receive keyboard focus
        beforeSelect: function (event, data) {
            // A node is about to be selected: prevent this for folders:
            if (data.node.isFolder()) {
                return false
            }
        },
        select: function (event, data) {
            jQuery('#tree').attr('algotree', true);
            var node = data.node;

            console.log('!SELECTED NODE : ' + node.title);
            targetType = data.targetType;
            annotool.getMultiAnnot()
        }
    })
}

/*
ToolBar.prototype.toggleAlgorithmSelector = function () {
  if (!jQuery('#algosel').attr('eb')) {
    jQuery('#algosel').attr('eb', true)
    // console.log("initializing...")
    jQuery('#algosel').css({
      'width': '300px',
      'zIndex': 199,
      'visibility': 'hidden'
    })
    jQuery('#algosel').on('mousedown', function (e) {
      jQuery(this).addClass('draggable').parents().on('mousemove', function (e) {
        jQuery('.draggable').offset({
          top: e.pageY - jQuery('.draggable').outerHeight() / 2,
          left: e.pageX - jQuery('.draggable').outerWidth() / 2
        }).on('mouseup', function () {
          jQuery(this).removeClass('draggable')
        })
      })
      e.preventDefault()
    }).on('mouseup', function () {
      jQuery('.draggable').removeClass('draggable')
    })
  }
  if (jQuery('#algosel').css('visibility') == 'visible') {
    jQuery('#algosel').css({
      'visibility': 'hidden'
    })
  } else {
    jQuery('#algosel').css({
      'visibility': 'visible'
    })
  }
  this.showMessage('Algorithm Selection Toggled')
}
*/

var ALGORITHM_LIST = {};
var SELECTED_ALGORITHM_LIST = [];
var SELECTED_ALGORITHM_KEYS = [];
var SELECTED_ALGORITHM_COLOR = {};
var AlgorithmSelectorHidden = true;

/**
 * Show/Hide "Select Algorithm" menu
 */
ToolBar.prototype.toggleAlgorithmSelector = function () {
    var self = this;
    //jQuery("#panel").show("slide");
    var url = 'api/Data/getAlgorithmsForImage.php?iid=' + self.iid;

    //var htmlStr = "<div id='panelHeader'> <h4>Select Algorithm </h4> </div> <div id='panelBody'> <ul id='algorithmList'>";
    var htmlStr = "<div id='panelHeader'><a href='#'><div id='closeFilterPanel'><img src='images/ic_close_white_24px.svg' title='Close' alt='Close' width='20' height='20'></div></a><h4>Select Algorithm </h4></div><div id='panelBody'><ul id='algorithmList'>";

    jQuery.get(url, function (data) {

        d = JSON.parse(data);

        // sorting the algorithms
        var tmp_algorithm_list = [];
        for (var i = 0; i < d.length; i++) {
            tmp_algorithm_list[i] = d[i].provenance.analysis_execution_id;
        }
        //tmp_algorithm_list = tmp_algorithm_list.sort();
        var algorithms_computer = [];
        var algorithms_composite_input = [];
        var algorithms_composite_dataset = [];
        var algorithms_under = [];
        var algorithms_over = [];

        var algorithm_number = tmp_algorithm_list.length;
        if (algorithm_number > 0) {

            for (i = 0; i < algorithm_number; i++) {
                var index_composite_input = tmp_algorithm_list[i].indexOf("composite_input");
                var index_composite_dataset = tmp_algorithm_list[i].indexOf("composite_dataset");
                var index_under = tmp_algorithm_list[i].indexOf("under_");
                var index_over = tmp_algorithm_list[i].indexOf("over_");

                if (index_composite_input != -1) {
                    algorithms_composite_input.push(tmp_algorithm_list[i]);
                } else if (index_composite_dataset != -1) {
                    algorithms_composite_dataset.push(tmp_algorithm_list[i]);
                } else if (index_under != -1) {
                    algorithms_under.push(tmp_algorithm_list[i]);
                } else if (index_over != -1) {
                    algorithms_over.push(tmp_algorithm_list[i]);
                } else {
                    algorithms_computer.push(tmp_algorithm_list[i]);
                }
            }
            algorithms_computer = algorithms_computer.sort();
            algorithms_under = algorithms_under.sort();
            algorithms_over = algorithms_over.sort();
            algorithms_composite_input = algorithms_composite_input.sort();
            algorithms_composite_dataset = algorithms_composite_dataset.sort();
            tmp_algorithm_list = algorithms_computer.concat(algorithms_under, algorithms_over, algorithms_composite_input, algorithms_composite_dataset);
        }

        ALGORITHM_LIST = d;
        for (var i = 0; i < tmp_algorithm_list.length; i++) {
            algorithm_color[tmp_algorithm_list[i]] = available_colors[i % available_colors.length];
            SELECTED_ALGORITHM_COLOR[tmp_algorithm_list[i]] = available_colors[i % available_colors.length];
            htmlStr += "<li><input type='checkbox' class='algorithmCheckbox' value=" + i + " /><span class='algoColorBox' style='background:" + algorithm_color[tmp_algorithm_list[i]] + "'></span> " + tmp_algorithm_list[i]
                + "</li>";
        }

        htmlStr += "</ul> <br /> <button class='btn' id='cancelAlgorithms'>Hide</button> </div>";

        jQuery("#panel").html(htmlStr);

        /**
         * Open Select Algorithm menu.
         */
        jQuery("#algorithmList input[type=checkbox]").each(function () {

            var elem = jQuery(this);
            var id = (this).value * 1;
            for (var i = 0; i < SELECTED_ALGORITHM_KEYS.length; i++) {
                if (SELECTED_ALGORITHM_KEYS[i] == (id)) {

                    elem.prop('checked', true);
                }
            }


        });

        self.annotools.getMultiAnnot();

        /**
         * Select algorithm from menu.
         */
        jQuery('#algorithmList input[type=checkbox]').change(function () {
            console.log("change");
            SELECTED_ALGORITHM_LIST = [];
            SELECTED_ALGORITHM_KEYS = [];
            jQuery("#algorithmList input:checked").each(function () {
                console.log("algorithm list:", ALGORITHM_LIST);
                SELECTED_ALGORITHM_LIST.push(tmp_algorithm_list[(this).value * 1]);
                SELECTED_ALGORITHM_KEYS.push((this).value * 1);
            });

            self.annotools.getMultiAnnot();


        });

        /*
         jQuery("#submitAlgorithms").click(function(){
         var selected= [];
         SELECTED_ALGORITHM_LIST = [];
         jQuery("#algorithmList input:checked").each(function() {
         SELECTED_ALGORITHM_LIST.push(ALGORITHM_LIST[(this).value * 1].analysis.execution_id);
         SELECTED_ALGORITHM_KEYS.push((this).value*1);
         });

         self.annotools.getMultiAnnot();
         jQuery("#panel").html("");
         jQuery("#panel").hide("slide");
         });
         */

        jQuery("#cancelAlgorithms").click(function () {
            jQuery("#panel").html("");
            jQuery("#panel").hide("slide");
            AlgorithmSelectorHidden = true;
        });

        jQuery("#closeFilterPanel").click(function () {
            jQuery("#panel").html("");
            jQuery("#panel").hide("slide");
            AlgorithmSelectorHidden = true;
        });

    });

    if (AlgorithmSelectorHidden == true) {
        jQuery("#panel").show("slide");
        AlgorithmSelectorHidden = false;
    } else {
        jQuery("#panel").html("");
        jQuery("#panel").hide("slide");

        AlgorithmSelectorHidden = true;
    }

};

ToolBar.prototype.setNormalMode = function () {
    this.annotools.mode = 'normal';
    jQuery("canvas").css("cursor", "default");
    jQuery("#drawRectangleButton").removeClass('active');
    jQuery("#drawFreelineButton").removeClass('active');

    jQuery("#drawDotButton").removeClass("active");   // Dot Tool
    jQuery("#mergeStep2Button").removeClass("active");   // merge Step2 Button
    jQuery("#freeLineMarkupButton").removeClass("active");
    jQuery("#markuppanel").hide();
    jQuery("#switchuserpanel").hide();

    this.annotools.drawLayer.hide();
    this.annotools.addMouseEvents()
};
