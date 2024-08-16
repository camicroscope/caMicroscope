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
              <h3>Preset Labels vs Preset Labels count</h3>
              <canvas id="chart2"></canvas>
          </div>
          <div class="card" id="card3">
              <button class="expand-btn" onclick="openModal('card3', [3, 7, 11, 15, 19])">
                  <span class="material-icons card-expand-icon">open_in_full</span>
              </button>
              <h3>Users of Annotations</h3>
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
  // console.log('getVisualizationData2', json);

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
  //  Create initiate graph
  let initialZoomingData = visualizationLayerItems(getVisualizationData);
  let presetLabelData = presetLabelsData(getVisualizationData);
  let creatorsData = creatorData(getVisualizationData);
  // Create Graph
  VisualizationViewer('chart1', initialZoomingData);
  PresetLabelsGraph('chart2', presetLabelData );
  drawPieChart('chart3', creatorsData);
})();
