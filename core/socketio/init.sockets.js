console.log('htllo');

const socket = io("http://localhost:4050", {
    // WARNING: in that case, there is no fallback to long-polling
    transports: [ "websocket", "polling" ] // or [ "websocket", "polling" ] (the order matters)
  });

socket.on('connect', function() {
    // Connected, let's sign-up for to receive messages for this room
    socket.emit('room', window.getUrlVars().slideId);
});

socket.on("connection_success", (data) => {
    console.log('Socket connected!', data);
})

const constantMock = window.fetch;
window.fetch = function() {
    // Get the parameter in arguments
    // Intercept the parameter here
    if (arguments[2] === true) {
        console.log('arguments: ', arguments);
        console.log('argument 3: ', arguments[2]);
        console.log('inside here');
        // return constantMock.apply(this, arguments).then(arguments[2](JSON.parse(arguments[1].body)));
        return constantMock.apply(this, arguments).then( async (data) => {
            let body = data.clone();
            body = await body.json();
            // const  { data, body } = dataObj;
            console.log('data:', data);
            console.log('body: ', body);
            socket.emit('message', { roomId: window.getUrlVars().slideId, body });
            return data;
        });
        // .then((dataObj) => {

        // });
    }
    return constantMock.apply(this, arguments);
}

socket.on("message", (arg) => {
    // document.getElementById('output').innerText = arg;
    console.log('message received: ', arg);
    // FormTempaltesLoader();
    layersLoader();
    // initialize();
});