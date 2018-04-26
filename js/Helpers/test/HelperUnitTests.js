const { expect } = require('chai');


describe('State Manager', function () {
  var camic_state;
  var state_test_obj = {"a": 1, "b":[1,2], "c": {"valid": true}}
  var state_str;
  it('should construct', async function () {
    camic_state = new StateManager('state');
    expect(camic_state).to.exist;
  });
  it('should encode', async function () {
    state_str = camic_state.encode(state_test_obj)
    expect(state_str).to.exist;
  });
  it('should decode to the same as the input', async function () {
    var res_str = camic_state.decode(state_str)
    expect(camic_state).to.deep.equal(state_test_obj);
  });
});
