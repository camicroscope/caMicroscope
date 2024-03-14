


const { JSDOM } = require('jsdom');
const jquery = require('jquery');
const $ = require('jquery')

// Create a new JSDOM instance
const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>');



// Assign the window and document to global variables
global.window = window;
global.document = window.document;

console.log(global.window)




const { calculateMainHeight, redirectPath } = require('./admin');

describe('calculateMainHeight', () => {
  it('should calculate the height of the main element correctly', () => {
    global.window = { height: jest.fn(() => 600) }; 
    document.body.innerHTML = '<div id="nav-bar" style="height: 50px;"></div><div id="main"></div>';
    
    calculateMainHeight();
    
    expect($('#main').height()).toBe($(window).height() - $('#nav-bar').height());
  });
});

describe('redirectPath', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="sidebarMenu">
        <a class="nav-link" href="#">Link 1</a>
        <a class="nav-link" href="#">Link 2</a>
      </div>
      <div id="main">
        <iframe></iframe>
      </div>
    `;
  });

  it('should set the src attribute of the iframe element correctly', () => {
    const link = document.querySelector('#sidebarMenu .nav-link');
    const url = 'https://example.com';

    redirectPath(link, url);

    expect($('#main iframe').attr('src')).toBe(url);
  });

  it('should add the active class to the clicked link', () => {
    const link = document.querySelector('#sidebarMenu .nav-link');
    const url = 'https://example.com';

    redirectPath(link, url);

    expect($(link).hasClass('active')).toBe(true);
  });

  it('should remove the active class from other links', () => {
    const links = document.querySelectorAll('#sidebarMenu .nav-link');
    const link1 = links[0];
    const link2 = links[1];
    const url = 'https://example.com';

    // Set the active class to link1 initially
    $(link1).addClass('active');

    redirectPath(link2, url);

    expect($(link1).hasClass('active')).toBe(false);
    expect($(link2).hasClass('active')).toBe(true);
  });
});
