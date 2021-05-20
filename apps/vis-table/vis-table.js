// render each thumbnail
function renderSlide(data) {
  // make div
  let div = document.createElement('div');
  div.classList.add('slidebox');
  let location = data.location;
  // add thumbnail
  let thumbnailUrl = `../../img/IIP/raw/?FIF=${location}&WID=200&CVT=png`;
  div.style.backgroundImage = `url(${thumbnailUrl});`;
  // add label text
  let label = document.createElement('div');
  label.classList.add('namebox');
  label.innerText = data.name;
  // add checkmark if reviewed, for now
  if (data.review) {
    label.innerText += '✔';
  }
  // add to a link
  let anchor = document.createElement('a');
  anchor.href = `../viewer/viewer.html?slideId=${data['_id']['$oid']}`;
  anchor.appendChild(div);
  document.getElementById('table').appendChild(anchor);
}

// initialization routine
function init(filters) {
  const STORE = Store('../../data');
  // get slide data w/filters
  STORE.findSlide(filters).then((x)=>{
    x.forEach(renderSlide);
  });
  // render each one
}


// get url params
filters = {};
// initialize with url params as filters
init(filters);
