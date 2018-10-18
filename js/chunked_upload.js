// expects changeStatus to be defined from loader.js

var start_url = 'load/Upload/start'
var continue_url = 'load/Upload/continue/'
var finish_url = 'load/Upload/finish/'

function parseFile(file, callback, offset, doneCB) {
    var fileSize   = file.size;
    var chunkSize  = 64 * 1024; // bytes
    var offset     = offset || 0;
    var self       = this; // we need a reference to the current object
    var chunkReaderBlock = null;

    var readEventHandler = function(evt) {
        if (evt.target.error == null) {
            offset += chunkSize
            // remove the "data url" items
            let x = evt.target.result.split(',')[1];
            callback({chunkSize:chunkSize, offset:offset-chunkSize, data:x}); // callback for handling read chunk
        } else {
            console.log("Read error: " + evt.target.error);
            return;
        }
        if (offset >= fileSize) {
            console.log("Done reading file");
            doneCB()
            return;
        }

        // of to the next chunk
        chunkReaderBlock(offset, chunkSize, file);
    }

    chunkReaderBlock = function(_offset, length, _file) {
        var r = new FileReader();
        var blob = _file.slice(_offset, length + _offset);
        r.onload = readEventHandler;
        r.readAsDataURL(blob);
    }

    // now let's start the read with the first block
    chunkReaderBlock(offset, chunkSize, file);
}

async function handle_upload(selectedFiles){
  selectedFile = selectedFiles[0]
  let filename = document.getElementById("filename").value
  let token = await start_upload(document.getElementById("filename").value)
  // uncurry the upload function
  let callback = continue_uplpad(token)
  let doneDB = finish_upload(token, filename)
  parseFile(selectedFile, callback, 0, doneDB)
}

async function start_upload(filename){
  let body = {filename: filename}
  let token = fetch(start_url,{method:'POST', body: JSON.stringify(body),headers: {
            "Content-Type": "application/json; charset=utf-8"
        }}).then(x=>x.json())
  try{
    let a = await token
    changeStatus("UPLOAD", "Begun upload - Token:" + a['upload_token'])
    return a['upload_token']
  }
  catch(e){
    changeStatus("UPLOAD", "ERROR; " + JSON.stringify(e))
  }
}

function continue_uplpad(token){
  return (body)=>{
    changeStatus("UPLOAD", "Uploading chunk at: "+ body.offset +" of size "+ body.chunkSize)
    let reg_req = fetch(continue_url + token,{method:'POST', body: JSON.stringify(body),headers: {
              "Content-Type": "application/json; charset=utf-8"
          }})
  }
}
function finish_upload(token, filename){
  return ()=>{
    let body = {filename: filename}
    changeStatus("UPLOAD", "Finished Reading File, Posting")
    let reg_req = fetch(finish_url + token,{method:'POST', body: JSON.stringify(body),headers: {
              "Content-Type": "application/json; charset=utf-8"
          }})
    reg_req.then(x=>x.json()).then(a=>changeStatus("UPLOAD", "Finished -" + JSON.stringify(a)))
    reg_req.then(e=>changeStatus("UPLOAD", "ERROR; " + JSON.stringify(e)))
  }
}
