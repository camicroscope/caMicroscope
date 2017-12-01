console.log("overlay_image_test.js");

const path = "/overlay_img_test",
    m_tilesize = 256,
    m_minlevel = 0, //m_minlevel = ln(m_tilesize)/ln(2)
    m_overlaymaxlevel = 6;

/**
 * Testing segmentation tile overlay.
 * @param imgData
 * @param viewer
 * @returns {boolean}
 */
overlayRoutine = function (imgData, viewer) {

    console.log("Here in overlayRoutine()");

    var odata = {
        tilesize: m_tilesize,
        minlevel: m_minlevel,
        maxlevel: m_overlaymaxlevel,
        width: imgData.w,
        height: imgData.h,
        tileprefix: tissueId
    };

    try {
        odata = fetchOverlayData(imgData.id, odata);

        if (jQuery.isEmptyObject(odata)) {
            console.log("Carry on...");
        } else {
            console.log("Rendering segmentation overlays...");
            viewer.addTiledImage({
                tileSource: {
                    height: odata.height,
                    width: odata.width,
                    tileSize: odata.tilesize,
                    minLevel: odata.minlevel,
                    maxLevel: odata.maxlevel,
                    getTileUrl: function (level, x, y) {
                        return location.origin + odata.filepath + odata.tileprefix + "-"
                            + (odata.maxlevel - level) + "-" + x + "-" + y + ".png";
                    }
                }
            });
        }

    } catch (e) {
        throw ('Error generating overlays ' + e.message);
    }

};


/**
 *
 * @param tissueId
 * @param odata
 * @returns {{}}
 */
function fetchOverlayData(tissueId, odata) {

    var imagesWithTiles = ['PC_052_0_1', '17039889', 'BC_201_1_1'];

    try {

        if (!imagesWithTiles.includes(tissueId)) {
            // If no tiles, return empty object
            odata = {};
        }
        else {
            if (tissueId === "PC_052_0_1") {
                odata.filepath = path + "/Hawaii/PC_052_0_1.svs_files/";
            }
            else if (tissueId === "17039889") {
                odata.filepath = path + "/VTR-Connecticut/17039889.svs_files/";
            }
            else if (tissueId === "BC_201_1_1") {
                odata.filepath = path + "/Hawaii/batch2/BC_201_1_1.svs_files/";
            }
            else {
                // If none of the above, return empty obj
                odata = {};
            }
        }
    }
    catch (ex) {
        console.log("ex: ", ex.message);
    }
    finally {
        console.log("odata: ", odata);
    }

    return odata;

}

/**
 *
 * @param width
 * @param height
 */
/*
function getMaxLevel(width, height) {
    // do natural logarithm (base e)
    if (width > height) {
        return Math.ceil(Math.log(width) / Math.log(2));
    }
    else {
        return Math.ceil(Math.log(height) / Math.log(2));
    }

}
*/
