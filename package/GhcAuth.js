function GhcAuth() {
  // Fill in all the values between the hash marks
  // #############################################
  const CLIENT_ID = 'INSERT-YOUR-CLIENT-ID-HERE'
  // #############################################

  const CLOUD_HEALTHCARE_API_BASE =
      'https://healthcare.googleapis.com/v1beta1/projects/';
  const SCOPE = 'https://www.googleapis.com/auth/cloud-healthcare';
  const STUDIES_PATH = '/studies';
  const SERIES_PATH = '/series';
  gapi.auth2.init({'clientId': CLIENT_ID, 'scope': SCOPE})
      .then(
          function() {
            googleAuth = gapi.auth2.getAuthInstance();

            if (googleAuth == null) {
              alert(
                  `OAuth failed, please make sure correct apiKey and clientId
                  filled in.`);
              return;
            }

            googleAuth.currentUser.get().getAuthResponse(true).access_token;
            user.hasGrantedScopes(SCOPE);
          });
}
