// initalize store, dependency
let _STORE = new Store('../../data/');
var $D = {};
_STORE.getCurrentUser().then((resp)=>{
  if (resp.status!=200) {
    window.location.href = '../error/401.html';
  }
  return resp;
}).then((resp)=> resp.json()).then((user)=>{
  if (Array.isArray(user)&&user.length==0) {
    window.location.href = '../error/401.html';
  }
  if (Array.isArray(user)&&user.length > 0) {
    $D.user = user[0];
    if (user[0].userType!=='Admin') {
      window.location.href = '../landing/landing.html';
    }
  }
});


function addToStatus(text) {
  let status = document.getElementById('status');
  let li = document.createElement('li');
  li.innerText = text;
  status.prepend(li);
}

function postDoc(dataType, data) {
  if (dataType == 'mark') {
    _STORE.addMark(data).then(console.log);
  } else if (dataType == 'heatmap') {
    _STORE.addHeatmap(data).then(console.log);
  } else {
    console.error('Unknown type ', dataType);
  }
}

// borrowed conversion helper?
function csv2Json(csv) {
  const lines = csv.split('\n');
  const result = [];
  const headers = lines[0].split(',');
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) {
      continue;
    }
    const obj = {};
    const currentline = lines[i].split(',');
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }
    result.push(obj);
  }
  return result;
}

function getManifest() {
  return new Promise(function(res, rej) {
    var files = document.getElementById('manifestSelect').files;
    if (files.length) {
      let reader = new FileReader();
      // callbacks
      reader.onload = function(e) {
        let manifest = csv2Json(e.target.result);
        console.info('got manifest');
        // convert to filename as key
        let keyedManifest = {};
        for (let x of manifest) {
          let f = x.file || x.filename;
          if (!f) {
            rej(new Error('Could not find file reference in manifest.'));
          } else {
            delete x['file'];
            delete x['filename'];
            keyedManifest[f] = x;
          }
        }
        console.info(keyedManifest);
        res(keyedManifest);
      };
      reader.onerror = console.error;
      reader.readAsText(files[0]);
    } else {
      res(false);
    }
  });
}


function getImportFiles() {
  let files = document.getElementById('importSelect').files;
  console.info('got ' + files.length + ' files');
  return files;
}

function importFile(file, dataType, manifestRecord) {
  return new Promise(function(res, rej) {
    let r = new FileReader();
    // callbacks
    r.onload = function(e) {
      let data = JSON.parse(e.target.result);
      // put into array if not already
      if (!Array.isArray(data)) {
        data = [data];
      }
      console.log(data);
      for (let record of data) {
        record.provenance = record.provenance || {};
        record.provenance.image = record.provenance.image || {};
        // inject relevant manifest data
        let manifestId = manifestRecord['slideId'] || manifestRecord['nodeId'] || manifestRecord['id'];
        if (manifestId) record.provenance.image['slideId'] = manifestId;
        let manifestSlide = manifestRecord['slide'] || manifestRecord['name'];
        console.log(manifestSlide);
        if (manifestSlide) record.provenance.image['slide'] = manifestSlide;
        let manifestStudy = manifestRecord['study'];
        if (manifestStudy) record.provenance.image['study'] = manifestStudy;
        let manifestSpecimen = record['specimen'] || record['subject'];
        if (manifestSpecimen) record.provenance.image['specimen'] = manifestSpecimen;
        // if we have a pre-given slide id, use that and don't look up
        let slideId = record['slideId'] || record['nodeId'] || record['id'];
        if (slideId) {
          postDoc(dataType, data);
        } else {
          // otherwise, inject slide lookup based on manifest or document attrs
          let slide = record.provenance.image['slide'] || record.provenance.image['name'];
          let specimen = record.provenance.image['specimen'] || record.provenance.image['subject'];
          let study = record.provenance.image['study'];
          console.log(slide, specimen, study);
          let lookup = _STORE.findSlide(slide, specimen, study).then((x)=>{
            record.provenance.image.slide = x[0]['_id']['$oid'];
            console.log(record);
            addToStatus('Found a match for slide ' + slide);
            return record;
          });
          lookup.then((x)=>postDoc(dataType, data)).then(console.log)
              .then((x)=>addToStatus('Posted  a ' + dataType))
              .catch((e)=>{
                console.error(e);
                addToStatus('Error posting a ' + dataType);
              });
        }
      }
      res(true); // note that find/post callbacks may not be done
    };
    r.onerror = console.error;
    r.readAsText(file);
  });
}

async function runImport() {
  let dataType = document.getElementById('dataType').value;
  // get manifest if exists
  manifest = await getManifest();
  let files = getImportFiles();
  for (let file of files) {
    let manifestRecord = {};
    if (dataType == 'slide') {
      // insert data from manifest if applicable
      if (manifest) {
        manifestRecord = manifest[file.name] || {};
      }
      // upload the file to the load service
      let fileUpload = await startUpload(file.name)
          .then((x)=>continueUpload(x, file))
          .then((x)=>finishUpload(x, file.name))
          .then((x)=>{
            addToStatus('Uploaded file ' + file.name);
          }).catch((e)=>{
            console.error(e);
            addToStatus('Error uploading file ' + file.name);
          });
      // TODO lookup fields (e.g. mpp) from load service
      let record = manifestRecord || {};
      record.name = record.name || file.name.split('.').join('_');
      record.specimen = record.specimen || '';
      record.study = record.study || '';
      record.location = record.location || '/images/' + file.name;
      let slidePost = await _STORE.addSlide(record).then((x)=>{
        addToStatus('Added slide ' + record.name);
      }).catch((e)=>{
        addToStatus('Error adding slide ' + record.name);
      });
    } else {
      // insert data from manifest if applicable
      if (manifest) {
        manifestRecord = manifest[file.name] || {};
      }
      importFile(file, dataType, manifestRecord).then(console.log)
          .then((x)=>{
            addToStatus('Imported a ' + dataType);
          }).catch((e)=>{
            console.error(e);
            addToStatus('Error Importing a ' + dataType);
          });
    }
  }
}

document.getElementById('start').addEventListener('click', runImport, false);
