const darkModeToggle = document.getElementById('switch');

const modeStatusD = document.createElement('i');
modeStatusD.setAttribute('class', 'fas fa-sun');
modeStatusD.style.color = 'yellow';

const modeStatusN = document.createElement('i');
modeStatusN.setAttribute('class', 'fas fa-moon');
modeStatusN.style.color = 'yellow';

var element = document.body;

// Check localStorage for saved mode
const savedMode = localStorage.getItem('mode');

if (savedMode === 'dark') {
    element.classList.add("dark-mode");
    darkModeToggle.appendChild(modeStatusN);
} else {
    element.classList.remove("dark-mode");
    darkModeToggle.appendChild(modeStatusD);
}

function modeChange() {
    element.classList.toggle("dark-mode");

    // Update localStorage with current mode
    if (element.classList.contains("dark-mode")) {
        localStorage.setItem('mode', 'dark');
        darkModeToggle.innerHTML = ""; // Clear existing content
        darkModeToggle.appendChild(modeStatusN);
    } else {
        localStorage.setItem('mode', 'light');
        darkModeToggle.innerHTML = ""; // Clear existing content
        darkModeToggle.appendChild(modeStatusD);
    }
}

// Add event listener to handle clicks on the switch
darkModeToggle.addEventListener('click', function(event) {
    modeChange();
});
