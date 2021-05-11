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
