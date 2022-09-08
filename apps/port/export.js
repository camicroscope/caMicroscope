const store = new Store('../../data');

function populateList() {
  // clear any previous
  document.getElementById("output").innerHTML = "";
  console.log("populating list...")
  name_field = "name"
  // testing the tree table
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
  for (let x of res){
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
    parentCheck.checked = true;
    parent.appendChild(parentCheck);
    table.appendChild(parent)
    for (let y of annots){
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
