// initalize dependencies and params
let store = new Store('../../data/');
const urlParams = new URLSearchParams(window.location.search);
const page = urlParams.get('p');
const mode = 'normal';
const MAX_TILES = urlParams.get('mt') || 16
const prefixUrl = 'https://cdn.jsdelivr.net/npm/openseadragon@2.3/build/openseadragon/images/';
let query = JSON.parse(urlParams.get('q') || '{}');

let viewers = [];

const workspace = document.getElementById('workspace');

function addTiles(n) {
  for (let i=0; i<n ; i++){
    let d = document.createElement('div');
    d.id = 'osd' + i;
    d.className = 'osd col';
    d.style.width = '200px';
    d.style.height = '200px';
    // append
    workspace.appendChild(d);
    viewers[i] = OpenSeadragon({
      id: d.id,
      prefixUrl: prefixUrl
    });

  }
  // TODO create "open this slide button"
  // TODO style
}

function changeTile(url, n) {
  viewers[n].open(url);
}

function onInit() {
  addTiles(MAX_TILES)
  // TODO pathdb variant
  store.findSlide(null, null, null, null, query).then((x)=>{
    for (let n = 0; n < Math.min(x.length, MAX_TILES); n++) {
      let item = x[n];
      // TODO respect max size
      // TODO fix url!
      let loc = "../../img/IIP/raw/?DeepZoom=" + item.location + ".dzi"
      changeTile(loc, n);
    }
  });
}

// TODO pagination


// ?? how many can we reasonably open at once?

window.onload = onInit;
