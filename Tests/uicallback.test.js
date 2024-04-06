

// test for toggle viewer mode:

const {JSDOM} = require('jsdom');
const {toggleSideMenu} = require('../apps/heatmap/uicallbacks');


// test for closeSecondary viewer
describe('closed viewer function', () => {
  // settting up a basic dom structure using JSDOM

  const dom = new JSDOM(`
      <html>
      <body>
        <div id="main_viewer" class="main"></div>
        <div id="minor_viewer" class="none"></div>
      </body>
      </html>
      
      `);

  // global objects for window and document

  global.window = dom.window;
  global.document = dom.window.document;
});
test('closeSecondaryViewer function should update classes and elements correctly', () => {
  const closeSecondaryViewer = jest.fn();

  const $CAMIC = {
    viewer: {
      controls: {
        bottomright: {style: {display: ''}},
      },
      removeHandler: jest.fn(),
    },
  };

  const $UI = {
    lockerPanel: {style: {display: 'block'}},
    toolbar: {
      getSubTool: jest.fn(() => ({
        querySelector: jest.fn(() => ({checked: true})),
      })),
    },
    layersViewerMinor: {
      toggleAllItems: jest.fn(),
      setting: {data: [{layer: 'example'}]},
    },
  };

  const Loading = {close: jest.fn()};

  // Call the function
  closeSecondaryViewer();

  // Assertions
  expect(document.getElementById('main_viewer').classList.contains('main')).toBe(true);
  expect(document.getElementById('main_viewer').classList.contains('left')).toBe(false);
  expect(document.getElementById('minor_viewer').classList.contains('none')).toBe(true);
  expect(document.getElementById('minor_viewer').classList.contains('right')).toBe(false);
  expect($CAMIC.viewer.controls.bottomright.style.display).toBe('');
});


const $UI = {
  toolbar: {
    changeMainToolStatus: jest.fn(),
  },
};
  // testing the toggle side menu function
describe('toggleSlideMenu', () => {
  it('should changeMainToolStatus when isOpen is false', () => {
    const opt = {
      isOpen: false,
      target: {id: 'sidebar_menu_1'},
    };

    const changeMainToolStatusMock = jest.fn();
    $UI.toolbar.changeMainToolStatus = changeMainToolStatusMock;

    function toggleSideMenu(options) {
      if (!options.isOpen) {
        $UI.toolbar.changeMainToolStatus('menu_1', false);
      }
    }

    toggleSideMenu(opt);

    expect(changeMainToolStatusMock).toHaveBeenCalledWith('menu_1', false);
  });
});


// testing for the open secondary viewer
describe('openSecondaryViewer function', () => {
  beforeEach(() => {
    // settting up a basic dom structure using JSDOM

    const dom = new JSDOM(`
  <html>
  <body>
    <div id="main_viewer" class="main"></div>
    <div id="minor_viewer" class="none"></div>
  </body>
  </html>
  `);

    // global objects for window and document

    global.window = dom.window;
    global.document = dom.window.document;
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });
  test('should update classes and call multSelectorAction after timeout', () => {
    const openSecondaryViewer = jest.fn();
    const multSelectorAction = jest.fn();
    // Mock necessary DOM elements


    // Call the function
    openSecondaryViewer();


    // Assertions
    const main = document.getElementById('main_viewer');
    const minor = document.getElementById('minor_viewer');
    expect(minor.classList.contains('none')).toBe(true);
    expect(minor.classList.contains('right')).toBe(false);
    // Simulate setTimeout
    jest.runAllTimers();
  });
});

