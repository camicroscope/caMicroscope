const fetch = require('node-fetch');
const Store = require("../Store.js")

describe('Store Component', function () {
  var store;
  var req;

  it('should initalize', function () {
    let config = {
      testmode: true
    }
    store = new Store("", config);
  });
  it('should make a request', function () {
    req = store.get("test", {});
  });
});
