

const { JSDOM } = require('jsdom');
const jquery = require('jquery');
const $ = require('jquery')

const { window } = new JSDOM('<!doctype html><html><body></body></html>');

global.window = window;
global.document = window.document;


console.log(typeof $)



console.log(typeof window)
// Create a new JSDOM instance


// Assign the window and document to global variables

// Now you can use jQuery in your tests








const pathConfig = {
  'collection': '../collection/collection.html',
  'user': '../user/user.html',

};

function calculateMainHeight() {
  
  const height = $(window).height() - $('#nav-bar').height();
  $('#main').height(height);
}
calculateMainHeight();
$(window).resize(function() {
  calculateMainHeight();
});

function redirectPath(link, url) {
  //
  // console.log(this);
  $('#sidebarMenu .nav-link').each((idx, link)=>$(link).removeClass('active'));
  $(link).addClass('active');
  $('#main iframe').attr('src', url);
}

module.exports = admin
