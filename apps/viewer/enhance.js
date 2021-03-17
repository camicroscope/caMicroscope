
/** Histogram equalization CLAHE
 *@param {ImageData} imgData
 *@param {int} tiles
 *@param {float} clip
 *@return {ImageData} imgData
**/
function clahe (imgData, tiles=32, clip=0.1){
  var tilesize = [tiles, tiles];
  var clipLimit = clip;

  var min=255, max=0;
  var intens=[];
  var levels=[];
  var j=0;

  for (var i=0;i<imgData.data.length;i+=4) {
      intens[j] = (imgData.data[i]+imgData.data[i+1]+imgData.data[i+2] )/3;
      j++;
  }
  // number of bins
  var num_bins = 256;

  var h = imgData.height;

  var w = imgData.width;
  // number of tiles in x and y direction
  var xtiles = Math.ceil(w / tilesize[0]);
  var ytiles = Math.ceil(h / tilesize[1]);

  var cdfs = new Array(ytiles);
  for(var i=0;i<ytiles;i++)
      cdfs[i] = new Array(xtiles);

  var inv_tile_size = [1.0 / tilesize[0], 1.0 / tilesize[1]];

  var cdf = [];
  // create histograms
  for(var i=0;i<ytiles;i++){
      var y0 = i * tilesize[1];
      var y1 = y0 + tilesize[1];
      for(var j=0;j<xtiles;j++)
      {
          var x0 = j * tilesize[0];
          var x1 = x0 + tilesize[0];
          var hist = histogram(intens, x0, y0, x1, y1, num_bins, h, w);

          cdfs[i][j] = buildcdf(hist, num_bins, tilesize[0] * tilesize[1], clipLimit);
      }
  }

  // interpolation and pixel filling
  var finalArray = [];
  var p = 0;
  for(var y=0, idx=0;y<h;++y){
      for(var x=0;x<w;++x, idx+=4){
          // intensity of current pixel
          var I = Math.floor(intens[y*w+x]);

          var tx = x * inv_tile_size[0] - 0.5;
          var ty = y * inv_tile_size[1] - 0.5;

          var xl = Math.max(Math.floor(tx), 0);
          var xr = Math.min(xl+1, xtiles-1);

          var yt = Math.max(Math.floor(ty), 0);
          var yd = Math.min(yt+1, ytiles-1);

          var fx = tx - xl;
          var fy = ty - yt;

          var cdf11 = (cdfs[yt][xl][I]) * 255 ;
          var cdf12 = (cdfs[yd][xl][I]) * 255;
          var cdf21 = (cdfs[yt][xr][I]) * 255;
          var cdf22 = (cdfs[yd][xr][I]) * 255;

          var Iout = (1 - fx) * (1 - fy) * cdf11
              + (1 - fx) *       fy  * cdf12
              +      fx  * (1 - fy) * cdf21
              +      fx  *      fy  * cdf22;

          finalArray[p] = Iout;
          p++;
      }
  }
  var pixelLength = h * w;

  // filling the image
  for (var index = 0, indexToFill = 3; index < pixelLength; index++, indexToFill = indexToFill + 4) {
      var result = finalArray[index];
      var oldsum = imgData.data[indexToFill-3]+imgData.data[indexToFill-2]+imgData.data[indexToFill-1], newsum = result*3;
      var chn = newsum/oldsum;
      if(oldsum<255*3-50 && newsum>50){
        imgData.data[indexToFill-3]= Math.floor(imgData.data[indexToFill-3]*chn);
        imgData.data[indexToFill-2] = Math.floor(imgData.data[indexToFill-2]*chn);
        imgData.data[indexToFill-1] = Math.floor(imgData.data[indexToFill-1]*chn);
        //imgData.data[indexToFill] = 255 - result;
      }
  }
  return imgData;
}


/** Edge detect
 *@param {ImageData} imageData
 *@param {float} threshold
 *@param {int} startx
 *@param {int} starty
 *@param {int} sizex
 *@param {int} sizey
 *@return {ImageData} imageData
**/
function edgedetect(imgData,threshold,is,js,sx,sy){
  var kernelx =
      [[-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]],
      kernely =
          [[-1, -2, -1],
          [0, 0, 0],
          [1, 2, 1]];

  is = Math.floor(is); js = Math.floor(js);
  sx = Math.floor(sx); sy = Math.floor(sy);
  var newdata = new Array(4*sx*sy);
  var imgx = applyfilter(imgData,[kernelx,kernelx,kernelx],is,js,sx,sy);
  console.log("imgx");
  var imgy = applyfilter(imgData,[kernely,kernely,kernely],is,js,sx,sy);
  console.log("imgy");

  for(var i=is;i<is+sx;i++){
    for(var j=js;j<js+sy;j++){
      var ox = getpix(imgData.data,j,i,imgData.width), nx = getpix(imgx,j-js,i-is,sx),ny = getpix(imgy,j-js,i-is,sx);
      var sum = Math.sqrt((nx[0]+nx[1]+nx[2])*(nx[0]+nx[1]+nx[2])/9+(ny[0]+ny[1]+ny[2])*(ny[0]+ny[1]+ny[2])/9);
      sum = sum>threshold? 0:255;
      ox[0] = sum; ox[1] = sum; ox[2]=sum;
      setpix(newdata,j-js,i-is,sx,ox);
    }
  }
  return new ImageData(new Uint8ClampedArray(newdata),sx,sy);
}
/***********************************************************************************************************************/
/** Apply Filter
*@param {ImageData} imageData
*@param {list} kernel
*@param {int} startx
*@param {int} starty
*@param {int} sizex
*@param {int} sizey
 *@return {Array} Data
**/
function applyfilter(imgData, kernel, is,js,sx,sy){
  var kernelSizey = kernel[0].length;
  var kernelSizex = kernel[0][0].length;
  var kernelSizey2 = Math.floor(kernelSizey/2)
  var kernelSizex2 = Math.floor(kernelSizex/2)
  var newdata = new Array(4*sx*sy);
  var data = imgData.data;
  var width = imgData.width, height = imgData.height

  var sumkr=0,sumkg=0,sumkb=0;
  for(var x = 0; x < kernelSizex; x++){
      for(var y = 0; y < kernelSizey; y++){
        sumkr+=(kernel[0][y][x]);
        sumkg+=(kernel[1][y][x]);
        sumkb+=(kernel[2][y][x]);}}
  if(!sumkr)sumkr=1;if(!sumkg)sumkg=1;if(!sumkb)sumkb=1;

  var x1=is-kernelSizex2,x2=is+sx-kernelSizex2;
  var y1=js-kernelSizey2,y2=js+sy-kernelSizey2;
  for(var i=x1;i<x2;i+=1){
    for(var j=y1;j<y2;j+=1){
      var sumr=0,sumg=0,sumb=0;
      for(var x = 0; x < kernelSizex; x++){
          for(var y = 0; y < kernelSizey; y++){
            if(i+x>= width || j+y>=height || i+x<0 || j+y<0) continue;
            var px = getpix(data,j+y,i+x,width);
            sumr += (px[0])*kernel[0][y][x];
            sumg += (px[1])*kernel[1][y][x];
            sumb += (px[2])*kernel[2][y][x];
          }
        }
        var col = getpix(data,j+kernelSizey2,i+kernelSizex2,width);
        col[0] = Math.floor(sumr/sumkr);
        col[1] = Math.floor(sumg/sumkg);
        col[2] = Math.floor(sumb/sumkb);
        setpix(newdata,j-js+kernelSizey2,i-is+kernelSizex2,sx,col);

    }
  }
  return newdata;
}
function getpix(data,i,j,offset){
  var p = i*offset+j;
  return [data[4*p],data[4*p+1],data[4*p+2],data[4*p+3]]
}
function setpix(data, i,j,offset, newcol){
  var p = i*offset+j;
  for(var i = 0;i<newcol.length;i++)
    data[4*p+i] = newcol[i];
}
function buildcdf(hist, num_bins, num_pixels, clipLimit){
        var excess = 0;
        for(var i=0;i<num_bins;++i){
            hist[i] = hist[i] / num_pixels;
            if(hist[i]>clipLimit){
                excess = excess + hist[i] - clipLimit;
                hist[i] = clipLimit;
            }
        }
        var addExcess = excess/num_bins;
        var cumuhist = [];
        cumuhist[0] = hist[0] + addExcess;
        for(var i=1;i<num_bins;++i)
            cumuhist[i] = cumuhist[i-1] + hist[i] + addExcess;

        return cumuhist;
    }
function histogram(intens, x1, y1, x2, y2, num_bins, h, w){
    var hist = [];
    for(var i=0;i<num_bins;++i)
        hist[i] = 0;
    for(var y=y1;y<y2;++y){
        for(var x=x1;x<x2;++x){
            var idx;
            if(x>=w && y<h){
                idx = (y * w + (w - 1));
            }else if(y>=h && x<w){
                idx = ((h-1) * w + x);
            }else if(y>=h && x>=w){
                idx = (h * w) - 1;
            }else{
                idx = (y * w + x);
            }
            var val = Math.floor(intens[idx]);
            hist[val]++;
        }
    }
    return hist;
}
