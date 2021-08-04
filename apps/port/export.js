// initalize store, dependency
let _STORE = new Store('../../data/');


function addToStatus(text) {
  let status = document.getElementById('status');
  let li = document.createElement('li');
  li.innerText = text;
  status.prepend(li);
}

async function runExport() {
  // get slide
  let slide = document.getElementById('slideInput').value;
  let dataType = document.getElementById('dataType').value;
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
  let dlAnchorElem = document.getElementById('downloadAnchorElem');
  dlAnchorElem.setAttribute('href', dataStr);
  dlAnchorElem.setAttribute('download', fn);
  dlAnchorElem.click();
}

document.getElementById('start').addEventListener('click', runExport, false);
