
// overwrites loadImg function to handle dicom sources.
function DicomWebMods() {
    async function openSeries(base_url, study_id, series_id) {
        try {
            // Construct series metadata URL
            const series_url = `${base_url}/studies/${study_id}/series/${series_id}/metadata`;
    
            // Fetch series metadata
            const series_overview = await fetch(series_url, { mode: 'cors' })
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                    return response.json();
                });
    
            if (!Array.isArray(series_overview)) {
                throw new Error("Unexpected series metadata format");
            }
            // Extract instance IDs
            const instance_ids = series_overview
                .map(item => item?.["00080018"]?.["Value"]?.[0])
                .filter(id => typeof id === "string");
    
            if (instance_ids.length === 0) {
                throw new Error("No valid instance IDs found");
            }
    
            // Generate list of instance metadata URLs
            const instance_urls = instance_ids.map(
                id => `${base_url}/studies/${study_id}/series/${series_id}/instances/${id}/metadata`
            );
    
            // Fetch metadata for each instance
            const instance_promises = instance_urls.map(async (url) => {
                try {
                    const response = await fetch(url, { mode: 'cors' });
                    if (!response.ok) throw new Error(`Failed to fetch: ${url} (Status: ${response.status})`);
                    const json = await response.json();
                    if (!Array.isArray(json) || json.length === 0) throw new Error("Invalid response structure");
                    
                    const metadata = json[0];
                    metadata["url"] = url;
                    return metadata;
                } catch (error) {
                    console.error("Error fetching instance metadata:", error);
                    return null; // Skip this instance if it fails
                }
            });
    
            // Wait for all instance requests to complete
            const instance_data = (await Promise.all(instance_promises)).filter(item => item !== null);
    
            if (instance_data.length === 0) {
                throw new Error("No valid instance metadata retrieved");
            }
            console.log(instance_data)
            // Transform result into OpenSeadragon-compatible format
            const instance_results = instance_data.map(x => {
                try {
                    let tile_order = "r++"; // default
                    if (x["00480102"]?.Value &&
                        Array.isArray(x["00480102"].Value) &&
                        x["00480102"].Value.length == 6) {
                        let [X1, Y1, Z1, X2, Y2, Z2] = x["00480102"].Value;
                        isRowMajor = Math.abs(X1) < Math.abs(X2);
                        isColReverse = X1 < 0 || X2 < 0;
                        isRowReverse = Y1 < 0 || Y2 < 0;
                        tile_order_proposed = `${isRowMajor ? 'r' : 'c'}${isRowReverse ? '-' : '+'}${isColReverse ? '-' : '+'}`;

                        //isColReverse = false;
                        isRowReverse = !isRowReverse;
                        //isRowMajor = false;
                        //isRowMajor = !isRowMajor;
                        //isColReverse = !isColReverse;
                        //isRowReverse = !isRowReverse;
                        let doReverse = true;
                        doReverse = false;
                        if (doReverse && !isRowMajor){
                            let tmp = isRowReverse;
                            isRowReverse = isColReverse;
                            isColReverse = tmp;
                        }
                        
                        tile_order = `${isRowMajor ? 'r' : 'c'}${isRowReverse ? '-' : '+'}${isColReverse ? '-' : '+'}`;
                        //tile_order = "r++"
                        console.info(x["00480102"]?.Value, tile_order, tile_order_proposed)
                        
                    }
                    return {
                        height: x["00480007"]?.["Value"]?.[0] ?? null, 
                        width: x["00480006"]?.["Value"]?.[0] ?? null,
                        tile_size: x["00280010"]?.["Value"]?.[0] ?? null,
                        url: x["url"]?.split("/metadata")[0] ?? "",
                        type: x["00080008"]?.["Value"] ?? [], 
                        tile_order: tile_order,
                    };
                } catch (error) {
                    console.error("Error processing instance metadata:", error);
                    return null;
                }
            }).filter(x=>{
                if (x == null || x.height == null || x.width == null){
                    return false;
                }
                let types = x['type']
                for (let i=0; i< types.length; i++){
                    let v = types[i].toUpperCase();
                    if (v.indexOf("LABEL") !== -1 || 
                        v.indexOf("THUMBNAIL") !== -1 || 
                        v.indexOf("MACRO") !==-1 ||
                        v.indexOf("OVERVIEW") !== -1) {
                        return false;
                    }
                }
                return true;
            });
            console.log(instance_results)
            if (instance_results.length == 0){
                alert("didn't find anything!! Labels only maybe?")
                history.back()
            }
    
            // Sort instance_results by width in ascending order
            instance_results.sort((a, b) => a.width - b.width);
    
            // Add an `order` field starting with smallest
            instance_results.forEach((item, index) => {
                item.order = index;
            });
    
            // prep result for openseadragon
            let tilesources = instance_results.map(x=>{
                return {
                    // Low-res image layer
                    height: x['height'],
                    width: x['width'],
                    tileSize: x['tile_size'],
                    minLevel: 0, 
                    maxLevel: x['order'],
                    getTileUrl: function(level, x_pos, y_pos) {
                        if (level == x['order']){
                            const numRows = Math.ceil(x['height'] / x['tile_size']);
                            const numCols = Math.ceil(x['width'] / x['tile_size']);
                            let a = x_pos;
                            let b = y_pos;

                            if (x['tile_order'][1] == "-") {
                                a = numRows - 1 - a;
                            }

                            if (x['tile_order'][2] == "-") {
                                b = numCols - 1 - b;
                            }

                            if (x['tile_order'][0] == "c") {
                                let tmp = b;
                                b = a;
                                a = tmp;
                            }

                            let frameIndex = b * numCols + a;
                  

                            return `${x["url"]}/frames/${frameIndex + 1}/rendered`;
                        } else {
                            return null;
                        }
                    }
                }
            })
    
            return tilesources
    
        } catch (error) {
            console.error("Error in openSeries:", error);
        }
    }
    Store.prototype.default_findSlide = Store.prototype.findSlide;
    Store.prototype.findSlide = function(slide, specimen, study, location, q, collection) {
    }
    CaMic.prototype.loadImg = function(func) {
        // override for multi image as single viewport image simulation
        OpenSeadragon.Viewport.prototype.viewportToImageCoordinates = function(x,y){
            let i = this.viewer.world._items.length - 1
            return this.viewer.world.getItemAt(i).viewportToImageCoordinates(x,y)
        }
        OpenSeadragon.Viewport.prototype.viewportToImageZoom = function(z){
            let i = this.viewer.world._items.length - 1
            return this.viewer.world.getItemAt(i).viewportToImageZoom(z)
        }
        OpenSeadragon.Viewport.prototype.imageToViewportZoom = function(z){
            let i = this.viewer.world._items.length - 1
            return this.viewer.world.getItemAt(i).imageToViewportZoom(z)
        }
        OpenSeadragon.Viewport.prototype.imageToViewportCoordinates = function(x,y){
            let i = this.viewer.world._items.length - 1
            return this.viewer.world.getItemAt(i).imageToViewportCoordinates(x,y)
        }
        var urlParams = new URLSearchParams(window.location.search);
        let encodedUrl = urlParams.get('source') || "https%3A%2F%2Fihe.j4care.com%3A18443%2Fdcm4chee-arc%2Faets%2FDCM4CHEE%2Frs";
        let base_url = decodeURIComponent(encodedUrl);
        let study_id =  urlParams.get('study');
        let series_id =  urlParams.get('series');
        this.slideId = series_id
        this.slideName = series_id
        img_id = this.slideId
        var imagingHelper = new OpenSeadragonImaging.ImagingHelper({
            viewer: this.viewer
          });
          imagingHelper.setMaxZoom(1);
        openSeries(base_url, study_id, series_id).then(tilesources=>{
            this.viewer.open(tilesources)
            let x = {}
            x['_id'] = "0"
            x.name = this.slideName
            x.mpp = this.mpp;
            x.mpp_x = this.mpp_x;
            x.mpp_y = this.mpp_y;
            x.location = img_id;
            x.url = tilesources;
            if (func && typeof func === 'function'){
                func.call(null, x);
              }
            Loading.text.textContent = `Loading Slide...`;
        }).catch(e=>{
            console.error(e)
            Loading.text.textContent = "ERROR - Slide May be Broken or Unsupported"
            //if(func && typeof func === 'function') func.call(null,{hasError:true,message:e});
        })
        
    }
}