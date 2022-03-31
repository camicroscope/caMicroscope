const __auth_check = async function(levels) {
  const resp = await fetch('../'.repeat(levels) + 'data/Template/find');
  if (resp.status == 401) {
    // send them to login
    window.location = '../'.repeat(levels) + 'login.html?state=' + encodeURIComponent(window.location);
  }
};

const checkRegistrationStatus = async function(levels) {
  const base = `${'../'.repeat(levels)}data/`;
  const dbStore = new Store(base);
  try {
    var user = await dbStore.getUsers(getUserId());

    if (Array.isArray(user)&&user.length>0) { // user exist
      $USER = user = user[0];
      if (user.registration&&user.isAgreed) { //
        const userType = getUserType();
        if (userType == 'Admin') {
          if (-1 === window.location.href.indexOf('landing/landing.html')) {
            window.location = '../'.repeat(levels) + 'apps/landing/landing.html';
          }
        } else {
          if (-1 === window.location.href.indexOf('landing/crowd.html')) {
            window.location = '../'.repeat(levels) + 'apps/landing/crowd.html';
          }
        }
      } else { // no registration info and disagree consent form
        window.location = '../'.repeat(levels) + 'apps/registration/registration.html';
      }
    } else {
      window.location = '../'.repeat(levels) + 'apps/registration/registration.html';
    }
  } catch (error) {
    console.error('checkRegistrationStatus: service error'+ error.toString());
    //
  }
};
