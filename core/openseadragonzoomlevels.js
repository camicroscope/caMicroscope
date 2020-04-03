!function(e) {
  'use strict'; function o(o) {
    e.isArray(o)&&o.sort(function(e, o) {
      return e-o;
    });
  } if (!e.version||e.version.major<2) throw new Error('This version of OpenSeadragonZoomLevels requires OpenSeadragon version 2.0.0+'); e.Viewer.prototype.zoomLevels=function(o) {
    return this.zoomLevelsInstance&&!o||(o=o||{}, o.viewer=this, this.zoomLevelsInstance=new e.ZoomLevels(o)), this.zoomLevelsInstance;
  }, e.ZoomLevels=function(t) {
    const r=this; e.extend(!0, r, {viewer: null, levels: []}, t), o(t.levels); let i; const s=r.viewer.viewport; r.viewer.addHandler('zoom', function(e) {
      i!==e.zoom&&(i=e.zoom, i!==s.getHomeZoom()&&(i<s.zoomSpring.current.value?i=r.getLowerZoomLevel(i):i>s.zoomSpring.current.value&&(i=r.getUpperZoomLevel(i))), i!==e.zoom&&(e.zoom=i, s.zoomTo(i, e.refPoint, e.immediately)));
    });
  }, e.extend(e.ZoomLevels.prototype, {getUpperZoomLevel: function(o) {
    if (e.isArray(this.levels)&&this.levels.length) {
      const t=this.viewer.world.getItemAt(0); const r=t.viewportToImageZoom(o); o=t.imageToViewportZoom(this.levels[this.levels.length-1]); for (let i=0; i<this.levels.length; i++) {
        if (this.levels[i]>=r) {
          o=t.imageToViewportZoom(this.levels[i]); break;
        }
      } return Math.min(o, this.viewer.viewport.getMaxZoom());
    } return o;
  }, getLowerZoomLevel: function(o) {
    if (e.isArray(this.levels)&&this.levels.length) {
      const t=this.viewer.world.getItemAt(0); const r=t.viewportToImageZoom(o); o=t.imageToViewportZoom(this.levels[0]); for (let i=this.levels.length-1; i>=0; i--) {
        if (this.levels[i]<=r) {
          o=t.imageToViewportZoom(this.levels[i]); break;
        }
      } return Math.max(o, this.viewer.viewport.getMinZoom());
    } return o;
  }});
}(OpenSeadragon);
// # sourceMappingURL=openseadragonzoomlevels.js.map
