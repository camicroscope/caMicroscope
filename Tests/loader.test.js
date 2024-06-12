const {JSDOM} = require('jsdom');

// test for successful upload
test('Successful upload', () => {
  const handleUpload = jest.fn();
  const mockFile = new File([], 'dummyFile');
  const mockFilename = 'dummyFilename';

  global.changeStatus = jest.fn();

  return handleUpload(mockFile, mockFilename);

  expect(global.changeStatus).toHaveBeenCalledWith('UPLOAD', 'dummyFile uploaded successfully');
});
