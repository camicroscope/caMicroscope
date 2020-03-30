// expects changeStatus to be defined from loader.js

var startUrl = '../../load/Upload/start';
var continueUrl = '../../load/Upload/continue/';
var finishUrl = '../../load/Upload/finish/';
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
  var part = 0;
  var complete = false;
  while (!complete) {
    try {
      const data = await promiseChunkFileReader(file, part);
      const body = {chunkSize: chunkSize, offset: part*chunkSize, data: data};
      const res = await continueUpload(token)(body);
      part++;
      console.log(part);
    } catch (e) {
      console.log(e);
      changeStatus('UPLOAD', e);
      complete = true;
    }
  }
}


async function handleUpload(selectedFiles) {
  var fnametr = document.getElementById('filenameRow');
  var tokentr = document.getElementById('tokenRow');
  var slidetr = document.getElementById('slidenameRow');
  var idtr = document.getElementById('fileIdRow');

  // Clear existing
  document.getElementById('json_table').innerHTML = '';
  var n = idtr.cells.length;
  for (var i=0; i<n-1; i++) {
    fnametr.deleteCell(1);
    tokentr.deleteCell(1);
    slidetr.deleteCell(1);
    idtr.deleteCell(1);
  }

  var currID = 0;
  // Add columns
  for (var i=0; i<selectedFiles.length; i++, currID++) {
    idtr.insertCell(-1).innerHTML = '<b>'+Number(currID+1)+'<b>';
    fnametr.insertCell(-1).innerHTML = '<input type=text name=filename id=\'filename'+
    currID+'\' value=\''+
    selectedFiles[i]['name']+'\'>';
    tokentr.insertCell(-1).innerHTML = '<input type=text name=token id=\'token'+currID+'\'>';
    slidetr.insertCell(-1).innerHTML = '<input type=text name=slidename id=\'slidename'+currID+'\'>';

    selectedFile = selectedFiles[i];
    const filename = document.getElementById('filename'+currID).value;
    const token = await startUpload(filename);
    const callback = continueUpload(token);
    document.getElementById('token'+currID).value = token;
    readFileChunks(selectedFile, token);
    // parseFile(selectedFile, callback, 0, x=>(changeStatus("UPLOAD", "Finished Reading File")))
  }

  document.getElementById('fileUploadInput').colSpan = selectedFiles.length;
  document.getElementById('controlButtons').colSpan = selectedFiles.length+1;
}

async function startUpload(filename) {
  const body = {filename: filename};
  const token = fetch(startUrl, {method: 'POST', body: JSON.stringify(body), headers: {
    'Content-Type': 'application/json; charset=utf-8',
  }}).then((x)=>x.json());
  try {
    const a = await token;
    changeStatus('UPLOAD', 'Begun upload - Token:' + a['upload_token']);
    return a['upload_token'];
  } catch (e) {
    changeStatus('UPLOAD | ERROR;', e);
  }
}

function continueUpload(token) {
  return async function(body) {
    changeStatus('UPLOAD', 'Uploading chunk at: '+ body.offset +' of size '+ body.chunkSize);
    return await fetch(continueUrl + token, {method: 'POST', body: JSON.stringify(body), headers: {
      'Content-Type': 'application/json; charset=utf-8',
    }});
  };
}
function finishUpload() {
  var reset = true;
  for (var i=0; i<document.getElementById('fileIdRow').cells.length-1; i++) {
    const token = document.getElementById('token'+i).value;
    const filename = document.getElementById('filename'+i).value;
    const body = {filename: filename};
    changeStatus('UPLOAD', 'Finished Reading File, Posting');
    const regReq = fetch(finishUrl + token, {method: 'POST', body: JSON.stringify(body), headers: {
      'Content-Type': 'application/json; charset=utf-8',
    }});
    console.log(i);
    regReq.then((x)=>x.json()).then((a)=>{
      changeStatus('UPLOAD | Finished', a, reset); console.log(a); reset = false;
    });
    regReq.then((e)=> {
      if (e['ok']===false) {
        changeStatus('UPLOAD | ERROR;', e);
        reset = true;
        console.log(e);
      }
    });
  }
}
