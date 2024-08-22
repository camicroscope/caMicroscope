// DrawAnnotationData
function prepareDrawAnnotationData(getVisualizationData) {
  let DrawAnnotationData = [];

  // Get initial data
  getVisualizationData.annotations.map((d) => {
    d.geometries.features.map((detailData)=>{
      if (detailData.viewerStates) {
        DrawAnnotationData.push(roundToSecondDecimalPlace(detailData.viewerStates.z));
      }
    });
  });
  let result = countOccurrences(DrawAnnotationData);

  return result;
}
// Function to round to decimal places
function roundToSecondDecimalPlace(num) {
  return Math.round(num * 100) / 100;
}

function countOccurrences(arr) {
  // Create objects for counting
  let countMap = {};

  // Count each element in the array
  arr.forEach(function(value) {
    if (countMap[value] === undefined) {
      countMap[value] = 1;
    } else {
      countMap[value]++;
    }
  });

  // Convert the result to a 2-dimensional array
  let result = [];
  for (let key in countMap) {
    if (countMap.hasOwnProperty(key)) {
      result.push([parseFloat(key), countMap[key]]);
    }
  };

  return result;
}

// Preset Labels annotations
function preparePresetLabelsData(getVisualizationData) {
  let initialData = [];
  // Get initial data
  getVisualizationData.annotations.map((d) => {
    if (d.properties.annotations.name == d.properties.annotations.notes) {
      initialData.push(d.properties.annotations.name);
    };
  });
  let result = countOccurrencesFromString(initialData);
  return result;
}

function countOccurrencesFromString(arr) {
  let countMap = {};

  arr.forEach(function(value) {
    if (typeof value !== 'string') {
      return;
    }

    if (countMap[value] === undefined) {
      countMap[value] = 1;
    } else {
      countMap[value]++;
    }
  });
  let countArray = Object.entries(countMap).map(([key, value]) => [key, value]);

  return countArray;
}

// Users of Annotations
function prepareUsersOfAnnotationsData(getVisualizationData) {
  let initialData = [];
  // Get initial data
  getVisualizationData.annotations.map((d) => {
    if (d.creator.length !== 0) {
      initialData.push(d.creator);
    };
  });
  let result = countOccurrencesFromString(initialData);
  return result;
}
