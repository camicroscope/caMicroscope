const fileName = 'hsi1'; // This should be dynamically set based on the file chosen
document.getElementById('fileName').textContent = fileName;

fetch(`/bands/${fileName}`)
    .then(response => response.json())
    .then(data => {
        const form = document.getElementById('bandSelectionForm');
        for(let i = 0; i < data.num_bands; i++) {
            const label = document.createElement('label');
            label.textContent = `Band ${i}: `;
            const select = document.createElement('select');
            select.name = `band_${i}`;
            ['None', 'R', 'G', 'B'].forEach(color => {
                const option = document.createElement('option');
                option.value = color;
                option.textContent = color;
                select.appendChild(option);
            });
            label.appendChild(select);
            form.appendChild(label);
            form.appendChild(document.createElement('br'));
        }
    })
    .catch(error => console.error('Error:', error));

document.getElementById('viewImageButton').addEventListener('click', function() {
    const form = document.getElementById('bandSelectionForm');
    const formData = new FormData(form);
    fetch(`../../multichannel/select_bands/${fileName}`, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if(response.ok) return response.json();
        throw new Error('Network response was not ok.');
    })
    .catch(error => console.error('Error:', error));
});