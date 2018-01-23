var overlays = function (tissueId) {
    this.tissueId = tissueId;
    this.m_tilesize = 256;
    this.m_minlevel = 0; //m_minlevel = ln(m_tilesize)/ln(2)
    this.m_overlaymaxlevel = 6;
};

/**
 * Segmentation tile overlay.
 *
 * @param imgData
 * @param viewer
 */
overlays.prototype.overlayRoutine = function (imgData, viewer) {
    var self = this;

    var odata = {
        tilesize: self.m_tilesize,
        minlevel: self.m_minlevel,
        maxlevel: self.m_overlaymaxlevel,
        width: imgData.w,
        height: imgData.h,
        name: tissueId,
        loc: imgData.loc
    };

    if (!jQuery.isEmptyObject(odata)) {
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
 * Toggle on/off.
 *
 * @param viewer
 * @param opacity
 */
overlays.prototype.toggle = function (viewer, opacity) {
    var i, tiledImage;
    var count = viewer.world.getItemCount();
    for (i = 1; i < count; i++) {
        tiledImage = viewer.world.getItemAt(i);
        tiledImage.setOpacity(opacity);
    }
};

