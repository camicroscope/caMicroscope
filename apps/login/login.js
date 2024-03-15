//TO check if the user is logged in or not
function validateUser(e) {
    var email = document.getElementById("mail").value;
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(email)) {
      displayAlert("Email is valid!", "success");
    } else {
      displayAlert("Please enter a valid email address!", "danger");
    }
  }
  function displayAlert(message, type) {
    // Create alert element
    var alertElement = document.createElement("div");
    alertElement.classList.add("alert", "alert-" + type);
    alertElement.setAttribute("role", "alert");
    alertElement.textContent = message;

    // Append alert to container
    var alertContainer = document.getElementById("alertContainer");
    alertContainer.innerHTML = ""; // Clear previous alerts
    alertContainer.appendChild(alertElement);
  }