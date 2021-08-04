function makeid(length=6) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

const domain = 'localhost:8443'
let jitsiIframeApi; 

function openJitsiInNewTab () {
    var url = document.getElementById('jitsi-iframe').children[1].src;
    $( "#jitsi-iframe iframe" ).remove();
    $( "#jitsi-iframe" ).addClass('hide'); 	
    var tab = window.open(url, '_blank');
    tab.focus();
}

function closeJitsiCall () {
    jitsiIframeApi.executeCommand('hangup');
    $( "#jitsi-iframe iframe" ).remove();
    $( "#jitsi-iframe" ).addClass('hide'); 	
}

function initiateJitsiCall() {
    $('#jitsi-iframe').removeClass('hide');
    if (jitsiIframeApi) {
        jitsiIframeApi.executeCommand('hangup');
    }
    $( "#jitsi-iframe iframe" ).remove();
    const options = {
        roomName: 'JitsiMeetAPIExample',
        width: 400,
        height: 250,
        parentNode: document.querySelector('#jitsi-iframe')
    };    
    jitsiIframeApi = new JitsiMeetExternalAPI(domain, options)
    $('#jitsi-iframe').draggable();
}