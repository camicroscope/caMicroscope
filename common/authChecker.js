function getCookie(name) {
  var value = '; ' + document.cookie;
  var parts = value.split('; ' + name + '=');
  if (parts.length == 2) {
    return parts
        .pop()
        .split(';')
        .shift();
  }
}

const __auth_check = async function(levels) {
  // check token
  if (!getCookie('token')) {
    window.location = '../'.repeat(levels) + 'login.html?state=' + encodeURIComponent(window.location);
  }
  const resp = await fetch('../'.repeat(levels) + 'data/Template/find');
  if (resp.status == 401) {
    // send them to login
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
      case 'Editor':
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
