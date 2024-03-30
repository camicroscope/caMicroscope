const {addItem, clearList, getList} = require('../../itemManager');

// Set up the test environment
beforeEach(() => {
  addItem('Item 1');
  addItem('Item 2');
  addItem('Item 3');
});

// Clean up the test environment
afterEach(() => {
  clearList();
});

// Test case 1: Adding an item to the list
test('Add item to the list', () => {
  addItem('New Item');
  expect(getList()).toContain('New Item');
});

// Test case 2: Clearing the list
test('Clear the list', () => {
  clearList();
  expect(getList()).toHaveLength(0);
});

// Test case 3: Getting the list
test('Get the list', () => {
  const list = getList();
  expect(list).toHaveLength(3);
  expect(list).toEqual(['Item 1', 'Item 2', 'Item 3']);
});
