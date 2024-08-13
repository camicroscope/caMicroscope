document.addEventListener('DOMContentLoaded', function() {
  const cardContainer = `
        <div class="card-container">
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

  // 各カードにグラフを描画
  renderChart('chart1', [12, 19, 3, 5, 2]);
  renderChart('chart2', [5, 10, 15, 20, 25]);
  renderChart('chart3', [3, 7, 11, 15, 19]);
});
