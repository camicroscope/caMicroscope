if (detectIE()) {
  createWarningText(
      'You are using an <strong>IE/Edge</strong> browser that may be lead to erratic behavior on caMicroscope. ' +
      'Please switch to <a href="https://www.google.com/chrome/">Chrome</a>, ' +
      '<a href="https://www.mozilla.org/en-US/firefox/new/">Firefox</a> or ' +
      '<a href="https://www.apple.com/safari/">Safari</a> browser to improve your experience.',
  );
}
// Loading.open(document.body, 'CaMicroscope is initializing...');
// get slide id from url
$D.params = getUrlVars();

if ($D.params.mode == 'pathdb') {
  $D.pages.home = '../../../';
  $D.pages.table = '../../../';
}

// load if we have at least one slide query element
if ($D.params && $D.params.slideId) {
  // normal initialization starts
  document.addEventListener('DOMContentLoaded', initialize);
} else if (
  $D.params &&
      ($D.params.slide ||
        $D.params.specimen ||
        $D.params.study ||
        $D.params.location ||
        $D.params.collection
      )
) {
  let STORE = new Store('../../data/');
  STORE.findSlide(
      $D.params.slide,
      $D.params.specimen,
      $D.params.study,
      $D.params.location,
      null,
      $D.params.collection,
  )
      .then((x) => {
        let offset = parseInt($D.params.offset, 10) || 0;
        if (x.length == 0 || offset >= x.length) {
          redirect($D.pages.table, 'No Slide Found. Redirecting To Table.');
        } else {
          newParams = $D.params;
          delete newParams.data;
          delete newParams.slide;
          delete newParams.location;
          delete newParams.offset;
          newParams.slideId = x[offset]['_id']['$oid'];
          newUrl =
              window.location.href.split('?')[0] +
              '?' +
              objToParamStr(newParams);
          window.location.href = newUrl;
        }
      })
      .catch((e) => {
        console.warn(e);
        redirect($D.pages.table, 'Redirecting to Table.');
      });
  // find the associated slideID
  // open viewer with that slideID
} else {
  redirect($D.pages.table, 'Slide is undefined. Redirecting to Table.');
}

// get states parameters
if ($D.params.states) {
  $D.params.states = StatesHelper.decodeStates($D.params.states);
}
