/*
 * This software was developed at the National Institute of Standards and
 * Technology by employees of the Federal Government in the course of
 * their official duties. Pursuant to title 17 Section 105 of the United
 * States Code this software is not subject to copyright protection and is
 * in the public domain. This software is an experimental system. NIST assumes
 * no responsibility whatsoever for its use by other parties, and makes no
 * guarantees, expressed or implied, about its quality, reliability, or
 * any other characteristic. We would appreciate acknowledgement if the
 * software is used.
 */

/**
 *
 * @author Antoine Vandecreme <antoine.vandecreme@nist.gov>
 */
(function() {

    'use strict';

    var $ = window.OpenSeadragon;
    if (!$) {
        $ = require('openseadragon');
        if (!$) {
            throw new Error('OpenSeadragon is missing.');
        }
    }
    // Requires OpenSeadragon >=2.1
    if (!$.version || $.version.major < 2 ||
        $.version.major === 2 && $.version.minor < 1) {
        throw new Error(
            'Filtering plugin requires OpenSeadragon version >= 2.1');
    }

    $.Viewer.prototype.setFilterOptions = function(options) {
        if (!this.filterPluginInstance) {
            options = options || {};
            options.viewer = this;
            this.filterPluginInstance = new $.FilterPlugin(options);
        } else {
            setOptions(this.filterPluginInstance, options);
        }
    };

    /**
     * @class FilterPlugin
     * @param {Object} options The options
     * @param {OpenSeadragon.Viewer} options.viewer The viewer to attach this
     * plugin to.
     * @param {String} [options.loadMode='async'] Set to sync to have the filters
     * applied synchronously. It will only work if the filters are all synchronous.
     * Note that depending on how complex the filters are, it may also hang the browser.
     * @param {Object[]} options.filters The filters to apply to the images.
     * @param {OpenSeadragon.TiledImage[]} options.filters[x].items The tiled images
     * on which to apply the filter.
     * @param {function|function[]} options.filters[x].processors The processing
     * function(s) to apply to the images. The parameters of this function are
     * the context to modify and a callback to call upon completion.
     */
    $.FilterPlugin = function(options) {
        options = options || {};
        if (!options.viewer) {
            throw new Error('A viewer must be specified.');
        }
        var self = this;
        this.viewer = options.viewer;

        this.viewer.addHandler('tile-loaded', tileLoadedHandler);
        this.viewer.addHandler('tile-drawing', tileDrawingHandler);

        // filterIncrement allows to determine whether a tile contains the
        // latest filters results.
        this.filterIncrement = 0;

        setOptions(this, options);


        function tileLoadedHandler(event) {
            var processors = getFiltersProcessors(self, event.tiledImage);
            if (processors.length === 0) {
                return;
            }
            var tile = event.tile;
            var image = event.image;
            if (image !== null) {
                var canvas = window.document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                var context = canvas.getContext('2d');
                context.drawImage(image, 0, 0);
                tile._renderedContext = context;
                var callback = event.getCompletionCallback();
                applyFilters(context, processors, callback);
                tile._filterIncrement = self.filterIncrement;
            }
        }


        function applyFilters(context, filtersProcessors, callback) {
            if (callback) {
                var currentIncrement = self.filterIncrement;
                var callbacks = [];
                for (var i = 0; i < filtersProcessors.length - 1; i++) {
                    (function(i) {
                        callbacks[i] = function() {
                            // If the increment has changed, stop the computation
                            // chain immediately.
                            if (self.filterIncrement !== currentIncrement) {
                                return;
                            }
                            filtersProcessors[i + 1](context, callbacks[i + 1]);
                        };
                    })(i);
                }
                callbacks[filtersProcessors.length - 1] = function() {
                    // If the increment has changed, do not call the callback.
                    // (We don't want OSD to draw an outdated tile in the canvas).
                    if (self.filterIncrement !== currentIncrement) {
                        return;
                    }
                    callback();
                };
                filtersProcessors[0](context, callbacks[0]);
            } else {
                for (var i = 0; i < filtersProcessors.length; i++) {
                    filtersProcessors[i](context, function() {
                    });
                }
            }
        }

        function tileDrawingHandler(event) {
            var tile = event.tile;
            var rendered = event.rendered;
            if (rendered._filterIncrement === self.filterIncrement) {
                return;
            }
            var processors = getFiltersProcessors(self, event.tiledImage);
            if (processors.length === 0) {
                if (rendered._originalImageData) {
                    // Restore initial data.
                    rendered.putImageData(rendered._originalImageData, 0, 0);
                    delete rendered._originalImageData;
                }
                rendered._filterIncrement = self.filterIncrement;
                return;
            }

            if (rendered._originalImageData) {
                // The tile has been previously filtered (by another filter),
                // restore it first.
                rendered.putImageData(rendered._originalImageData, 0, 0);
            } else {
                rendered._originalImageData = rendered.getImageData(
                    0, 0, rendered.canvas.width, rendered.canvas.height);
            }

            if (tile._renderedContext) {
                if (tile._filterIncrement === self.filterIncrement) {
                    var imgData = tile._renderedContext.getImageData(0, 0,
                        tile._renderedContext.canvas.width,
                        tile._renderedContext.canvas.height);
                    rendered.putImageData(imgData, 0, 0);
                    delete tile._renderedContext;
                    delete tile._filterIncrement;
                    rendered._filterIncrement = self.filterIncrement;
                    return;
                }
                delete tile._renderedContext;
                delete tile._filterIncrement;
            }
            applyFilters(rendered, processors);
            rendered._filterIncrement = self.filterIncrement;
        }
    };

    function setOptions(instance, options) {
        options = options || {};
        var filters = options.filters;
        instance.filters = !filters ? [] :
            $.isArray(filters) ? filters : [filters];
        for (var i = 0; i < instance.filters.length; i++) {
            var filter = instance.filters[i];
            if (!filter.processors) {
                throw new Error('Filter processors must be specified.');
            }
            filter.processors = $.isArray(filter.processors) ?
                filter.processors : [filter.processors];
        }
        instance.filterIncrement++;

        if (options.loadMode === 'sync') {
            instance.viewer.forceRedraw();
        } else {
            var itemsToReset = [];
            for (var i = 0; i < instance.filters.length; i++) {
                var filter = instance.filters[i];
                if (!filter.items) {
                    itemsToReset = getAllItems(instance.viewer.world);
                    break;
                }
                if ($.isArray(filter.items)) {
                    for (var j = 0; j < filter.items.length; j++) {
                        addItemToReset(filter.items[j], itemsToReset);
                    }
                } else {
                    addItemToReset(filter.items, itemsToReset);
                }
            }
            for (var i = 0; i < itemsToReset.length; i++) {
                itemsToReset[i].reset();
            }
        }
    }

    function addItemToReset(item, itemsToReset) {
        if (itemsToReset.indexOf(item) >= 0) {
            throw new Error('An item can not have filters ' +
                'assigned multiple times.');
        }
        itemsToReset.push(item);
    }

    function getAllItems(world) {
        var result = [];
        for (var i = 0; i < world.getItemCount(); i++) {
            result.push(world.getItemAt(i));
        }
        return result;
    }

    function getFiltersProcessors(instance, item) {
        if (instance.filters.length === 0) {
            return [];
        }

        var globalProcessors = null;
        for (var i = 0; i < instance.filters.length; i++) {
            var filter = instance.filters[i];
            if (!filter.items) {
                globalProcessors = filter.processors;
            } else if (filter.items === item ||
                $.isArray(filter.items) && filter.items.indexOf(item) >= 0) {
                return filter.processors;
            }
        }
        return globalProcessors ? globalProcessors : [];
    }

    $.Filters = {
        THRESHOLDING: function(threshold) {
            if (threshold < 0 || threshold > 255) {
                throw new Error('Threshold must be between 0 and 255.');
            }
            return function(context, callback) {
                var imgData = context.getImageData(
                    0, 0, context.canvas.width, context.canvas.height);
                var pixels = imgData.data;
                for (var i = 0; i < pixels.length; i += 4) {
                    var r = pixels[i];
                    var g = pixels[i + 1];
                    var b = pixels[i + 2];
                    var v = (r + g + b) / 3;
                    pixels[i] = pixels[i + 1] = pixels[i + 2] =
                        v < threshold ? 0 : 255;
                }
                context.putImageData(imgData, 0, 0);
                callback();
            };
        },
        BRIGHTNESS: function(adjustment) {
            if (adjustment < -255 || adjustment > 255) {
                throw new Error(
                    'Brightness adjustment must be between -255 and 255.');
            }
            return function(context, callback) {
                var imgData = context.getImageData(
                    0, 0, context.canvas.width, context.canvas.height);
                var pixels = imgData.data;
                for (var i = 0; i < pixels.length; i += 4) {
                    pixels[i] += adjustment;
                    pixels[i + 1] += adjustment;
                    pixels[i + 2] += adjustment;
                }
                context.putImageData(imgData, 0, 0);
                callback();
            };
        },
        CONTRAST: function(adjustment) {
            if (adjustment < 0) {
                throw new Error('Contrast adjustment must be positive.');
            }
            return function(context, callback) {
                var imgData = context.getImageData(
                    0, 0, context.canvas.width, context.canvas.height);
                var pixels = imgData.data;
                for (var i = 0; i < pixels.length; i += 4) {
                    pixels[i] *= adjustment;
                    pixels[i + 1] *= adjustment;
                    pixels[i + 2] *= adjustment;
                }
                context.putImageData(imgData, 0, 0);
                callback();
            };
        },
        GAMMA: function(adjustment) {
            if (adjustment < 0) {
                throw new Error('Gamma adjustment must be positive.');
            }
            return function(context, callback) {
                var imgData = context.getImageData(
                    0, 0, context.canvas.width, context.canvas.height);
                var pixels = imgData.data;
                for (var i = 0; i < pixels.length; i += 4) {
                    pixels[i] = Math.pow(pixels[i] / 255, adjustment) * 255;
                    pixels[i + 1] =
                        Math.pow(pixels[i + 1] / 255, adjustment) * 255;
                    pixels[i + 2] =
                        Math.pow(pixels[i + 2] / 255, adjustment) * 255;
                }
                context.putImageData(imgData, 0, 0);
                callback();
            };
        },
        GREYSCALE: function() {
            return function(context, callback) {
                var imgData = context.getImageData(
                    0, 0, context.canvas.width, context.canvas.height);
                var pixels = imgData.data;
                for (var i = 0; i < pixels.length; i += 4) {
                    var val = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
                    pixels[i] = val;
                    pixels[i + 1] = val;
                    pixels[i + 2] = val;
                }
                context.putImageData(imgData, 0, 0);
                callback();
            };
        },
        INVERT: function() {
            return function(context, callback) {
                var imgData = context.getImageData(
                    0, 0, context.canvas.width, context.canvas.height);
                var pixels = imgData.data;
                for (var i = 0; i < pixels.length; i += 4) {
                    pixels[i] = 255 - pixels[i];
                    pixels[i + 1] = 255 - pixels[i + 1];
                    pixels[i + 2] = 255 - pixels[i + 2];
                }
                context.putImageData(imgData, 0, 0);
                callback();
            };
        },
        MORPHOLOGICAL_OPERATION: function(kernelSize, comparator) {
            if (kernelSize % 2 === 0) {
                throw new Error('The kernel size must be an odd number.');
            }
            var kernelHalfSize = Math.floor(kernelSize / 2);

            if (!comparator) {
                throw new Error('A comparator must be defined.');
            }

            return function(context, callback) {
                var width = context.canvas.width;
                var height = context.canvas.height;
                var imgData = context.getImageData(0, 0, width, height);
                var originalPixels = context.getImageData(0, 0, width, height)
                    .data;
                var offset;

                for (var y = 0; y < height; y++) {
                    for (var x = 0; x < width; x++) {
                        offset = (y * width + x) * 4;
                        var r = originalPixels[offset];
                        var g = originalPixels[offset + 1];
                        var b = originalPixels[offset + 2];
                        for (var j = 0; j < kernelSize; j++) {
                            for (var i = 0; i < kernelSize; i++) {
                                var pixelX = x + i - kernelHalfSize;
                                var pixelY = y + j - kernelHalfSize;
                                if (pixelX >= 0 && pixelX < width &&
                                    pixelY >= 0 && pixelY < height) {
                                    offset = (pixelY * width + pixelX) * 4;
                                    r = comparator(originalPixels[offset], r);
                                    g = comparator(
                                        originalPixels[offset + 1], g);
                                    b = comparator(
                                        originalPixels[offset + 2], b);
                                }
                            }
                        }
                        imgData.data[offset] = r;
                        imgData.data[offset + 1] = g;
                        imgData.data[offset + 2] = b;
                    }
                }
                context.putImageData(imgData, 0, 0);
                callback();
            };
        },
        CONVOLUTION: function(kernel) {
            if (!$.isArray(kernel)) {
                throw new Error('The kernel must be an array.');
            }
            var kernelSize = Math.sqrt(kernel.length);
            if ((kernelSize + 1) % 2 !== 0) {
                throw new Error('The kernel must be a square matrix with odd' +
                    'width and height.');
            }
            var kernelHalfSize = (kernelSize - 1) / 2;

            return function(context, callback) {
                var width = context.canvas.width;
                var height = context.canvas.height;
                var imgData = context.getImageData(0, 0, width, height);
                var originalPixels = context.getImageData(0, 0, width, height)
                    .data;
                var offset;

                for (var y = 0; y < height; y++) {
                    for (var x = 0; x < width; x++) {
                        var r = 0;
                        var g = 0;
                        var b = 0;
                        for (var j = 0; j < kernelSize; j++) {
                            for (var i = 0; i < kernelSize; i++) {
                                var pixelX = x + i - kernelHalfSize;
                                var pixelY = y + j - kernelHalfSize;
                                if (pixelX >= 0 && pixelX < width &&
                                    pixelY >= 0 && pixelY < height) {
                                    offset = (pixelY * width + pixelX) * 4;
                                    var weight = kernel[j * kernelSize + i];
                                    r += originalPixels[offset] * weight;
                                    g += originalPixels[offset + 1] * weight;
                                    b += originalPixels[offset + 2] * weight;
                                }
                            }
                        }
                        offset = (y * width + x) * 4;
                        imgData.data[offset] = r;
                        imgData.data[offset + 1] = g;
                        imgData.data[offset + 2] = b;
                    }
                }
                context.putImageData(imgData, 0, 0);
                callback();
            };
        }
    };

}());
