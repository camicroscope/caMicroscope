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

  // Check if label exists and is not null
  if (label) {
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


document.addEventListener('DOMContentLoaded', function() {
  const generalForm = document.getElementById('generalForm');
  const bugForm = document.getElementById('bugForm');

  generalForm.addEventListener('submit', function(event) {
    event.preventDefault();
    if (validateGeneralForm()) {
      // If validation succeeds, submit the form
      generalForm.submit();
    }
  });
  bugForm.addEventListener('submit', function(event) {
    event.preventDefault();
    if (validateBugForm()) {
      // If validation succeeds, submit the form
      bugForm.submit();
    }
  });
});


function validateGeneralForm() {
  let isValid = true;
  // Validate general feedback form fields
  const errorMessages = document.querySelectorAll('.error-message');
  errorMessages.forEach((msg) => msg.textContent = '');

  // Validate each field
  if (isValid) {
    const firstName = document.getElementById('firstName').value;
    if (firstName.length == '') {
      document.getElementById('firstNameError').textContent = 'Please enter your first name.';
      isValid = false;
    } else if (firstName.length < 2) {
      document.getElementById('firstNameError').textContent = 'Please enter a valid first name.';
      isValid = false;
    }
  }

  if (isValid) {
    const lastName = document.getElementById('lastName').value;
    if (lastName.length == 0) {
      document.getElementById('lastNameError').textContent = 'Please enter your last name.';
      isValid = false;
    } else if (lastName.length < 2) {
      document.getElementById('lastNameError').textContent = 'Please enter a valid last name.';
      isValid = false;
    }
  }

  if (isValid) {
    const email = document.getElementById('email').value;
    if (email.length == '') {
      document.getElementById('emailError').textContent = 'Please enter your email address.';
      isValid = false;
    } else if (!email.includes('@')) {
      document.getElementById('emailError').textContent = 'Please enter a valid email address.';
      isValid = false;
    }
  }

  if (isValid) {
    const use = document.getElementById('use').value.trim();
    if (use.length == 0) {
      document.getElementById('useError').textContent = 'Please provide a description of how you used caMicroscope.';
      isValid = false;
    } else if (use.length < 10) {
      document.getElementById('useError').textContent = 'Please provide a longer description of how you used caMicroscope.';
      isValid = false;
    }
  }

  if (isValid) {
    const feedback = document.getElementById('feedback').value.trim();
    if (feedback.length == 0) {
      document.getElementById('feedbackError').textContent = 'Please provide feedback.';
      isValid = false;
    } else if (feedback.length < 10) {
      document.getElementById('feedbackError').textContent = 'Please provide longer feedback.';
      isValid = false;
    }
  }

  return isValid;
}


function validateBugForm(event) {
  let isValid = true;

  // Validate bug report form fields
  const errorMessages = document.querySelectorAll('.error-message');
  errorMessages.forEach((msg) => msg.textContent = '');

  // Validate each field
  if (isValid) {
    const firstName = document.getElementById('fName').value;
    if (firstName.length === 0) {
      document.getElementById('fNameError').textContent = 'Please enter your first name.';
      isValid = false;
    } else if (firstName.length < 2) {
      document.getElementById('firstNameError').textContent = 'Please enter a valid first name.';
      isValid = false;
    }
  }

  if (isValid) {
    const lastName = document.getElementById('lName').value;
    if (lastName.length === 0) {
      document.getElementById('lNameError').textContent = 'Please enter your last name.';
      isValid = false;
    } else if (lastName.length < 2) {
      document.getElementById('lNameError').textContent = 'Please enter a valid last name.';
      isValid = false;
    }
  }

  if (isValid) {
    const email = document.getElementById('emails').value;
    if (email.length === 0) {
      document.getElementById('emailErrors').textContent = 'Please enter your email address.';
      isValid = false;
    } else if (!email.includes('@')) {
      document.getElementById('emailErrors').textContent = 'Please enter a valid email address.';
      isValid = false;
    }
  }

  if (isValid) {
    const severity = document.querySelector('input[name="inlineRadioOptions"]:checked');
    if (!severity) {
      document.getElementById('severityError').textContent = 'Please select the severity of the bug.';
      isValid = false;
    }
  }

  if (isValid) {
    const bugDescription = document.getElementById('bugDescription').value.trim();
    if (bugDescription.length === 0) {
      document.getElementById('bugDescriptionError').textContent = 'Please provide a description of the bug.';
      isValid = false;
    } else if (bugDescription.length < 10) {
      document.getElementById('bugDescriptionError').textContent = 'Please provide a longer description of the bug.';
      isValid = false;
    }
  }

  if (isValid) {
    const bugSteps = document.getElementById('steps').value.trim();
    if (bugSteps.length === 0) {
      document.getElementById('stepsError').textContent = 'Please provide steps to reproduce the bug.';
      isValid = false;
    } else if (bugSteps.length < 10) {
      document.getElementById('stepsError').textContent = 'Please provide longer steps to reproduce the bug.';
      isValid = false;
    }
  }

  if (isValid) {
    const bugAdditional = document.getElementById('additional').value.trim();
    if (bugAdditional.length === 0) {
      document.getElementById('additionalError').textContent = 'Please provide additional information.';
      isValid = false;
    } else if (bugAdditional.length < 10) {
      document.getElementById('additionalError').textContent = 'Please provide longer additional information.';
      isValid = false;
    }
  }

  return isValid;
}


