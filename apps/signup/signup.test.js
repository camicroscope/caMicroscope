
const { addUser } = require('./signup');
const fetchMock = require('fetch-mock');


global.window.alert = jest.fn();

describe('addUser function tests', () => {
  beforeEach(() => {

    fetchMock.restore();
  });

  it('should alert if email is invalid', () => {
    document.getElementById = jest.fn().mockReturnValue({ value: 'invalid_email' });
    addUser();
    expect(window.alert).toHaveBeenCalledWith('Please enter a valid email');
  });

  it('should send correct data for admin user type', async () => {
    document.getElementById = jest.fn()
      .mockReturnValueOnce({ value: 'valid_email@example.com' }) 
      .mockReturnValueOnce({ value: 'filters' }) 
      .mockReturnValueOnce({ selectedIndex: 2 }); 

    fetchMock.post('../../data/User/post', 200); 

    await addUser();

    expect(fetchMock.lastOptions('../../data/User/post').body).toEqual(JSON.stringify({
      email: 'valid_email@example.com',
      userType: 'Admin',
      userFilter: 'filters'
    }));
    expect(window.alert).toHaveBeenCalledWith('User registered successfully');
  });

  it('should send correct data for non-admin user type with permission', async () => {
    document.getElementById = jest.fn()
      .mockReturnValueOnce({ value: 'valid_email@example.com' }) 
      .mockReturnValueOnce({ value: 'filters' }) 
      .mockReturnValueOnce({ selectedIndex: 2 }); 


    global.store = {
      getUserPermissions: jest.fn().mockResolvedValue({ user: { post: true } })
    };

    fetchMock.post('../../data/User/post', 200); 

    await addUser();

    expect(fetchMock.lastOptions('../../data/User/post').body).toEqual(JSON.stringify({
      email: 'valid_email@example.com',
      userType: 'Editor',
      userFilter: 'filters'
    }));
    expect(window.alert).toHaveBeenCalledWith('User registered successfully');
  });

});