// default getalgs
function getAlgs(caseid, cb){
  fetch("api/Data/getAlgorithmsForImage.php?" + caseid)
  .then((x)=>(cb(x.json())))
}

function DisplaySelector(viewer1, viewer2, imgs, getAlgs, annotools1, annotools2){
  // viewer 1 is l or base, viewer2 is r or spyglass; annotools follows same
  // imgs is a dict structued as name:open obj
  // get alg should return a list of algorithms; args (caseid, callback)
  // if returns null, ok

  var menu = document.getElementById("DisplaySelector");
  // create the base mneu selector, hidden by detault
  menu = document.createElement("div");
  menu.style.zIndex = 3;
  menu.style.position = "absolute";
  menu.style.top = "50px";
  menu.height = "100px";
  menu.id = "DisplaySelector";
  menu.style.width = "80%";
  menu.style.left = "10%";
  document.body.appendChild(menu);
  // left img box
  var dsli = document.createElement("select");
  dsli.id = "DS-LI";
  menu.appendChild(dsli);
  // left alg box
  var dsla = document.createElement("select");
  dsla.id = "DS-LA";
  menu.appendChild(dsla);
  // right img box
  var dsri = document.createElement("select");
  dsri.id = "DS-RI";
  menu.appendChild(dsri);
  // right alg box
  var dsra = document.createElement("select");
  dsra.id = "DS-RA";
  menu.appendChild(dsra);
  // done button
  var dsdone = document.createElement("input");
  dsdone.type = "button";
  dsdone.onclick = ()=>(menu.style.display="none");
  menu.appendChild(dsdone);


  function addOption(sid, name, val){
    let a = document.createElement("option");
    a.value = val;
    a.innerHTML = name;
    document.getElementById(sid).appendChild(a);
  }
  // populate images
  Object.keys(imgs).forEach(function(k){
      addOption("DS-LI", k, imgs[k]);
      addOption("DS-RI", k, imgs[k]);
  });
  // load first img in second viewer
  viewer2.open(imgs[Object.keys(imgs)[0]]);
  dsli.onchange = function(e){
    // open image
    viewer1.open(e.target.value);
    annotools1.iid = e.target.value;
    dsra.innerHTML = "";
    getAlgs(e.target.value, function(algs){
      algs.forEach((k)=>addOption("DS-LA", k, algs[k]));
    });
  };
  dsri.onchange = function(e){
    // open image
    viewer2.open(e.target.value);
    annotools2.iid = e.target.value;
    dsra.innerHTML = "";
    getAlgs(e.target.value, function(algs){
      algs.forEach((k)=>addOption("DS-RA", k, algs[k]));
    });
  };
  dsla.onchange = function(e){
    // open algs
    annotools1.SELECTED_ALGORITHM_LIST = [e.target.value];
    annotools1.getMultiAnnot(viewer1);

  };
  dsra.onchange = function(e){
    // open algs
    annotools2.SELECTED_ALGORITHM_LIST = [e.target.value];
    annotools2.getMultiAnnot(viewer2);
  };
}
