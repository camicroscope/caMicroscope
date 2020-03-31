//--------------------------------------------------
// name: colorDeconvolution
// description: Split image into three channels: H&E
//--------------------------------------------------
function colorDeconvolution(image, doIshow) {
  //Set stain values
  let MODx = [], MODy = [], MODz = []; // length 3
  let cosx = [], cosy = [], cosz = []; // length 3
  let len = []; // length 3
  let q = []; // length 9
  let Rlog = 0.0, Blog = 0.0, Glog = 0.0; // 
  let log255=Math.log(255.0);
  let size = image.cols*image.rows;
  if(doIshow) console.log('size: ',size);
  

  let outputStack = [];
  outputStack[0] = [];
  outputStack[1] = [];
  outputStack[2] = [];
  
  // Stain defined
  // GL Haem matrix
  MODx[0]= 0.644211; //0.650;
  MODy[0]= 0.716556; //0.704;
  MODz[0]= 0.266844; //0.286;
  // GL Eos matrix
  MODx[1]= 0.092789; //0.072;
  MODy[1]= 0.954111; //0.990;
  MODz[1]= 0.283111; //0.105;
  // Zero matrix
  MODx[2]= 0.0;
  MODy[2]= 0.0;
  MODz[2]= 0.0;

  for (i=0; i<3; i++){
    //normalise vector length
    cosx[i]=cosy[i]=cosz[i]=0.0;
    len[i]=Math.sqrt(MODx[i]*MODx[i] + MODy[i]*MODy[i] + MODz[i]*MODz[i]);
    if (len[i] != 0.0){
      cosx[i]= MODx[i]/len[i];
      cosy[i]= MODy[i]/len[i];
      cosz[i]= MODz[i]/len[i];
    }
  }


  // translation matrix
  if (cosx[1]==0.0){ //2nd colour is unspecified
    if (cosy[1]==0.0){
      if (cosz[1]==0.0){
        cosx[1]=cosz[0];
        cosy[1]=cosx[0];
        cosz[1]=cosy[0];
      }
    }
  }

  if (cosx[2]==0.0){ // 3rd colour is unspecified
    if (cosy[2]==0.0){
      if (cosz[2]==0.0){
        if ((cosx[0]*cosx[0] + cosx[1]*cosx[1])> 1){
          cosx[2]=0.0;
        }
        else {
          cosx[2]=Math.sqrt(1.0-(cosx[0]*cosx[0])-(cosx[1]*cosx[1]));
        }

        if ((cosy[0]*cosy[0] + cosy[1]*cosy[1])> 1){
          if (doIshow)
            console.log("Colour_3 has a negative G component.");
          cosy[2]=0.0;
        }
        else {
          cosy[2]=Math.sqrt(1.0-(cosy[0]*cosy[0])-(cosy[1]*cosy[1]));
        }

        if ((cosz[0]*cosz[0] + cosz[1]*cosz[1])> 1){
          if (doIshow)
            console.log("Colour_3 has a negative B component.");
          cosz[2]=0.0;
        }
        else {
          cosz[2]=Math.sqrt(1.0-(cosz[0]*cosz[0])-(cosz[1]*cosz[1]));
        }
      }
    }
  }

  leng=Math.sqrt(cosx[2]*cosx[2] + cosy[2]*cosy[2] + cosz[2]*cosz[2]);

  cosx[2]= cosx[2]/leng;
  cosy[2]= cosy[2]/leng;
  cosz[2]= cosz[2]/leng;

  for (i=0; i<3; i++){
    if (cosx[i] == 0.0) cosx[i] = 0.001;
    if (cosy[i] == 0.0) cosy[i] = 0.001;
    if (cosz[i] == 0.0) cosz[i] = 0.001;
  }

  //matrix inversion
  A = cosy[1] - cosx[1] * cosy[0] / cosx[0];
  V = cosz[1] - cosx[1] * cosz[0] / cosx[0];
  C = cosz[2] - cosy[2] * V/A + cosx[2] * (V/A * cosy[0] / cosx[0] - cosz[0] / cosx[0]);
  q[2] = (-cosx[2] / cosx[0] - cosx[2] / A * cosx[1] / cosx[0] * cosy[0] / cosx[0] + cosy[2] / A * cosx[1] / cosx[0]) / C;
  q[1] = -q[2] * V / A - cosx[1] / (cosx[0] * A);
  q[0] = 1.0 / cosx[0] - q[1] * cosy[0] / cosx[0] - q[2] * cosz[0] / cosx[0];
  q[5] = (-cosy[2] / A + cosx[2] / A * cosy[0] / cosx[0]) / C;
  q[4] = -q[5] * V / A + 1.0 / A;
  q[3] = -q[4] * cosy[0] / cosx[0] - q[5] * cosz[0] / cosx[0];
  q[8] = 1.0 / C;
  q[7] = -q[8] * V / A;
  q[6] = -q[7] * cosy[0] / cosx[0] - q[8] * cosz[0] / cosx[0];

  //console.log("DeCon Values:",MODx,MODy,MODz,cosx,cosy,cosz,A,V,C,q);

  let pixels = image.data;
    let newpixels = [];
  newpixels[0] = [];
  newpixels[1] = [];
  newpixels[2] = [];
  
  let rows = image.rows;
  let cols = image.cols;
  let asize = pixels.length;
  let jmod = 0;
  for (j=0;j<asize;j+=3){
    // log transform the RGB data
    let R = pixels[j];
    let G = pixels[j+1];
    let B = pixels[j+2];
    Rlog = -((255.0*Math.log((R+1)/255.0))/log255);
    Glog = -((255.0*Math.log((G+1)/255.0))/log255);
    Blog = -((255.0*Math.log((B+1)/255.0))/log255);
    for (i=0; i<3; i++){
      // rescale to match original paper values
      Rscaled = Rlog * q[i*3];
      Gscaled = Glog * q[i*3+1];
      Bscaled = Blog * q[i*3+2];
      output = Math.exp(-((Rscaled + Gscaled + Bscaled) - 255.0) * log255 / 255.0);
      if(output>255) output=255;
      jmod = (j==0 ? 0 : j/3);
      newpixels[i][jmod]=(0xff & (Math.floor(output+.5)));
    }
  }

  outputStack[0] = newpixels[0].slice(0);
  outputStack[1] = newpixels[1].slice(1);
  outputStack[2] = newpixels[2].slice(2);
  
  let ilen=outputStack[0].length;
  let iarr = new Uint8ClampedArray(ilen*4);

  for(i=0,j=0;i<ilen;i++,j+=4){
      iarr[j] = outputStack[0][i];
      iarr[j+1] = outputStack[0][i];
      iarr[j+2] = outputStack[0][i];
      iarr[j+3] = 255;
  }
  // output = iarr;
  console.log(outputStack,iarr);
  return(iarr.slice(0));
}

//--------------------------------------------------
//Helper functions and declarations
//--------------------------------------------------

//--------------------------------------------------
// Convert Canvas to Multi Channel RGB Array
//--------------------------------------------------
function canvas2RGBArray(image,cols,rows) {
  let m=[];
  let x=0;
  let size = cols*rows;
  for(i=0;i<=2;i++) {
    let arr=[];
    for(j=0;j<size;j++) {
      arr[j]=image.data[j+x]
      }
    m[i] = arr;
    x+=size;
  }
  return m;
}
