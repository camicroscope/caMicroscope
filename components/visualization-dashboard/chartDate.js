// DrawAnnotationData
function prepareDrawAnnotationData(getVisualizationData) {
  let DrawAnnotationData = [];
  // console.log('prepareDrawAnnotationData--getVisualizationData', getVisualizationData);

  // Get initial data
  getVisualizationData.annotations.map((d) => {
    // console.log('prepareDrawAnnotationData--getVisualizationData--getVisualizationData.annotations', d);
    d.geometries.features.map((detailData)=>{
      // console.log('prepareDrawAnnotationData--getVisualizationData--getVisualizationData.annotations-geometry', detailData);
      if (detailData.viewerStates) {
        // eslint-disable-next-line max-len
        // console.log('prepareDrawAnnotationData--getVisualizationData--getVisualizationData.annotations-geometry--viewerStates', detailData.viewerStates);
        DrawAnnotationData.push(roundToSecondDecimalPlace(detailData.viewerStates.z));
      }
    });
  });
  // console.log('DrawAnnotationData', DrawAnnotationData);
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
  // console.log('preparePresetLabelsData', getVisualizationData.annotations[1].properties.annotations.name);
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

// Users of Annotations
function prepareUsersOfAnnotationsData(getVisualizationData) {
  // console.log('creator', getVisualizationData.annotations[1].creator);
  let initialData = [];
  // Get initial data
  getVisualizationData.annotations.map((d) => {
    // console.log('getVisualizationData.annotations', d.properties.annotations.notes);
    if (d.creator.length !== 0) {
      initialData.push(d.creator);
      // console.log('name', d.creator);
    };
  });
  // console.log('initialData ', initialData );
  let result = countOccurrencesFromString(initialData);
  // console.log('result ', result);
  return result;
}