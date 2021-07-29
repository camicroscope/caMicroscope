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
        // inject relevant manifest data
        // !! TODO fix injection locations to match standard
        let manifestId = manifestRecord['slideId'] || manifestRecord['nodeId'] || manifestRecord['id'];
        if (manifestId) record['slideId'] = manifestId;
        let manifestSlide = manifestRecord['slide'] || manifestRecord['name'];
        if (manifestSlide) record['slide'] = manifestSlide;
        let manifestStudy = manifestRecord['study'];
        if (manifestStudy) record['study'] = manifestStudy;
        let manifestSpecimen = record['specimen'] || record['subject'];
        if (manifestSpecimen) record['specimen'] = manifestSpecimen;
        // if we have a pre-given slide id, use that and don't look up
        // -- slideId or id or nodeId or nid
        let slideId = record['slideId'] || record['nodeId'] || record['id'];
        if (slideId) {
          _postFunctions[dataType](record).then(console.log); // TODO better result page
        } else {
          // otherwise, inject slide lookup based on manifest or document attrs
          // !! TODO fix read locations to match standard
          let name = record['slide'] || record['name'];
          let specimen = record['specimen'] || record['subject'];
          let study = record['study'];
          let lookup = _STORE.findSlide(slide, specimen, study).then((x)=>{
            record.provenance = record.provenance || {};
            record.provenance.image = record.provenance.image || {};
            record.provenance.image.slide = x[0]['_id']['$oid'];
            return record;
          });
          lookup.then(_postFunctions[dataType]).then(console.log); // todo better result page
        }
      }
      res(true); // note that find/post callbacks may not be done
    };
    r.onerror = console.error;
    r.readAsText(file);
  });
}

function runImport() {
  let dataType = document.getElementById('dataType').value;
  // get manifest if exists
  getManifest().then((manifest)=>{
    let files = getImportFiles();
    for (file of files) {
      let manifestRecord = {};
      if (dataType == 'slide') {
        // insert data from manifest if applicable
        if (manifest) {
          manifestRecord = manifest[file.name] || {};
        }
        // TODO --
        // chunked upload process, incl finish this file via load service
        // lookup required fields from load service
        // post slide
      } else {
        // insert data from manifest if applicable
        if (manifest) {
          manifestRecord = manifest[file.name] || {};
        }
        importFile(file, dataType, manifestRecord).then(console.log);
      }
    }
  });
}

document.getElementById('start').addEventListener('click', runImport, false);
