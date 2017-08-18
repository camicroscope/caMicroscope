// Work with a client database to store and get values
var ClientPrefManager = new Class({
  initialize: function (schema) {
    this.schema = schema;
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.msIndexedDB;
    var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
    var openCopy = indexedDB && indexedDB.open;
    var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
    if (IDBTransaction)
    {
      IDBTransaction.READ_WRITE = IDBTransaction.READ_WRITE || 'readwrite';
      IDBTransaction.READ_ONLY = IDBTransaction.READ_ONLY || 'readonly';
    }
    var request = indexedDB.open(this.schema);
    request.onupgradeneeded = function(e)
    {
      var idb = e.target.result;
      if (!idb.objectStoreNames.contains(this.schema))
      {
        var store = idb.createObjectStore(this.schema, {keyPath: 'pref'});
      }
    }
  },
  set_pref: function(pref, val){
    var request = indexedDB.open(this.schema);

    request.onsuccess = function(e)
    {
      var idb = e.target.result;
      var trans = idb.transaction(this.schema, IDBTransaction.READ_WRITE);
      var store = trans.objectStore(this.schema);

      var requestAdd = store.put({pref: pref, value: val});
      requestAdd.onsuccess = function(e) {
        console.log(`Stored {pref: ${pref}, value: ${val}}`)
      };

      requestAdd.onfailure = function(e) {
        console.log("There was some issue with storing the requested preference.")
      };
    };
  },
  get_pref: function(pref, cb){
    var request = indexedDB.open(this.schema);
    request.onsuccess = function(e)
    {
      idb = e.target.result;
      var transaction = idb.transaction(this.schema, IDBTransaction.READ_ONLY);
      var objectStore = transaction.objectStore(this.schema);

      var request = objectStore.get(pref)
      request.onsuccess = function(event)
      {
        var data = event.target.result;
        if (data)
        {
          console.log(`Found ${data.pref} = ${data.value}`);
          cb(data.value);
        }
        else
        {
          console.log('No Entry Found.');
          cb(null);
        }
      };
    };
  }
});

// example of usage of this helper:
// var a = new ClientPrefManager("viewer");
// a.set_pref("a","a");
// a.get_pref("a", console.log)
