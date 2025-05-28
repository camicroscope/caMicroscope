
// overwrites loadImg function to handle dicom sources.
function DicomWebMods() {
  async function openSeries(baseUrl, studyId, seriesId) {
    try {
      // Construct series metadata URL
      const seriesUrl = `${baseUrl}/studies/${studyId}/series/${seriesId}/metadata`;

      // Fetch series metadata
      const seriesOverview = await fetch(seriesUrl, {mode: 'cors'})
          .then((response) => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
          });

      if (!Array.isArray(seriesOverview)) {
        throw new Error('Unexpected series metadata format');
      }
      // Extract instance IDs
      const instanceIds = seriesOverview
          .map((item) => item?.['00080018']?.['Value']?.[0])
          .filter((id) => typeof id === 'string');

      if (instanceIds.length === 0) {
        throw new Error('No valid instance IDs found');
      }

      // Generate list of instance metadata URLs
      const instanceUrls = instanceIds.map(
          (id) => `${baseUrl}/studies/${studyId}/series/${seriesId}/instances/${id}/metadata`,
      );

      // Fetch metadata for each instance
      const instancePromises = instanceUrls.map(async (url) => {
        try {
          const response = await fetch(url, {mode: 'cors'});
          if (!response.ok) throw new Error(`Failed to fetch: ${url} (Status: ${response.status})`);
          const json = await response.json();
          if (!Array.isArray(json) || json.length === 0) throw new Error('Invalid response structure');

          const metadata = json[0];
          metadata['url'] = url;
          return metadata;
        } catch (error) {
          console.error('Error fetching instance metadata:', error);
          return null; // Skip this instance if it fails
        }
      });

      // Wait for all instance requests to complete
      const instanceData = (await Promise.all(instancePromises)).filter((item) => item !== null);

      if (instanceData.length === 0) {
        throw new Error('No valid instance metadata retrieved');
      }
      console.log(instanceData);
      // Transform result into OpenSeadragon-compatible format
      const instanceResults = instanceData.map((x) => {
        try {
          let instanceHeight = x['00480007']?.['Value']?.[0] ?? null;
          let instanceWidth = x['00480006']?.['Value']?.[0] ?? null;
          let tileSize = x['00280010']?.['Value']?.[0] ?? null;
          // instanceWidth = tileSize*Math.ceil(instanceWidth/tileSize)
          instanceHeight = tileSize*Math.ceil(instanceHeight/tileSize);
          let tileMap = {};
          if (x['52009230']?.Value &&
                            Array.isArray(x['52009230'].Value) &&
                            x['52009230'].Value.length > 0) {
            console.log('sparse!');
            let frames = x['52009230']?.Value || [];
            for (let i = 0; i < frames.length; i++) {
              const frame = frames[i];
              const item = frame['0048021A']?.Value?.[0];
              const col = item?.['0048021E']?.Value?.[0];
              const row = item?.['0048021F']?.Value?.[0];
              if (col !== undefined && row !== undefined && tileSize) {
                const tileX = Math.floor(col / tileSize);
                const tileY = Math.floor(row / tileSize);
                tileMap[`${tileX}_${tileY}`] = i + 1;
                // console.log(row, col, tileX, tileY, i+1)
              }
            }
            console.log(tileMap);
          }

          return {
            height: instanceHeight,
            width: instanceWidth,
            tileSize: tileSize,
            url: x['url']?.split('/metadata')[0] ?? '',
            type: x['00080008']?.['Value'] ?? [],
            tileMap: tileMap,
          };
        } catch (error) {
          console.error('Error processing instance metadata:', error);
          return null;
        }
      }).filter((x)=>{
        if (x == null || x.height == null || x.width == null || x.height < x.tileSize || x.width < x.tileSize) {
          return false;
        }
        let types = x['type'];
        for (let i=0; i< types.length; i++) {
          let v = types[i].toUpperCase();
          if (v.indexOf('LABEL') !== -1 ||
                        v.indexOf('THUMBNAIL') !== -1 ||
                        v.indexOf('MACRO') !==-1 ||
                        v.indexOf('OVERVIEW') !== -1) {
            return false;
          }
        }
        return true;
      });
      console.log(instanceResults);
      if (instanceResults.length == 0) {
        alert('didn\'t find anything!! Labels only maybe?');
        history.back();
      }

      // Sort instanceResults by width in ascending order
      instanceResults.sort((a, b) => a.width - b.width);

      // Add an `order` field starting with smallest
      instanceResults.forEach((item, index) => {
        item.order = index;
      });

      // prep result for openseadragon
      let tilesources = instanceResults.map((x)=>{
        return {
          // Low-res image layer
          height: x['height'],
          width: x['width'],
          tileSize: x['tileSize'],
          minLevel: 0,
          maxLevel: x['order'],
          getTileBounds: function(level, col, row) {
            const tileSize = x['tileSize'];
            const fullWidth = x['width'];
            const fullHeight = x['height'];

            const xPx = col * tileSize;
            const yPx = row * tileSize;

            const tileWidth = Math.min(tileSize, fullWidth - xPx);
            const tileHeight = Math.min(tileSize, fullHeight - yPx);
            // console.log(xPx, yPx, tileHeight, tileWidth)
            return new OpenSeadragon.Rect(
                xPx / x['width'],
                yPx / x['width'],
                tileSize / x['width'],
                tileSize / x['width'],
            );
          },
          getTileUrl: function(level, xPos, yPos) {
            if (level == x['order']) {
              const numRows = Math.ceil(x['height'] / x['tileSize']);
              const numCols = Math.ceil(x['width'] / x['tileSize']);
              let numDir = numCols;
              let a = xPos;
              let b = yPos;

              if (!x['tileMap'] || Object.keys(x['tileMap']).length === 0) {
                let frameIndex = b * numCols + a;
                return `${x['url']}/frames/${frameIndex + 1}/rendered`;
              } else {
                let tileIdx = x['tileMap'][`${xPos}_${yPos}`];
                if (tileIdx !== undefined) {
                  return `${x['url']}/frames/${tileIdx}/rendered`;
                } else {
                  return null;
                }
              }
            } else {
              return null;
            }
          },
        };
      });

      return tilesources;
    } catch (error) {
      console.error('Error in openSeries:', error);
    }
  }
  Store.prototype.default_findSlide = Store.prototype.findSlide;
  Store.prototype.findSlide = function(slide, specimen, study, location, q, collection) {
  };
  CaMic.prototype.loadImg = function(func) {
    // override for multi image as single viewport image simulation
    OpenSeadragon.Viewport.prototype.viewportToImageCoordinates = function(x, y) {
      let i = this.viewer.world._items.length - 1;
      return this.viewer.world.getItemAt(i).viewportToImageCoordinates(x, y);
    };
    OpenSeadragon.Viewport.prototype.viewportToImageZoom = function(z) {
      let i = this.viewer.world._items.length - 1;
      return this.viewer.world.getItemAt(i).viewportToImageZoom(z);
    };
    OpenSeadragon.Viewport.prototype.imageToViewportZoom = function(z) {
      let i = this.viewer.world._items.length - 1;
      return this.viewer.world.getItemAt(i).imageToViewportZoom(z);
    };
    OpenSeadragon.Viewport.prototype.imageToViewportCoordinates = function(x, y) {
      let i = this.viewer.world._items.length - 1;
      return this.viewer.world.getItemAt(i).imageToViewportCoordinates(x, y);
    };
    var urlParams = new URLSearchParams(window.location.search);
    let encodedUrl = urlParams.get('source') || 'https%3A%2F%2Fihe.j4care.com%3A18443%2Fdcm4chee-arc%2Faets%2FDCM4CHEE%2Frs';
    let baseUrl = decodeURIComponent(encodedUrl);
    let studyId = urlParams.get('study');
    let seriesId = urlParams.get('series');
    this.slideId = seriesId;
    this.slideName = seriesId;
    imgId = this.slideId;
    var imagingHelper = new OpenSeadragonImaging.ImagingHelper({
      viewer: this.viewer,
    });
    imagingHelper.setMaxZoom(1);
    openSeries(baseUrl, studyId, seriesId).then((tilesources)=>{
      this.viewer.open(tilesources);
      let x = {};
      x['_id'] = '0';
      x.name = this.slideName;
      x.mpp = this.mpp;
      x.mpp_x = this.mpp_x;
      x.mpp_y = this.mpp_y;
      x.location = imgId;
      x.url = tilesources;
      if (func && typeof func === 'function') {
        func.call(null, x);
      }
      Loading.text.textContent = `Loading Slide...`;
    }).catch((e)=>{
      console.error(e);
      Loading.text.textContent = 'ERROR - Slide May be Broken or Unsupported';
      // if(func && typeof func === 'function') func.call(null,{hasError:true,message:e});
    });
  };
}
