document.addEventListener('DOMContentLoaded', function() {
  fetch('../../multichannel/')
      .then(response => response.json())
      .then(data => {
          const imageList = document.getElementById('imageList');
          data.sample_files.forEach(file => {
              const imgElement = document.createElement('img');
              imgElement.src = `static/mat_files/${file}.jpg`; // Assuming you have JPEG versions for preview
              imgElement.alt = `Sample Image ${file}`;
              imageList.appendChild(imgElement);
          });
      })
      .catch(error => console.error('Error:', error));
    });