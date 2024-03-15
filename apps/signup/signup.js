var userSignupUrl = "../../data/User/post";
var protoTokenUrl = "../../auth/Token/proto";
var permissions;
const store = new Store('../../data/');

document.addEventListener("DOMContentLoaded", function() {
  const emailInput = document.getElementById("mail");
  const filtersInput = document.getElementById("filters");
  const attrSelect = document.getElementById("attr");
  const submitButton = document.getElementById("sub");

  // Initially disable the submit button
  submitButton.disabled = true;

  // Function to check if all fields are filled with valid values
  function checkFormValidity() {
    const emailValue = emailInput.value.trim();
    const filtersValue = filtersInput.value.trim();
    const attrValue = attrSelect.value;

    const emailValid = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(emailValue);
    const filtersValid = filtersValue !== '';
    const attrValid = attrValue !== '';

    // Enable the submit button if all fields are valid
    submitButton.disabled = !(emailValid && filtersValid && attrValid);
  }

  // Add event listeners to input fields to check validity on input change
  emailInput.addEventListener("input", checkFormValidity);
  filtersInput.addEventListener("input", checkFormValidity);
  attrSelect.addEventListener("change", checkFormValidity);

  // Handler for the form submission
  function handleSubmit(event) {
    event.preventDefault(); // Prevent default form submission behavior
    if (submitButton.disabled) return; // Don't submit if button is disabled

    // Call the addUser function when all fields are valid
    addUser();
  }

  // Add event listener to the form for submission
  document.getElementById("userForm").addEventListener("submit", handleSubmit);
  
  $('#sub').text('Sign up');
  $('#sub').prop('disabled', true);

  store.getUserPermissions(getUserType())
    .then(response => response.text())
    .then((data) => {
      return (data ? JSON.parse(data) : null);
    })
    .then((data) => {
      if (data === null) return;
      permissions = data;
    });
});

function addUser(){
  let email = document.getElementById("mail").value
  let filters = document.getElementById("filters").value
  let attrEle = document.getElementById("attr");
  let attr = attrEle.options[attrEle.selectedIndex].value;

  if (!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email))) {
    window.alert("Please enter a valid email");
    return;
  } else if (filters.trim() === '') {
    window.alert('Please provide a list of filters');
    return;
  }

  // Disable submit button initially
  document.getElementById("sub").disabled = true;

  let userType = "Null"
  if (attr == "3"){
    userType = "Admin"
  } else if (attr == "2"){
    userType = "Editor"
  }

  store.getUserPermissions(getUserType())
    .then(response => response.text())
    .then((data) => {
      return (data ? JSON.parse(data) : null);
    })
    .then((data) => {
      if (data === null) return;
      permissions = data;
      return;
    })
    .then((resp) => {
      return fetch(protoTokenUrl);
    })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data.exists;
    })
    .then((x) => {
      if (x) {
        let doc = {email: email, userType: userType, userFilter:filters}
        fetch(userSignupUrl, {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(doc),
        }).then(x => {
          if (x.status >= 400){
            throw "failed to sign up user";
          }
          x.json();
        }).then(x => {
          window.alert("User registered successfully");
          // Enable submit button after successful registration
          document.getElementById("sub").disabled = false;

          // Clear input values
          document.getElementById("mail").value = "";
          document.getElementById("filters").value = "";
          document.getElementById("attr").selectedIndex = 0; // Reset dropdown to default option
        }).catch(e => {
          console.error(e);
        });
      } else {
        if (permissions.user && permissions.user.post == true) {
          let doc = {email: email, userType: userType, userFilter:filters}
          fetch(userSignupUrl, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(doc),
          }).then(x => {
            if (x.status >= 400) {
              throw "failed to sign up user";
            }
            x.json();
          }).then(x => {
            window.alert("User registered successfully");
            // Enable submit button after successful registration
            document.getElementById("sub").disabled = false;

            // Clear input values
            document.getElementById("mail").value = "";
            document.getElementById("filters").value = "";
            document.getElementById("attr").selectedIndex = 0; // Reset dropdown to default option
          }).catch(e => {
            console.error(e);
          });
        } else {
          store.requestToCreateUser(email, filters, userType);
        }
      }
    });
}


function loginPage(){
  const url = "/login.html";
  window.location.href = url;
}
