let userSignupUrl = "../../data/User/post";
let protoTokenUrl = "../../auth/Token/proto";
let permissions;
const store = new Store('../../data/');

function addUser(){
  let email = document.getElementById("mail").value
  let filters = document.getElementById("filters").value
  // let attr = document.querySelector('input[name="attr"]:checked').value
  let attrEle = document.getElementById("attr");
  let attr = attrEle.options[attrEle.selectedIndex].value;

  if (!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email))) {
    window.alert("Please enter a valid email");
    return;
  }

  let userType = "Null"
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
      let doc = {email: email, userType: userType, userFilter:filters}
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
        let doc = {email: email, userType: userType, userFilter:filters}
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
            window.alert("User registered successfully");
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