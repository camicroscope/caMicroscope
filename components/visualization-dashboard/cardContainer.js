// cardContainer.js
(function() {
  const cardContainer = `
      <div class="card-container">
          <div class="card" id="card-original">
              <h3>Synopsis</h3>
              <div id="synopsis"></div>
          </div>
          <div class="card" id="card1">
              <button class="expand-btn" onclick="openModal('card1', [12, 19, 3, 5, 2])">
                  <span class="material-icons card-expand-icon">open_in_full</span>
              </button>
              <h3>Draw Annotation Count</h3>
              <canvas id="chart1"></canvas>
          </div>
          <div class="card" id="card2">
              <button class="expand-btn" onclick="openModal('card2', [5, 10, 15, 20, 25])">
                  <span class="material-icons card-expand-icon">open_in_full</span>
              </button>
              <h3>Card 2</h3>
              <canvas id="chart2"></canvas>
          </div>
          <div class="card" id="card3">
              <button class="expand-btn" onclick="openModal('card3', [3, 7, 11, 15, 19])">
                  <span class="material-icons card-expand-icon">open_in_full</span>
              </button>
              <h3>Card 3</h3>
              <canvas id="chart3"></canvas>
          </div>
      </div>
  `;
  document.body.insertAdjacentHTML('beforeend', cardContainer);

  // Synopsis
  var json = {
    id: getVisualizationData.id,
    name: getVisualizationData.name,
    annotations: getVisualizationData.annotations.length,
    heatmaps: getVisualizationData.heatmap.length,
  };
  console.log('getVisualizationData2', json);

  const synopsisDiv = document.getElementById('synopsis');
  // <p>追加された段落${getVisualizationData.name}</p>`
  synopsisDiv.innerHTML += `
  <table>
  <tbody>
    <tr>
      <th scope="row">Slide ID</th>
      <td>${json.id}</td>
    </tr>
    <tr>
      <th scope="row">Slide Name</th>
      <td>${json.name}</td>
    </tr>
    <tr>
      <th scope="row">Number of Annotations</th>
      <td>${json.annotations} annotations</td>
    </tr>
    <tr>
      <th scope="row">Number of Heatmaps</th>
      <td>${json.heatmaps} heatmaps</td>
    </tr>
  </tbody>
</table>
`;
  // console.log(getVisualizationData.annotations[133].properties.annotations.name);
  // 位置情報 annotations[5].geometries.features[0].viewerStates
  // human であるかannotations[5].provenance.analysis
  // humanの中でも分けたい　round annotations[5].geometries.features[0].properties.style
  // 今のデータを出したい　今は過去のを読んでる
  console.log(getVisualizationData.annotations[5].geometries.features[0].viewerStates);
  let initialZoomingData = visualizationLayerItems(getVisualizationData);
  console.log('initialZoomingData', initialZoomingData);
  // 各カードにグラフを描画
  VisualizationViewer('chart1', initialZoomingData);
  // renderChart('chart1', [12, 19, 3, 5, 2]);
  renderChart('chart2', [5, 10, 15, 20, 25]);
  renderChart('chart3', [3, 7, 11, 15, 19]);
})();

function visualizationLayerItems(getVisualizationData) {
  let initialZoomingData = [];
  console.log('visualizationLayerItems--getVisualizationData', getVisualizationData);

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
  console.log('initialZoomingData', initialZoomingData);
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
