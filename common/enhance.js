/**
CLAHE, Edge detect Sobel, Edge detect Canny, Apply filter 1, Grayscaler
Misc: conv 1, recrop, grayscale, mapcolor, copycolor
(changes input)
**/

/** Histogram equalization CLAHE
 *@param {ImageData} image
 *@param {int} tiles
 *@param {float} clip
 *@return {ImageData} image
**/
function clahe(imgData, tiles=32, clip=0.1) {
  let tilesize = [tiles, tiles];
  let clipLimit = clip;
  let min=255, max=0;
  let intens=[];
  let levels=[];
  let j=0;
  for (let i=0;i<imgData.data.length;i+=4) {
      intens[j] = (imgData.data[i]+imgData.data[i+1]+imgData.data[i+2] )/3;
      j++;
  }
  // number of bins
  let num_bins = 256;
  let h = imgData.height;
  let w = imgData.width;
  // number of tiles in x and y direction
  let xtiles = Math.ceil(w / tilesize[0]);
  let ytiles = Math.ceil(h / tilesize[1]);
  let cdfs = new Array(ytiles);
  for(let i=0;i<ytiles;i++)
      cdfs[i] = new Array(xtiles);
  let inv_tile_size = [1.0 / tilesize[0], 1.0 / tilesize[1]];
  let cdf = [];
  // create histograms
  for(let i=0;i<ytiles;i++){
      let y0 = i * tilesize[1];
      let y1 = y0 + tilesize[1];
      for(let j=0;j<xtiles;j++)
      {
          let x0 = j * tilesize[0];
          let x1 = x0 + tilesize[0];
          let hist = histogram(intens, x0, y0, x1, y1, num_bins, h, w);
          cdfs[i][j] = buildcdf(hist, num_bins, tilesize[0] * tilesize[1], clipLimit);
      }
  }
  // interpolation and pixel filling
  let finalArray = [];
  let p = 0;
  for(let y=0, idx=0;y<h;++y){
      for(let x=0;x<w;++x, idx+=4){
          // intensity of current pixel
          let I = Math.floor(intens[y*w+x]);
          let tx = x * inv_tile_size[0] - 0.5;
          let ty = y * inv_tile_size[1] - 0.5;
          let xl = Math.max(Math.floor(tx), 0);
          let xr = Math.min(xl+1, xtiles-1);
          let yt = Math.max(Math.floor(ty), 0);
          let yd = Math.min(yt+1, ytiles-1);
          let fx = tx - xl;
          let fy = ty - yt;
          let cdf11 = (cdfs[yt][xl][I]) * 255 ;
          let cdf12 = (cdfs[yd][xl][I]) * 255;
          let cdf21 = (cdfs[yt][xr][I]) * 255;
          let cdf22 = (cdfs[yd][xr][I]) * 255;
          let Iout = (1 - fx) * (1 - fy) * cdf11
              + (1 - fx) *       fy  * cdf12
              +      fx  * (1 - fy) * cdf21
              +      fx  *      fy  * cdf22;
          finalArray[p] = Iout;
          p++;
      }
  }
  let pixelLength = h * w;
  // filling the image
  for (let index = 0, indexToFill = 3; index < pixelLength; index++, indexToFill = indexToFill + 4) {
    let result = finalArray[index];
    let oldsum = imgData.data[indexToFill-3]+imgData.data[indexToFill-2]+imgData.data[indexToFill-1]; let newsum = result*3;
    let chn = newsum/oldsum;
    if (oldsum<255*3-50 && newsum>50) {
      imgData.data[indexToFill-3]= Math.floor(imgData.data[indexToFill-3]*chn);
      imgData.data[indexToFill-2] = Math.floor(imgData.data[indexToFill-2]*chn);
      imgData.data[indexToFill-1] = Math.floor(imgData.data[indexToFill-1]*chn);
      // imgData.data[indexToFill] = 255 - result;
    }
  }
  return imgData;
}


/** Apply Filter 1
*@param {ImageData} image
*@param {2D array} kernel
*@param {int} Ouput_channels (0/4)
*@return {ImageData} image
**/
// color cannot be displaced
function applyfilter(imgData,kernel,ch=4){
  let height = imgData.height,width=imgData.width, data=imgData.data;
  let graydata = grayscale(data,width,height);
  let newdata = conv_1(graydata,width,height,kernel);
  if(ch==4) mapcolor(newdata,data,width,height);
  else imgData = {data:newdata,width:width,height:height};
  return imgData;
}


/** Grayscaler
 *@param {ImageData} image
 *@param {int} Ouput_channels (0/4)
 *@return {ImageData} image
**/
function grayscaler(imgData,ch=4){
    let height = imgData.height,width=imgData.width, data=imgData.data;
    let cl = grayscale(data,width,height);
    if(ch==4) copycolor(cl,data,width,height);
    else imgData = {data:cl,width:width,height:height};
    return imgData;
}


/** Sobel Edge detect
 *@param {ImageData} image
 *@param {float} threshold
 *@param {int} Ouput_channels (0/4)
 *@return {ImageData} image
**/
function edgedetect_sobel(imgData,threshold,ch=4){
  //console.time('SOBEL');
  let kernelx =
      [[-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]];
  let kernely =
          [[-1, -2, -1],
          [0, 0, 0],
          [1, 2, 1]];
  let height = imgData.height,width=imgData.width, data=imgData.data;

  let gray = grayscale(data,width,height);
  //console.log("gray");
  let gaussMatrix = [[2,3,2],[3,5,3],[2,3,2]];
  gray = conv_1(gray,width,height,gaussMatrix)
  //console.log("blur");

  let imgx = conv_1(gray,width,height,kernelx);
  //console.log("imgx");
  let imgy = conv_1(gray,width,height,kernely);
  //console.log("imgy");
  for(let i=0;i<width;i++){
    for(let j=0;j<height;j++){
      let nx = getpix1(imgx,j,i,width),ny = getpix1(imgy,j,i,width);
      let sum = ~~(Math.sqrt((nx*nx+ny*ny)/2));
      sum = sum>threshold? 255-sum:255-0;
      setpix1(gray,j,i,width,sum);
    }
  }
  if (ch==4) copycolor(gray,imgData.data,width,height);
  else imgData = {data:gray,width:width,height:height};
  //console.timeEnd('SOBEL');
  return imgData;
}


/** Canny Edge detect
 *@param {ImageData} image
 *@param {int} lower_threshold
 *@param {int} Upper_threshold
 *@param {int} Gaussian_Kernal_Size
 *@param {int} Kernel_Sigma
 *@param {int} Ouput_channels (0/4)
 *@return {ImageData} image
**/
let oldkerneln = -1; //cache gaussian kernal
let gaussMatrix;
function edgedetect_canny(imgData,lt=20,ut=60,kerneln=5,sigma=1.8,ch=4){
    let height = imgData.height,width=imgData.width, data=imgData.data;
    //console.time('Canny');
    let gradientMagnitude = new Array(width*height);
    const gradientDirection = new Array(width*height);
    if(oldkerneln != kerneln){
      let kernelh = Math.floor(kerneln/2); gaussMatrix=[]; oldkerneln = kerneln;
      for(let i=-kernelh;i<kerneln-kernelh;i++){
        let row = [];
        for(let j=-kernelh;j<kerneln-kernelh;j++){
          let e = Math.floor(Math.exp((2*kernelh*kernelh-i*i-j*j)/(2*sigma*sigma))*2)
          row.push(e);}
        gaussMatrix.push(row);
      }
    }
    //console.log(gaussMatrix);
    const kernelx = [[1, 0, -1], [2, 0, -2], [1, 0, -1]];
    const kernely = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
    // grayscale
    let gray = grayscale(data,width,height);
    // blur
    let blur = conv_1(gray,width,height,gaussMatrix);
    //console.log("gray");
    // SOBEL
    let xDerived = conv_1(blur,width,height,kernelx);
  //  console.log("imgx");
    let yDerived = conv_1(blur,width,height,kernely);
    //console.log("imgy");
    //console.log("gradient calculation");
    let index, pom;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            index = y * width + x;
            gradientMagnitude[index] = Math.floor(Math.sqrt((xDerived[index] * xDerived[index] + yDerived[index] * yDerived[index])));
            pom = Math.atan2(xDerived[index], yDerived[index]);
            if ((pom >= -Math.PI / 8 && pom < Math.PI / 8) || (pom <= -7 * Math.PI / 8 && pom > 7 * Math.PI / 8))
                gradientDirection[index] = 0; //0
            else if ((pom >= Math.PI / 8 && pom < 3 * Math.PI / 8) || (pom <= -5 * Math.PI / 8 && pom > -7 * Math.PI / 8))
                gradientDirection[index] = 1; //45
            else if ((pom >= 3 * Math.PI / 8 && pom <= 5 * Math.PI / 8) || (-3 * Math.PI / 8 >= pom && pom > -5 * Math.PI / 8))
                gradientDirection[index] = 2; //90
            else if ((pom < -Math.PI / 8 && pom >= -3 * Math.PI / 8) || (pom > 5 * Math.PI / 8 && pom <= 7 * Math.PI / 8))
                gradientDirection[index] = 3; //135 / -45
            else gradientDirection[index] = 0;
        }
    }
  //  console.log("non max suppression");
    let copy = new Array(width*height), degrees = {0 : [{x:1, y:2}, {x:1, y:0}], 1 : [{x: 0, y: 2}, {x: 2, y: 0}], 2 : [{x: 0, y: 1}, {x: 2, y: 1}], 3 : [{x: 0, y: 0}, {x: 2, y: 2}]};
    for (let y = 1; y < height-1; y++) {
      for (let x = 1; x < width-1; x++) {
        index = y * width + x;
        let pixNeighbors = degrees[gradientDirection[index]];
          //pixel neighbors to compare
          let pix1 = getpix1(gradientMagnitude,y-1+pixNeighbors[0].y,x-1+pixNeighbors[0].x,width);
          let pix2 = getpix1(gradientMagnitude,y-1+pixNeighbors[1].y,x-1+pixNeighbors[1].x,width);
          if (pix1 > gradientMagnitude[index] ||
              pix2 > gradientMagnitude[index] ||
              (pix2 === gradientMagnitude[index] &&
              pix1 < gradientMagnitude[index]))
            setpix1(copy,y,x,width, 0);
          else
            setpix1(copy,y,x,width, getpix1(gradientMagnitude,y,x,width));
        }
      }
  //  console.log("thresholding")
    let gradientMagnitudeLt = copy.map(value => value>lt ? value:0);
  //  console.log("hysterisis");
    let _traverseEdge = function(current, imgData,width,height, threshold, traversed) {
        let group = [current];
        let neighbors = getEdgeNeighbors(current, imgData,width,height, threshold, traversed);
        for(let i = 0; i < neighbors.length; i++){
          group = group.concat(_traverseEdge(neighbors[i], imgData, threshold, traversed.concat(group)));}
        return group;};
    let getEdgeNeighbors = function(inn, imgData,width,height, threshold, includedEdges) {
        let neighbors = []
        let x = inn%width, y= (inn-x)/width,r=1;
        for(let i=x-r;i<x+r;i++){
          for(let j=y-r;j<y+r;j++){
            let index = j*width+i;
            if(inn==index)continue;
            if(index<0)continue;
            if(imgData[index]>threshold && (includedEdges === undefined || includedEdges.indexOf(index) === -1))
              neighbors.push(index);}}
        return neighbors;};
    let realEdges = []
    for (let y = 1; y < height - 1; y++)
        for (let x = 1; x < width - 1; x++) {
            index = y * width + x;
            if (gradientMagnitudeLt[index] > ut && realEdges[index] === undefined) {//accept as a definite edge
                let group = _traverseEdge(index, gradientMagnitudeLt,width,height, ut, []);
                for(let i = 0; i < group.length; i++)
                  realEdges[group[i]] = true;
              }
        }
    for (let y = 1; y < height - 1; y++)
        for (let x = 1; x < width - 1; x++) {
            index = y * width + x;
            if (realEdges[index] === undefined)
              setpix1(gradientMagnitudeLt,y,x,width, 0);
             else
              setpix1(gradientMagnitudeLt,y,x,width, 255);
          }
    //console.timeEnd('Canny');
    if (ch==4) copycolor(gradientMagnitudeLt,imgData.data,width,height);
    else imgData = {data:gradientMagnitudeLt,width:width,height:height};
    return imgData;
}

/*******************************************************************************************************************************************************************/
/*******************************************************************************************************************************************************************/
/*******************************************************************************************************************************************************************/
/** Apply Conv 1
*@param {1ch Array} image
*@param {int} width
*@param {int} height
*@param {2D array} kernel
*@return {1ch Array} Data
**/
// Corners are ignored
function conv_1(data,width,height, kernel){
  let kernelSizey = kernel.length;
  let kernelSizex = kernel[0].length;
  let kernelSizey2 = Math.floor(kernelSizey/2)
  let kernelSizex2 = Math.floor(kernelSizex/2)
  let newdata = new Array(width*height);

  let sumk=0;
  for(let x = 0; x < kernelSizex; x++)
      for(let y = 0; y < kernelSizey; y++)
        sumk+=kernel[y][x];
  if(!sumk)sumk=1;

  let x1=0,x2=width-kernelSizex;
  let y1=0,y2=height-kernelSizey;
  for(let i=x1;i<x2;i+=1){
    for(let j=y1;j<y2;j+=1){
      let sum=0;
      for(let x = 0; x < kernelSizex; x++){
          for(let y = 0; y < kernelSizey; y++){
            let px = getpix1(data,j+y,i+x,width);
            sum += px*kernel[y][x];
          }
        }
        let col = ~~(sum/sumk);
        setpix1(newdata,j+kernelSizey2,i+kernelSizex2,width,col);
    }
  }
  return newdata;
}
// 4-->1
function grayscale(data,width,height){
  let x1=0,x2=width;
  let y1=0,y2=height;
  let newdata = new Array(width*height);
  for(let i=x1;i<x2;i+=1){
    for(let j=y1;j<y2;j+=1){
      let p = j*width+i;
      let px = p*4;
      let sum = ~~((data[px]+data[px+1]+data[px+2])/3);
      newdata[p] = sum;
    }
  }
  return newdata;
}
// 1 --> 4 with color
function mapcolor(bw,color,width,height){
  let x1=0,x2=width;
  let y1=0,y2=height;
  for(let i=x1;i<x2;i+=1){
    for(let j=y1;j<y2;j+=1){
      let p = j*width+i;
      let px = p*4;
      let num = 3*bw[p], den = (color[px]+color[px+1]+color[px+2]);
      color[px] = clip((num*color[px])/den); color[px+1] = clip((num*color[px+1])/den); color[px+2] = clip((num*color[px+2])/den);
    }
  }
}
// 1 --> 4 without color
function copycolor(bw,color,width,height){
  let x1=0,x2=width;
  let y1=0,y2=height;
  for(let i=x1;i<x2;i+=1){
    for(let j=y1;j<y2;j+=1){
      let p = j*width+i;
      let px = p*4;
      let bwpx = clip(bw[p]);
      color[px] = bwpx; color[px+1] = bwpx; color[px+2] = bwpx;
    }
  }
}
// Crop the image Array
function recrop(data,width,height,is,js,sx,sy){
  if(is == 0 && js==0 && sx==width && sy==height)
    return data;
  let x1=is,x2=is+sx;
  let y1=js,y2=js+sy;
  let newdata = new Array(4*sx*sy);
  for(let i=x1;i<x2;i+=1){
    for(let j=y1;j<y2;j+=1){
      let px = getpix4(data,j,i,width);
      setpix4(newdata,j-js,i-is,sx,px);
    }
  }
  return newdata;
}
function getpix1(data,i,j,offset){
  return data[i*offset+j];
}
function getpix4(data,i,j,offset){
  let p = i*offset+j;
  return [data[4*p],data[4*p+1],data[4*p+2],data[4*p+3]];
}
function setpix1(data,i,j,offset,col){
  data[i*offset+j]=col;
}
function setpix4(data, i,j,offset, newcol){
  let p = i*offset+j;
  data[4*p] = newcol[0]; data[4*p+1] = newcol[1]; data[4*p+2] = newcol[2]; data[4*p+3] = newcol[3];
}
function clip(a){
  a = ~~(a);
  if(a<0)a=0;
  else if(a>255)a=255;
  return a;
}
function buildcdf(hist, num_bins, num_pixels, clipLimit){
    let excess = 0;
    for(let i=0;i<num_bins;++i){
        hist[i] = hist[i] / num_pixels;
        if(hist[i]>clipLimit){
            excess = excess + hist[i] - clipLimit;
            hist[i] = clipLimit;
        }
    }
    let addExcess = excess/num_bins;
    let cumuhist = [];
    cumuhist[0] = hist[0] + addExcess;
    for(let i=1;i<num_bins;++i)
        cumuhist[i] = cumuhist[i-1] + hist[i] + addExcess;
    return cumuhist;
}
function histogram(intens, x1, y1, x2, y2, numBins, h, w) {
  let hist = [];
  for (let i=0; i<numBins; ++i) {
    hist[i] = 0;
  }
  for (let y=y1; y<y2; ++y) {
    for (let x=x1; x<x2; ++x) {
      let idx;
      if (x>=w && y<h) {
        idx = (y * w + (w - 1));
      } else if (y>=h && x<w) {
        idx = ((h-1) * w + x);
      } else if (y>=h && x>=w) {
        idx = (h * w) - 1;
      } else {
        idx = (y * w + x);
      }
      let val = Math.floor(intens[idx]);
      hist[val]++;
    }
  }
  return hist;
}
