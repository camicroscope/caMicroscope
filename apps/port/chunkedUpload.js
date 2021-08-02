// expects changeStatus to be defined from loader.js

var startUrl = '../loader/upload/start';
var continueUrl = '../loader/upload/continue/';
var finishUrl = '../loader/upload/finish/';
var chunkSize = 5*1024*1024;

// read a chunk of the file
function promiseChunkFileReader(file, part) {
  return new Promise((resolve, reject)=>{
    var fr = new FileReader();
    fr.onload = (evt)=>{
      if (evt.target.error == null) {
        const d = evt.target.result.split(',')[1];
        if (d) {
          resolve(d);
        } else {
          reject(new Error('Done Reading') );
        }
      } else {
        reject(evt.target.error);
      }
    };
    var blob = file.slice(part*chunkSize, (part+1)*chunkSize);
    fr.readAsDataURL(blob);
  });
}

async function readFileChunks(file, token) {

}


// reserve a token
function startUpload() {
  return fetch(startUrl).then((x)=>{
    return x['upload_token'];
  });
}

async function continueUpload(token, file) {
  var part = 0;
  var complete = false;
  while (!complete) {
    try {
      const data = await promiseChunkFileReader(file, part);
      const body = {chunkSize: chunkSize, offset: part*chunkSize, data: data};
      // TODO replace upload call
      const res = await fetch(continueUrl + token, {method: 'POST', body: JSON.stringify(body), headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }});
      part++;
      console.info(part);
    } catch (e) {
      console.log(e);
      complete = true;
    }
  }
  return token;
}

async function finishUpload(token) {
  // finish the upload
  let regReq = await fetch(finishUrl + token, {method: 'POST', body: JSON.stringify(body), headers: {
    'Content-Type': 'application/json; charset=utf-8',
  }});
}
