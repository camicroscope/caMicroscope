// Multi-channel / fluorescence image support, backed by the camicroscope-mctile
// tile server (proxied by Caracal at /img/MCT/*). Activated via ?mode=mctile,
// dispatched from common/dynamicLoadScript.js.
//
// Follows the NanoBorbMods.js "preserve-then-override" pattern rather than
// DicomWebMods.js's bespoke-TileSource approach: mctile speaks real DeepZoom,
// so loadImg only needs to point at a different DZI URL, not build a custom
// OpenSeadragon tile source from scratch.

// Every slide's `location` field is stamped `/images/<filename>` by the
// upload UI (loader.js, batchLoader.js, SlideLoader's upload.py all use this
// exact convention -- confirmed directly). mctile's own Flask routes resolve
// `location` as relative to their own IMAGES_DIR (camicroscope-mctile/app/
// utils/path_resolve.py's plain-relative-path case, which always works)
// -- but both consumers of this value build a URL PATH segment out of it
// (Store.js's getChannelMeta() directly, and caracal's mctileHandler.js
// rewriting the DeepZoom query param from _mctBuildUrl() into a `/dzi/`
// path segment). A location's own leading '/' plus the route's separator
// slash produces a literal double slash in the final HTTP request path --
// and Werkzeug's <path:location> converter can never match that (its
// captured segment can't itself start with '/', regardless of Flask's
// merge_slashes setting), so the request 404s outright. Confirmed against
// a real running stack, not hypothetical. Stripping the prefix once here,
// before it's used anywhere, keeps both call sites correct.
function normalizeMctLocation(location) {
  return location.replace(/^\/images\//, '');
}

function MultiChannelMods() {
  console.warn('{multichannel mods enabled}');

  CaMic.prototype.default_loadImg = CaMic.prototype.loadImg;
  CaMic.prototype.loadImg = function(func) {
    Loading.open(document.body, 'CaMicroscope Is Loading Images ...');

    let slidePromise;
    if (this.slideQuery.hasOwnProperty('id') && this.slideQuery.id) {
      slidePromise = this.store.getSlide(this.slideQuery.id);
    } else {
      slidePromise = this.store.findSlide(this.slideQuery.name,
          this.slideQuery.study, this.slideQuery.specimen,
          this.slideQuery.location, this.slideQuery.collection);
    }
    slidePromise
        .then((x) => {
          if (!x || !OpenSeadragon.isArray(x) || !x.length || !x[0].location) {
            console.log(x);
            redirect($D.pages.table, `Can't Find The Slide Information`);
            return;
          }
          this.mctSrv(x[0], func);
        })
        .catch((e) => {
          console.error(e);
          Loading.close();
          if (func && typeof func === 'function') func.call(null, {hasError: true, message: e});
        });
  };

  // Builds a DZI URL for mctile's composited-tile route. `style` MUST be
  // encoded before `DeepZoom=` in the query string, never after: OpenSeadragon
  // derives per-tile URLs by substituting the trailing ".dzi" with
  // "_files/<level>/<col>_<row>.<ext>" and keeping everything before it
  // (including the query string) intact -- the same mechanism the existing
  // iipSrv()/?token= convention already relies on. If style comes after
  // DeepZoom=<loc>.dzi, ".dzi" would no longer be the literal end of the URL.
  CaMic.prototype._mctBuildUrl = function(style) {
    let url = '../../img/MCT/composited/?';
    if (getCookie('token')) url += 'token=' + getCookie('token') + '&';
    url += 'style=' + encodeURIComponent(JSON.stringify(style));
    url += '&DeepZoom=' + this.slideLocation + '.dzi';
    return url;
  };

  CaMic.prototype.mctSrv = function(data, func) {
    this.slideId = data['_id']['$oid'];
    this.slideName = data['name'];

    // encode special characters but not dir slashes, matching iipSrv's
    // convention exactly so mctile resolves the same location string iipsrv
    // would have (aside from the '/images/' prefix -- see
    // normalizeMctLocation() above; iipsrv never hits that issue since
    // iipHandler.js keeps DeepZoom as a query param instead of rewriting it
    // into a URL path segment the way mctileHandler.js does).
    let loc = encodeURIComponent(normalizeMctLocation(data['location'])).replaceAll('%2F', '/');
    this.slideLocation = loc;

    this.store.getChannelMeta(loc).then((meta) => {
      // Store.errorHandler resolves (rather than rejects) on a non-OK HTTP
      // response, returning {error, text, url} instead of throwing -- so a
      // 404/500 from mctile lands here, not in .catch(). Without this check,
      // meta.default_style/.channels/.mpp_x would all be undefined and
      // _mctBuildUrl(undefined) would silently build a URL containing the
      // literal string "style=undefined" (JSON.stringify(undefined) is the
      // bare word `undefined`, not a JSON value) instead of failing loudly.
      if (!meta || meta.error) {
        console.error('getChannelMeta failed:', meta);
        Loading.close();
        Loading.text.textContent = 'ERROR - Slide May be Broken or Unsupported';
        if (func && typeof func === 'function') {
          func.call(null, {hasError: true, message: (meta && meta.text) || 'Failed to load channel metadata'});
        }
        return;
      }

      this.channelMeta = meta;
      this.currentStyle = meta.default_style;

      const mctUrl = this._mctBuildUrl(this.currentStyle);
      this.viewer.open(mctUrl);

      // mctile's /meta is the authoritative mpp source in this mode (mirrors
      // how NanoBorbMods.js sources mpp from its own info.json rather than a
      // generic Slide doc field).
      this.mpp_x = +meta.mpp_x;
      this.mpp_y = +meta.mpp_y;
      this.mpp = this.mpp_x || this.mpp_y || 1e9;
      this.mpp_x = this.mpp_x || this.mpp;
      this.mpp_y = this.mpp_y || this.mpp;

      this.viewer.mpp = this.mpp;
      this.viewer.mpp_x = this.mpp_x;
      this.viewer.mpp_y = this.mpp_y;

      const mpp = this.mpp_x || this.mpp;
      if (mpp && mpp != 1e9) this.createScalebar(this.mpp);

      const imagingHelper = new OpenSeadragonImaging.ImagingHelper({
        viewer: this.viewer,
      });
      imagingHelper.setMaxZoom(1);

      data.url = mctUrl;
      data.slide = this.slideId;
      data.channels = meta.channels;
      if (func && typeof func === 'function') func.call(null, data);
      Loading.text.textContent = `Loading Slide's Tiles...`;
    }).catch((e) => {
      console.error(e);
      Loading.close();
      Loading.text.textContent = 'ERROR - Slide May be Broken or Unsupported';
      if (func && typeof func === 'function') func.call(null, {hasError: true, message: e});
    });
  };

  // Live channel-style update without reloading the page or losing the
  // viewport position. OpenSeadragon's DZI TileSource is immutable once
  // created (no API to mutate an open source's query params), so a new one
  // has to be swapped in -- but NOT via viewer.open(): OpenSeadragon's
  // Viewer.prototype.open() calls this.close() first (full world teardown)
  // and then re-raises the viewer's 'open' event. apps/viewer/init.js
  // registers a *non-once* handler on 'open' (`$CAMIC.viewer.addHandler('open',
  // function() { initUIcomponents(); ... })`) that every other mode only ever
  // triggers once, since nothing else in the codebase re-opens the viewer
  // after first load -- so calling viewer.open() here would silently re-run
  // that entire one-time UI bootstrap (recreating Tracker/Spyglass/CaMessage/
  // ChannelControl) on every single channel-style tweak.
  //
  // Deliberately NOT using addTiledImage's own `replace`/`index` option:
  // OpenSeadragon captures `replaceItem = world.getItemAt(index)` SYNCHRONOUSLY
  // at call time (openseadragon.js addTiledImage), before the new tileSource
  // has even resolved. Two overlapping calls issued close together (e.g. a
  // native color-picker firing many rapid 'input' events) both capture the
  // SAME original item as their replace target; whichever's tileSource
  // resolves second then tries to remove an item OSD already removed for the
  // first call, which silently no-ops -- leaving two tiled images layered
  // instead of one properly replaced, which is exactly the "sometimes
  // doesn't refresh" symptom. Fixed by tracking the current item ourselves
  // (updated only inside the success callback, once we know we're not
  // stale) and discarding any completion that's been superseded by a newer
  // request before it finished loading.
  CaMic.prototype.setChannelStyle = function(newStyle) {
    const center = this.viewer.viewport.getCenter();
    const zoom = this.viewer.viewport.getZoom();
    this.currentStyle = newStyle;

    this._styleRequestSeq = (this._styleRequestSeq || 0) + 1;
    const requestId = this._styleRequestSeq;
    const mctUrl = this._mctBuildUrl(newStyle);

    this.viewer.addTiledImage({
      tileSource: mctUrl,
      success: (event) => {
        if (requestId !== this._styleRequestSeq) {
          // superseded by a newer style change before this one finished
          // loading -- discard instead of racing with the newer one.
          this.viewer.world.removeItem(event.item);
          return;
        }
        const oldItem = this._currentChannelTiledImage || this.viewer.world.getItemAt(0);
        this._currentChannelTiledImage = event.item;
        if (oldItem && oldItem !== event.item) this.viewer.world.removeItem(oldItem);
        this.viewer.viewport.panTo(center, true);
        this.viewer.viewport.zoomTo(zoom, null, true);
      },
    });
  };
}

if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  module.exports = {normalizeMctLocation, MultiChannelMods};
}
