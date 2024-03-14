const jQuery = require('jquery');
const { JSDOM } = require('jsdom');
global.$ = jQuery;
global.jQuery = jQuery;




// Create a new JSDOM instance
const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>');

// Assign the window and document to global variables
global.window = window;
global.document = window.document;

// Now you can use jQuery in your tests
const $ = jquery(window);