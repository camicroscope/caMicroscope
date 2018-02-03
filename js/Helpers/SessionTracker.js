// SESSION TRACKING
// This tool is intended to keep a session active, so it tracks some session variables.

class SessionTracker{
  constructor(name){
    this.name = name;
  }
  store(){
    // store the current time or some proxy
    var now = Date.now();
    window.localStorage.setItem(this.name + "-lastauth", now);
  }
  start(interval, timeout, renewFcn){
    /**
    * @param {Integer} interval - how often, in ms, to check the session
    * @param {Integer} timeout - how long, in ms, the session takes to expire. Estimate low.
    * @param {function} renewFcn - the function to call when the session expires
    * NOTE that renewFcn is called two intevals before the timeout
    */
    // TODO doc that interval and timeout are in ms
    var a = function(){
      var lastauth = window.localStorage.getItem(this.name + "-lastauth");
      var now = Date.now();
      if (now - lastauth >= timeout - (2*interval)){
        // TODO maybe make an event object to pass to renew fcn?
        renewFcn();
        this.store();
      }
    }
    var b = a.bind(this);
    window.setInterval(b, interval);
  }

}

/*
Usage example:
var st = new SessionTracker("myApp");
st.store(); // initial authorization tracked.
// check minutely and renew by 10 minutes
st.start(60000, 600000, function(){console.log("renewed!")});
*/
