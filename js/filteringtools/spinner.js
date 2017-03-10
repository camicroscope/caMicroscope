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

var Spinner = function () {
  /**
   * This class is an improvement over the basic jQuery spinner to support
   * 'Enter' to update the value (with validity checks).
   * @param {Object} options Options object
   * @return {Spinner} A spinner object
   */
  return function (options) {
    options.$element.html('<input type="text" size="1" ' +
      'class="ui-widget-content ui-corner-all"/>')

    var $spinner = options.$element.find('input')
    var value = options.init
    $spinner.spinner({
      min: options.min,
      max: options.max,
      step: options.step,
      spin: function (event, ui) {
        /*jshint unused:true */
        value = ui.value
        options.updateCallback(value)
      }
    })
    $spinner.val(value)
    $spinner.keyup(function (e) {
      if (e.which === 13) {
        if (!this.value.match(/^-?\d?\.?\d*$/)) {
          this.value = options.init
        } else if (options.min !== undefined &&
          this.value < options.min) {
          this.value = options.min
        } else if (options.max !== undefined &&
          this.value > options.max) {
          this.value = options.max
        }
        value = this.value
        options.updateCallback(value)
      }
    })

    this.getValue = function () {
      return value
    }
  }
}
