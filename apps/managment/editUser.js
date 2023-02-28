const store = new Store('../../data/');

async function populateUserEdit(){
  let collections = await store.getAllCollection()
  let searchparam = new URLSearchParams(window.location.search)
  let users = await store.getUsers(searchparam.get("email"));
  let user = users[0];

  // populate regular fields
  document.getElementById('first_name').value = user.registration.firstName;
  document.getElementById('last_name').value = user.registration.lastName;
  document.getElementById('email').value = user.email;
  document.getElementById('institution').value = user.registration.institutionOfEmployment;
  // hidden user id
  document.getElementById('user_id').value = user['_id']['$oid'];
  // userType
  if (user.userType == "Admin"){
    document.getElementById('admin-select').checked=true;
  }
  else if (user.userType == "Editor"){
    document.getElementById('participant-select').checked=true;
  }
  else if (user.userType == "Expert"){
    document.getElementById('expert-select').checked=true;
  } else {
    document.getElementById('public-select').checked=true;
  }

  // collections
  let collectionMap = {}
  let collectionSelector = document.getElementById('collection_list');
  for (let i of collections){document.getElementById('first_name').value
    // populate collection map
    collectionMap[i['_id']['$oid']] = i['name']
    // add checkboxes for collection selection
    let outer_div = document.createElement("div")
    outer_div.classList.add("form-check", "form-switch")
    let input=document.createElement("input")
    input.id = "check-collection-" + i['name']
    input.name = i['name']
    input.value = i['_id']['$oid']
    input.type = "checkbox"
    input.classList.add("checkbox", "form-check-input" ,"collection_input")
    // set checked to true if present
    if (user.collections.indexOf(i['_id']['$oid'])>=0){
      input.checked = true;
    }
    // make label
    let label = document.createElement("label")
    label.classList.add("form-check-label")
    label.for = "check-collection-" + i['name']
    label.innerText = i['name']
    // append to document
    outer_div.appendChild(input);
    outer_div.appendChild(label);
    collectionSelector.appendChild(outer_div);
  }
}

async function updateUser(e){
  console.log(e)
  let user_id = document.getElementById("user_id").value
  let edits = {};
  edits.registration = {};
  edits.registration.firstName = document.getElementById('first_name').value;
  edits.registration.lastName = document.getElementById('last_name').value;
  edits.registration.institutionOfEmployment = document.getElementById('institution').value;
  edits.email = document.getElementById('email').value;
  edits.registration.email = edits.email;
  userTypeBoxes = document.getElementById("user_type").children;
  // user type
  if (document.getElementById('expert-select').checked){
    edits.userType = "Expert"
  } else if (document.getElementById('admin-select').checked){
    edits.userType = "Admin"
  } else if (document.getElementById('editor-select').checked){
    edits.userType = "Editor"
  } else {
    edits.userType = "Null"
  }
  // collections
  edits.collections = [];
  let collectionBoxes = document.getElementsByClassName("collection_input");
  for (let i of collectionBoxes){
    if (i.checked){
      edits.collections.push(i.value)
    }
  }
  // update the user
  let res = await store.updateUser(user_id, edits)
  console.log(edits)
  return edits;
}

document.getElementById("updateBtn").addEventListener("click", updateUser);
