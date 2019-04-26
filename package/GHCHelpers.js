 class GHCHelpers {
   // adatped from https://github.com/GoogleCloudPlatform/dicomweb-wsi-viewer/blob/master/viewer.js
   constructor(project, location, dataset, store, viewer){
     this.viewer = viewer
     // required params
     this.project = project
     this.location = location;
     this.dataset = dataset;
     this.store = store;
     // dicom standar attribute tags
     this.COLUMN_POSITION_TAG = '0048021E';
     this.COLUMNS_TAG = '00280011';  // Number of columns in the image
     // Per-frame Functional Groups Sequence
     this.FUNCTIONAL_GROUP_SEQUENCE_TAG = '52009230';
     this.PLANE_POSITION_SEQUENCE_TAG = '0048021A';  // Plane Position Sequence
     this.ROW_POSITION_TAG = '0048021F';
     this.ROWS_TAG = '00280010';  // Number of rows in the image
     this.SERIES_INSTANCE_UID_TAG = '0020000E';
     this.SOP_INSTANCE_UID_TAG = '00080018';
     // Unique identifier for the Series that is part of the Study
     this.STUDY_INSTANCE_UID_TAG = '0020000D';
     // Total number of columns in pixel matrix
     this.TOTAL_PIXEL_MATRIX_COLUMNS_TAG = '00480006';
     // Total number of rows in pixel matrix
     this.TOTAL_PIXEL_MATRIX_ROWS_TAG = '00480007';
     // google url, may change??
     this.updatedDicomUrl = 'https://healthcare.googleapis.com/v1beta1/projects/'
     // token stuff
     var cookiename = "GHCToken"
     var cookiestring=RegExp(""+cookiename+"[^;]+").exec(document.cookie);
     this.token = decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./,"") : "");
   }

   toDicomWebQIDOUrl(path) {
     return this.updatedDicomUrl + path + '?includefield=all&access_token=' + this.token;

   }
   toDicomWebWADOUrl(path) {
     return this.updatedDicomUrl + path + '?access_token=' + this.token;
   }
   loadInstancesInStudy(study) {
     var baseUrl = this.project + "/locations/"+ this.location +"/datasets/" + this.dataset + "/dicomStores/" + this.store + "/dicomWeb/studies/"
     const pathToStudy = baseUrl + study
     const seriesPath = pathToStudy + '/series';
     $.ajax({
       url: this.toDicomWebQIDOUrl(seriesPath),
       error: function(jqXHR) {
         alert(
             'Error - retrieving series failed: ' +
             jqXHR.responseJSON[0].error.code + ' ' +
             jqXHR.responseJSON[0].error.message);
       },
       success: function(series) {
         const instancesPath = seriesPath + '/' +
             series[0][this.SERIES_INSTANCE_UID_TAG].Value[0] + '/instances';
         $.ajax({
           url: this.toDicomWebQIDOUrl(instancesPath),
           error: function(jqXHR) {
             alert(
                 'Error - retrieving instances failed: ' +
                 jqXHR.responseJSON[0].error.code + ' ' +
                 jqXHR.responseJSON[0].error.message);
           },
           success: function(instances) {
             try {
               let maxWidthPx = 0;
               let maxHeightPx = 0;
               let tileWidthPx = 0;
               let tileHeightPx = 0;
               let levelWidths = new Set();

               for (let i = 0; i < instances.length; i++) {
                 const w =
                     Number(instances[i][this.TOTAL_PIXEL_MATRIX_COLUMNS_TAG].Value);
                 levelWidths.add(w);
                 const h = Number(instances[i][this.TOTAL_PIXEL_MATRIX_ROWS_TAG].Value);

                 if (w > maxWidthPx) {
                   maxWidthPx = w;
                 }
                 if (h > maxHeightPx) {
                   maxHeightPx = h;
                 }
                 tileWidthPx = Number(instances[i][this.COLUMNS_TAG].Value);
                 tileHeightPx = Number(instances[i][this.ROWS_TAG].Value);
               }
               const sortedLevelWidths = Array.from(levelWidths.values());
               sortedLevelWidths.sort((a, b) => b - a);

               const countLevels = levelWidths.size;
               // Compute pyramid cache
               // Map of "x,y,z" => {SOPInstanceUID, Frame No.}
               const pyramidMeta =this.calculatePyramidMeta(instances, sortedLevelWidths);

               var tileSource = {
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
                   return this.toDicomWebWADOUrl(
                       instancesPath + '/' + params.SOPInstanceUID + '/frames/' +
                       params.FrameNumber + '/rendered');
                 }.bind(this),
                 getLevelScale: function(level) {
                   return sortedLevelWidths[countLevels - 1 - level] / maxWidthPx;
                 }
               };
               console.log(tileSource)
               viewer.open(tileSource)
             } catch (err) {
               console.error(err)
               alert(
                   `Could not parse DICOM for study, possible reason: DICOM is not
                   pathology or damaged image.`);
             }
           }.bind(this)
         });
       }.bind(this)
     });
   }
   calculatePyramidMeta(dicomInstances, sortedLevelWidths) {
     let widthToLevelMap = {};
     for (let i = 0; i < sortedLevelWidths.length; i++) {
       widthToLevelMap[sortedLevelWidths[i]] = i;
     }

     let pyramidMeta = {};
     for (let i = 0; i < dicomInstances.length; i++) {
       const sopInstanceUID = dicomInstances[i][this.SOP_INSTANCE_UID_TAG].Value;
       const frameMeta = dicomInstances[i][this.FUNCTIONAL_GROUP_SEQUENCE_TAG].Value;

       for (let j = 0; j < frameMeta.length; j++) {
         const frameNumber = j + 1;

         // For (x,y) should actually use
         // FrameContentSequence.DimensionIndexValues which an array of
         // size 2 with [x, y]. The below are pixel values and need to be
         // diveded by frameWidth/frameHeight.
         // PerFrameFunctionalGroupsSequence.PlanePositionSlideSequence.ColumnPositionInTotalImagePixelMatrix
         const x = frameMeta[j][this.PLANE_POSITION_SEQUENCE_TAG]
                       .Value[0][this.COLUMN_POSITION_TAG]
                       .Value;
         // PerFrameFunctionalGroupsSequence.PlanePositionSlideSequence.RowPositionInTotalImagePixelMatrix
         const y = frameMeta[j][this.PLANE_POSITION_SEQUENCE_TAG]
                       .Value[0][this.ROW_POSITION_TAG]
                       .Value;

         const w = Number(dicomInstances[i][this.TOTAL_PIXEL_MATRIX_COLUMNS_TAG].Value);
         const z = sortedLevelWidths.indexOf(w);

         const key = x + '/' + y + '/' + z;
         pyramidMeta[key] = {
           'SOPInstanceUID': sopInstanceUID,
           'FrameNumber': frameNumber,
         };
       }
     }
     return pyramidMeta;
   }
 }


export default GHCHelpers
