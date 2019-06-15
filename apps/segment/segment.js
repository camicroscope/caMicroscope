let PDR = OpenSeadragon.pixelDensityRatio;

let $CAMIC = null;
const $UI = {};
const $D = {
  pages: {
    home: '',
    table: ''
  },
  params: null
};
const objAreaMin = 400;
const objAreaMax = 4500;
const lineWidth = 2;
const timeOutMs = 10;


function initialize() {
      var checkPackageIsReady = setInterval(function () {
        if(IsPackageLoading) {
          clearInterval(checkPackageIsReady);
            initUIcomponents();
            initCore();
        }
      }, 100);
}

function initUIcomponents() {
  /* create UI components */

  // create the message queue
  $UI.message = new MessageQueue();
  $UI.toolbar = new CaToolbar({
    id: 'ca_tools',
    zIndex: 601,
    hasMainTools: false,
    subTools: [
      // rectangle draw
      {
        icon: 'timeline',
        type: 'check',
        value: 'rect',
        title: 'Segment',
        callback: drawRectangle
      }, {
        icon: 'insert_photo',
        type: 'btn',
        value: 'viewer',
        title: 'Viewer',
        callback: function () {
          if (window.location.search.length > 0) {
            window.location.href = '../viewer/viewer.html' + window.location.search;
          } else {
            window.location.href = '../viewer/viewer.html';
          }
        }
      }, {
        icon: 'bug_report',
        title: 'Bug Report',
        value: 'bugs',
        type: 'btn',
        callback: () => {
          window.open('https://goo.gl/forms/mgyhx4ADH0UuEQJ53', '_blank').focus()
        }
      }
    ]
  });

  // let button = document.createElement('button');
  // button.id = 'trigger';
  // button.style.display = "none";
  // document.body.appendChild(button);

}

// setting core functionality
function initCore() {
  // start initial
  const opt = {
    hasZoomControl: true,
    hasDrawLayer: true,
    hasLayerManager: true,
    hasScalebar: true,
    hasMeasurementTool: true
  };

  // set states if exist
  if ($D.params.states) {
    opt.states = $D.params.states;
  }

  try {
    let slideQuery = {}
    slideQuery.id = $D.params.slideId;
    slideQuery.name = $D.params.slide;
    slideQuery.location = $D.params.location;
    $CAMIC = new CaMic("main_viewer", slideQuery, opt);
  } catch (error) {
    Loading.close();
    $UI.message.addError('Core Initialization Failed');
    console.error(error);
    return;
  }

  $CAMIC.loadImg(function (e) {
    // image loaded
    if (e.hasError) {
      $UI.message.addError(e.message)
    }else{
      $D.params.data = e;
    }
  });

  $CAMIC.viewer.addOnceHandler('open', function (e) {
    const viewer =  $CAMIC.viewer;
    // add stop draw function
    viewer.canvasDrawInstance.addHandler('stop-drawing', camicStopDraw);

    $UI.segmentPanel = new SegmentPanel(viewer);

    //add event for threshold
    $UI.segmentPanel.__threshold.addEventListener('input', function(e){
      const alpha = +this.__threshold.value;
      this.__tlabel.innerHTML = alpha;
    }.bind($UI.segmentPanel));

    $UI.segmentPanel.__threshold.addEventListener('change', function(e){
      let src = this.__src;
      let out = this.__out;
      const self = this;
      const alpha = +this.__threshold.value;
      self.__tlabel.innerHTML = alpha;
      self.showProgress();
      setTimeout(function() {
        watershed(src,out,alpha);
        self.hideProgress();
      },timeOutMs);
    }.bind($UI.segmentPanel));

    //add event for min
    $UI.segmentPanel.__minarea.addEventListener('input', function (e) {
      this.__minlabel.innerHTML = +this.__minarea.value;
    }.bind($UI.segmentPanel));

    $UI.segmentPanel.__minarea.addEventListener('change', function (e) {
      let src = this.__src;
      let out = this.__out;
      const self = this;
      const alpha = +this.__threshold.value;
      this.__minlabel.innerHTML = +this.__minarea.value;
      self.showProgress();
      setTimeout(function() {
        watershed(src,out,alpha);
        self.hideProgress();
      },timeOutMs);
    }.bind($UI.segmentPanel));

    //add event for max
    $UI.segmentPanel.__maxarea.addEventListener('input', function (e) {
      this.__maxlabel.innerHTML = +this.__maxarea.value;
    }.bind($UI.segmentPanel));

    $UI.segmentPanel.__maxarea.addEventListener('change', function (e) {
      let src = this.__src;
      let out = this.__out;
      const self = this;
      const alpha = +this.__threshold.value;
      this.__maxlabel.innerHTML = +this.__maxarea.value;
      self.showProgress();
      setTimeout(function() {
        watershed(src,out,alpha);
        self.hideProgress();
      },timeOutMs);
    }.bind($UI.segmentPanel));

    $UI.segmentPanel.__btn_save.addEventListener('click', function(e) {
      let fname = $D.params.slideId + '_roi.png';
      download($UI.segmentPanel.__c2s,fname);
    }.bind($UI.segmentPanel));

    $UI.segmentPanel.__btn_savecsv.addEventListener('click', function(e) {
      let fname = $D.params.slideId + '_roi.csv';
      buildAndDownloadCSV($UI.segmentPanel.__contours,fname);
    }.bind($UI.segmentPanel));
  });
}

/**
 * Toolbar button callback
 * @param e
 */
function drawRectangle(e) {

  let canvas = $CAMIC.viewer.drawer.canvas; //Original Canvas
  canvas.style.cursor = e.checked ? 'crosshair' : 'default';

  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.drawMode = 'rect';
  canvasDraw.style.color = '#FFFF00';
  canvasDraw.style.isFill = false;

  if (e.checked) {
    canvasDraw.drawOn();
  } else {
    canvasDraw.drawOff();
  }
}

/**
 * This is basically onmouseup after drawing rectangle.
 * @param e
 */
function camicStopDraw(e) {

  const viewer = $CAMIC.viewer;
  const canvasDraw = viewer.canvasDrawInstance;

  let imgColl = canvasDraw.getImageFeatureCollection();
  if (imgColl.features.length > 0) {

    // Check size first
    let box = checkSize(imgColl, viewer.imagingHelper);

    if (Object.keys(box).length === 0 && box.constructor === Object) {
      console.error('SOMETHING WICKED THIS WAY COMES.');
    } else {
      segmentROI(box);
      $UI.segmentPanel.setPosition(box.rect.x,box.rect.y,box.rect.width,box.rect.height);
      $UI.segmentPanel.open();

      // close
      canvasDraw.clear();
    }

  } else {
    console.error('Could not get feature collection.')
  }

}

function checkSize(imgColl, imagingHelper) {

  // 5x2 array
  let bound = imgColl.features[0].bound;

  // get position on viewer

  const top_left = imgColl.features[0].bound[0];
  const bottom_right = imgColl.features[0].bound[2];
  const min = imagingHelper._viewer.viewport.imageToViewportCoordinates(top_left[0],top_left[1]);
  const max = imagingHelper._viewer.viewport.imageToViewportCoordinates(bottom_right[0],bottom_right[1]);
  const rect = new OpenSeadragon.Rect(min.x,min.y,max.x-min.x,max.y-min.y);
  const self = $UI.segmentPanel;
  
  self.__top_left = top_left;
  self.__spImgX = top_left[0];
  self.__spImgY = top_left[1];
  self.__spImgWidth = bottom_right[0]-top_left[0];
  self.__spImgHeight = bottom_right[1]-top_left[1];
  console.log('iX: '+self.__spImgX);
  console.log('iY: '+self.__spImgY);
  console.log('iW: '+self.__spImgWidth);
  console.log('iH: '+self.__spImgHeight);
  
  console.log(top_left);
  console.log(bottom_right);
  // console.log(imagingHelper._viewer.viewport.viewportToImageCoordinates(0,0));

  // Convert to screen coordinates
  let foo = convertCoordinates(imagingHelper, bound);

  //retina screen
  let newArray = foo.map(function (a) {
    let x = a.slice();
    x[0] *= PDR;
    x[1] *= PDR;
    return x;
  });
  console.log('bounds', newArray);

  const xCoord = Math.round(newArray[0][0]);
  const yCoord = Math.round(newArray[0][1]);
  let width = Math.round(newArray[2][0] - xCoord);
  let height = Math.round(newArray[2][1] - yCoord);

  self.__x = xCoord;
  self.__y = yCoord;
  self.__width = xCoord;
  self.__height = yCoord;

  // check that image size is ok
  if (width * height > 8000000) {
    alert("Selected ROI too large, current version is limited to 4 megapixels");
    // Clear the rectangle  canvas-draw-overlay.clear()
    $CAMIC.viewer.canvasDrawInstance.clear();
    return {}; //throw('image too large')
  } else {
    return {rect:rect,'xCoord': xCoord, 'yCoord': yCoord, 'width': width, 'height': height};
  }
}

/**
 * Make a canvas element & draw the ROI.
 * @param imgData
 * @param canvasId
 * @param hidden
 */
function loadImageToCanvas(imgData, canvas) {
  console.log(typeof(imgData));
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  let context = canvas.getContext("2d");
  context.putImageData(imgData, 0, 0);

}

/**
 * Segment! :)
 * @param box
 */
function segmentROI(box) {

  // But first, some setup...
  const self = $UI.segmentPanel;

  // let div = document.createElement('div');
  // document.body.appendChild(div);

  // var mybr = document.createElement('br');

  // // TRACKBAR WEIGHT VALUE
  // let weightValue = document.createElement("label");
  // weightValue.id = 'weightValue';
  // div.appendChild(weightValue);
  // div.appendChild(mybr);

  // // TRACKBAR
  // let trackbar = document.createElement('input');
  // trackbar.setAttribute('type', 'range');
  // trackbar.id = 'trackbar';
  // trackbar.setAttribute('value', '.7');
  // trackbar.setAttribute('min', '0');
  // trackbar.setAttribute('max', '1');
  // trackbar.setAttribute('step', '.1');
  // div.appendChild(trackbar);
  // div.appendChild(mybr);

  // weightValue.innerText = trackbar.value;
  // weightValue.addEventListener('input', () => {
  //   weightValue.innerText = trackbar.value;
  // });

  // trackbar.addEventListener('input', () => {
  //   let alpha = trackbar.value / trackbar.max;
  //   watershed('canvasInput', 'canvasOutput', alpha);
  // });

  // // TRIGGER
  // let trigger = document.getElementById('trigger');
  // trigger.addEventListener("click", function () {
  //   watershed('canvasInput', 'canvasOutput', .07);
  // }, false);

  // SEGMENTATION CANVAS
  self.showProgress();

  let fullResCvs = self.__fullsrc;
  // const prefix_url = ImgloaderMode == 'iip'?`${window.location.origin}/img/IIP/raw/?IIIF=${$D.params.data.location}`:$CAMIC.slideId;
  const prefix_url = ImgloaderMode == 'iip'?`../../img/IIP/raw/?IIIF=${$D.params.data.location}`:$CAMIC.slideId;

  self.__img.src = prefix_url+'\/'+self.__spImgX+','+self.__spImgY+','+self.__spImgWidth+','+self.__spImgHeight+'\/'+self.__spImgWidth+',/0/default.jpg';
  self.__img.onload = function() {
    let image = cv.imread(self.__img);
    cv.imshow(fullResCvs, image);
    image.delete();
    let imgData = fullResCvs.getContext('2d').getImageData(0,0,fullResCvs.width,fullResCvs.height);

    // loadImageToCanvas(imgData, $UI.segmentPanel.__out);
    loadImageToCanvas(imgData, self.__src);

    const alpha = +self.__threshold.value;
    self.__tlabel.innerHTML = alpha;
    watershed(self.__src,self.__out,alpha);
    self.hideProgress();
  };

  // let camicanv = $CAMIC.viewer.drawer.canvas; //Original Canvas
  // let imgData = (camicanv.getContext('2d')).getImageData(box.xCoord, box.yCoord, box.width, box.height);
  // console.log('X: ' + box.xCoord);
  // console.log('Y: ' + box.yCoord);
  
  // loadImageToCanvas(imgData, self.__out);
  // loadImageToCanvas(imgData, self.__src);

  // TRIGGER SEGMENTATION
  // const alpha = +self.__threshold.value;
  // self.__tlabel.innerHTML = alpha;
  // watershed(self.__src,self.__out,alpha);

  /*
  let dataURL = loadImageToCanvas(imgData, 'canvasInput', false);
  var img = document.createElement("img");
  img.src = dataURL;
  document.body.appendChild(img);
  */

  /*
  let blob = dataURItoBlob(dataURL);
  let filename = 'testing';
  let f = new File([blob], filename, {type: blob.type});
  console.log(f);
  */

}

/**
 * WATERSHED SEGMENTATION
 *
 * @param inn
 * @param out
 * @param thresh
 */
function watershed(inn, out, thresh) {

  // Read image
  const self = $UI.segmentPanel;
  let src = cv.imread(inn);
  let i2s = cv.imread(inn);
  // Matrices
  let dst = new cv.Mat();
  let gray = new cv.Mat();
  let opening = new cv.Mat();
  let imageBg = new cv.Mat();
  let imageFg = new cv.Mat();
  let distTrans = new cv.Mat();
  let unknown = new cv.Mat();
  let markers = new cv.Mat();

  cv.cvtColor(i2s, i2s, cv.COLOR_RGBA2RGB, 0);
  // Store canvas to save combined image
  // $UI.segmentPanel.__c2s = cv.imread(inn);

  // Gray and threshold image
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  // Find an approximate estimate of the objects
  cv.threshold(gray, gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);

  // Get background
  let M = cv.Mat.ones(3, 3, cv.CV_8U);

  // Remove the stuff that's not an object
  cv.erode(gray, gray, M);

  // Find the stuff that IS an object
  cv.dilate(gray, opening, M); //remove any small white noises in the image
  cv.dilate(opening, imageBg, M, new cv.Point(-1, -1), 3); //remove any small holes in the object

  // Distance transform - for the stuff we're not sure about
  cv.distanceTransform(opening, distTrans, cv.DIST_L2, 5);
  cv.normalize(distTrans, distTrans, 1, 0, cv.NORM_INF);

  // Get foreground - make the objects stand out
  // cv.threshold (src, dst, thresh, maxval, type)
  cv.threshold(distTrans, imageFg, thresh, 1, cv.THRESH_BINARY_INV);
  console.log(thresh);

  // Mark (label) the regions starting with 1 (color output)
  imageFg.convertTo(imageFg, cv.CV_8U, 1, 0);
  cv.subtract(imageBg, imageFg, unknown);

  // Get connected components markers
  let x = cv.connectedComponents(imageFg, markers);

  // Get Polygons
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  let color = new cv.Scalar(255, 255, 0);
  cv.findContours(imageFg,contours,hierarchy,cv.RETR_CCOMP,cv.CHAIN_APPROX_SIMPLE);
  $UI.segmentPanel.__contours = contours;
  console.log("Getting contours.");

  for (let i = 0; i < markers.rows; i++) {
    for (let j = 0; j < markers.cols; j++) {
      markers.intPtr(i, j)[0] = markers.ucharPtr(i, j)[0] + 1;
      if (unknown.ucharPtr(i, j)[0] === 255) {
        markers.intPtr(i, j)[0] = 0;
      }
    }
  }
  cv.cvtColor(src, dst, cv.COLOR_RGBA2RGB, 0);
  cv.watershed(dst, markers);
  const cloneSrc = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC4);
  const listContours = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC4);
  
  // Draw barriers
  //console.log(markers.rows,markers.cols);
  // for (let i = 0; i < markers.rows; i++) {
  //   for (let j = 0; j < markers.cols; j++) {
  //     if (markers.intPtr(i, j)[0] === -1) {
  //       dst.ucharPtr(i, j)[0] = 255; // R
  //       dst.ucharPtr(i, j)[1] = 255; // G
  //       dst.ucharPtr(i, j)[2] = 0; // B
  //       cloneSrc.ucharPtr(i, j)[0] = 255; // R
  //       cloneSrc.ucharPtr(i, j)[1] = 255; // G
  //       cloneSrc.ucharPtr(i, j)[2] = 0; // B

  //       //console.log(dst.ucharPtr(i, j));
  //     }else{
  //       cloneSrc.ucharPtr(i, j)[3] = 0;
  //     }
  //   }
  // }

  let segcount = 0;
  let tmp = new cv.Mat();

  console.log("Drawing Contours");
  // console.log($UI.segmentPanel.__minarea.value);
  // console.log($UI.segmentPanel.__maxarea.value);
  for (let i = 1; i < contours.size(); ++i) {
    let cnt = contours.get(i);
    // console.log(contours[i]);
    let area = cv.contourArea(cnt,false);
    if(area < $UI.segmentPanel.__maxarea.value && area > $UI.segmentPanel.__minarea.value) {
      // console.log(cnt);
      ++segcount;
      cv.approxPolyDP(cnt, tmp, 1, true);
      // console.log(tmp.data32S);
      cv.drawContours(cloneSrc, contours, i, color, lineWidth, cv.FILLED, hierarchy,1);
      cv.drawContours(i2s , contours, i, color, lineWidth, cv.FILLED, hierarchy,1);
    }
  }
  console.log(segcount);
  console.log("Done Drawing Contours");

  // Update the count
  let clabel = document.getElementById('segcount');
  clabel.innerHTML=segcount;
  // console.log("Labels: " + segcount);
  // console.log(cloneSrc.cols);
  // console.log(cloneSrc.rows);

  // Draw barriers
  // console.log(cloneSrc.rows,cloneSrc.cols);
  for (let i = 0; i < cloneSrc.rows; i++) {
    for (let j = 0; j < cloneSrc.cols; j++) {
      if (cloneSrc.ucharPtr(i, j)[0] === 0 && cloneSrc.ucharPtr(i, j)[1] === 0 && cloneSrc.ucharPtr(i, j)[2] === 0) {
        cloneSrc.ucharPtr(i, j)[3] = 0;
      } else {
        cloneSrc.ucharPtr(i, j)[3] = 255;
      }
    }
  }


  // Display it
  //cv.imshow(out, dst);
  //console.log(document.getElementById('test1'));
  cv.imshow(out, cloneSrc);
  cv.imshow($UI.segmentPanel.__c2s, i2s);
  //cv.imshow($UI.segmentPanel.__out, cloneSrc);

  // Free up memory
  src.delete();
  dst.delete();
  gray.delete();
  opening.delete();
  imageBg.delete();
  imageFg.delete();
  distTrans.delete();
  unknown.delete();
  markers.delete();
  M.delete();
}

/**
 * Convert a dataURI to a Blob
 *
 * @param dataURI
 * @returns {Blob}
 */
function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  let byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else
    byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  let ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {type: mimeString});
}

/**
 * Convert image coordinates
 */
function convertCoordinates(imagingHelper, bound) {

  let newArray = bound.map(function (arr) {
    return arr.slice(); // copy
  });

  // 'image coordinate' to 'screen coordinate'
  for (let i = 0; i < newArray.length; i++) {
    let boundElement = newArray[i];
    for (let j = 0; j < boundElement.length; j++) {
      newArray[i][j] = j === 0 ? imagingHelper.dataToPhysicalX(boundElement[j])
        : imagingHelper.dataToPhysicalY(boundElement[j]);
    }
  }

  return newArray;

}

// Save the canvas to filename.  Uses local save dialog.
function download(canvas, filename) {

  /// create an "off-screen" anchor tag
  var lnk = document.createElement('a'),
      e;

  /// the key here is to set the download attribute of the a tag
  lnk.download = filename;

  /// convert canvas content to data-uri for link. When download
  /// attribute is set the content pointed to by link will be
  /// pushed as "download" in HTML5 capable browsers
  lnk.href = canvas.toDataURL();

  /// create a "fake" click-event to trigger the download
  if (document.createEvent) {

      e = document.createEvent("MouseEvents");
      e.initMouseEvent("click", true, true, window,
                       0, 0, 0, 0, 0, false, false, false,
                       false, 0, null);

      lnk.dispatchEvent(e);

  } else if (lnk.fireEvent) {

      lnk.fireEvent("onclick");
  }
}

// Build a csv of the polygons and associated metadata
function buildAndDownloadCSV(contours,fname) {
  let data = '';
  let tmp = new cv.Mat();
  const self = $UI.segmentPanel;
  const nl = '\n';
  const vpx = self.__top_left[0];
  const vpy = self.__top_left[1];
  const spx = self.__x;
  const spy = self.__y;

  console.log('In Download and Save CSV');
  data += 'AreaInPixels,PereimeterInPixels,Polygon\n';

  for (let i = 1; i < contours.size(); ++i) {
    let cnt = contours.get(i);
    // console.log(contours[i]);
    let area = cv.contourArea(cnt,false);
    let perimeter = cv.arcLength(cnt,true);
    if(area < self.__maxarea.value && area > self.__minarea.value) {
      data += area + ',' + perimeter + ',[';
      cv.approxPolyDP(cnt, tmp, 1, true);
      let carray = tmp.data32S;
      let asize = tmp.data32S.length;
      for(j = 0;j < asize-1;j+=2) {
        let imgX = carray[j]+vpx+spx;
        let imgY = carray[j+1]+vpy+spy;
        if(j<(asize-2)) {
          data += imgX + ':' + imgY + ':';
        } else {
          data += imgX + ':' + imgY + ']';
        }
      }
      data += nl;
    }
  }
  downloadCSV(data, fname);
}

// Save the polygons to csv with filename.  Uses local save dialog.
function downloadCSV(data,filename) {
  let csv = data;
  const self = $UI.segmentPanel;
  // console.log(data);

  if (csv == null) return;

  filename = filename || 'export.csv';

  if (csv.search(/^data:text\/csv/i) == -1) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
  }
  data = encodeURI(csv);

  link = document.createElement('a');
  link.setAttribute('href', data);
  link.setAttribute('download', filename);
  link.click();
}
