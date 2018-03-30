//This file creates an overlay which aims to provide information to any second viewer
// such as side split or spyglass



function overlay_url(id){
  return "api/Data/getAlgorithmsForImage.php?" + id;
}

let menu = document.createElement("div");
menu.style.zIndex = 3;
menu.style.display = "none";
menu.id = "second_display_menu"
let lst = document.createElement("ul");
lst.id = "second_display_list";
menu.appendChild(lst);

function show_images(img_api_url, lst){
  fetch(img_api_url)
    .then(function(rsp){
      // clear the list first
      lst.innerHtml = "";
      // parse api response
      let d = rsp.json();
      d.forEach(function(item){
        let elem = document.createElement("li");
        elem.innerHtml = item.name;
        elem.onclick = () => (document.dispatchEvent(new CustomEvent("SecImageLoad", {url: item.url, id: item.name})));
        lst.appendChild(elem);
      })
    });
}

function show_overlays(ovr_api_url, lst){
  fetch(ovr_api_url)
    .then(function(rsp){
      // clear the list first
      lst.innerHtml = "";
      // parse api response
      let d = rsp.json();
      d.forEach(function(item){
        let elem = document.createElement("li");
        elem.innerHtml = item.name;
        elem.onclick = () => (document.dispatchEvent(new CustomEvent("SecOverlay", {algs: [item.name]})));
        lst.appendChild(elem);
      })
    });
}

// register this event to pusing a button which requiees it
document.addEventListner('display_select', function(detail){
  var menu = document.getElementById("second_display_menu");
  var lst = document.getElementById("second_display_list");
  menu.style.display = "block";
  if (detail.type == "img"){
    show_images(detail.img_api_url, lst);
  } else if (detail.type == "mkp"){
    show_mkp(detail.mkp_api_url, lst);
  } else {
    console.warn("unkown display selector requested");
  }
})

// event listner for img load
document.addEventListner("SecImageLoad", function(detail){
  viewer2.open(detail.url);
  show_overlays(overlay_url(detail.id), document.getElementById("second_display_list"))
});

// event listner for mkp load
document.addEventListner("SecOverlay", function(detail){
  annotools2.algorithmList = detail.algs;
  // close menu
  document.getElementById("second_display_menu").style.display = "none";
});
