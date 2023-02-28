const store = new Store('../../data/');

async function populateUserTable(){
  // todo use await store instead
  let collections = await store.getAllCollection()

  let users = await store.getUsers();

  // map between collection id and name
  let collectionMap = {}
  for (let i of collections){
    collectionMap[i['_id']['$oid']] = i['name']
  }

  // cleaned user data for the table
  let usersClean = []
  for (let i of users){
    let u = {};
    u['Name'] = i.registration.firstName + " " + i.registration.lastName
    u['Email'] = i.email
    u['Institution'] = i.registration.institutionOfEmployment
    u['Type'] = i.userType
    u['Collections'] = ""
    for(j of i.collections){
      u['Collections'] += collectionMap[j] || j
      u['Collections'] += ", "
    }
    // remove last comma and space
    u['Collections'] = u['Collections'].slice(0,-2)
    usersClean.push(u)
  }

  // populate table with usersClean result

  for (user of usersClean){
    let tr = document.createElement("tr");
    let name_td = document.createElement("td");
    name_td.innerText = user['Name']
    tr.appendChild(name_td);
    let institution_td = document.createElement("td");
    institution_td.innerText = user['Institution']
    tr.appendChild(institution_td);
    let email_td = document.createElement("td");
    email_td.innerText = user['Email']
    tr.appendChild(email_td);
    let type_td = document.createElement("td");
    type_td.innerText = user['Type']
    tr.appendChild(type_td);
    let collections_td = document.createElement("td");
    collections_td.innerText = user['Collections']
    tr.appendChild(collections_td);
    // edit button
    let edit_td = document.createElement("td");
    let edit_btn = document.createElement("button")
    edit_btn.innerText = "Edit"
    edit_btn.type = "button"
    edit_btn.classList.add("btn", "btn-primary")
    edit_btn.onclick = () => {window.location = "./editUser.html?email=" + user['Email']}
    edit_td.appendChild(edit_btn)
    tr.appendChild(edit_td);

    document.getElementById("user_table_body").appendChild(tr);
  }

}
