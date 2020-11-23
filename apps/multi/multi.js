// initalize dependencies and params
let store = new Store('../../data/');
const urlParams = new URLSearchParams(window.location.search);
const page = urlParams.get('p');
const mode = 'normal';
const prefixUrl = 'https://cdn.jsdelivr.net/npm/openseadragon@2.3/build/openseadragon/images/';
let list = JSON.parse(urlParams.get('l') || '[]');

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
  // TODO create "open this slide button"
  // TODO style
}

function changeTile(url, n) {
  viewers[n].open(url);
}

// TODO respect max size
for (let n = 0; n<n.length; n++) {
  let item = list[n];
  // TODO pathdb variant
  store.findSlide(item).then((x)=>{
    addTile(x.location, n);
  });
}

// TODO pagination


// ?? how many can we reasonably open at once?
