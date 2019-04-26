import GHCHelpers from './GHCHelpers.js'
// this is not working yet. WIP until I can look at the data
CaMic.prototype.loadImg = function(func) {
  // do we have a GHC token?
  // load up!
  var urlParams = new URLSearchParams(window.location.search);
  let default_project = "public-datasets-194701"
  let default_location = "us-central1"
  let default_data_store = "test1"
  let default_dataset = "rbirmin_dicom_test"
  let default_ghc_study = "1.2.276.0.7230010.3.1.2.1784940379.231387.1533066220.970617"
  var ghc_params = {}
  try{
    ghc_params = JSON.parse(decodeURIComponent(urlParams.get('slideId'))) || {}
  } catch (e){
    console.log("bad or missing ghc param object", e)
  }
  this.project = ghc_params.project || default_project
  this.location = ghc_params.location || default_location
  this.data_store = ghc_params.datastore || default_data_store
  this.dataset = ghc_params.dataset || default_dataset
  this.ghc_study = ghc_params.study || default_ghc_study // the thing we expect to change
  var img_id = urlParams.get('slideId');
  this.slideId = "GHC:" + this.project + ":" + this.location + ":" + this.data_store + ":"+ this.dataset + ":" + this.ghc_study
  this.slideName = "GHC IMG FROM " + this.project
  this.study = ""
  this.specimen = ""
  this.mpp = 1e9;
  this.mpp_x = this.mpp; // until we can fix this
  this.mpp_y = this.mpp;
  var ghc = new GHCHelpers(this.project, this.location, this.dataset, this.data_store, this.viewer)
  document.addEventListener("ghc_tileSource_ready", e=>{
    console.log("finishing load with event")
    console.info(e.detail)
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
    x.url = e.detail; // oh no, the secondary viewers...
    if (func && typeof func === 'function') {
      func.call(null, x);
    }
  })
  ghc.loadInstancesInStudy(this.ghc_study) // opens viewer to its own custom source


}
