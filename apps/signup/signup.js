var userSignupUrl = "../../data/User/post";
var protoTokenUrl = "../../auth/Token/proto";
var permissions;
const store = new Store('../../data/');
var emailError = document.getElementById("emailError");
var filtersError = document.getElementById("filtersError");

// Validation function for email
function validateEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

// Validation function for filters
function validateFilters(filters) {
  return filters.trim() !== ''; // Basic validation: ensuring it's not empty
}

function addUser(){
  var email = document.getElementById("mail").value
  var filters = document.getElementById("filters").value
  // var attr = document.querySelector('input[name="attr"]:checked').value
  var attrEle = document.getElementById("attr");
  var attr = attrEle.options[attrEle.selectedIndex].value;
  var emailErr = document.getElementById('emailerror');
  // Clear previous error messages
  emailError.style.display = "none";
  filtersError.style.display = "none";

  if (!validateEmail(email)) {
    emailError.style.display = "block";
    emailError.innerHTML = "Please enter a valid email address.";
    return;
  }

  if (!validateFilters(filters)) {
    filtersError.style.display = "block";
    filtersError.innerHTML = "Please enter atleast one filter.";
    return;
  }


  var userType = "Null"
  if (attr == "3"){
    userType = "Admin"
  }
  if (attr == "2"){
    userType = "Editor"
  }

  store.getUserPermissions(getUserType())
    .then(response => response.text())
    .then((data) => {
    return (data ? JSON.parse(data) : null);
    })
    .then((data)=> {
        if(data===null)
            return;
        permissions = data;
        return;
  })
  .then((resp) => {
    return fetch(protoTokenUrl)
  })
  .then((response) => {
    // console.log(response);
    return response.json();
  })
  .then((data) => {
    return data.exists
  })
  .then((x) => {
    if (x) {
      var doc = {email: email, userType: userType, userFilter:filters}
      fetch(userSignupUrl, {
          method: 'POST',
          mode: 'cors', // no-cors, cors, *same-origin
          cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
          credentials: 'same-origin', // include, *same-origin, omit
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(doc),
        }).then(x=>{
          if (x.status>=400){
            throw "failed to sign up user"
          }
          x.json()
        }).then(x=>{
          window.alert("User registered successfully")
        }).catch(e=>{
          // window.alert("error!")
          console.error(e)
      });
    } else {
      if (permissions.user && permissions.user.post == true) {
        var doc = {email: email, userType: userType, userFilter:filters}
        fetch(userSignupUrl, {
            method: 'POST',
            mode: 'cors', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(doc),
          }).then(x=>{
            if (x.status>=400){
              throw "failed to sign up user"
            }
            x.json()
          }).then(x=>{
             // Show success popup
            document.getElementById("successPopup").style.display = "block";
            document.getElementById('mail').value = '';
            document.getElementById('filters').value = '';

            setTimeout(function(){
              document.getElementById("successPopup").style.display = "none";
            }, 3000)
          }).catch(e=>{
            // window.alert("error!")
            console.error(e)
        });
      } else {
        store.requestToCreateUser(email, filters, userType);
      }
    }
  });
}
$(window).on('load', function() {
  $('#sub').text('Sign up');
  $('#sub').removeAttr('disabled');

  store.getUserPermissions(getUserType())
    .then(response => response.text())
    .then((data) => {
    return (data ? JSON.parse(data) : null);
    })
    .then((data)=> {
        if(data===null)
            return;
        permissions = data;
  });
});

function loginPage(){
  const url = "/login.html";
  window.location.href = url;
}
