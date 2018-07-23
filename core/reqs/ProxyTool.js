// call delayer to store then later apply
// {delayer obj}.__apply_all(new_base) applies everything done to the delayer obj to new base
function delayer(base){
  // add our delay functions/objects to base
  base.__queue = [];
  base.__apply_all = function(new_base){
    base.__queue.forEach(function(instruction){
      if (instruction[0]==="set"){
        new_base[instruction[1]] = instruction[2];
      }
      else if (instruction[0]==="fcn"){
        if (typeof new_base[instruction[1]] === "function"){
          new_base[instruction[1]](...instruction[2]);
        }
      }
    })
  }
  var handler = {
    get(obj, prop, val){
      // what if we're looking for queue or apply all?
      if (prop === "__queue"){
        return obj.__queue;
      }
      if (prop === "__clear_queue"){
        return () => (obj.__queue = []);
      }
      else if (prop === "__apply_all"){
        return obj.__apply_all;
      } else {
        return function (...args){
          obj.__queue.push(["fcn", prop, args]);
        }
      }
    },
    set(obj, prop, val) {
        obj.__queue.push(["set", prop, val]);
    }
  }
  return new Proxy(base, handler);
}

// call cloner with base and a list of items to clone (same type preferably) of the same type
function cloner(clones){
  var handler = {
     get(target, name, reciever){
      if (typeof clones[0][name] == "function"){
        // call the function with args to all contexts
        return function (...args){
          var ret = clones[0][name](...args);
          clones.slice(1).forEach((x) => (x[name](...args)));
          // return whatever base returns
          return ret;
        }
      } else {
        // just return base context value if it's not a function
        return clones[0][name];
      }

    },
    set(obj, prop, val) {
        clones.forEach((x) => x[prop] = val);;
        return val;
      }
    }
  return new Proxy(clones, handler);
}

var ProxyTools={}
ProxyTools.delayer = delayer;
ProxyTools.cloner = cloner;
try{
  module.exports = ProxyTools;
}
catch(e){
  var a;
}
