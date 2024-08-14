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
              <h3>Card 1</h3>
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

  // 各カードにグラフを描画
  renderChart('chart1', [12, 19, 3, 5, 2]);
  renderChart('chart2', [5, 10, 15, 20, 25]);
  renderChart('chart3', [3, 7, 11, 15, 19]);
})();

function renderChart(canvasId, data) {
  // 既存のチャートがあるかどうかを確認し、削除します
  if (Chart.getChart(canvasId)) {
    Chart.getChart(canvasId).destroy();
  }

  const ctx = document.getElementById(canvasId).getContext('2d');

  // 新しいチャートを作成します
  new Chart(ctx, {
    type: 'bar', // ここでグラフのタイプを指定
    data: {
      labels: ['January', 'February', 'March', 'April', 'May'], // 例として月を使用
      datasets: [{
        label: 'Dataset 1',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
