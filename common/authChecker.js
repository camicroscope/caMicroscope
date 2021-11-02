const __auth_check = function(levels) {
  fetch('../'.repeat(levels) + 'data/Template/find').then((x)=>{
    // send them to login
    // for seer start
    xRemoteUser = x.headers.get('x-remote-user');
    console.log(`xRemoteUser: ${xRemoteUser}`);
    // for seer end
    if (x.status == 401) {
      window.location = '../'.repeat(levels) + 'login.html?state=' + encodeURIComponent(window.location);
    }
  });
};
