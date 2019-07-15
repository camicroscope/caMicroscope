function touchHandler(event) {
  console.info(event)
    if (event.touches.length > 1){
      return
    }
  var touches = event.targetTouches;
  
    var first = touches[0];
    var type = "";
    switch (event.type) {
      case "touchstart":
        type = "mousedown";
        break;
      case "touchmove":
        type = "mousemove";
        event.preventDefault();
        break;
      case "touchend":
        type = "mouseup";
        event.preventDefault();
        break;
      default:
        type = "mouseup";
        event.preventDefault();
        break;
    }

    // initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //                screenX, screenY, clientX, clientY, ctrlKey, 
    //                altKey, shiftKey, metaKey, button, relatedTarget);
    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1,
      first.screenX, first.screenY,
      first.clientX, first.clientY, false,
      false, false, false, 0 /*left*/ , null);

    first.target.dispatchEvent(simulatedEvent);
}

function touchMe_init() {
  document.addEventListener("touchstart", touchHandler, true);
  document.addEventListener("touchmove", touchHandler, true);
  document.addEventListener("touchend", touchHandler, true);
  document.addEventListener("touchcancel", touchHandler, true);
}
touchMe_init()
// thanks, Mickey Shine!
