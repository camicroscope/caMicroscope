// Get all forms with class 'form'
const forms = document.querySelectorAll('.form');

// Loop through each form
forms.forEach((form) => {
// Get all input and textarea elements within the form
  const inputs = form.querySelectorAll('input, textarea');
  // Loop through each input/textarea
  inputs.forEach((input ) => {
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

// JavaScript to handle the toggling of sections
document.addEventListener('DOMContentLoaded', function() {
  // Get the links and sections
  const generalLink = document.querySelector('.general_header');
  const bugLink = document.querySelector('.bug_header');
  const generalSection = document.querySelector('.general_class');
  const bugSection = document.querySelector('.bug_class');

  // Function to show General Feedback section and hide Bug Report section
  function showGeneral() {
    generalSection.classList.remove('hidden');
    bugSection.classList.add('hidden');
  }

  // Function to show Bug Report section and hide General Feedback section
  function showBug() {
    generalSection.classList.add('hidden');
    bugSection.classList.remove('hidden');
  }

  // Event listeners for the links
  generalLink.addEventListener('click', function(event) {
    event.preventDefault();
    showGeneral();
  });

  bugLink.addEventListener('click', function(event) {
    event.preventDefault();
    showBug();
  });
});
