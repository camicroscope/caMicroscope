let itemList = [];

function addItem(item) {
  itemList.push(item);
}

function clearList() {
  itemList = [];
}

function getList() {
  return itemList;
}

module.exports = {
  addItem,
  clearList,
  getList,
};
