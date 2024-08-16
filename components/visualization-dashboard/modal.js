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

function openModal(cardId) {
  const modal = document.getElementById('modal');
  console.log('cardId', cardId);

  // Remove the existing chart and create a new canvas
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = '<canvas id="modal-chart"></canvas>';


  // Render the chart inside the modal
  switch (cardId) {
    case 'drawAnnotationChart':
      createAnnotationZoomingChart('modal-chart', prepareDrawAnnotationData(getVisualizationData));
      console.log('cardId', cardId);
      break;
    case 'presetLabelsDataChart':
      createPresetLabelsChart('modal-chart', preparePresetLabelsData(getVisualizationData));
      console.log('cardId', cardId);
      break;
    case 'usersOfAnnotationsChart':
      createUsersOfAnnotationsChart('modal-chart', prepareUsersOfAnnotationsData(getVisualizationData));
      console.log('cardId', cardId);
      break;
    default:
      console.log('No valid chart selected');
      break;
  }


  // Display the modal
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
  const modal = document.getElementById('modal');
  if (event.target == modal) {
    closeModal();
  }
};
