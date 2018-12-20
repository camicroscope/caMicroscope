var upload_url = "../../load/Slide/upload"
var check_url = "../../load/Slide/info/"
var thumb_url = "../../load/Slide/thumb/"

var store = new Store("../../data/")

function changeStatus(step, text){
  text = JSON.stringify(text)
  text = step + " | " + text
  document.getElementById("load_status").innerHTML=text
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

function getThumbnail(filename, size){
  fetch(thumb_url + filename, {credentials: "same-origin"}).then(
    response => response.json() // if the response is a JSON object
  ).then(x=>{
    let img = new Image()
    img.src = x.slide
    document.getElementById("thumbnail").appendChild(img)
  }).catch(
    error => changeStatus("CHECK, Thumbnail", error) // Handle the error response object
  );
}

function handleCheck(filename){
  fetch(check_url + filename, {credentials: "same-origin"}).then(
    response => response.json() // if the response is a JSON object
  ).then(
    success => {
      changeStatus("CHECK", success)
      getThumbnail(filename, 100)
    } // Handle the success response object
  ).catch(
    error => changeStatus("CHECK", error) // Handle the error response object
  );
}

function handlePost(filename, slidename){
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
      store.post("Slide", {}, data).then(
        success => changeStatus("POST", success) // Handle the success response object
      ).catch(
        error => changeStatus("POST", error) // Handle the error response object
      );
    }
  ).catch(
    error => changeStatus("POST", error) // Handle the error response object
  );
}

//register events for file upload
function UploadBtn(){
  const fileInput = document.getElementById('fileinput');
  var filename = document.getElementById('filename').value
  handleUpload(fileInput.files[0], filename);
}

function CheckBtn(){
  var filename = document.getElementById('filename').value
  handleCheck(filename)
}

function PostBtn(){
  var filename = document.getElementById('filename').value
  var slidename = document.getElementById('slidename').value
  handlePost(filename, slidename)
}
