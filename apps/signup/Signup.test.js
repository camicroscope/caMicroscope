// Importing the addUser function
const addUser = require('./signup')
const Store = require('../../core/Store')



const storeMock = {
    getUserPermissions: jest.fn().mockResolvedValue({}), // Mock any methods you use from the Store class
    requestToCreateUser: jest.fn().mockResolvedValue({})
    // Add more mock methods as needed
};

jest.mock('../../data/Store', () => {
    return jest.fn(() => storeMock);
});

// Simulating functions and objects
document.getElementById = jest.fn();
window.alert = jest.fn();
fetch = jest.fn(() => Promise.resolve({ status: 200, json: () => Promise.resolve({}) }));

describe('addUser', () => {
    beforeEach(() => {
        // Resetting mocks before each test
        jest.clearAllMocks();
    });

    test('should display an alert message for invalid email', () => {
        document.getElementById.mockReturnValueOnce({ value: 'invalidemail' });

        addUser();

        // Asserting
        expect(window.alert).toHaveBeenCalledWith('Please enter a valid email');
        expect(fetch).not.toHaveBeenCalled(); // No HTTP request should be initiated
    });

    test('should register user with admin type when attribute is "3"', async () => {
        document.getElementById.mockReturnValueOnce({ value: 'validemail@example.com' });
        document.getElementById.mockReturnValueOnce({ value: 'filtersValue' });
        document.getElementById.mockReturnValueOnce({ selectedIndex: 0, options: [{ value: '3' }] });
        fetch.mockReturnValueOnce(Promise.resolve({ exists: true }));

        await addUser();

        expect(fetch).toHaveBeenCalledWith(expect.any(String), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: 'validemail@example.com', userType: 'Admin', userFilter: 'filtersValue' }),
        });
        expect(window.alert).toHaveBeenCalledWith('User registered successfully');
    });

    // Test for creating a user
    test('should request to create a user if token does not exist and user has permission', async () => {
        // Arranging
        document.getElementById.mockReturnValueOnce({ value: 'validemmail@example.com' });
        document.getElementById.mockReturnValueOnce({ value: 'filtersValue' });
        document.getElementById.mockReturnValueOnce({ selectedIndex: 0, options: [{ value: '1' }] });
        fetch.mockReturnValueOnce(Promise.resolve({ exists: false }));
        const requestToCreateUserMock = jest.spyOn(store, 'requestToCreateUser').mockImplementation(() => {});

        // Acting
        await addUser();

        // Asserting
        expect(requestToCreateUserMock).toHaveBeenCalledWith('validemail@example.com', 'filtersValue', 'Null');
        expect(fetch).not.toHaveBeenCalled();
        expect(window.alert).not.toHaveBeenCalled();
    });

    test('should handle error when user registration fails', async () => {
        // Arranging
        document.getElementById.mockReturnValueOnce({ value: 'validemail@example.com' });
        document.getElementById.mockReturnValueOnce({ value: 'filtersValue' });
        document.getElementById.mockReturnValueOnce({ selectedIndex: 0, options: [{ value: '3' }] });
        fetch.mockReturnValueOnce(Promise.resolve({ status: 400 }));

        // Acting
        await addUser();

        // Asserting
        expect(fetch).toHaveBeenCalledWith(expect.any(String), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: 'validemail@example.com', userType: 'Admin', userFilter: 'filtersValue' }),
        });
        expect(window.alert).toHaveBeenCalledWith('failed to sign up user');
    });
});
