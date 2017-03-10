var FilterTools = function () {}

FilterTools.prototype.updateFilters = function () {
  var $ = jQuery
  var filters = []
  var sync = true
  $('#selected li').each(function () {
    var id = this.id
    var filter = hashTable[id]
    filters.push(filter.generatedFilter.getFilter())
    sync &= filter.generatedFilter.sync
  })
  // console.log(filters)
  viewer.setFilterOptions({
    filters: {
      processors: filters
    },
    loadMode: sync ? 'sync' : 'async'
  })
}

FilterTools.prototype.showFilterControls = function () {
  var panel = jQuery('#panel')
  var $ = jQuery
  panel.show('slide')
  panel.html("<div id='panelHeader'><h4>Image Filters</h4></div>"
    + "<div id='panelBody'>" +
    '<button id="toggleFilter" class="btn">Toggle</button>' +
    '<button id="saveFilter" class="btn">Save</button>' +
    '<button id="closeFilter" class="btn">Close</button>'+
    '<div id="savedURL"></div>' +
    '<h5>Selected Filters</h5>' +
    "<ul id='selected'></ul>" +
    '<h5>Available Filters</h5>' +
    "<ul id='available'></ul>"
    + '</div>')
  
  $("#closeFilter").click(function(){
    $("#panel").hide();
  });

  $('#saveFilter').click(function () {
    var filters = []
    $('#selected li').each(function () {
      var id = this.id
      var filter = hashTable[id]
      // filters.push(filter.generatedFilter.getFilter())
      // console.log(filter)
      var f = {}
      var filterName = filter.name
      var filterVal = filter.generatedFilter.getParams()
      f.name = filterName
      f.value = filterVal
      filters.push(f)
    // sync &= filter.generatedFilter.sync
    })
    console.log(filters)
    var state = {
      'state': {
        'filters': filters
      }
    }
    console.log(state)
    jQuery.ajax({
      'type': 'POST',
      'url': 'https://test-8f679.firebaseio.com/camicroscopeStates.json?auth=kweMPSAo4guxUXUodU0udYFhC27yp59XdTEkTSJ4',
      'data': JSON.stringify(state),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function (data) {
        console.log('posted!')
        console.log(data)
        var url = 'http://dragon.cci.emory.edu/camicroscope3/osdCamicroscope.php?tissueId=TCGA-02-0001&stateID=' + data.name
        console.log(url)
        jQuery('#savedURL').html('<a href="http://dragon.cci.emory.edu/camicroscope3/osdCamicroscope.php?tissueId=TCGA-02-0001&stateID=' + data.name + '">' + url + '</a>')
      }
    })
  })

  // List of filters with their templates.
  var availableFilters = [
    {
      name: 'Invert',
      generate: function () {
        return {
          html: '',
          getParams: function () {
            return ''
          },
          getFilter: function () {
            /*eslint new-cap: 0*/
            return OpenSeadragon.Filters.INVERT()
          },
          sync: true
        }
      }
    }, {
      name: 'Contrast',
      help: 'Range is from 0 to infinity, although sane values are from 0 ' +
        'to 4 or 5. Values between 0 and 1 will lessen the contrast ' +
        'while values greater than 1 will increase it.',
      generate: function (updateCallback) {
        // var $html = $('<div></div>')
        var $html = $("<div><input type='range' id='controlContrast' value=1 min=0 max=4 step=0.1 /><input type='number' id='controlContrastNum' min='0' value=1  max='4' step='0.1'/></div>")

        return {
          html: $html,
          getParams: function () {
            return $('#controlContrast').val() * 1
          },
          getFilter: function () {
            return OpenSeadragon.Filters.CONTRAST($('#controlContrast').val() * 1)
          },
          sync: true
        }
      }
    }, {
      name: 'Gamma',
      help: 'Range is from 0 to infinity, although sane values ' +
        'are from 0 to 4 or 5. Values between 0 and 1 will ' +
        'lessen the contrast while values greater than 1 will increase it.',
      generate: function (updateCallback) {
        var $html = $('<div><input type="range" id="controlGamma" min=0 max=5 step=0.1 /><input type="number" id="controlGammaNum" min="0" max="4" step="0.1" /></div>')
        return {
          html: $html,
          getParams: function () {
            return $('#controlGamma').val() * 1
          },
          getFilter: function () {
            // var value =
            return OpenSeadragon.Filters.GAMMA($('#controlGamma').val() * 1)
          }
        }
      }
    }, {
      name: 'Greyscale',
      generate: function () {
        return {
          html: '',
          getParams: function () {
            return ''
          },
          getFilter: function () {
            return OpenSeadragon.Filters.GREYSCALE()
          },
          sync: true
        }
      }
    }, {
      name: 'SobelEdge',
      generate: function () {
        return {
          html: '',
          getParams: function () {
            return ''
          },
          getFilter: function () {
            return function (context, callback) {
              var imgData = context.getImageData(
                0, 0, context.canvas.width, context.canvas.height)
              var pixels = imgData.data
              var originalPixels = context.getImageData(0, 0, context.canvas.width, context.canvas.height).data
              var oneRowOffset = context.canvas.width * 4
              var onePixelOffset = 4
              var Gy, Gx
              var idx = 0
              for (var i = 1; i < context.canvas.height - 1; i += 1) {
                idx = oneRowOffset * i + 4
                for (var j = 1; j < context.canvas.width - 1; j += 1) {
                  Gy = originalPixels[idx - onePixelOffset + oneRowOffset] + 2 * originalPixels[idx + oneRowOffset] + originalPixels[idx + onePixelOffset + oneRowOffset]
                  Gy = Gy - (originalPixels[idx - onePixelOffset - oneRowOffset] + 2 * originalPixels[idx - oneRowOffset] + originalPixels[idx + onePixelOffset - oneRowOffset])
                  Gx = originalPixels[idx + onePixelOffset - oneRowOffset] + 2 * originalPixels[idx + onePixelOffset] + originalPixels[idx + onePixelOffset + oneRowOffset]
                  Gx = Gx - (originalPixels[idx - onePixelOffset - oneRowOffset] + 2 * originalPixels[idx - onePixelOffset] + originalPixels[idx - onePixelOffset + oneRowOffset])
                  pixels[idx] = Math.sqrt(Gx * Gx + Gy * Gy); // 0.5*Math.abs(Gx) + 0.5*Math.abs(Gy);//100*Math.atan(Gy,Gx)
                  pixels[idx + 1] = 0
                  pixels[idx + 2] = 0
                  idx += 4
                }
              }
              context.putImageData(imgData, 0, 0)
              callback()
            }
          }
        }
      }
    }, {
      name: 'Brightness',
      help: 'Brightness must be between -255 (darker) and 255 (brighter).',
      generate: function (updateCallback) {
        var $html

        $html = $("<div><input type='range' id='controlBrightness' min='-255' max=255 step=1 />   <input type='number' value=0 id='controlBrightnessNum' min='-255' max='255' step='1' /></div>")

        // console.log(updateCallback)
        return {
          html: $html,
          getParams: function () {
            console.log($('#controlBrightness').val() * 1)
            return $('#controlBrightness').val() * 1
          },
          getFilter: function () {
            return OpenSeadragon.Filters.BRIGHTNESS($('#controlBrightness').val() * 1)
          },
          sync: true
        }
      }
    }, {
      name: 'Erosion',
      help: 'The erosion kernel size must be an odd number.',
      generate: function (updateCallback) {
        var $html = $("<div><input type='range' value=1 id='controlErosion' min='1' max=51 step=2 /><input type='number' id='controlErosionNum' min=1 max=51 step=2 value=1 /></div>")

        return {
          html: $html,
          getParams: function () {
            return $('#controlErosion').val() * 1
          },
          getFilter: function () {
            return OpenSeadragon.Filters.MORPHOLOGICAL_OPERATION($('#controlErosion').val() * 1, Math.min)
          }
        }
      }
    }, {
      name: 'Dilation',
      help: 'The dilation kernel size must be an odd number.',
      generate: function (updateCallback) {
        var $html = $("<div><input type='range' id='controlDilation' value=1 min=1 max=31 step=2 /><input value=1 type='number' id='controlDilationNum' min=1 mx=31 step=2 /></div>")
        return {
          html: $html,
          getParams: function () {
            return $('#controlDilation').val() * 1
          },
          getFilter: function () {
            return OpenSeadragon.Filters.MORPHOLOGICAL_OPERATION($('#controlDilation').val() * 1, Math.max)
          }
        }
      }
    }, {
      name: 'Thresholding',
      help: 'The threshold must be between 0 and 255.',
      generate: function (updateCallback) {
        var $html = $("<div><input type='range' id='controlThreshholding' min='0' value=150  max=255 step=1 /><input type='number' id='controlThreshholdingNum' value=150 min=0 max=255 step=1 /></div>")

        return {
          html: $html,
          getParams: function () {
            return $('#controlThreshholding').val() * 1
          },
          getFilter: function () {
            return OpenSeadragon.Filters.THRESHOLDING($('#controlThreshholding').val() * 1)
          },
          sync: true
        }
      }
    }]
  availableFilters.sort(function (f1, f2) {
    return f1.name.localeCompare(f2.name)
  })

  var idIncrement = 0
  hashTable = {}

  availableFilters.forEach(function (filter) {
    var $li = $('<li></li>')
    var $plus = $('<img src="images/plus.png" alt="+" class="button" id="' + filter.name + '_add">')
    $li.append($plus)
    $li.append(filter.name)
    $li.appendTo($('#available'))
    $plus.click(function () {
      var id = 'selected_' + idIncrement++
      var generatedFilter = filter.generate(updateFilters)

      hashTable[id] = {
        name: filter.name,
        generatedFilter: generatedFilter
      }
      var $li = $('<li id="' + id + '"><div class="wdzt-table-layout"><div class="wdzt-row-layout"></div></div></li>')
      var $minus = $('<div class="wdzt-cell-layout"><img src="images/minus.png" alt="-" class="button"></div>')
      $li.find('.wdzt-row-layout').append($minus)
      $li.find('.wdzt-row-layout').append('<div class="wdzt-cell-layout filterLabel">' + filter.name + '</div>')
      if (filter.help) {
        var $help = $('<div class="wdzt-cell-layout"><img src="images/help-browser-2.png" alt="help" title="' +
          filter.help + '"></div>')
        $help.tooltip()
        $li.find('.wdzt-row-layout').append($help)
      }
      $li.find('.wdzt-row-layout').append(
        $('<div class="wdzt-cell-layout wdzt-full-width"></div>')
          .append(generatedFilter.html))
      $minus.click(function () {
        delete hashTable[id]
        $li.remove()
        updateFilters()
      })
      $li.appendTo($('#selected'))

      $('#controlBrightness').on('change input', function () {
        console.log('changed brightness')
        $('#controlBrightnessNum').val($('#controlBrightness').val() * 1)
        updateFilters()
      })
      $('#controlBrightnessNum').on('input', function () {
        console.log('..')
        $('#controlBrightness').val($('#controlBrightnessNum').val() * 1)
        updateFilters()
      })

      $('#controlNoise').on('change', function () {
        updateFilters()
      })
      $('#controlContrast').on('change', function () {
        $('#controlContrastNum').val($('#controlContrast').val() * 1)
        updateFilters()
      })
      $('#controlContrastNum').on('input', function () {
        console.log('..')
        $('#controlContrast').val($('#controlContrastNum').val() * 1)
        updateFilters()
      })
      $('#controlErosion').on('change', function () {
        $('#controlErosionNum').val($('#controlErosion').val() * 1)
        updateFilters()
      })
      $('#controlErosionNum').on('input', function () {
        console.log('..')
        $('#controlErosion').val($('#controlErosionNum').val() * 1)
        updateFilters()
      })
      $('#controlDilation').on('change', function () {
        $('#controlDilationNum').val($('#controlDilation').val() * 1)
        updateFilters()
      })
      $('#controlDilationNum').on('input', function () {
        console.log('..')
        $('#controlDilation').val($('#controlDilationNum').val() * 1)
        updateFilters()
      })

      $('#controlExposure').on('change', function () {
        $('#controlExposureNum').val($('#controlExposure').val() * 1)
        updateFilters()
      })
      $('#controlExposureNum').on('input', function () {
        console.log('..')
        $('#controlExposure').val($('#controlExposureNum').val() * 1)
        updateFilters()
      })
      $('#controlThreshholding').on('change', function () {
        $('#controlThreshholdingNum').val($('#controlThreshholding').val() * 1)
        updateFilters()
      })
      $('#controlThreshholdingNum').on('input', function () {
        console.log('..')
        $('#controlThreshholding').val($('#controlThreshholdingNum').val() * 1)
        updateFilters()
      })

      $('#controlGamma').on('change', function () {
        $('#controlGammaNum').val($('#controlGamma').val() * 1)
        updateFilters()
      })
      $('#controlGammaNum').on('input', function () {
        console.log('..')
        $('#controlGamma').val($('#controlGammaNum').val() * 1)
        updateFilters()
      })

      $('#controlSaturation').on('change', function () {
        updateFilters()
      })
      updateFilters()
    })
  })
  var showFilters = true
  $('#toggleFilter').click(function () {
    var filters = []
    $('#selected li').each(function () {
      var id = this.id
      var filter = hashTable[id]
      filters.push(filter.generatedFilter.getFilter())
    // sync &= filter.generatedFilter.sync
    })

    if (showFilters) {
      viewer.setFilterOptions({
        filters: {processors: []}
      })
      showFilters = false
    } else {
      console.log(filters)
      viewer.setFilterOptions({
        filters: {processors: filters}
      })
      showFilters = true
    }
  })

  $('#selected').sortable({
    containment: 'parent',
    axis: 'y',
    tolerance: 'pointer',
    update: updateFilters
  })

  function updateFilters () {
    var filters = []
    var sync = true
    $('#selected li').each(function () {
      var id = this.id
      var filter = hashTable[id]
      filters.push(filter.generatedFilter.getFilter())
      sync &= filter.generatedFilter.sync
    })
    // console.log(filters)
    viewer.setFilterOptions({
      filters: {
        processors: filters
      },
      loadMode: sync ? 'sync' : 'async'
    })
  }
}
