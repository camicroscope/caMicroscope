// initalize dependencies and params
let store = new Store('../../data/');
const urlParams = new URLSearchParams(window.location.search);
const page = urlParams.get('p');
const mode = 'normal';
const prefixUrl = 'https://cdn.jsdelivr.net/npm/openseadragon@2.3/build/openseadragon/images/';
let query = JSON.parse(urlParams.get('q') || '{}');

let viewers = [];

const workspace = document.getElementById('workspace');

function addTile(url, n) {
  let d = document.createElement('div');
  d.id = 'osd' + n;
  d.className = 'osd';
  d.width = '200px';
  d.height = '200px';
  // append
  viewers[n] = OpenSeadragon({
    id: 'first',
    prefixUrl: prefixUrl,
    tileSources: url,
  });
  workspace.appendChild(d);
  // TODO create "open this slide button"
  // TODO style
}

function changeTile(url, n) {
  viewers[n].open(url);
}

function onInit() {
  // TODO pathdb variant
  store.findSlide(null, null, null, null, query).then((x)=>{
    for (let n = 0; n<x.length; n++) {
      let item = list[n];
      // TODO respect max size
      addTile(item.location, n);
    }
  });
}

// TODO pagination


// ?? how many can we reasonably open at once?

window.onload = onInit;
