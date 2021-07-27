// initalize store, dependency
let _STORE = new Store('../../data/');

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
  // todo check len
  var files = document.getElementById('manifestSelect').files;
  if (files.length) {
    let reader = new FileReader();
    // callbacks
    reader.onload = handleManifest;
    reader.onerror = console.error;
    reader.readAsText(files[0]);
  } else {
    return false;
  }
}

function handleManifest(e) {
  let manifest = e.target.result;
  console.info('got manifest file');
  console.log(csv2Json(manifest));
  let filemap = getFilemap();
}

function getFilemap() {
  let files = document.getElementById('importSelect').files;
  let filemap = {};
  console.info('got ' + files.length + ' files');
  for (let x of files) {
    console.log(x.name);
    filemap[x.name] = x;
  }
  console.log(filemap);
  return filemap;
}

function runImport() {
  // get manifest if exists
  let manifest = getManifest();
  let filemap = getFilemap();
  for (file of filemap) {
    console.log(file);
    // insert data from manifest if applicable
    if (manifest) {
      console.info('with manifest');
    }
    // look up slide
    // insert into document
    // post
  }
}

document.getElementById('start').addEventListener('click', runImport, false);
