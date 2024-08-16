// Define function
function visualizationLayerItems(getVisualizationData) {
  let initialZoomingData = [];
  // console.log('visualizationLayerItems--getVisualizationData', getVisualizationData);

  // Get initial data
  getVisualizationData.annotations.map((d) => {
    // console.log('visualizationLayerItems--getVisualizationData--getVisualizationData.annotations', d);
    d.geometries.features.map((detailData)=>{
      // console.log('visualizationLayerItems--getVisualizationData--getVisualizationData.annotations-geometry', detailData);
      if (detailData.viewerStates) {
        // eslint-disable-next-line max-len
        // console.log('visualizationLayerItems--getVisualizationData--getVisualizationData.annotations-geometry--viewerStates', detailData.viewerStates);
        initialZoomingData.push(roundToSecondDecimalPlace(detailData.viewerStates.z));
      }
    });
  });
  // console.log('initialZoomingData', initialZoomingData);
  let result = countOccurrences(initialZoomingData);

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
function presetLabelsData(getVisualizationData) {
  // console.log('presetLabelsData', getVisualizationData.annotations[1].properties.annotations.name);
  let initialData = [];
  // Get initial data
  getVisualizationData.annotations.map((d) => {
    // console.log('getVisualizationData.annotations', d.properties.annotations.notes);
    if (d.properties.annotations.name == d.properties.annotations.notes) {
      initialData.push(d.properties.annotations.name);
    };
  });
  let result = countOccurrencesFromString(initialData);
  return result;
}

function countOccurrencesFromString(arr) {
  // console.log('arr', arr);
  // 文字列用のカウントマップを作成
  let countMap = {};

  // 配列の各要素をカウント
  arr.forEach(function(value) {
    // 文字列以外の場合は処理をスキップ
    if (typeof value !== 'string') {
      return;
    }

    // カウントマップに追加またはインクリメント
    if (countMap[value] === undefined) {
      countMap[value] = 1;
    } else {
      countMap[value]++;
    }
  });
  // console.log(countMap);
  // カウントマップを2次元配列に変換
  let countArray = Object.entries(countMap).map(([key, value]) => [key, value]);

  // console.log(countArray);
  return countArray;
}
