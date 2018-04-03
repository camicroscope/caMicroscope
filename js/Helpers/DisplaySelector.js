// default getalgs
function getAlgs(caseid, cb){
  fetch("api/Data/getAlgorithmsForImage.php?" + caseid)
  .then((x)=>(cb(x.json())))
}

var DisplaySelector(viewer1, viewer2, imgs, getAlgs, annotools1, annotools2){
  // viewer 1 is l or base, viewer2 is r or spyglass; annotools follows same
  // imgs is either a dict structued as name:open obj or just a name
  // get alg should return a list of algorithms; args (caseid, callback)
  // if returns null, ok

  // create the base mneu selector, hidden by detault
  var menu = document.createElement("div");
  menu.style.zIndex = 3;
  menu.style.display = "none";
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

  function addOption(sid, name, val){
    let a = document.createElement("option");
    a.value = val;
    a.innerHTML = name;
    document.getElementById(sid).appendChild(a);
  }
  // if imgs is str, hide img selectors
  if (typeof(imgs) == "string"){
    document.getElementById("DS-LI").style.display = "none";
    document.getElementById("DS-RI").style.display = "none";
  } else {
    for (var k in imgs){
      addOption("DS-LI", k, imgs[k]);
      addOption("DS-RI", k, imgs[k]);
    }
  }
  dsli.onchange = function(e){
    // open image
    viewer1.open(e.target.value)
    dsra.innerHTML = "";
    getAlgs(e.target.value, function(algs){
      for (var k in algs){
        addOption("DS-LA", k, algs[k]);
      }
    });
  };
  dsri.onchange = function(e){
    // open image
    viewer2.open(e.target.value);
    dsra.innerHTML = "";
    getAlgs(e.target.value, function(algs){
      for (var k in algs){
        addOption("DS-RA", k, algs[k]);
      }
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
