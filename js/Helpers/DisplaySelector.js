//This file creates an overlay which aims to provide information to any second viewer
// such as side split or spyglass


function overlay_url(id){
  return "api/Data/getAlgorithmsForImage.php?" + id;
}

var menu = document.createElement("div");
menu.style.zIndex = 3;
menu.style.display = "none";
menu.id = "second_display_menu"
var lst = document.createElement("ul");
lst.id = "second_display_list";
menu.appendChild(lst);
document.body.appendChild(menu);

function show_images(img_api_url, lst){
  fetch(img_api_url)
    .then(function(rsp){
      // clear the list first
      lst.innerHTML = "";
      // parse api response
      let d = rsp.json();
      d.forEach(function(item){
        let elem = document.createElement("li");
        elem.innerHTML = item.name;
        elem.onclick = () => (document.dispatchEvent(new CustomEvent("SecImageLoad", {detail: {url: item.url, id: item.name}})));
        lst.appendChild(elem);
      })
    });
}

function show_images_lst(d, lst){
  lst.innerHTML = "";
  d.forEach(function(item){
    let elem = document.createElement("li");
    elem.innerHTML = item.name;
    elem.onclick = () => (document.dispatchEvent(new CustomEvent("SecImageLoad", {detail:{url: item.url, id: item.name}})));
    lst.appendChild(elem);
  })
}

function show_overlays(ovr_api_url, lst){
  fetch(ovr_api_url)
    .then(function(rsp){
      // clear the list first
      lst.innerHTML = "";
      // parse api response
      let d = rsp.json();
      d.forEach(function(item){
        let elem = document.createElement("li");
        elem.innerHTML = item.name;
        elem.onclick = () => (document.dispatchEvent(new CustomEvent("SecOverlay", {detail: {algs: [item.name]}})));
        lst.appendChild(elem);
      })
    });
}

// register this event to pusing a button which requiees it
window.addEventListener('display_select', function(detail){
  var menu = document.getElementById("second_display_menu");
  var lst = document.getElementById("second_display_list");
  menu.style.display = "block";
  if (detail.detail.type == "lst_img"){
    show_images_lst(detail.detail.list, lst);
  }
  else if (detail.detail.type == "img"){
    show_images(detail.detail.api_url, lst);
  } else if (detail.detail.ype == "mkp"){
    show_mkp(detail.detail.api_url, lst);
  } else {
    console.warn("unkown display selector requested");
  }
})

// event listner for img load
window.addEventListener("SecImageLoad", function(detail){
  viewer2.open(detail.detail.url);
  show_overlays(overlay_url(detail.detail.id), document.getElementById("second_display_list"))
});

// event listner for mkp load
window.addEventListener("SecOverlay", function(detail){
  annotools2.algorithmList = detail.detail.algs;
  // close menu
  document.getElementById("second_display_menu").style.display = "none";
});

function start(){
  e = new CustomEvent("display_select", {detail: {type: "lst_img", list: [{name: "first", url:"first"}, {name: "first", url:"first"}]}})
  window.dispatchEvent(e);
}
