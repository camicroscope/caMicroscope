var UNIQUES = {};
var $collectionList;
var $collectionTree;
var $slideData;
let filterVars = ['study', 'subject'];
filterVars.forEach((x)=>{
  UNIQUES[x] = new Set();
  UNIQUES[x].add('(ALL)');
  UNIQUES[x].add('(EMPTY)');
});

// render each thumbnail
function renderSlide(data) {
  // make div and anchor
  let div = document.createElement('div');
  let anchor = document.createElement('a');
  div.classList.add('slidebox');
  let loc = data.location;
  // add thumbnail
  let thumbnailUrl = `url(../../img/IIP/raw/?FIF=${loc}&WID=200&CVT=.jpg)`;
  div.style.backgroundImage = thumbnailUrl;
  // add label text
  let label = document.createElement('div');
  label.classList.add('namebox');
  label.classList.add('bg-dark');
  label.innerText = data.name;
  label.title = data.name;
  div.appendChild(label);
  // populate uniques
  filterVars.forEach((x)=>{
    UNIQUES[x].add(data[x]);
    anchor.dataset[x] = data[x];
  });
  // add checkmark if reviewed, for now
  if (data.review) {
    let checkmark = document.createElement('p');
    checkmark.classList.add('checkmark');
    checkmark.innerText = '✔';
    checkmark.title = 'reviewed';
    div.appendChild(checkmark);
  }
  // add to the link
  anchor.href = `../viewer/viewer.html?slideId=${data['_id']['$oid']}`;
  anchor.appendChild(div);
  // use html elem dataset for filtering
  let searchStr = '';
  searchStr += data.study + ' ' + data.specimen + ' ' + data.name;
  if (data.review) {
    searchStr += ' ' + 'reviewed';
  }
  anchor.dataset.searchable = searchStr;
  document.getElementById('table').appendChild(anchor);
}

// initialization routine
function init(filters) {
  const STORE = new Store('../../data/');
  STORE.addSurvey({
    first: 'test_first',
    second: 'test_second',
    email: 'email@test.com',
  }).then((data) => {
    console.log(data);
  });

  STORE.getAllCollection().then((data) => {
    if (Array.isArray(data)) {
      $collectionList = data.map((d)=>{
        d.id = d._id.$oid;
        delete d._id;
        return d;
      });
      $collectionTree = listToTree(data);


      $('#collection-tree-view').jstree({
        'core': {
          'data': $collectionTree,
          'multiple': false,
          'check_callback': true,
        },
        'types': {
          '#': {'max_children': 1, 'max_depth': 4, 'valid_children': ['default']},
          'default': {'valid_children': ['default']},
        },
        'plugins': ['search', 'wholerow'],
      });

      showMessage();
      // $('#collection-tree-view').on('loaded.jstree', () => {
      //   if (data.length == 0) $('#coll-message').show();
      // });

      // bind select node event
      $('#collection-tree-view').on('select_node.jstree', function(event, _data) {
        const node = _data.node;
        if (node.children.length > 0) {
          showMessage();
          return;
        }
        hideMessage();


        const slides = $slideData.filter((d)=>d.collections&&d.collections.includes(node.id));
        $('#table').empty();
        $('#table').show();
        if (slides.length) {
          slides.forEach(renderSlide);
        } else {
          showEmptyMessage();
        }

        // if ( _selectedNodeId === _data.node.id ) {
        //   // unselected node
        //   _data.instance.deselect_node(_data.node);
        //   _selectedNodeId = null;
        //   //
        //   selectCollectionHandler(null);
        //   // hide rename/remove btns
        //   $('#col-rename').hide();
        //   $('#col-delete').hide();
        // } else {
        //   // selected node
        //   _selectedNodeId = _data.node.id;
        //   // show rename/remove btns

        //   $('#col-rename').show();
        //   $('#col-delete').show();
        //   selectCollectionHandler(_data.node);

        // show up breadcrum
        // }
      });
    } else {
      // error message

    }
  });


  // get slide data w/filters
  STORE.findSlide().then((x)=>{
    $slideData = x;
    // x.forEach(renderSlide);
  });
}

function onSearch() {
  let inputs = document.querySelectorAll('input');
  let search = '';
  let checks = {};
  filterVars.forEach((x)=>{
    checks[x] = new Set();
  });
  for (i of inputs) {
    if (i.type == 'search') {
      search = i.value;
    } else if (i.type == 'checkbox') {
      checks[i.dataset.field].add(i.dataset.value);
    }
  }
  let query = document.getElementById('searchbar').value;
  // get list of anchor elems and hide ones which don't match
  let slides = document.getElementById('table').children;
  for (let i = 0; i < slides.length; i++) {
    let matchesSearchbar = slides[i].dataset.searchable.includes(query);
    let matchesCheckboxes = true;
    if (matchesSearchbar && matchesCheckboxes) {
      slides[i].style.display='';
    } else {
      slides[i].style.display='none';
    }
  }
}

// handle filters

function initFilters(uniques) {
  let isFirstList = true;
  Object.keys(uniques).forEach((x)=>{
    console.log(x, uniques[x]);
    let pane = document.createElement('div');
    pane.classList.add('tab-pane');
    pane.classList.add('fade');
    pane.id = x;
    pane.setAttribute('role', 'tabpanel');
    pane.setAttribute('aria-labelledby', x + '-tab');
    if (isFirstList) {
      isFirstList = false;
      pane.classList.add('active');
      pane.classList.add('show');
    }
    let listGroup = document.createElement('div');
    listGroup.classList.add('list-group');
    pane.appendChild(listGroup);
    for (y of uniques[x]) {
      `<div class="tab-pane fade" id="subject" role="tabpanel" aria-labelledby="subject-tab">
        <div class="list-group">
          <label class="list-group-item">
            <input class="form-check-input me-1" type="checkbox" value="">
            3 checkbox
          </label>
          <label class="list-group-item">
            <input class="form-check-input me-1" type="checkbox" value="">
            4 checkbox
          </label>
        </div>
      </div>`;
      let label = document.createElement('label');
      label.classList.add('list-group-item');
      let input = document.createElement('input');
      input.classList.add('form-check-input');
      input.classList.add('me-1');
      input.setAttribute('type', 'checkbox');
      input.value = y;
      input.dataset.field = x;
      input.dataset.value = y;
      label.appendChild(input);
      let labelText = document.createElement('span');
      labelText.innerText = y;
      label.appendChild(labelText);
      listGroup.appendChild(label);
    }
    document.getElementById('tabContent').appendChild(pane);
  });
}

function createTabs(vars) {
  let tabContainer = document.getElementById('tabContainer');
  let isFirstTab = true;
  vars.forEach((x)=>{
    console.log(x);
    // create tab pane button
    let button = document.createElement('button');
    button.classList.add('nav-link');
    button.id = x + '-tab';
    button.setAttribute('data-bs-toggle', 'tab');
    button.setAttribute('data-bs-target', '#' + x);
    button.setAttribute('type', 'button');
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', x);
    if (isFirstTab) {
      isFirstTab = false;
      button.classList.add('active');
    }
    button.innerText = x;
    // create <li class="nav-item" role="presentation">
    let li = document.createElement('li');
    li.classList.add('nav-item');
    button.setAttribute('role', 'presentation');
    li.appendChild(button);
    tabContainer.appendChild(li);
  });
}
console.log(UNIQUES);
createTabs(filterVars);
initFilters(UNIQUES);

// TODO get url params
filters = {};
// initialize with url params as filters
init(filters);

function listToTree(list) {
  var map = {}; var node; var roots = []; var i;

  for (i = 0; i < list.length; i += 1) {
    map[list[i].id] = i; // initialize the map
    list[i].children = []; // initialize the children
  }

  for (i = 0; i < list.length; i += 1) {
    node = list[i];
    if (node.pid) {
      // if you have dangling branches check that map[node.parentId] exists
      list[map[node.pid]].children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function showMessage() {
  $('#table').empty();
  $('#table').html(`<div id="message" class="alert alert-warning" role="alert">
    Please Select A Collection Without Subcollection on Right Collection Tree</div>`);
  $('#table').show();
}

function hideMessage() {
  $('#table').hide();
}

function showEmptyMessage() {
  $('#table').empty();
  $('#table').html(`<div id="message" class="alert alert-warning" role="alert">
    The Selected Collection Is Empty. Please Add Slides Into It.</div>`);
  $('#table').show();
}
