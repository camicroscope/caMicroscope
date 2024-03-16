// Get all forms with class 'form'
const forms = document.querySelectorAll('.form');



// Loop through each form
forms.forEach(form => {
    // Get all input and textarea elements within the form
    const inputs = form.querySelectorAll('input, textarea');
    
    // Loop through each input/textarea
    inputs.forEach(input => {
        // Attach event listeners for keyup, blur, and focus events
        input.addEventListener('keyup', handleInputEvent);
        input.addEventListener('blur', handleInputEvent);
input.addEventListener('focus', handleInputEvent);
});
});

// Function to handle keyup, blur, and focus events on input/textarea elements
function handleInputEvent(e) {
    const label = this.previousElementSibling;

    if (e.type === 'keyup') {
        label.classList.toggle('active', this.value !== '');
        label.classList.toggle('highlight', this.value !== '');
    } else if (e.type === 'blur') {
        if (this.value === '') {
            label.classList.remove('active', 'highlight');
        } else {
            label.classList.remove('highlight');
        }
    } else if (e.type === 'focus') {
        label.classList.toggle('highlight', this.value !== '');
    }
}

// Get all tab links
const tabLinks = document.querySelectorAll('.tab a');

// Loop through each tab link
tabLinks.forEach(tabLink => {
    // Attach click event listener
    tabLink.addEventListener('click', function(e) {
        e.preventDefault();

        // Add 'active' class to clicked tab link's parent
        this.parentElement.classList.add('active');

        // Remove 'active' class from siblings of clicked tab link's parent
        const siblings = Array.from(this.parentElement.parentElement.children);
        siblings.forEach(sibling => {
            if (sibling !== this.parentElement) {
                sibling.classList.remove('active');
            }
        });

        // Get target tab content
        const target = this.getAttribute('href');

        // Hide all tab content except the target
        const tabContents = document.querySelectorAll('.tab-content > div');
        tabContents.forEach(tabContent => {
            if (tabContent !== document.querySelector(target)) {
                tabContent.style.display = 'none';
            }
        });

        // Fade in target tab content
        document.querySelector(target).style.display = 'block';
    });
});
