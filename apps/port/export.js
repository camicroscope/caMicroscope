const store = new Store('../../data/');

async function populateList() {
  // clear any previous
  document.getElementById("output").innerHTML = "";
  console.log("populating list...")
  name_field = "name"
  // get slide and associated result information
  let slides = []
  let results = {}
  let slideList = document.getElementById("slide_id").value;
  slideList = slideList.replace(/\s+/g, '');
  slideList = slideList.split(",")
  for (id of slideList){
    let slide = await store.getSlide(id);
    slide = slide[0]
    if (slide && slide["_id"]){
      let s = {"id": slide["_id"]["$oid"], "name": slide['name'], "type": "slide"}
      console.log(s)
      slides.push(s)
      // get associated result types
      r = []
      for (let a of await store.findMarkTypes(slide["_id"]["$oid"], "computer")){
        r.push({"id": a["_id"]["analysis"]['execution_id'], "name": a["_id"]["analysis"]['name'], "type": "computer mark"})
      }
      for (let a of await store.findMarkTypes(slide["_id"]["$oid"], "human")){
        r.push({"id": a["_id"]["analysis"]['execution_id'], "name": a["_id"]["analysis"]['name'], "type": "human mark"})
      }
      // todo -- is this right for heatmapType results?
      for (let a of await store.findHeatmapType(slide["_id"]["$oid"])){
        r.push({"id": a["provenance"]["analysis"]["execution_id"], "name": a["provenance"]["analysis"]["execution_id"], "type": "heatmap"})
      }
      results[slide["_id"]["$oid"]] = r;
    }
  }

  let res = [{"name":'a', "type": "slide", "id":1}, {"name":'b', "type": "slide", "id":2}, {"name":'c', "type": "slide", "id":3}];
  let annots = [{"name":'circles', "type": "mark", "id":"x1"}, {"name":'boxes', "type": "heatmap", "id":"x2"}]
  let headers = ["name", "id", "type"]
  let t = document.createElement("table");
  t.id = "tree-table";
  t.classList.add("table", "table-hover", "table-bordered");
  // add headers
  let table = document.createElement("tbody")
  let hdr_tr = document.createElement("tr");
  for (let z of headers){
    let th = document.createElement("th");
    th.innerText = z || "?"
    hdr_tr.appendChild(th);
  }
  // add select header special
  let select_th = document.createElement("th");
  select_th.innerText = "Select";
  hdr_tr.appendChild(select_th);
  table.append(hdr_tr);
  // populate results
  for (let x of slides){
    let parent = document.createElement("tr");
    parent.setAttribute("data-id", x.id);
    parent.setAttribute("data-parent", 0);
    parent.setAttribute("data-level", 1);
    for (let z of headers){
      let d = document.createElement("td");
      d.innerText = x[z] || "?";
      if (z==name_field){
        d.setAttribute("data-column","name");
      }
      parent.appendChild(d);
    }
    // add special checkbox
    parentCheck = document.createElement("input");
    parentCheck.classList.add("form-check-input")
    parentCheck.type = "checkbox"
    parentCheck.indeterminate = true; // cool!
    parent.appendChild(parentCheck);
    table.appendChild(parent)
    for (let y of results[x.id]){
      let child = document.createElement("tr");
      child.setAttribute("data-id", x.id+"-"+y.id);
      child.setAttribute("data-parent", x.id);
      child.setAttribute("data-level", 2);
      for (let z of headers){
        let d = document.createElement("td");
        d.innerText = y[z] || "?";
        if (z==name_field){
          d.setAttribute("data-column","name");
        }
        child.appendChild(d);
      }
      // special checkbox
      childCheck = document.createElement("input");
      childCheck.type = "checkbox"
      childCheck.classList.add("form-check-input")
      childCheck.classList.add("result")
      childCheck.setAttribute("data-target", x.id);
      childCheck.setAttribute("data-self", y.id);
      childCheck.setAttribute("data-type", y.type);
      childCheck.checked = true;
      child.appendChild(childCheck);
      table.appendChild(child)
    }
  }
  t.appendChild(table);
  document.getElementById("output").appendChild(t);
  make_tree_table("tree-table")
}

function downloadResults() {
  console.log('hi again')
}
