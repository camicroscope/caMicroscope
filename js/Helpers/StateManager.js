/* StateManager
 * @constructor
 * @param prefix - the prefix for the state url component (i.e. ?{prefix}=abc)
 */
class StateManager {

    // TODO more sensible method names
    constructor(prefix) {
        this.prefix = prefix;
        this.vals = {};
        this.setters = {};
    }

    /* Add a key to the state variable */
    add_key(name, callback) {
        /* Register a new key
         * @param name - the unique name of the key
         * @param callback - what to do with the value if present on load
         * then use (this).vals['key'] to set key values
         * run (this).set_url();  to update the url with all set key values
         */
        this.setters[name] = callback;
    }

    encode(state_object) {
        /* encoding for state into url
         * @param state_object - the object to encode
         * uses base64 encoding
         * "exotic" objects likely won't work correctly without a way to convert to and from string
         */
        return encodeURIComponent(btoa(JSON.stringify(state_object)));
    }

    decode(encoded_string) {
        /* decoding for state from url
         * @param encoded_string - the encoded string
         * uses base64 decoding
         * "exotic" objects likely won't work correctly without a way to convert to and from string
         */
        return JSON.parse(atob(decodeURIComponent(encoded_string)));
    }

    set_url() {
        /* Sets the current state into the url
         * This updates the string to reflect all set (this).vals for all keys
         */
        var state_string = this.encode(this.vals);
        // get all url components
        var previous = location.search.substring(1);
        var p_var = previous ? JSON.parse('{"' + previous.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
            function(key, value) {
                return key === "" ? value : decodeURIComponent(value)
            }) : {}
        // switch out our state value
        p_var[this.prefix] = state_string;
        // put paramater string back together, as modified
        var params = Object.keys(p_var).map((i) => i + '=' + p_var[i]).join('&');
        window.history.replaceState({}, document.title,location.pathname + "?" + params);
    }

    get_url_state() {
        /* fetches all state information from the current url
         */
        // get all url components
        var previous = location.search.substring(1);
        var p_var = previous ? JSON.parse('{"' + previous.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
            function(key, value) {
                return key === "" ? value : decodeURIComponent(value)
            }) : {}
        // return ours
        return p_var[this.prefix];
    }

    clear_url() {
        /* remove this param from the url
         */
        var previous = location.search.substring(1);
        var p_var = previous ? JSON.parse('{"' + previous.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
            function(key, value) {
                return key === "" ? value : decodeURIComponent(value)
            }) : {}
        // pull out our state value
        delete p_var[this.prefix];
        var params = Object.keys(p_var).map((i) => i + '=' + p_var[i]).join('&');
        window.history.replaceState({}, document.title,location.pathname + "?" + params);
    }

    initialize(state) {
        /* run all set functions based on the url and registry */
        for (var i in state) {
            if (i in this.setters) {
                this.setters[i](state[i]);
            }
        }
    }

    to_storage(key) {
        /* copy state from url component to local storage
         * @param key - the key to store under localstorage
         */
        localStorage.setItem(key, this.get_url_state());
    }

    from_storage(key) {
        /* copy state from local storage to url component
         * @param key - the key to retrieve under localstorage
         */
        return localStorage.getItem(key);
    }



}
