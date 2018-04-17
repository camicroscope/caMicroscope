window.setInterval(function(){
  fetch("../security/checkStatus.php", {method: 'post'})
  .then(function(x){
    return x.json()
  })
  .then(function(rsp){
    if (rsp.issued && (rsp.now - rsp.issued > 60*50)){
      window.alert("Your session has expired.")
    }
  })
  .catch((x)=>console.warn(x));
}, (1000*60*5));
