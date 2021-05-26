// render each thumbnail
function renderSlide(data) {
  // make div
  let div = document.createElement('div');
  div.classList.add('slidebox');
  let loc = data.location;
  // add thumbnail
  let thumbnailUrl = `url('../../img/IIP/raw/?FIF=${loc}&WID=200');`;
  div.style.backgroundImage = thumbnailUrl
  // add label text
  let label = document.createElement('div');
  label.classList.add('namebox');
  label.classList.add('bg-dark');
  label.innerText = data.name;
  div.appendChild(label);
  // add checkmark if reviewed, for now
  if (data.review) {
    let checkmark = document.createElement('div');
    checkmark.classList.add('checkmark');
    checkmark.innerText = '&#10004;'; // ✔
    checkmark.title = 'reviewed';
    div.appendChild(checkmark);
  }
  // add to a link
  let anchor = document.createElement('a');
  anchor.href = `../viewer/viewer.html?slideId=${data['_id']['$oid']}`;
  anchor.appendChild(div);
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

// handle searchbar

// TODO filters

// get url params
filters = {};
// initialize with url params as filters
init(filters);
