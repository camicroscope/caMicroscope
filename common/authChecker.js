function getCookie(name) {
  var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match){
    return match[2];
  }
}

const __auth_check = async function(levels) {
  // check token
  if (!getCookie('token')) {
    console.log("Redir due to lack of token")
    window.location = '../'.repeat(levels) + 'login.html?state=' + encodeURIComponent(window.location);
  }
  const resp = await fetch('../'.repeat(levels) + 'data/Template/find');
  if (resp.status == 401) {
    // send them to login
    console.log("Redir due to getting a 401 on template")
    window.location = '../'.repeat(levels) + 'login.html?state=' + encodeURIComponent(window.location);
  }
};

const checkRegistrationStatus = function(levels) {
  const base = `${'../'.repeat(levels)}data/`;
  try {
    const userType = getUserType();
    switch (userType) {
      case 'Admin':
        if (-1 === window.location.href.indexOf('landing/landing.html')) {
          window.location = '../'.repeat(levels) + 'apps/landing/landing.html';
        }
        break;
      case 'Expert':
          if (-1 === window.location.href.indexOf('landing/landing.html')) {
            window.location = '../'.repeat(levels) + 'apps/landing/landing.html';
          }
          break;
      case 'Participant':
        if (-1 === window.location.href.indexOf('landing/crowd.html')) {
          window.location = '../'.repeat(levels) + 'apps/landing/crowd.html';
        }
        break;
      case 'Null':
        if (-1 === window.location.href.indexOf('landing/crowd.html')) {
          window.location = '../'.repeat(levels) + 'apps/landing/crowd.html';
        }
        break;
      default:
        console.warn('something wrong');
        break;
    }
  } catch (error) {
    console.error('checkRegistrationStatus: service error'+ error.toString());
    //
  }
};
