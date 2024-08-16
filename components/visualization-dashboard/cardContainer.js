// cardContainer.js
(function() {
  const cardContainer = `
          <div class="card-container">
          <div class="card" id="card-original">
              <h3>Synopsis</h3>
              <div id="synopsis"></div>
          </div>
          <div class="card" id="drawAnnotationCard">
              <button class="expand-btn" onclick="openModal('drawAnnotationChart')">
                  <span class="material-icons card-expand-icon">open_in_full</span>
              </button>
              <h3>Draw Annotation Count vs Zooming</h3>
              <canvas id="drawAnnotationChart"></canvas>
          </div>
          <div class="card" id="presetLabelsDataCard">
              <button class="expand-btn" onclick="openModal('presetLabelsDataChart')">
                  <span class="material-icons card-expand-icon">open_in_full</span>
              </button>
              <h3>Preset Labels vs Preset Labels count</h3>
              <canvas id="presetLabelsDataChart"></canvas>
          </div>
          <div class="card" id="usersOfAnnotationsCard">
              <button class="expand-btn" onclick="openModal('usersOfAnnotationsChart')">
                  <span class="material-icons card-expand-icon">open_in_full</span>
              </button>
              <h3>Users of Annotations</h3>
              <canvas id="usersOfAnnotationsChart"></canvas>
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
  let drawAnnotationData = prepareDrawAnnotationData(getVisualizationData);
  let presetLabelsData = preparePresetLabelsData(getVisualizationData);
  let usersOfAnnotationsData = prepareUsersOfAnnotationsData(getVisualizationData);

  // Create Graph
  createAnnotationZoomChart('drawAnnotationChart', drawAnnotationData);
  createPresetLabelsChart('presetLabelsDataChart', presetLabelsData );
  usersOfAnnotationsChart('usersOfAnnotationsChart', usersOfAnnotationsData);
})();
