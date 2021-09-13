// Socket initialization
function socketInit() {
  const store = new Store('../../data/');
  const { slideId } = window.getUrlVars();
  const socketHostUrl = window.location.protocol + '//' + window.location.hostname + ':5000'
  store.getSlideCollabDetails(slideId).then(response => {
    let collaborationStatus = response.length > 0 ? response[0].collabStatus : false;
    if (collaborationStatus) {
      const socket = io(socketHostUrl, {
        // WARNING: in that case, there is no fallback to long-polling
        transports: ["websocket"], // or [ "websocket", "polling" ] (the order matters)
        auth: {
          token: document.cookie && document.cookie.split(';')[1] ? document.cookie.split(';')[1].split('=')[1] : '',
          slideId: window.getUrlVars().slideId,
        },
      });
  
      // Connection request
      socket.on('connect', function () {
        socket.emit('room', window.getUrlVars().slideId);
      });
  
      // Connection success
      socket.on("connection_success", (data) => {
        console.log('Socket connected!', data);
      })
  
      // EMPTY: On another user joining
      socket.on("user joined", (data) => {
        // console.log('user joined room: ', data);
      });

      // Error Handling
      socket.on("connect_error", err => {
        console.log('Socket Error: ', err);
      })
  
      const constantMock = window.fetch;
      window.fetch = function () {
        // Intercept the parameter here and get the parameter in "arguments"
        if (arguments[2] === true) {
          return constantMock.apply(this, arguments).then(async (data) => {
            let body = data.clone();
            body = await body.json();
            socket.emit('rtcActivity', { roomId: window.getUrlVars().slideId, body, typeOfEvent: arguments[3], socketData: arguments[4] });
            return data;
          });
        }
        return constantMock.apply(this, arguments);
      }
  
      socket.on("rtcActivity", (arg) => {
        if (arg.typeOfEvent === 'mark') {
          handleSocketDrawEvent()
        } else if (arg.typeOfEvent === 'heatmap') {
          handleSocketHeatmapEdit(arg)
        } else if (arg.typeOfEvent === 'chat') {
          receiveMessageIntoChat(arg.body.ops[0]);
        }
      });
    }
  });
}