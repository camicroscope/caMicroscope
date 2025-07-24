parser = new DOMParser();

function generateRandomId(length = 6) {
  return Math.random().toString(36).substr(2, length);
}

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
    'features': [],
  },
};

var aperioMap = {
  '0': 'Polygon',
  '1': 'Polygon',
  '2': 'Polygon',
  '4': 'Polyline',
};

// apollo color things...

// Define the known color categories and their hex values
const colorCategories = {
  "Tumor": "#00FF00",
  "Normal_Benign": "#FF00FF",
  "Stroma_fibrosis_inflammation": "#FFFF00",
  "Necrosis": "#000000",
  "Blood": "#FF0000"
};

// Convert hex to RGB
function hexToRgb(hex) {
  // Remove the "#" if it's present
  hex = hex.replace("#", "");
  
  // Parse hex color to RGB components
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

// Calculate Euclidean distance between two RGB colors
function calculateColorDistance(rgb1, rgb2) {
  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

// Classify the input hex color into one of the categories
function classifyColor(hex) {
  const inputRgb = hexToRgb(hex);
  let closestCategory = null;
  let minDistance = Infinity;

  // Loop through all categories and find the closest match
  for (const [category, hexColor] of Object.entries(colorCategories)) {
    const categoryRgb = hexToRgb(hexColor);
    const distance = calculateColorDistance(inputRgb, categoryRgb);

    if (distance < minDistance) {
      minDistance = distance;
      closestCategory = category;
    }
  }
  return closestCategory;
}


function xml2geo() {
  let input = document.getElementById('xml_in').value;
  xmlDoc = parser.parseFromString(input, 'text/xml');
  let annotations = xmlDoc.getElementsByTagName('Annotation');
  let slideId = document.getElementById('slide_id').value.trim();
  let annotName = document.getElementById('annot_name').value.trim();

  let apolloColors = document.getElementById('apollo_colors').checked;

  // Store objects per unique color
  let outputMap = {};

  for (let annotation of annotations) {
    let annotationType = annotation.getAttribute('Type') || '0';
    let annotationLineColor = annotation.getAttribute('LineColor') || '0';
    let annotationId = annotation.getAttribute('Id');

    let hexColor = `#${parseInt(annotationLineColor).toString(16).padStart(6, '0')}`;
    if (!outputMap[hexColor]) {
      let randomId = generateRandomId();
      outputMap[hexColor] = JSON.parse(JSON.stringify(template));
      outputMap[hexColor]['provenance']['image']['slide'] = slideId;
      let colorname = hexColor;
      if (apolloColors){
        colorname = classifyColor(hexColor)
      }
      outputMap[hexColor]['provenance']['analysis']['execution_id'] = randomId;
      outputMap[hexColor]['provenance']['analysis']['name'] = `${annotName}_${colorname}`;
      outputMap[hexColor]['properties']['annotations']['name'] = `${annotName}_${colorname}`;
    }

    let regions = annotation.getElementsByTagName('Region');
    for (let region of regions) {
      let regionId = region.getAttribute('Id');
      let regionType = aperioMap[annotationType || region.getAttribute('Type')] || 'Polygon';

      let vertices = region.getElementsByTagName('Vertex');
      let coordinates = [];
      let minX = 99e99; let maxX = 0; let minY = 99e99; let maxY = 0;

      for (let vertex of vertices) {
        let x = parseFloat(vertex.getAttribute('X'));
        let y = parseFloat(vertex.getAttribute('Y'));
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        coordinates.push([x, y]);
      }

      let isFill = false;
      if (regionType === 'Polygon') {
        coordinates.push(coordinates[0]);
        isFill = true;
      }

      let boundRect = [[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY]];

      let feature = {
        'type': 'Feature',
        'geometry': {
          'type': regionType === 'Polyline' ? 'LineString' : 'Polygon',
          'coordinates': [coordinates],
        },
        'properties': {
          'regionId': regionId,
          'lineColor': hexColor,
          'style': {
            'color': hexColor,
            'isFill': isFill,
          },
          'group': region.parentNode.getAttribute('Name') || 'Ungrouped',
        },
        'bound': {
          'type': 'BoundingBox',
          'coordinates': [boundRect],
        },
      };

      outputMap[hexColor]['geometries']['features'].push(feature);
    }
  }

  // Show all color-specific outputs
  let finalOutput = Object.values(outputMap);
  document.getElementById('output').textContent = JSON.stringify(finalOutput, null, 2);
}
