const store = new Store('../../data');

function prepareAnnot() {
  try {
    let output = JSON.parse(document.getElementById('input').value);
    output['provenance']['image']['slide'] = document.getElementById('slide_id').value;
    output['provenance']['analysis']['execution'] = document.getElementById('annot_name').value;
    output['properties']['annotations']['name'] = document.getElementById('annot_name').value;
  } catch (e) {
    alert(e);
  }
  document.getElementById('output').innerHTML = JSON.stringify(output);
}

function saveAnnot() {
  try {
    let doc = JSON.parse(document.getElementById('output').value);
    store.addMark(doc).then((x)=>alert('done!')).catch((e)=>alert(e));
  } catch (e) {
    alert(e);
  }
  
}
