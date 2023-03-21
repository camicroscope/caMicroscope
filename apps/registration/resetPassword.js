// if I see a token, populate "change password" fields
// and hide "send password reset link" div

function requestResetPassword(){
  email = document.getElementById("email").value
  user_req = {"email": email}
  fetch("../../requestResetPassword", {
    method: 'POST',
    body: JSON.stringify(user_req)
  }).then(x=>x.json()).then(x=>{
    console.info(x)
    document.getElementById("success").style = "";
    document.getElementById("error").style = "display:none;";
    document.getElementById("resetPassword").style = "display:none;";
    document.getElementById("sendRequest").style = "display:none;";
  }).catch(e=>{
    console.error(e);
    document.getElementById("error").style = "";
    document.getElementById("success").style = "display:none;";
    document.getElementById("resetPassword").style = "display:none;";
    document.getElementById("sendRequest").style = "display:none;";
  });
}



function resetPassword(){
  let searchparam = new URLSearchParams(window.location.search)
  let token = searchparam.get("token");
  password = document.getElementById("password").value
  password_req = {"password": password}
  fetch("../../resetPassword", {
    method: 'POST',
    headers: new Headers({'Authorization': 'Bearer ' + token }),
    body: JSON.stringify(password_req)
  }).then(x=>x.json()).then(x=>{
    console.info(x)
    document.getElementById("success").style = "";
    document.getElementById("error").style = "display:none;";
    document.getElementById("resetPassword").style = "display:none;";
    document.getElementById("sendRequest").style = "display:none;";
  }).catch(e=>{
    console.error(e);
    document.getElementById("error").style = "";
    document.getElementById("success").style = "display:none;";
    document.getElementById("resetPassword").style = "display:none;";
    document.getElementById("sendRequest").style = "display:none;";
  });
}


document.body.onload = function(){
  // which to display
  let searchparam = new URLSearchParams(window.location.search)
  let token = searchparam.get("token");
  document.getElementById("resetBtn").onclick = resetPassword;
  document.getElementById("requestBtn").onclick = requestResetPassword;
  if (token){
    // show reset password only
    document.getElementById("resetPassword").style = "";
    document.getElementById("sendRequest").style = "display:none;";
    document.getElementById("success").style = "display:none;";
    document.getElementById("error").style = "display:none;";
  } // showing the sendRequest is default.
}
