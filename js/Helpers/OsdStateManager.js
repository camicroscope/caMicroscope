var OsdStateManager = new Class({
  initialize: function (viewer, options) {
    this.viewer = viewer
    this.state = 'none'
    this.stateTarget = null
    this.stateOrigin = null
    this.scale = options.ratio || 1.3
    this.lastCenter = {x: 0, y: 0}
    this.objectCenterPts = {}
    this.originalCoords = []
    this.originalDivCoords = []
    this.zoom = viewer.viewport.getZoom()
    this.zoomBase = viewer.viewport.getZoom()
    this.zooming = false
    this.panning = false
    this.animateWaitTime = options.animateWaitTime || 300

    this._setupOpenSeadragonButtonHandlers()

    // global object reference used when the "this" object is referring to the window
    window.annotationHandler = this
  },

  getState: function(){
    var pt = this.viewer.viewport.getCenter(true);
    var xi = pt.x;
    var yi = pt.y;
    var zi = this.viewer.viewport.getZoom(true);
    var l = encodeURIComponent(btoa(JSON.stringify({
      "x": xi,
      "y": yi,
      "z": zi
    })));
    window.history.pushState("hi", "Encoded", "?state=" + l);
  },

  setState: function(){
    //TODO some error handling
    // handle improper encoding gracefully
    // handle missing field in json gracefully
    var matches = /state=([^&#=]*)/.exec(window.location.search);
    if (matches.length) {
      var xi = matches[1];
      var l = atob(decodeURIComponent(xi));
      var ll = JSON.parse(l);
      if ("x" in ll && "y" in ll) {
        var pt = new Point(ll.x, ll.y);
        this.viewer.viewport.zoomTo(pt, ll.z);
        }
      }
    }
  });
