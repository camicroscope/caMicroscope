const store = new Store('../../data/');

async function populateList() {
  // clear any previous
  document.getElementById('output').innerHTML = '';
  console.log('populating list...');
  nameField = 'name';
  // get slide and associated result information
  let slides = [];
  let results = {};
  let slideList = document.getElementById('slide_id').value;
  slideList = slideList.replace(/\s+/g, '');
  slideList = slideList.split(',');
  for (let id of slideList) {
    //next line is for testing only
    let slide = [{ _id: { "$oid": id }, name: "Mock Slide", type: "slide" }];
    slide = slide[0];
    if (slide && slide['_id']) {
      let s = {'id': slide['_id']['$oid'], 'name': slide['name'], 'type': 'slide', 'raw': slide};
      console.log(s);
      slides.push(s);
      // get associated result types
      r = [];
      for (let a of await store.findMarkTypes(slide['_id']['$oid'], 'computer')) {
        console.log(a);
        r.push({'id': a['execution_id'], 'name': a['name'], 'type': 'computer mark'});
      }
      for (let a of await store.findMarkTypes(slide['_id']['$oid'], 'human')) {
        console.log(a);
        r.push({'id': a['_id']['analysis']['execution_id'], 'name': a['_id']['analysis']['name'], 'type': 'human mark'});
      }
      // todo -- is this right for heatmapType results?
      for (let a of await store.findHeatmapType(slide['_id']['$oid'])) {
        r.push({'id': a['provenance']['analysis']['execution_id'],
          'name': a['provenance']['analysis']['execution_id'], 'type': 'heatmap'});
      }
      results[slide['_id']['$oid']] = r;

      document.querySelectorAll('.slide-checkbox').forEach(parentCheckbox => {
        parentCheckbox.addEventListener('change', function() {
            let slideId = this.getAttribute('data-id');
            let childCheckboxes = document.querySelectorAll(`.result[data-target="${slideId}"]`);
            
            childCheckboxes.forEach(childCheckbox => {
                childCheckbox.checked = parentCheckbox.checked;
            });
        });
    });
    
  }
  }

  let headers = ['name', 'id', 'type'];
  let t = document.createElement('table');
  t.id = 'tree-table';
  t.classList.add('table', 'table-hover', 'table-bordered');
  // add headers
  let table = document.createElement('tbody');
  let headerTr = document.createElement('tr');
  for (let z of headers) {
    let th = document.createElement('th');
    th.innerText = z || '?';
    headerTr.appendChild(th);
  }
  // add select header special
  let selectTh = document.createElement('th');
  selectTh.innerText = 'Select';
  headerTr.appendChild(selectTh);
  table.append(headerTr);
  // populate results
  for (let x of slides) {
    let parent = document.createElement('tr');
    parent.setAttribute('data-id', x.id);
    parent.setAttribute('data-parent', 0);
    parent.setAttribute('data-level', 1);
    for (let z of headers) {
      let d = document.createElement('td');
      d.innerText = x[z] || '?';
      if (z==nameField) {
        d.setAttribute('data-column', 'name');
      }
      parent.appendChild(d);
    }

    // Add special checkbox for parent row
    let parentCheck = document.createElement('input');
    parentCheck.classList.add('form-check-input', 'slide-checkbox');
    parentCheck.type = 'checkbox';
    parentCheck.setAttribute('data-id', x.id);

    // Append checkbox to the parent row
    let parentTd = document.createElement('td');
    parentTd.appendChild(parentCheck);
    parent.appendChild(parentTd);

    // TODO -- finish this. you'd want to add logic that sets this checkbox to true, false or indeterminate
    //         depending on children selection. also select/deselect all children on change of this.
    // parent.appendChild(parentCheck);
    table.appendChild(parent);
    for (let y of results[x.id]) {
      console.log(x.raw);
      let child = document.createElement('tr');
      child.setAttribute('data-id', x.id+'-'+y.id);
      child.setAttribute('data-parent', x.id);
      child.setAttribute('data-level', 2);
      for (let z of headers) {
        let d = document.createElement('td');
        d.innerText = y[z] || '?';
        if (z==nameField) {
          d.setAttribute('data-column', 'name');
        }
        child.appendChild(d);
      }
      // Add checkbox for child row
      let childCheck = document.createElement('input');
      childCheck.type = 'checkbox';
      childCheck.classList.add('form-check-input', 'result');
      childCheck.setAttribute('data-target', x.id);
      childCheck.setAttribute('data-self', y.id);
      childCheck.setAttribute('data-slideInfo', JSON.stringify(x.raw));
      childCheck.setAttribute('data-type', y.type);
      childCheck.checked = true;

      // Append checkbox to the child row
      let childTd = document.createElement('td');
      childTd.appendChild(childCheck);
      child.appendChild(childTd);

    }
  }
  t.appendChild(table);
  document.getElementById('output').appendChild(t);
  makeTreeTable('tree-table');
}

async function downloadResults() {
  let checks = document.querySelectorAll('.result:checked');
  let marks = [];
  let heatmaps = [];
  for (let c of checks) {
    console.log(c.dataset);
    let parentSlide = JSON.parse(checks[0].dataset.slideinfo);
    if (c.dataset.type == 'human mark' || c.dataset.type == 'human mark') {
      let mark = await store.getMarkByIds([c.dataset.self], c.dataset.target);
      for (m of mark) {
        m.provenance.image = parentSlide;
        marks.push(m);
      }
      console.log(mark);
    } else if (c.dataset.type == 'heatmap' ) {
      let hm = await store.getHeatmap(c.dataset.parent, c.dataset.target);
      for (h of hm) {
        h.provenance.image = parentSlide;
        heatmaps.push(h);
      }
    }
  }
  console.log(marks, heatmaps);
  if (marks.length) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(marks)));
    element.setAttribute('download', 'camic_export_marks.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  if (heatmaps.length) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(heatmaps)));
    element.setAttribute('download', 'camic_export_heatmaps.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  // tell the user that data is missing
  if (!heatmaps.length && !marks.length) {
    alert('No data selected for download.');
  }
}
