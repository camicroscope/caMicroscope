// initalize store, dependency
let _STORE = new Store('../../data/');

let _postFunctions = {
  'slide': _STORE.addSlide,
  'mark': _STORE.addMark,
  'heatmap': _STORE.addHeatmap,
};

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
        for (x of manifest) {
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

function prepareFile(file, dataType, manifestRecord) {
  return new Promise(function(res, rej) {
    let r = new FileReader();
    // callbacks
    r.onload = function(e) {
      let data = JSON.parse(e.target.result);
      console.log(data);
      for (record of data) {
        record.provenance = record.provenance || {};
        record.provenance.image = record.provenance.image || {};
        // inject relevant manifest data
        let manifestId = manifestRecord['slideId'] || manifestRecord['nodeId'] || manifestRecord['id'];
        if (manifestId) record.provenance.image['slideId'] = manifestId;
        let manifestSlide = manifestRecord['slide'] || manifestRecord['name'];
        if (manifestSlide) record.provenance.image['slide'] = manifestSlide;
        let manifestStudy = manifestRecord['study'];
        if (manifestStudy) record.provenance.image['study'] = manifestStudy;
        let manifestSpecimen = record['specimen'] || record['subject'];
        if (manifestSpecimen) record.provenance.image['specimen'] = manifestSpecimen;
        // if we have a pre-given slide id, use that and don't look up
        let slideId = record['slideId'] || record['nodeId'] || record['id'];
        if (slideId) {
          _postFunctions[dataType](record).then(console.log);
        } else {
          // otherwise, inject slide lookup based on manifest or document attrs
          let name = record.provenance.image['slide'] || record.provenance.image['name'];
          let specimen = record.provenance.image['specimen'] || record.provenance.image['subject'];
          let study = record.provenance.image['study'];
          let lookup = _STORE.findSlide(slide, specimen, study).then((x)=>{
            record.provenance.image.slide = x[0]['_id']['$oid'];
            return record;
          });
          lookup.then(_postFunctions[dataType]).then(console.log);
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
  for (file of files) {
    let manifestRecord = {};
    if (dataType == 'slide') {
      // insert data from manifest if applicable
      if (manifest) {
        manifestRecord = manifest[file.name] || {};
      }
      // TODO --
      // upload the file to the load service
      let fileUpload = await startUpload().then((x)=>continueUpload(x, file)).then((x)=>finishUpload(x));
      // lookup required/recommended fields (mpp) from load service -- TODO
      let record = manifestRecord || {};
      // TODO what else goes in this record?
      let slidePost = await _STORE.addSlide(record);
    } else {
      // insert data from manifest if applicable
      if (manifest) {
        manifestRecord = manifest[file.name] || {};
      }
      importFile(file, dataType, manifestRecord).then(console.log);
    }
  }
}

document.getElementById('start').addEventListener('click', runImport, false);
