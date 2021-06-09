var UNIQUES = {};
let filterVars = ['study', 'subject'];
filterVars.forEach((x)=>{
  UNIQUES[x] = new Set();
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
  // get slide data w/filters
  STORE.findSlide().then((x)=>{
    x.forEach(renderSlide);
  });
  // render each one
}

function onSearch() {
  // get search term
  let query = document.getElementById('searchbar').value;
  // get list of anchor elems and hide ones which don't match
  let slides = document.getElementById('table').children;
  for (let i = 0; i < slides.length; i++) {
    console.log('searchable', slides[i].dataset.searchable);
    if (slides[i].dataset.searchable.includes(query)) {
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
      input.innerHTML = y;
      input.dataset.field = x;
      input.dataset.value = y;
      label.appendChild(input);
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
    button.setAttribute('bs-toggle', 'tab');
    button.setAttribute('bs-target', '#' + x);
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

// get url params
filters = {};
// initialize with url params as filters
init(filters);
