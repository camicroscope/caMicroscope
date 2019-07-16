function touchHandler(event) {
  console.info(event.type)
  var touches = event.touches;
  console.log(touches)
  if (touches.length == 0|| !(touches[0])){
    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent("mouseup", true, true, window, 1,
      0, 0,
      0, 0, false,
      false, false, false, 0 /*left*/ , null);

    event.target.dispatchEvent(simulatedEvent);
  } else {
    for (let i = 0; i < touches.length; i++) {
      var first = touches[i];
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
