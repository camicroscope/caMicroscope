// initalize store, dependency
let _STORE = new Store('../../data/');


function addToStatus(text) {
  let status = document.getElementById('status');
  let li = document.createElement('li');
  li.innerText = text;
  status.prepend(li);
}

const flattenObject = (obj) => {
  let flattenKeys = {};
  for (let i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    // again, don't overflatten arrays
    if ((typeof obj[i]) == 'object' && !(Array.isArray(obj[i]))) {
      let flatObject = flattenObject(obj[i]);
      for (let j in flatObject) {
        if (!flatObject.hasOwnProperty(j)) continue;
        flattenKeys[i + '.' + j] = flatObject[j];
      }
    } else {
      flattenKeys[i] = JSON.stringify(obj[i]);
    }
  }
  return flattenKeys;
};

function json2csv(json) {
  let res = '';
  // get a list of headers, for now just from the first record
  let headers = Object.keys(json[0]);
  // replace newlines with two spaces, commas with one
  let cleanHeaders = headers.map((x)=>x.replaceAll('\n', '  ').replaceAll(',', ' '));
  res += cleanHeaders.join(',');
  res += '\n';
  // append data
  let cleanData = json.map((y)=>{
    r = [];
    for (i of headers) {
      // replace newlines with two spaces, commas with one
      r.push(String(y[i]).replaceAll('\n', '  ').replaceAll(',', ' '));
      console.log(r)
    }
    return r.join(',');
  });
  res += cleanData.join('\n');
  return res;
}

async function runExport() {
  // get slide
  let slide = document.getElementById('slideInput').value;
  let dataType = document.getElementById('dataType').value;
  let outputType = document.getElementById('outType').value;
  // get type
  // get type for slide
  let slideRes = await _STORE.findSlide(slide);
  console.log(slideRes);
  let slideData = slideRes[0];
  let slideId = slideData['_id']['$oid'];
  let res = [];
  if (dataType == 'mark') {
    res = await _STORE.findMark(slideId);
  } else if (dataType = 'heatmap') {
    res = await _STORE.findHeatmap(slideId);
  }
  // for each record, add slide info (name, study, speicmen, etc)
  for (let record of res) {
    // append name at least
    record['provenance']['image']['name'] = slideData['name'];
  }
  console.log(res);
  // trigger download
  let fn = slide + '-' + dataType + 's.json';
  let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res));
  if (outputType == 'csv') {
    console.log(res.map(flattenObject));
    let csvRes = json2csv(res.map(flattenObject));
    console.log(csvRes);
    fn = slide + '-' + dataType + 's.csv';
    dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRes);
  }
  let dlAnchorElem = document.getElementById('downloadAnchorElem');
  dlAnchorElem.setAttribute('href', dataStr);
  dlAnchorElem.setAttribute('download', fn);
  dlAnchorElem.click();
}

document.getElementById('start').addEventListener('click', runExport, false);
