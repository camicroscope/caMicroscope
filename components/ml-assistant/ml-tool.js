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
    detectContours(x1, y1, w, h, th, context = this.context, invert = true) {
        const imgCanvasData = context.getImageData(x1, y1, w, h);
        let img = cv.matFromImageData(imgCanvasData);

        // Convert the image to grayscale
        let gray = new cv.Mat();
        cv.cvtColor(img, gray, cv.COLOR_RGBA2GRAY);

        let thresholdImg1 = new cv.Mat();
        cv.threshold(gray, thresholdImg1, th, 255, cv.THRESH_BINARY)
        this.showmatImg(thresholdImg1, document.querySelector('#edge-img'));
        let contours1 = new cv.MatVector();
        let hierarchy1 = new cv.Mat();
        cv.findContours(thresholdImg1, contours1, hierarchy1, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        if (invert) {
            let thresholdImg2 = new cv.Mat();
            cv.threshold(gray, thresholdImg2, th, 255, cv.THRESH_BINARY_INV)
            let contours2 = new cv.MatVector();
            let hierarchy2 = new cv.Mat();
            cv.findContours(thresholdImg2, contours2, hierarchy2, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
            return [contours1, contours2]
        }

        return [contours1];
    }

    /**
     * Compute the overlap area between contour and polygon
     * @param contour {number[][]} openCV contour data
     * @param polygon {number[][]} polygon data
     * @return {number} overlap area
     */
    overlapArea(contour, polygon) {
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
        
        return turf.area(intersection);
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
     * Find the most fit contour with polygon data
     * @param contours {any} openCV contours data
     * @param polygon {number[][]} polygon data
     * @param w {number} width of original image
     * @param h {number} height of orignal image
     * @return {number[][]} the most fit contour data array
     */
    mostFitContour(contours, polygon, expansionBound) {
        let maxArea = 0;
        let area;
        let fitContour;
        for (let j = 0; j < contours.length; j++) {
            for (let i = 0; i < contours[j].size(); i++) {
                let contour = contours[j].get(i);
                if (cv.contourArea(contour, false) < 1) {
                    continue;
                }
                contour = this.convertToArray(contour);
                if (this.closeBoundary(contour, expansionBound, 3)) {
                    continue;
                }
                area = this.overlapArea(contour, polygon);
                if (area > maxArea) {
                    maxArea = area;
                    fitContour = contour;
                }
            }
        }

        return fitContour;
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
            if (contour[i][0] <= epsilon
            || contour[i][0] >= expansionBound.w - epsilon
            || contour[i][1] <= epsilon
            || contour[i][1] >= expansionBound.h - epsilon) {
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
        }
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
        }
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
    applyDrawNoModel(polygon, threshold, expansion) {
        // remove last point from the polygon
        polygon.pop();

        // get current polygon coordinate (left, top, width, height)
        const polygonBound = this.getCoordinate(polygon);

        // get expansion coordinate (left, top, width, height)
        const expansionBound = this.getExpansionCoordicate(polygonBound, expansion);

        // get contours from detect edges image
        const contours = this.detectContours(expansionBound.x, expansionBound.y, expansionBound.w, expansionBound.h, threshold);

        // re-align polygon origin
        polygon = this.reAlign(polygon, expansionBound.x, expansionBound.y);

        // get most fit contour
        let fitContour = this.mostFitContour(contours, polygon, expansionBound);
        console.log('fitContour: ', fitContour);

        // re-align the most fit contour
        fitContour = this.reAlign(fitContour, -expansionBound.x, -expansionBound.y);

        if (fitContour.length === 0) {
            return [];
        }
        // add last point into the most fit contour
        fitContour.push(fitContour[0]);
        
        return fitContour;
    }

    /**
     * Load model when annotation have been enable
     * @param {string} key - model key
     * @return {Promise<boolean>}
     */
    loadModel(key) {
        return new Promise((resolve, reject) => {
            try {
                if (this.model) {
                    this.model.dispose();
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
                    this.ch =  parseInt(inputShape[3]);
              
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
                        resolve(true)
                    });
                }.bind(this)
            } catch (error) {
                console.log('fail to load model: ', error);
                reject(false);
            }
        })
    }

    /**
     * Make 
     * @param {any} img tensorflow data
     * @param {number} ch - number of channel process by model (gray: 1, rgb: 4)
     * @return {any} - process image data
     */
    channelProcessing(img, ch=1) {
        if (ch == 1) {
            return tf.image.resizeBilinear(img, [imageSize, imageSize]).mean(2);
        } else {
            return tf.image.resizeBilinear(img, [imageSize, imageSize]);
        }
    }

    /**
     * Scaling processing for model input images
     * @param {any} img - image tensorflow data
     * @param {string} scaleMethod - model scaling method
     * @return {any} - scaled image data
     */
    pixelScaling(img, scaleMethod) {
        if (scaleMethod == 'no_scale') {
            return img
        } else if (scaleMethod == 'norm') {
        // Pixel Normalization: scale pixel values to the range 0-1.
            const scale = tf.scalar(255);
            return img.div(scale);
        } else if (scaleMethod == 'center') {
        // Pixel Centering: scale pixel values to have a zero mean.
            const mean = img.mean();
            return img.sub(mean);
        } else {
        // Pixel Standardization: scale pixel values to have a zero mean and unit variance.
            const mean = img.mean();
            const std = (img.squaredDifference(mean).sum()).div(img.flatten().shape).sqrt();
            return img.sub(mean).div(std);
        }
    }

    /**
     * Get expansion coordinate parameter coresponding with using model
     * @param {number} step - current model input size px
     * @param {any} polygonBound - current polygon boundary parameter
     * @param {number} expansionValue - choosen expansion value
     * @return {any} expansion boundary parameter
     */
    getModelExpansionCoordicate(step, polygonBound, expansionValue) {
        const extendX = Math.ceil(polygonBound.w *  (1 + expansionValue / 100) / step) * step - polygonBound.w;
        const extendY = Math.ceil(polygonBound.h *  (1 + expansionValue / 100) / step) * step - polygonBound.h;
        return {
            x: polygonBound.x - ~~(extendX/2),
            y: polygonBound.y - ~~(extendY/2),
            w: polygonBound.w + extendX,
            h: polygonBound.h + extendY,
        }
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
                })
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
    async applyDrawModel(model, size, ch, scaleMethod, polygon, threshold, expansion) {
        console.log('applyDrawModel');
        // remove last point from the polygon
        polygon.pop();

        // get current polygon coordinate (left, top, width, height)
        const polygonBound = this.getCoordinate(polygon);

        // get expansion coordinate (left, top, width, height)
        const expansionBound = this.getModelExpansionCoordicate(size, polygonBound, expansion);

        // get grid coordinate with grid size is model size
        const gridBounds = this.getGridCoordinate(size, expansionBound);
        console.log('gridBounds: ', gridBounds);

        // loop over all pieces of image and run the model
        this.fullPredict.getContext('2d').clearRect(0, 0, this.fullPredict.width, this.fullPredict.height);
        this.fullPredict.width = expansionBound.w;
        this.fullPredict.height = expansionBound.h;
        for (let i = 0; i < gridBounds.length; i++) {
            // get image data
            const imgCanvasData = this.context.getImageData(gridBounds[i].x, gridBounds[i].y, size, size);
            console.log('imgCanvasData: ', imgCanvasData);
            let val;
            tf.tidy(() => {
                const img = tf.browser.fromPixels(imgCanvasData).toFloat();
                console.log('img: ', img);
                // const channedProcessedImg = this.channelProcessing(img, ch);
                // console.log('channedProcessedImg: ', channedProcessedImg);
                // const pixelScaledImg = this.pixelScaling(channedProcessedImg, scaleMethod);
                // console.log('pixelScaledImg: ', pixelScaledImg);
                let img2;
                if (ch == 1) {
                    img2 = tf.image.resizeBilinear(img, [size, size]).mean(2);
                } else {
                    img2 = tf.image.resizeBilinear(img, [size, size]);
                }
                console.log('img2: ', img2);
                const batched = img2.reshape([1, size, size, ch]);
                console.log('batched: ', batched);
                let values = model.predict(batched).dataSync();
                console.log('values: ', values);
                values = Array.from(values);
                // scale values
                values = values.map((x) => x * 255);
                val = [];
                while (values.length > 0) val.push(values.splice(0, size));
            })
            tf.engine().startScope();
            await tf.browser.toPixels(val, this.temp);
            this.fullPredict.getContext('2d').drawImage(this.temp, gridBounds[i].x - expansionBound.x, gridBounds[i].y - expansionBound.y);
            tf.engine().endScope();
        }

        this.showCanvas(this.fullPredict, document.querySelector('#edge-img'));

        const fullPredictCanvas = this.fullPredict.getContext('2d');

        // get contours from detect edges image
        const contours = this.detectContours(0, 0, this.fullPredict.width, this.fullPredict.height, threshold, fullPredictCanvas, false);

        // re-align polygon origin
        polygon = this.reAlign(polygon, expansionBound.x, expansionBound.y);

        // get most fit contour
        let fitContour = this.mostFitContour(contours, polygon, expansionBound);

        // re-align the most fit contour
        fitContour = this.reAlign(fitContour, -expansionBound.x, -expansionBound.y);

        if (fitContour.length === 0) {
            return [];
        }
        // add last point into the most fit contour
        fitContour.push(fitContour[0]);

        return fitContour;
    }

    async applyDraw(polygon, threshold, expansion, scaleMethod = 'no_scale') {
        console.log('model: ', this.model);
        if (this.model && this.model !== 'watershed') {
            return await this.applyDrawModel(this.model, this.size, this.ch, scaleMethod, polygon, threshold, expansion);
        } else {
            return this.applyDrawNoModel(polygon, threshold, expansion)
        }
    }

    showmatImg(edges, elt) {
        // Create a new canvas for displaying the edges
        empty(elt)
        var edgesCanvas = document.createElement('canvas');
        edgesCanvas.width = edges.cols;
        edgesCanvas.height = edges.rows;
        var edgesCtx = edgesCanvas.getContext('2d');
        let data = []
        for (let i = 0; i < edges.data.length; i++) {
            data.push(edges.data[i]);
            data.push(edges.data[i]);
            data.push(edges.data[i]);
            data.push(225);
        }

        // Convert the edges data to an image
        var edgesData = new ImageData(
            new Uint8ClampedArray(data),
            edges.cols,
            edges.rows
        );

        // Draw the edges on the canvas
        edgesCtx.putImageData(edgesData, 0, 0);

        // Append the canvas to the document body or any other container
        elt.appendChild(edgesCanvas);
    }

    showCanvas(canvas, elt) {
        empty(elt);
        elt.appendChild(canvas);
    }
}

var mltools = new mlTools();
