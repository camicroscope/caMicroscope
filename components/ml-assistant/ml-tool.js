const IDB_URL = 'indexeddb://';

class mlTools {
  constructor() {
    this.init();
  }

  init() {
    console.log('run init');
    this.canvas;
    this.context;
    this.data = new Map();
    this.threshold = this.t = 120;
    this.radius = 30;
    this.mode = 0;
    this.model = 0;
    this.modelLoaded = false;
    this.size = 0;
    this.ch = 4;
    this.undo;
    this.temp = document.createElement('canvas');
    this.fullPredict = document.createElement('canvas');
    this.sureFgImg1 = null;
    this.sureFgImg2 = null;
  }

  initcanvas(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
  }

  /**
     *
     * @param {*} x1
     * @param {*} y1
     * @param {*} w
     * @param {*} h
     * @param {*} th
     * @returns
     */
  detectContours(x1, y1, w, h, th, size, iter, context = this.context, invert = true) {
    const imgCanvasData = context.getImageData(x1, y1, w, h);
    let img = cv.matFromImageData(imgCanvasData);

    // Convert the image to grayscale
    let gray = new cv.Mat();
    cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY);

    let thresholdImg1 = new cv.Mat();
    cv.threshold(gray, thresholdImg1, th, 255, cv.THRESH_BINARY);
    const sureFgImg1 = this.thresholdImgToForegroundImg(thresholdImg1, size, iter, 2);

    let contours1 = new cv.MatVector();
    let hierarchy1 = new cv.Mat();
    cv.findContours(sureFgImg1, contours1, hierarchy1, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    if (invert) {
      let thresholdImg2 = new cv.Mat();
      cv.threshold(gray, thresholdImg2, th, 255, cv.THRESH_BINARY_INV);
      const sureFgImg2 = this.thresholdImgToForegroundImg(thresholdImg2, size, iter, 2);
      let contours2 = new cv.MatVector();
      let hierarchy2 = new cv.Mat();
      cv.findContours(sureFgImg2, contours2, hierarchy2, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
      thresholdImg2.delete();
      hierarchy2.delete();
      sureFgImg2.delete();
      thresholdImg1.delete();
      hierarchy1.delete();
      sureFgImg1.delete();
      img.delete();
      gray.delete();

      return [contours1, contours2];
    }

    thresholdImg1.delete();
    hierarchy1.delete();
    sureFgImg1.delete();
    img.delete();
    gray.delete();

    return [contours1];
  }

  thresholdImgToForegroundImg(thresholdImg, erodeSize = 2, iteration = 1, kernel_size = 3) {
    // Perform morphological operations to enhance separation
    const kernel = new cv.Mat();
    cv.Mat.ones(kernel_size, kernel_size, cv.CV_8U).copyTo(kernel);
    const opening = new cv.Mat();
    cv.morphologyEx(thresholdImg, opening, cv.MORPH_OPEN, kernel);
    const morph = new cv.Mat();
    cv.morphologyEx(opening, morph, cv.MORPH_CLOSE, kernel);
    const erode = new cv.Mat();
    const erodeKernel = new cv.Mat();
    cv.Mat.ones(erodeSize, erodeSize, cv.CV_8U).copyTo(erodeKernel);
    cv.erode(morph, erode, erodeKernel, new cv.Point(-1, -1), iteration);
    kernel.delete();
    opening.delete();
    morph.delete();
    erodeKernel.delete();
    return erode;
  }

  /**
     * Compute the overlap area between contour and polygon
     * @param contour {number[][]} openCV contour data
     * @param polygon {number[][]} polygon data
     * @return {number} overlap area
     */
  overlapAreaAndCircumference(contour, polygon) {
    const contour2 = contour.slice();
    const polygon2 = polygon.slice();
    contour2.push(contour2[0]);
    polygon2.push(polygon2[0]);
    const contourTurf = turf.polygon([contour2]);
    const polygonTurf = turf.polygon([polygon2]);
    const intersection = turf.intersect(contourTurf, polygonTurf);
    if (!intersection) {
      return 0.0;
    }
    const intersectionPolygon = intersection.geometry.coordinates[0];
    return {
      area: this.polygonArea(intersectionPolygon),
      circumference: this.getCircumference(intersectionPolygon),
    };
  }

  getCircumference(polygon) {
    let length = 0;
    for (let i = 0; i < polygon.length - 1; i++) {
      length += Math.sqrt((polygon[i][0] - polygon[i+1][0])**2 + (polygon[i][1] - polygon[i+1][1])**2);
    }
    return length;
  }

  /**
     * Convert contour data into array
     * @param contour {any} openCV contour data
     * @return {number[][]} contour data array
     */
  convertToArray(contour) {
    const contourData = contour.data32S;
    let contourPoints = [];
    for (let j = 0; j<contourData.length-1; j+=2) {
      contourPoints.push([contourData[j], contourData[j+1]]);
    }
    return contourPoints;
  }

  /**
     * find the most fit contours with user draw polygon
     * @param {*} contours
     * @param {*} polygon
     * @param {*} expansionBound
     * @param {*} erodeSize
     * @param {*} iteration
     * @param {*} overlap
     * @returns {number[][]} contour Array
     */
  mostFitContour(contours, polygon, expansionBound, erodeSize = 2, iteration = 1, overlap = 30) {
    let maxArea = 0;
    let fitContour;
    let expandedContour;
    const polygonArea = this.polygonArea(polygon);
    for (let j = 0; j < contours.length; j++) {
      for (let i = 0; i < contours[j].size(); i++) {
        let contour = contours[j].get(i);
        if (cv.contourArea(contour, false) < 50) {
          continue;
        }
        const contourArray = this.convertToArray(contour);
        if (this.closeBoundary(contourArray, expansionBound, 3)) {
          continue;
        }
        const {area} = this.overlapAreaAndCircumference(contourArray, polygon);
        if (area < 50) {
          continue;
        }
        if (area > maxArea) {
          maxArea = area;
          if (fitContour) {
            fitContour.delete();
          }
          fitContour = contour.clone();
        }
        contour.delete();
      }
      contours[j].delete();
    }

    if (fitContour) {
      expandedContour = this.expandContour(fitContour, expansionBound.w, expansionBound.h, erodeSize, iteration);
      const fitContourArray = this.convertToArray(expandedContour);
      expandedContour.delete();
      const expaned = this.overlapAreaAndCircumference(fitContourArray, polygon);
      if (expaned.area/polygonArea < overlap/100) {
        return [];
      }
      return [fitContourArray];
    } else {
      return [];
    }
  }

  manyFitContour(contours, polygon, expansionBound, erodeSize = 2, iteration = 1, overlap = 30) {
    let fitContours = [];
    let expandedContours = [];
    let expandedContourArrays = [];
    let totalOverlapArea = 0;
    const polygonArea = this.polygonArea(polygon);
    for (let j = 0; j < contours.length; j++) {
      for (let i = 0; i < contours[j].size(); i++) {
        let contour = contours[j].get(i);
        if (cv.contourArea(contour, false) < 50) {
          continue;
        }
        const contourArray = this.convertToArray(contour);
        if (this.closeBoundary(contourArray, expansionBound, 3)) {
          continue;
        }
        const {area, circumference} = this.overlapAreaAndCircumference(contourArray, polygon);
        if (!area || area < 15) {
          continue;
        }
        const expanedArea = area + circumference*erodeSize*iteration/2;
        totalOverlapArea += expanedArea;
        fitContours.push(contour.clone());
        contour.delete();
      }
      contours[j].delete();
    }
    if (!fitContours.length || totalOverlapArea/polygonArea < overlap/100) {
      return [];
    }

    expandedContours = fitContours.map((contour) => {
      return this.expandContour(contour, expansionBound.w, expansionBound.h, erodeSize, iteration);
    });

    expandedContourArrays = expandedContours.map((expanedContour) => {
      const expandedContourArray = this.convertToArray(expanedContour);
      expanedContour.delete();
      return expandedContourArray;
    });

    return expandedContourArrays;
  }

  polygonArea(points) {
    let area = 0;
    let j = points.length - 2;
    for (let i = 0; i < points.length - 1; i++) {
      area += (points[j][0] + points[i][0]) * (points[j][1] - points[i][1]);
      j = i;
    }
    return Math.abs(area / 2);
  }

  expandContour(contour, width, height, size, iter) {
    const mask = new cv.Mat.zeros(height, width, cv.CV_8UC1);
    const point = new cv.Point(0, 0);
    const bound = cv.boundingRect(contour);
    for (let i = bound.x; i < bound.x + bound.width; i++) {
      for (let j = bound.y; j < bound.y + bound.height; j++) {
        point.x = i;
        point.y = j;
        if (cv.pointPolygonTest(contour, point, false) >= 0) {
          mask.data[(point.y * mask.cols + point.x)] = 255;
        }
      }
    }

    const erodeKernel = new cv.Mat();
    cv.Mat.ones(size, size, cv.CV_8U).copyTo(erodeKernel);

    const dilate = new cv.Mat();
    cv.dilate(mask, dilate, erodeKernel, new cv.Point(-1, -1), iter);
    // const processImage = document.querySelector('.processed-image-container');
    // this.showmatImg(dilate, processImage);

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(dilate, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    mask.delete();
    erodeKernel.delete();
    dilate.delete();
    hierarchy.delete();
    if (contours.size() === 1) {
      const resultContour = contours.get(0).clone();
      contours.delete();
      return resultContour;
    }
    contours.delete();
    return null;
  }

  /**
     * Determine whether one point close to its boundary
     * @param {number[][]} contour
     * @param {any} expansionBound
     * @param {number} epsilon
     * @returns {boolean}
     */
  closeBoundary(contour, expansionBound, epsilon) {
    let close = false;
    for (let i = 0; i < contour.length; i++) {
      if (contour[i][0] <= epsilon ||
            contour[i][0] >= expansionBound.w - epsilon ||
            contour[i][1] <= epsilon ||
            contour[i][1] >= expansionBound.h - epsilon) {
        close = true;
        break;
      }
    }
    return close;
  }

  /**
     * Get coordinate parameter of polygon boundary
     * @param {number[][]} polygon
     * @return {any} {x: left, y: top, w: width, h: height}
     */
  getCoordinate(polygon) {
    let x1 = polygon[0][0];
    let y1 = polygon[0][1];
    let x2 = polygon[0][0];
    let y2 = polygon[0][1];

    for (let i = 0; i < polygon.length; i++) {
      if (x1 > polygon[i][0]) {
        x1 = polygon[i][0];
      }
      if (y1 > polygon[i][1]) {
        y1 = polygon[i][1];
      }
      if (x2 < polygon[i][0]) {
        x2 = polygon[i][0];
      }
      if (y2 < polygon[i][1]) {
        y2 = polygon[i][1];
      }
    }
    return {
      x: x1,
      y: y1,
      w: x2 - x1,
      h: y2 - y1,
    };
  }

  /**
     * Return boundary information with expansion value
     * @param {any} originalBound
     * @param {number} expansionValue
     */
  getExpansionCoordicate(originalBound, expansionValue) {
    return {
      x: ~~(originalBound.x - originalBound.w * expansionValue/(100 * 2)),
      y: ~~(originalBound.y - originalBound.h * expansionValue/(100 * 2)),
      w: ~~(originalBound.w * (1 + expansionValue/100)),
      h: ~~(originalBound.h * (1 + expansionValue/100)),
    };
  }

  /**
     * Realign position of polygon like array
     * @param {number[][]} array - input array
     * @param {number} x - left position of new coordinate
     * @param {number} y - top position of new coordinate
     * @return {number[][]} processed array
     */
  reAlign(array, x, y) {
    if (array === undefined) {
      return [];
    }
    for (let i = 0; i < array.length; i++) {
      array[i][0] -= x;
      array[i][1] -= y;
    }
    return array;
  }

  /**
     * Process drawing polygon without using any model
     * @param polygon {number[][]} drawing polygon data
     * @param threshold {number} threshold for edge detection
     * @param expansion {number} expansion percentage from existing data
     * @return {number[][]} processed polygon
     */
  applyDrawNoModel(polygon, threshold, expansion, overlap, drawMany = false) {
    // remove last point from the polygon
    polygon.pop();

    // get current polygon coordinate (left, top, width, height)
    const polygonBound = this.getCoordinate(polygon);

    // get expansion coordinate (left, top, width, height)
    const expansionBound = this.getExpansionCoordicate(polygonBound, expansion);

    // re-align polygon origin
    polygon = this.reAlign(polygon, expansionBound.x, expansionBound.y);

    let fitContours;
    for (let size = 0; size < 20; size+=6) {
      for (let iter = 1; iter < 10; iter+=4) {
        for (let dth = 1; dth < 100; dth+=10) {
          const th = (dth % 2 === 1) ? threshold - ~~(dth/2) : threshold - ~~(dth/2);
          if (th <= 0 || th >= 255) {
            continue;
          }
          // get contours from detect edges image
          const contours = this.detectContours(expansionBound.x, expansionBound.y, expansionBound.w,
              expansionBound.h, th, size, iter);
          // get most fit contour
          if (!drawMany) {
            fitContours = this.mostFitContour(contours, polygon, expansionBound, size, iter, overlap);
          } else {
            fitContours = this.manyFitContour(contours, polygon, expansionBound, size, iter, overlap);
          }
          if (fitContours.length) {
            break;
          }
        }
        if (fitContours.length) {
          break;
        }
      }
      if (fitContours.length) {
        break;
      }
    }

    if (fitContours.length === 0) {
      return [];
    }
    // re-align the most fit contour
    fitContours = fitContours.map((fitContour) => {
      fitContour = this.reAlign(fitContour, -expansionBound.x, -expansionBound.y);
      fitContour.push(fitContour[0]);
      return fitContour;
    });

    return fitContours;
  }

  /**
     * Load model when annotation have been enable
     * @param {string} key - model key
     * @return {Promise<boolean>}
     */
  loadModel(key) {
    if (key === 'default') {
      try {
        this.model.dispose();
      } catch (error) { }
      this.model = 'default';
      return Promise.resolve(true);
    }
    return new Promise((resolve, reject) => {
      try {
        if (this.model && this.model !== 'default') {
          try {
            this.model.dispose();
          } catch (error) { }
        }
        const tx = db.transaction('models_store', 'readonly');
        const store = tx.objectStore('models_store');
        const req = store.get(key);

        req.onsuccess = async function(e) {
          // self.showProgress('Loading model...');

          // Keras sorts the labels by alphabetical order.
          const inputShape = e.target.result.input_shape;
          console.log('inputShape: ', inputShape);
          this.size = parseInt(inputShape[1]);
          this.ch = parseInt(inputShape[3]);

          this.model = await tf.loadLayersModel(IDB_URL + key);
          console.log('Model Loaded');
          const memory = tf.memory();
          console.log('Model Memory Usage');
          console.log('GPU : ' + memory.numBytesInGPU + ' bytes');
          console.log('Total : ' + memory.numBytes + ' bytes');

          // tfvis.show.modelSummary({name: 'Model Summary', tab: 'Model Inspection'}, model);
          tf.tidy(()=>{
            // Warmup the model before using real data.
            this.model.predict(tf.zeros([1, this.size, this.size, this.ch]));
            //   self.showProgress('Model loaded...');
            resolve(true);
          });
        }.bind(this);
      } catch (error) {
        console.log('fail to load model: ', error);
        reject(error);
      }
    });
  }

  /**
     * Get expansion coordinate parameter coresponding with using model
     * @param {number} step - current model input size px
     * @param {any} polygonBound - current polygon boundary parameter
     * @param {number} expansionValue - choosen expansion value
     * @return {any} expansion boundary parameter
     */
  getModelExpansionCoordicate(step, polygonBound, expansionValue) {
    const extendX = Math.ceil(polygonBound.w * (1 + expansionValue / 100) / step) * step - polygonBound.w;
    const extendY = Math.ceil(polygonBound.h * (1 + expansionValue / 100) / step) * step - polygonBound.h;
    return {
      x: polygonBound.x - ~~(extendX/2),
      y: polygonBound.y - ~~(extendY/2),
      w: polygonBound.w + extendX,
      h: polygonBound.h + extendY,
    };
  }

  /**
     * Get list of coordinates
     * @param {number} step - model input size
     * @param {any} expansionBound - expansion boundary parameter
     * @return {any[]} - list of grid pieces coordinates
     */
  getGridCoordinate(step, expansionBound) {
    const numStepX = ~~(expansionBound.w / step);
    const numStepY = ~~(expansionBound.h / step);
    let gridBounds = [];
    for (let i = 0; i < numStepX; i++) {
      for (let j = 0; j < numStepY; j++) {
        gridBounds.push({
          x: expansionBound.x + i * step,
          y: expansionBound.y + j * step,
          w: step,
          h: step,
        });
      }
    }
    return gridBounds;
  }

  /**
     * Using imported model for autocorrect user draw polygon
     * @param {any} model - processing model
     * @param {number} size - model input image size px
     * @param {number} ch - model input channel
     * @param {string} scaleMethod - model scale method
     * @param {number[][]} polygon - user draw polygon data (already align)
     * @param {number} threshold - upper threshold value for canny detection
     * @param {number} expansion - expansion percentage
     */
  async applyDrawModel(model, size, ch, scaleMethod, polygon, threshold, expansion, overlap, drawMany = false) {
    // remove last point from the polygon
    polygon.pop();

    // get current polygon coordinate (left, top, width, height)
    const polygonBound = this.getCoordinate(polygon);

    // get expansion coordinate (left, top, width, height)
    const expansionBound = this.getModelExpansionCoordicate(size, polygonBound, expansion);

    // get grid coordinate with grid size is model size
    const gridBounds = this.getGridCoordinate(size, expansionBound);

    // loop over all pieces of image and run the model
    this.fullPredict.getContext('2d').clearRect(0, 0, this.fullPredict.width, this.fullPredict.height);
    this.fullPredict.width = expansionBound.w;
    this.fullPredict.height = expansionBound.h;
    for (let i = 0; i < gridBounds.length; i++) {
      // get image data
      const imgCanvasData = this.context.getImageData(gridBounds[i].x, gridBounds[i].y, size, size);
      let val;
      tf.tidy(() => {
        const img = tf.browser.fromPixels(imgCanvasData).toFloat();
        let img2;
        if (ch == 1) {
          img2 = tf.image.resizeBilinear(img, [size, size]).mean(2);
        } else {
          img2 = tf.image.resizeBilinear(img, [size, size]);
        }
        let normalized;
        if (scaleMethod == 'norm') {
          const scale = tf.scalar(255);
          normalized = img2.div(scale);
          scale.dispose();
        } else if (scaleMethod == 'center') {
          const mean = img2.mean();
          normalized = img2.sub(mean);
          mean.dispose();
        } else if (scaleMethod == 'std') {
          const mean = img2.mean();
          const std = (img2.squaredDifference(mean).sum()).div(img2.flatten().shape).sqrt();
          normalized = img2.sub(mean).div(std);
          mean.dispose();
          std.dispose();
        } else {
          normalized = img2;
        }
        const batched = normalized.reshape([1, size, size, ch]);
        let values = model.predict(batched).dataSync();
        let valuesArray = Array.from(values);
        // scale values
        valuesArray = valuesArray.map((x) => x * 255);
        val = [];
        while (valuesArray.length > 0) val.push(valuesArray.splice(0, size));
        const padding = 2;
        val = this.fillBoundary(val, padding);
        img.dispose();
        img2.dispose();
        normalized.dispose();
        batched.dispose();
      });
      tf.engine().startScope();
      await tf.browser.toPixels(val, this.temp);
      this.fullPredict.getContext('2d').
          drawImage(this.temp, gridBounds[i].x - expansionBound.x, gridBounds[i].y - expansionBound.y);
      tf.engine().endScope();
    }

    this.showCanvas(this.fullPredict, document.querySelector('.model-predict-image-container'));
    const fullPredictCanvas = this.fullPredict.getContext('2d');

    // re-align polygon origin
    polygon = this.reAlign(polygon, expansionBound.x, expansionBound.y);

    let fitContours = [];

    for (let size = 0; size < 20; size+=6) {
      for (let iter = 1; iter < 10; iter+=4) {
        for (let dth = 0; dth < 200; dth+=10) {
          const th = (dth % 2 === 1) ? threshold - ~~(dth/2) : threshold + ~~(dth/2);
          if (th <= 0 || th >= 255) {
            continue;
          }
          // get contours from detect edges image
          const contours = this.detectContours(0, 0, this.fullPredict.width, this.fullPredict.height,
              th, size, iter, fullPredictCanvas, false);
          // get most fit contour
          if (!drawMany) {
            fitContours = this.mostFitContour(contours, polygon, expansionBound, size, iter, overlap);
          } else {
            fitContours = this.manyFitContour(contours, polygon, expansionBound, size, iter, overlap);
          }
          if (fitContours.length) {
            break;
          }
        }
        if (fitContours.length) {
          break;
        }
      }
      if (fitContours.length) {
        break;
      }
    }

    if (fitContours.length === 0) {
      return [];
    }

    // re-align the most fit contour
    fitContours = fitContours.map((fitContour) => {
      fitContour = this.reAlign(fitContour, -expansionBound.x, -expansionBound.y);
      fitContour.push(fitContour[0]);
      return fitContour;
    });

    return fitContours;
  }

  async applyDraw(polygon, threshold, expansion, overlap, scaleMethod = 'no_scale', drawMany = false) {
    if (this.model && this.model !== 'default') {
      return await this.applyDrawModel(this.model, this.size, this.ch, scaleMethod, polygon, threshold,
          expansion, overlap, drawMany);
    } else {
      return this.applyDrawNoModel(polygon, threshold, expansion, overlap, drawMany);
    }
  }

  fillBoundary(imageArray, padding) {
    const size = imageArray.length;
    for (let i = 0; i < padding; i++) {
      for (let j = padding; j<size-padding; j++) {
        imageArray[i][j] = imageArray[padding][j];
        imageArray[size-i-1][j] = imageArray[size-padding-1][j];
        imageArray[j][i] = imageArray[j][padding];
        imageArray[j][size-i-1] = imageArray[j][size-padding-1];
      }
    }
    for (let i = 0; i < padding; i++) {
      for (let j = 0; j < padding; j++) {
        imageArray[i][j] = imageArray[padding][padding];
        imageArray[size-i-1][j] = imageArray[size-padding-1][padding];
        imageArray[i][size-j-1] = imageArray[padding][size-padding-1];
        imageArray[size-i-1][size-j-1] = imageArray[size-padding-1][size-padding-1];
      }
    }
    return imageArray;
  }

  showmatImg(edges, elt, convertCh = true) {
    // Create a new canvas for displaying the edges
    empty(elt);
    var edgesCanvas = document.createElement('canvas');
    edgesCanvas.width = edges.cols;
    edgesCanvas.height = edges.rows;
    var edgesCtx = edgesCanvas.getContext('2d');
    let data = [];
    if (convertCh) {
      for (let i = 0; i < edges.data.length; i++) {
        data.push(edges.data[i]);
        data.push(edges.data[i]);
        data.push(edges.data[i]);
        data.push(255);
      }
    }

    // Convert the edges data to an image
    var edgesData = new ImageData(
        new Uint8ClampedArray(data),
        edges.cols,
        edges.rows,
    );

    // Draw the edges on the canvas
    edgesCtx.putImageData(edgesData, 0, 0);
    if ((edgesCanvas.height/edgesCanvas.width) > (elt.offsetHeight/elt.offsetWidth)) {
      edgesCanvas.style.height = '100%';
      edgesCanvas.style.width = '';
    } else {
      edgesCanvas.style.width = '100%';
      edgesCanvas.style.height = '';
    }
    // Append the canvas to the document body or any other container
    elt.appendChild(edgesCanvas);
  }

  showCanvas(canvas, elt) {
    empty(elt);
    if ((canvas.height/canvas.width) > (elt.offsetHeight/elt.offsetWidth)) {
      canvas.style.height = '100%';
      canvas.style.width = '';
    } else {
      canvas.style.width = '100%';
      canvas.style.height = '';
    }
    elt.appendChild(canvas);
  }
}

var mltools = new mlTools();
