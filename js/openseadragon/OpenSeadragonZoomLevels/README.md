# OpenSeadragonZoomLevels

An OpenSeadragon plugin to allow restricting the image zoom to specific levels.

**Currently only works with single images!**

## Demo

http://picturae.github.io/openseadragonselection/#tabs-zoom-levels

## Usage

This plugin requires a version of OpenSeadragon later than 2.0

Include `dist/openseadragonzoomlevels.js` after OpenSeadragon in your html. Then after you create a viewer:

    var zoomLevels = viewer.zoomLevels({
        levels: [0.1, 0.5, 1]
    });

Zoom levels are specified as an array of Floats where 1 is 100%. Allows zooming only to specific levels.

When `minZoomImageRatio`, `maxZoomPixelRatio`, `minZoomLevel` and/or `maxZoomLevel` are in conflict with this, the most restrictive options are used. `defaultZoomLevel` is always respected, even if not in this list.

If `zoomPerScroll` is too big, some levels might be skipped, so a small value is recommended (e.g. 1.00001).
