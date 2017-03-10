(function($) {
    'use strict';

    if (!$.version || $.version.major < 2) {
        throw new Error('This version of OpenSeadragonZoomLevels requires OpenSeadragon version 2.0.0+');
    }

    $.Viewer.prototype.zoomLevels = function(options) {
        if (!this.zoomLevelsInstance || options) {
            options = options || {};
            options.viewer = this;
            this.zoomLevelsInstance = new $.ZoomLevels(options);
        }
        return this.zoomLevelsInstance;
    };


    /**
     * @class ZoomLevels
     * @classdesc Allows restricting the image zoom to specific levels
     * @memberof OpenSeadragon
     * @param {Object} options
     */
    $.ZoomLevels = function(options) {
        var self = this;

        $.extend(true, self, {
            // internal state properties
            viewer: null,

            // options
            levels: [],
        }, options);

        sortZoomLevels(options.levels);

        var viewport = self.viewer.viewport;
        var zoom;
        self.viewer.addHandler('zoom', function(e) {
            if (zoom !== e.zoom) {
                zoom = e.zoom;

                if (zoom !== viewport.getHomeZoom()) {
                    if (zoom < viewport.zoomSpring.current.value) {
                        zoom = self.getLowerZoomLevel(zoom);
                    } else if (zoom > viewport.zoomSpring.current.value) {
                        zoom = self.getUpperZoomLevel(zoom);
                    }
                }

                if (zoom !== e.zoom) {
                    e.zoom = zoom;
                    viewport.zoomTo(zoom, e.refPoint, e.immediately);
                }
            }
        });
    };

    $.extend($.ZoomLevels.prototype, /** @lends OpenSeadragon.ZoomLevels.prototype */ {
        /**
         * Only used for fixed zoom levels. See zoomLevels in {@link OpenSeadragon.Options}.
         * @function
         * @param {Number} zoom - The desired zoom level
         * @return {Number} The proper zoom level.
         */
        getUpperZoomLevel: function(zoom) {
            if ($.isArray(this.levels) && this.levels.length) {
                var viewport = this.viewer.viewport;
                var imageZoom = viewport.viewportToImageZoom(zoom);
                zoom = viewport.imageToViewportZoom(this.levels[this.levels.length - 1]);
                for (var i = 0; i < this.levels.length; i++) {
                    if (this.levels[i] > imageZoom) {
                        zoom = viewport.imageToViewportZoom(this.levels[i]);
                        break;
                    }
                }
                return Math.min(
                    zoom,
                    viewport.getMaxZoom()
                );
            }
            return zoom;
        },

        /**
         * Only used for fixed zoom levels. See zoomLevels in {@link OpenSeadragon.Options}.
         * @function
         * @param {Number} zoom - The desired zoom level
         * @return {Number} The proper zoom level.
         */
        getLowerZoomLevel: function(zoom) {
            if ($.isArray(this.levels) && this.levels.length) {
                var viewport = this.viewer.viewport;
                var imageZoom = viewport.viewportToImageZoom(zoom);
                zoom = viewport.imageToViewportZoom(this.levels[0]);
                for (var i = this.levels.length - 1; i >= 0; i--) {
                    if (this.levels[i] < imageZoom) {
                        zoom = viewport.imageToViewportZoom(this.levels[i]);
                        break;
                    }
                }
                return Math.max(
                    zoom,
                    viewport.getMinZoom()
                );
            }
            return zoom;
        },
    });

    /**
     * Sort zoom levels (if there are any) in numeric, ascending order
     * @function
     * @return {undefined}
     */
    function sortZoomLevels(levels) {
        if ($.isArray(levels)) {
            levels.sort(function(a, b) {
                // numeric, ascending
                return a - b;
            });
        }
    }

})(OpenSeadragon);
