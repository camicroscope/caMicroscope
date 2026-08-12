jest.mock('node-fetch', () => jest.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({success: true}),
})));

const fetch = require('node-fetch');
const Store = require('../core/Store');

describe('Store', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    test('builds a URL with the encoded email query param', async () => {
      const store = new Store('/api/');
      await store.getUsers('a@b.com');

      expect(fetch).toHaveBeenCalledWith(
          '/api/User/find?email=a%40b.com',
          expect.objectContaining({credentials: 'include', mode: 'cors'}),
      );
    });

    test('omits the query string when no email is given', async () => {
      const store = new Store('/api/');
      await store.getUsers();

      expect(fetch).toHaveBeenCalledWith('/api/User/find', expect.any(Object));
    });
  });

  describe('errorHandler', () => {
    test('returns an error object for a non-ok response', () => {
      const store = new Store('/api/');
      const result = store.errorHandler({ok: false, statusText: 'Not Found', url: '/api/x'});

      expect(result).toEqual({error: true, text: 'Not Found', url: '/api/x'});
    });
  });
});
