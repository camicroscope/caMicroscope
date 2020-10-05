parser = new DOMParser();

var template = {
  'provenance': {
    'image': {
      'slide': 'ID',
    },
    'analysis': {
      'source': 'human',
      'execution_id': 'TEMPLATE',
      'name': 'TEMPLATE',
      'coordinate': 'image',
    },
  },
  'properties': {
    'annotations': {
      'name': 'TEMPLATE',
      'note': 'Converted from XML',
    },
  },
  'geometries': {
    'type': 'FeatureCollection',
  },
};

function xml2geo() {
  let features = [];
  let input = document.getElementById('xml_in').value;
  xmlDoc = parser.parseFromString(input, 'text/xml');
  let regions = xmlDoc.getElementsByTagName('Region');
  for (let i of regions) {
    console.log('Looking at Region ID', i.getAttribute('Id'));
    let vertices = i.getElementsByTagName('Vertex');
    let coordinates = [];
    let minX = 99e99;
    let maxX = 0;
    let minY = 99e99;
    let maxY = 0;
    for (let j of vertices) {
      let x = parseFloat(j.getAttribute('X'));
      let y = parseFloat(j.getAttribute('Y'));
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      coordinates.push([x, y]);
    }
    coordinates.push(coordinates[0]);
    let boundRect = [[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY]];
    let feature = {};
    feature['type'] = 'Feature';
    feature['geometry'] = {};
    feature['geometry']['type'] = 'Polygon';
    feature['geometry']['coordinates'] = [coordinates];
    feature['bound'] = {};
    feature['bound']['type'] = 'Polygon';
    feature['bound']['coordinates'] = [boundRect];
    features.push(feature);
  }
  let output = Object.assign({}, template);
  output['geometries']['features'] = features;
  output['provenance']['image']['slide'] = document.getElementById('slide_id').value;
  output['provenance']['analysis']['execution'] = document.getElementById('annot_name').value;
  output['properties']['annotations']['name'] = document.getElementById('annot_name').value;
  document.getElementById('output').innerHTML = JSON.stringify(output);
}
