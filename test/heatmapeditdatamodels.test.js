const {EditDataCollection, EditDataCluster} = require('../common/heatmapeditdatamodels');

describe('EditDataCollection', () => {
  let editDataCollection;

  beforeEach(() => {
    editDataCollection = new EditDataCollection(1, 'name', 'value', 'color');
  });

  test('Constructor initializes properties correctly', () => {
    expect(editDataCollection.index).toBe(1);
    expect(editDataCollection.name).toBe('name');
    expect(editDataCollection.value).toBe('value');
    expect(editDataCollection.color).toBe('color');
    expect(editDataCollection.editDataArray).toEqual([]);
  });

  test('addEditData adds editData correctly', () => {
    const editData = {prop: 'value'};
    editDataCollection.addEditData(editData);
    expect(editDataCollection.editDataArray).toEqual([editData]);
  });

  test('removeEditDataByIndex removes editData correctly', () => {
    const editData1 = {prop: 'value1'};
    const editData2 = {prop: 'value2'};
    editDataCollection.addEditData(editData1);
    editDataCollection.addEditData(editData2);
    editDataCollection.removeEditDataByIndex(0);
    expect(editDataCollection.editDataArray).toEqual([editData2]);
  });

  test('toJSON returns the correct JSON representation', () => {
    const expectedJSON = {
      name: 'name',
      index: 1,
      value: 'value',
      color: 'color',
      data: [],
    };
  });
});

describe('EditDataCluster', () => {
  let editDataCluster;

  beforeEach(() => {
    editDataCluster = new EditDataCluster();
  });

  test('Constructor initializes properties correctly', () => {
    expect(editDataCluster.clusters).toEqual([]);
  });

  test('isEmpty returns true for empty clusters', () => {
    expect(editDataCluster.isEmpty()).toBe(true);
  });

  test('getCluster returns correct cluster', () => {
    const cluster = {index: 1, name: 'name', value: 'value', color: 'color'};
    editDataCluster.clusters.push(cluster);
    expect(editDataCluster.getCluster(1, 'name', 'value', 'color')).toEqual(cluster);
  });
});
