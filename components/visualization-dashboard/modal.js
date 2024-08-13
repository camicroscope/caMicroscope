document.addEventListener('DOMContentLoaded', function() {
  const modal = `
        <div id="modal" class="modal">
            <div class="modal-content" id="modal-content">
                <span class="close" onclick="closeModal()">&times;</span>
                <div id="modal-body">
                    <canvas id="modal-chart"></canvas>
                </div>
            </div>
        </div>
    `;
  document.body.insertAdjacentHTML('beforeend', modal);
});

function openModal(cardId, chartData) {
  const modal = document.getElementById('modal');

  // 既存のグラフを削除して新しい canvas を作成
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = '<canvas id="modal-chart"></canvas>';

  // モーダルの中のグラフを描画
  renderChart('modal-chart', chartData);

  // モーダルを表示
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
}

// モーダルの外側をクリックすると閉じる
window.onclick = function(event) {
  const modal = document.getElementById('modal');
  if (event.target == modal) {
    closeModal();
  }
};
