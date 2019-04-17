// this is not working yet. WIP until I can look at the data
CaMic.prototype.loadImg = function(func) {
  // do we have a GHC token?
  // load up!
  var img_id = urlParams.get('id');
  this.slideId = slideId
  this.slideName = slideId
  this.study = ""
  this.specimen = ""

  this.mpp = 1e9;
  this.mpp_x = this.mpp;
  this.mpp_y = this.mpp;
  // TODO what to do about this
  var ghc_source = {
    height: maxHeightPx,
    width: maxWidthPx,
    tileSize: tileWidthPx,
    maxLevel: countLevels - 1,
    minLevel: 0,
    getTileUrl: function(level, row, col) {
      const x = 1 + (tileWidthPx * row);
      const y = 1 + (tileHeightPx * col);
      const z = countLevels - 1 - level;
      const key = x + '/' + y + '/' + z;
      const params = pyramidMeta[key];
      return toDicomWebWADOUrl(
        instancesPath + '/' + params.SOPInstanceUID + '/frames/' +
        params.FrameNumber + '/rendered');
    },
    getLevelScale: function(level) {
      return sortedLevelWidths[countLevels - 1 - level] / maxWidthPx;
    }
  };
  this.viewer.open(ghc_source);

  if (func && typeof func === 'function') {
    func.call(null, x);
  }
}
