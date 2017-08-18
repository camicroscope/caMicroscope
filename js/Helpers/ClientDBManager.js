var ClientDbManager = new Class({
  initialize: function (schema) {
    this.schema = schema;
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    this.handler = indexedDB.open(this.schema, 1);
    this.db = open.result;
    this.store_name = this.schema+"Store";
    this.store = this.db.createObjectStore(this.schema+"Store", {keyPath: "id"});
    // TODO add index matching future usage patterns
  },

  getVal: function(item){
    var tx = this.db.transaction(this.store_name, "read");
    var st = tx.objectStore(this.store_name);
    tx.oncomplete = function() {
        this.db.close();
      };
    return st.get(item);
  },

  setVal: function(item, value){
    var tx = this.db.transaction(this.store_name, "readwrite");
    var st = tx.objectStore(this.store_name);
    st.put({id: item, value:value});
    console.log("Stored : " + `{id: ${item}, value: #{value}}`)
    tx.oncomplete = function() {
        this.db.close();
      };
    return {id: item, value:value};
    }
  });
