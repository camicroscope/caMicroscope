const fetch = require('node-fetch');
const Store = require("../Store.js")

describe('Store Component', function () {
  var store;
  var req;

  it('should initalize', function () {
    store = new Store("testid");
  });
  it('should make a request', function () {
    req = store.getSlide();
  });
});
