
// Function to toggle between dark mode and light mode
function toggleMode() {
    // Get the checkbox element
    const checkbox = document.getElementById('modeSwitchCheckbox');
    
    // Toggle dark mode class on the body
    document.body.classList.toggle('dark-mode', checkbox.checked);
}

// Event listener to toggle mode when the label (and thus the checkbox) is clicked
document.addEventListener('DOMContentLoaded', function() {
    const switchLabel = document.getElementById('modeSwitchLabel');
    switchLabel.addEventListener('click', toggleMode);
});
