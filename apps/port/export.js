const store = new Store('../../data');

function populateList() {
  console.log("populating list...")
  // testing the tree table
  let res = [{"name":'a', "id":1}, {"name":'b', "id":2}, {"name":'c', "id":3}];
  let annots = [{"name":'circles', "type": "mark", "id":"x1"}, {"name":'boxes', "type": "heatmap", "id":"x2"}]
  let headers = ["name", "id"]
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
  table.appendChild(hdr_tr);
  for (let x of res){
    console.log(x)
    let parent = document.createElement("tr");
    parent.setAttribute("data-id", x.id);
    parent.setAttribute("data-parent", 0);
    parent.setAttribute("data-level", 1);
    for (let z of headers){
      let d = document.createElement("td");
      d.innerText = x[z] || "?";
      parent.appendChild(d);
    }
    table.appendChild(parent)
    for (let y of annots){
      let child = document.createElement("tr");
      child.setAttribute("data-id", x.id+"-"+y.id);
      child.setAttribute("data-parent", x.id);
      child.setAttribute("data-level", 2);
      for (let z of headers){
        let d = document.createElement("td");
        d.innerText = y[z] || "?";
        child.appendChild(d);
      }
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
