console.log("overlay_image_test.js");

const path = "/overlay_img_test",
    m_tilesize = 256,
    m_minlevel = 0, //m_minlevel = ln(m_tilesize)/ln(2)
    m_overlaymaxlevel = 6;

console.log("minlevel: ", m_minlevel);


/**
 * Testing segmentation tile overlay.
 * @param tissueId
 * @param viewer
 * @returns {boolean}
 */
overlayRoutine = function (tissueId, viewer) {

    console.log("here in overlayRoutine()");

    var odata = {
        tilesize: m_tilesize,
        minlevel: m_minlevel,
        maxlevel: m_overlaymaxlevel
    };

    try {
        odata = fetchOverlayData(tissueId, odata);

        if (jQuery.isEmptyObject(odata)) {
            console.log("Carry on...");
        } else {
            console.log("Rendering segmentation overlays...");
            //var maxlevel = odata.overlaymaxlevel;
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
            odata = {};
        }
        else {
            if (tissueId === "PC_052_0_1") {

                odata.width = 163199;
                odata.height = 88262;
                //odata.maxlevel = getMaxLevel(odata.width, odata.height);
                odata.filepath = path + "/Hawaii/PC_052_0_1.svs_files/"; // TODO: replace RESTfully
                odata.tileprefix = "saved";
            }
            else if (tissueId === "17039889") {

                odata.width = 103583;
                odata.height = 91570;
                //odata.maxlevel = getMaxLevel(odata.width, odata.height);
                odata.filepath = path + "/VTR-Connecticut/17039889.svs_files/";
                odata.tileprefix = tissueId;
            }
            else if (tissueId === "BC_201_1_1") {

                odata.width = 107519;
                odata.height = 67341;
                //odata.maxlevel = getMaxLevel(odata.width, odata.height);
                odata.filepath = path + "/Hawaii/batch2/BC_201_1_1.svs_files/";
                odata.tileprefix = tissueId;
            }
            else {
                // In case we goofed somewhere
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
function getMaxLevel(width, height) {
    // do natural logarithm (base e)
    if (width > height) {
        return Math.ceil(Math.log(width) / Math.log(2));
    }
    else {
        return Math.ceil(Math.log(height) / Math.log(2));
    }

}

