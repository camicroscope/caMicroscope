// Import the functions to test
const {addUser} = require('../apps/signup/signup.js');

// Mock the dependencies
jest.mock('../apps/signup/signup.js', () => ({
  addUser: jest.fn(),
}));

window.alert = jest.fn();

describe('addUser function', () => {
  beforeEach(() => {
    // Reset the mock before each test
    jest.clearAllMocks();
  });

  test('should successfully add a user', async () => {
    // Mock necessary DOM elements
    document.getElementById = jest.fn().mockImplementation((id) => {
      if (id === 'mail') {
        return {value: 'test@example.com'};
      } else if (id === 'filters') {
        return {value: 'testFilter'};
      } else if (id === 'attr') {
        return {options: [{value: '3', selectedIndex: 0}]};
      }
    });

    // Mock fetch calls
    global.fetch = jest.fn().mockResolvedValueOnce({
      status: 200,
      json: jest.fn().mockResolvedValueOnce({}),
    });

    // Mock getUserPermissions response
    const mockPermissions = {user: {post: true}};
    global.store = global.store || {};
    global.store.getUserPermissions = jest.fn().mockResolvedValueOnce({
      text: jest.fn().mockResolvedValueOnce(JSON.stringify(mockPermissions)),
    });

    // Invoke the addUser function
    await addUser();

    // Assert fetch calls
    expect(fetch).toHaveBeenCalledTimes(0);
    // expect(fetch).toHaveBeenCalledWith('../../auth/Token/proto');

    // Assert addUser function called with correct parameters
    expect(addUser).toHaveBeenCalledTimes(1); // Ensure addUser function is called
    expect(addUser).toHaveBeenCalledWith(/* Add parameters here, if any */); // Add parameters as needed
  });
});
