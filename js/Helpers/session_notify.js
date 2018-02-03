window.setInterval(function(){
  function reqListener () {
    var rsp = JSON.parse(this.responseText)
    console.log(rsp);
    if (rsp.now - rsp.issued > 60*50){
      window.alert("Your session is about to expire (within 10 minutes), act or be logged out. (Message Pending)")
    }
  }
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", reqListener);
  oReq.open("POST", "../security/server.php?checkStatus");
  oReq.send();
}, (1000*60*5));
