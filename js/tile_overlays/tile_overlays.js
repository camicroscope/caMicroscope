var overlays = function (tissueId, viewer) {
    this.tissueId = tissueId;
    this.viewer = viewer;
    this.m_tilesize = 256;
    this.m_minlevel = 0; //m_minlevel = ln(m_tilesize)/ln(2)
    this.m_overlaymaxlevel = 6;
};

/**
 * Segmentation tile overlay.
 *
 * @param imgData
 */
overlays.prototype.overlayRoutine = function (imgData) {
    var self = this;
    var viewer = self.viewer;

    var odata = {
        tilesize: self.m_tilesize,
        minlevel: self.m_minlevel,
        maxlevel: self.m_overlaymaxlevel,
        width: imgData.w,
        height: imgData.h,
        name: tissueId,
        loc: imgData.loc
    };

    try {
        viewer.addTiledImage({
            tileSource: {
                height: odata.height,
                width: odata.width,
                tileSize: odata.tilesize,
                minLevel: odata.minlevel,
                maxLevel: odata.maxlevel,
                getTileUrl: function (level, x, y) {
                    return location.origin + self.getPath(odata.loc) + odata.name + "-" + (odata.maxlevel - level) + "-" + x + "-" + y + ".png";

                }
            }
        });
    } catch (e) {
        throw ('Error generating overlays ' + e.message);
    }
};


/**
 * Get web path from file path
 *
 * @param overlayFolder
 * @returns {string}
 */
overlays.prototype.getPath = function (overlayFolder) {
    return ('/overlays/' + overlayFolder.split(/[/ ]+/).pop() + '/');
};


/**
 * Toggle OFF.
 */
overlays.prototype.toggleAllOFF = function () {

    var i, tiledImage;
    var count = viewer.world.getItemCount();
    // Important: start from index 1.
    for (i = 1; i < count; i++) {
        tiledImage = viewer.world.getItemAt(i);
        tiledImage.setOpacity(0);
    }

};

/**
 * Toggle tile segmentation on/off.
 *
 * @param OVERLAY_LIST
 * @param SELECTED_ALGORITHM_LIST
 */
overlays.prototype.toggle = function (OVERLAY_LIST, SELECTED_ALGORITHM_LIST) {

    var self = this;

    // Turn off segmentation.
    self.toggleAllOFF();

    // Turn on segmentation.
    OVERLAY_LIST.forEach(function (elem) {

        // Find available-tile in selected-list
        var idx = SELECTED_ALGORITHM_LIST.indexOf(elem.execid);

        // element is selected
        if (idx >= 0) {

            var imgData = {
                "id": self.iid,
                "w": imagingHelper.imgWidth,
                "h": imagingHelper.imgHeight,
                "loc": elem.loc
            };
            self.overlayRoutine(imgData);

        }
    });

};

/**
 * Get available overlays.
 *
 * @param algorithms_urlparam
 */
overlays.prototype.getList = function (algorithms_urlparam) {
    /**
     * Populate available-overlays array.
     */
    jQuery.get("api/Data/getOverlayTiles.php?iid=" + self.tissueId + "&algorithms=" + algorithms_urlparam, function (data) {

        var d = JSON.parse(data);
        for (var i = 0; i < d.length; i++) {
            if (d[i]['tile-location'] != null) {
                var myObj = {};
                myObj.execid = d[i].provenance.analysis_execution_id;
                myObj.loc = d[i]['tile-location'];
                OVERLAY_LIST.push(myObj);
            }
            else {
                console.log(d[i], "has no tile location")
            }
        }
        console.log("OVERLAY_LIST", OVERLAY_LIST);

    });

    return OVERLAY_LIST;
};
