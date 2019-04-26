import GHCHelpers from './GHCHelpers.js'
// this is not working yet. WIP until I can look at the data
CaMic.prototype.loadImg = function(func) {
  // do we have a GHC token?
  // load up!
  var img_id = urlParams.get('id');
  this.slideId = img_id
  this.slideName = img_id
  this.study = ""
  this.specimen = ""
  // TODO make based on url
  this.project = "public-datasets-194701"
  this.locaion = "us-central1"
  this.data_store = "test1"
  this.dataset = "rbirmin_dicom_test"
  this.ghc_study = "1.2.276.0.7230010.3.1.2.1784940379.231387.1533066220.970617" // the thing we expect to change

  this.mpp = 1e9;
  this.mpp_x = this.mpp; // until we can fix this
  this.mpp_y = this.mpp;
  var ghc = new GHCHelpers(this.project, this.location, this.dataset, this.data_store, this.viewer)
  ghc.loadInstancesInStudy(this.ghc_study) // opens viewer to its own custom source

  // create item to pass to the callback function, previously x[0] (slide data)
  let x = {}
  x['_id'] = this.slideId
  x.name = this.slideName

  x.study = this.study
  x.specimen = this.specimen
  x.mpp = this.mpp;
  x.mpp_x = this.mpp_x;
  x.mpp_y = this.mpp_y;
  x.location = "GHC--" + this.slideId
  x.url = "WHOOPS"; // oh no, the secondary viewers...
  if (func && typeof func === 'function') {
    func.call(null, x);
  }
}
