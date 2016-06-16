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

var SpinnerSlider = function () {
  var idIncrement = 0

  return function (options) {
    this.hash = idIncrement++

    var spinnerId = 'wdzt-spinner-slider-spinner-' + this.hash
    var sliderId = 'wdzt-spinner-slider-slider-' + this.hash

    var value = options.init

    options.$element.html(
      '<div class="wdzt-table-layout wdzt-full-width">' +
      '    <div class="wdzt-row-layout">' +
      '        <div class="wdzt-cell-layout">' +
      '            <input id="' + spinnerId + '" type="text" size="1"' +
      '                   class="ui-widget-content ui-corner-all"/>' +
      '        </div>' +
      '        <div class="wdzt-cell-layout wdzt-full-width">' +
      '            <div id="' + sliderId + '" class="wdzt-menu-slider">' +
      '            </div>' +
      '        </div>' +
      '    </div>' +
      '</div>')

    var $slider = options.$element.find('#' + sliderId)
      .slider({
        min: options.min,
        max: options.sliderMax !== undefined ?
          options.sliderMax : options.max,
        step: options.step,
        value: value,
        slide: function (event, ui) {
          /*jshint unused:true */
          value = ui.value
          $spinner.spinner('value', value)
          options.updateCallback(value)
        }
      })
    var $spinner = options.$element.find('#' + spinnerId)
      .spinner({
        min: options.min,
        max: options.max,
        step: options.step,
        spin: function (event, ui) {
          /*jshint unused:true */
          value = ui.value
          $slider.slider('value', value)
          options.updateCallback(value)
        }
      })
    $spinner.val(value)
    $spinner.keyup(function (e) {
      if (e.which === 13) {
        value = $spinner.spinner('value')
        $slider.slider('value', value)
        options.updateCallback(value)
      }
    })

    this.getValue = function () {
      return value
    }
  }
}
