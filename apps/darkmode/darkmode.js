const darkModeToggle = document.getElementById('dark-mode-toggle');

// Function to enable dark mode
const enableDarkMode = () => {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
}

// Function to disable dark mode
const disableDarkMode = () => {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', null);
}

// Check if dark mode preference is stored in local storage
if (localStorage.getItem('darkMode') === 'enabled') {
    darkModeToggle.checked = true;
    enableDarkMode();
}

// Listen for changes to the dark mode toggle
darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
});
