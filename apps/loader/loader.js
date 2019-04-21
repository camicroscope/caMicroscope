var upload_url = "../../load/Slide/upload"
var check_url = "../../load/Slide/info/"
var thumb_url = "../../load/Slide/thumb/"

var store = new Store("../../data/")

function changeStatus(step, text, reset=true){

  //Reset the status bar
  console.log("Previous: ", document.getElementById("load_status").innerHTML)
  document.getElementById("load_status").innerHTML=""
  
  //Display JSON as table:
  if(typeof text === 'object'){ //If the text arg is a JSON

    var col = []; //List of column headers
    for (var key in text) {
      if (col.indexOf(key) === -1) {
        col.push(key);
      }
    }

    var table;
    if(reset){
      table = document.createElement("table")
      table.id = "statusTable"
      table.setAttribute('border', '1')
      table.setAttribute('cellpadding', '10%')
      table.style.borderCollapse = "collapse"

      //Add table headers:
      var tr = table.insertRow(-1)
      for (var i = 0; i < col.length; i++) {
        var th = document.createElement("th")
        th.innerHTML = col[i]
        tr.appendChild(th)
      }
    }
    else{
      table=document.getElementById("statusTable")
    }

    if(step == "POST" && !reset){
      tr = table.rows[table.rows.length-1];
      for(var j = 0; j < col.length; j++) {
        var tabCell = tr.cells[tr.cells.length-1]
        tabCell.innerHTML = Number(Number(tabCell.innerHTML) + 1)
      }        
    }
    else{
      //Add JSON data to the table as rows:
      tr = table.insertRow(-1)
      for (var j = 0; j < col.length; j++) {
        var tabCell = tr.insertCell(-1)
        tabCell.innerHTML = text[col[j]]
      }
      if(step == "CHECK"){ 
        //During check, thumbnail needs to be fetched & added to the table
        // In this case, text[col[col.length - 1]] is the filename
        fetch(thumb_url + text[col[col.length - 1]], {credentials: "same-origin"}).then(
          response => response.json() // if the response is a JSON object
        ).then(x=>{
          var tabCell = tr.cells[tr.cells.length-1]
          tabCell.innerHTML = ""
          let img = new Image()
          img.src = x.slide
          tabCell.appendChild(img)
        });
      }
    }

    var divContainer = document.getElementById("json_table")
    divContainer.innerHTML = ""
    divContainer.appendChild(table)

    document.getElementById("load_status").innerHTML=step
  }

  else{
    text = JSON.stringify(text)
    text = step + " | " + text
    document.getElementById("load_status").innerHTML=text
  }
}

function handleUpload(file, filename){
  var data = new FormData()
  data.append('file', file)
  data.append('filename', filename)
  changeStatus("UPLOAD", "Begun upload")
  fetch(upload_url, {
    credentials: "same-origin",
    method: "POST",
    body: data
  }).then(
    response => response.json() // if the response is a JSON object
  ).then(
    success => changeStatus("UPLOAD", success) // Handle the success response object
  ).catch(
    error => changeStatus("UPLOAD", error) // Handle the error response object
  );
}

function handleCheck(filename, reset, id){
  fetch(check_url + filename, {credentials: "same-origin"}).then(
    response => response.json() // if the response is a JSON object
  ).then(
    success => {
      success["ID"] = id
      //Add the filename, to be able to fetch the thumbnail.
      success["preview"] = filename
      changeStatus("CHECK", success, reset)
    } // Handle the success response object
  ).catch(
    error => changeStatus("CHECK", error, reset) // Handle the error response object
  );
}

function handlePost(filename, slidename, reset){  
  fetch(check_url + filename, {credentials: "same-origin"}).then(
    response => response.json() // if the response is a JSON object
  ).then(
    data => {
      data['upload_date'] = new Date(Date.now()).toLocaleString();
      data.name = slidename
      data.location = "/images/" + filename
      data.study = ""
      data.specimen = ""
      data.mpp = parseFloat(data['mpp-x']) || parseFloat(data['mpp-y']) || 0
      data.mpp_x = parseFloat(data['mpp-x'])
      data.mpp_y = parseFloat(data['mpp-y'])
      store.post("Slide", {}, data).then(
        success => changeStatus("POST", success, reset) // Handle the success response object
      ).catch(
        error => changeStatus("POST", error, reset) // Handle the error response object
      );
    }
  ).catch(
    error => changeStatus("POST", error, reset) // Handle the error response object
  );
}

//register events for file upload
function UploadBtn(){
  const fileInput = document.getElementById('fileinput');
  var filename = document.getElementById('filename').value
  handleUpload(fileInput.files[0], filename);
}

function CheckBtn(){
  for(var i=0; i<document.getElementById("fileIdRow").cells.length-1;i++){
    var filename = document.getElementById('filename'+i).value
    if(i==0) handleCheck(filename, true, i+1)
    else handleCheck(filename, false, i+1)
  }
}

function PostBtn(){
  for(var i=0; i<document.getElementById("fileIdRow").cells.length-1;i++){
    var filename = document.getElementById('filename'+i).value
    var slidename = document.getElementById('slidename'+i).value
    if(i==0) handlePost(filename, slidename, true)
    else handlePost(filename, slidename, false)
  }
}
