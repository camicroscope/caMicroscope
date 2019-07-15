function touchHandler(event) {
  console.info(event)
  var touches = event.targetTouches;
  console.log(touches)
  for (let i = 0; i < touches.length; i++) {
    var first = touches[i];
    var type = "";
    switch (event.type) {
      case "touchstart":
        type = "mousedown";
        break;
      case "touchmove":
        type = "mousemove";
        break;
      case "touchend":
        type = "mouseup";
        break;
      default:
        type = "mouseup";
        break;
    }

    // initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //                screenX, screenY, clientX, clientY, ctrlKey, 
    //                altKey, shiftKey, metaKey, button, relatedTarget);
    var simulatedEvent = new MouseEvent(type,{
      clientX:first.clientX,
      clientY:first.clientY,
      screenX:first.screenX,
      screenY:first.screenY
    })
    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
  }
}

function touchMe_init() {
  document.addEventListener("touchstart", touchHandler, true);
  document.addEventListener("touchmove", touchHandler, true);
  document.addEventListener("touchend", touchHandler, true);
  document.addEventListener("touchcancel", touchHandler, true);
}
touchMe_init()
// thanks, Mickey Shine!
