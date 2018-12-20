/*!
 * pure-form - v@version@
 * Pure JS drop in replacement for the HTML FORM using JSON Schemas
 * https://github.com/john-doherty/pure-form
 * @author John Doherty <www.johndoherty.info>
 * @license MIT
 */
(function (base, window, document) {

    'use strict';

    // check if we're using a touch screen
    var isTouch = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));

    // switch to touch events if using a touch screen
    var mouseClick = isTouch ? 'touchend' : 'click';

    // regex validation patterns
    var patterns = {
        email: /^[a-zA-Z0-9-_.]{1,}@[a-zA-Z0-9.-]{2,}[.]{1}[a-zA-Z]{2,}$/,
        // matches custom URC used to create custom elements, example = custom:tag:attributeKey1=attributeValue1,attributeKey2=attributeValue2
        customURC: /^custom:([a-z0-9-]*)(?:;|)([a-z0-9-=/*,.()\[\]]+|)$/i
    };

    // Create a new instance of the base object with these additional items
    var pureForm = Object.create(base, {
        action: {
            get: function () {
                return this.getAttribute('action') || '';
            },
            set: function (value) {
                this.setAttribute('action', value || '');
            }
        },
        enctype: {
            get: function () {
                return this.getAttribute('enctype') || 'application/x-www-form-urlencoded';
            },
            set: function (value) {
                this.setAttribute('enctype', value || 'application/x-www-form-urlencoded');
            }
        },
        method: {
            get: function () {
                return this.getAttribute('method') || 'get';
            },
            set: function (value) {
                this.setAttribute('method', value || 'get');
            }
        },
        src: {
            get: function () {
                return this.getAttribute('src') || '';
            },
            set: function (value) {
                this.setAttribute('src', value || '');
            }
        },
        schema: {
            get: function () {
                return this._schema || null;
            },
            set: function (value) {
                this._schema = value;

                this.title = this._schema.title;
                this.description = this._schema.description;

                if (value.id) {
                    this.setAttribute('schema-id', value.id);
                }
                else {
                    this.removeAttribute('schema-id');
                }

                // fire schema set event once set complete
                this.dispatchEvent(new CustomEvent('pure-form-schema-set', { bubbles: true, cancelable: true }));

                renderForm.call(this);
            }
        },
        value: {
            get: function () {
                return getData.call(this);
            },
            set: function (data) {
                populateForm.call(this, data);

                // update original value so isDirty can detect user changes
                this._originalValue = getData.call(this);
            }
        },
        isDirty: {
            get: function() {

                if (!this._originalValue) {
                    return false;
                }

                return (JSON.stringify(this._originalValue) !== JSON.stringify(getData.call(this)));
            }
        },
        readonly: {
            get: function () {
                return this.getAttribute('readonly') === 'true';
            },
            set: function (value) {
                if (value) {
                    this.setAttribute('readonly', value);
                }
                else {
                    this.removeAttribute('readonly');
                }
            }
        },
        title: {
            get: function () {
                return this.getAttribute('data-title') || '';
            },
            set: function (value) {
                this.setAttribute('data-title', value || '');
            }
        },
        description: {
            get: function () {
                return this.getAttribute('description') || '';
            },
            set: function (value) {
                this.setAttribute('description', value || '');
            }
        },
        buttons: {
            get: function () {
                return this.getAttribute('buttons') || '';
            },
            set: function (value) {

                // remove any empty values
                value = value.split(',').filter(Boolean).join(',');

                this.setAttribute('buttons', value);
            }
        },
        links: {
            get: function() {
                return (this.schema || {}).links || [];
            },
            set: function(value) {
                if (!Array.isArray(value)) throw new Error('Schema links must be an array');
                if (!this.schema) throw new Error('Unable to assign schema.links');

                // check link object have required data
                value.forEach(function(link) {
                    if (!link.title || link.title === '') throw new Error('Link object must have a title property');
                    if (!link.rel || link.rel === '') throw new Error('Link object must have a rel property');
                });

                this.schema.links = value;

                // update buttons
                renderButtons.call(this);
            }
        },
        persist: {
            get: function () {
                return (this.getAttribute('persist') === 'true');
            },
            set: function (value) {
                this.setAttribute('persist', value === true);
            }
        },
        storage: {
            get: function () {
                return this.getAttribute('storage') || 'sessionStorage';
            },
            set: function (value) {
                this.setAttribute('storage', value || 'sessionStorage');
            }
        },
        disableValidation: {
            get: function () {
                return (this.getAttribute('disable-validation') === 'true');
            },
            set: function (value) {
                this.setAttribute('disable-validation', value === true);
            }
        },
        placeholderMaxLength: {
            get: function () {
                return parseInt(this.getAttribute('placeholder-max-length') || '75', 10);
            },
            set: function (value) {
                this.setAttribute('placeholder-max-length', value);
            }
        },
        autofocusError: {
            get: function () {
                return (this.getAttribute('autofocus-error') === 'true');
            },
            set: function (value) {
                this.setAttribute('autofocus-error', value === true);
            }
        },
        validateOnBlur: {
            get: function () {
                return (this.getAttribute('validate-on-blur') === 'true');
            },
            set: function (value) {
                this.setAttribute('validate-on-blur', value === true);
                if (value) {
                    this.autofocusError = false;
                }
            }
        },
        tabOnEnter: {
            get: function () {
                return (this.getAttribute('tab-on-enter') === 'true');
            },
            set: function (value) {
                this.setAttribute('tab-on-enter', value === true);
            }
        },
        submitOnEnter: {
            get: function () {
                return (this.getAttribute('submit-on-enter') === 'true');
            },
            set: function (value) {
                this.setAttribute('submit-on-enter', value === true);
            }
        },
        useFormTag: {
            get: function () {
                return (this.getAttribute('use-form-tag') !== 'false');
            },
            set: function (value) {
                this.setAttribute('use-form-tag', value === true);
            }
        },
        enforceMaxLength: {
            get: function () {
                return (this.getAttribute('enforce-max-length') === 'true');
            },
            set: function (value) {
                this.setAttribute('enforce-max-length', value === true);
            }
        },
        schemaId: {
            get: function () {
                return this.getAttribute('schema-id') || '';
            }
        },
        autoResize: {
            get: function () {
                return (this.getAttribute('auto-resize') === 'true');
            },
            set: function (value) {
                this.setAttribute('auto-resize', value === true);
            }
        },
        autofocusId: {
            get: function () {
                return this.getAttribute('autofocus-id') || '';
            },
            set: function (value) {
                this.setAttribute('autofocus-id', value || '');
            }
        },
        authToken: {
            get: function () {
                return this.getAttribute('auth-token') || '';
            },
            set: function (value) {
                this.setAttribute('auth-token', value || '');
            }
        },
        showSchemaButtons: {
            get: function () {
                return (this.getAttribute('show-schema-buttons') !== 'false');
            },
            set: function (value) {
                this.setAttribute('show-schema-buttons', value === true);
            }
        },
        httpHeaders: {
            get: function() {

                var value = this.getAttribute('http-headers') || '';

                if (value !== '') {

                    var res = {};

                    value.split(';').forEach(function(item) {
                        var items = item.split('=');
                        res[items[0]] = items[1];
                    });

                    return res;
                }

                return null;
            },
            set: function(value) {

                if (typeof value !== 'object') throw new Error('httpHeaders must be a key/value object');

                var values = [];

                // convert JSON key/value object to 'key=value;key=value'
                Object.keys(value).forEach(function(key) {
                    values.push(key + '=' + value[key]);
                });

                this.setAttribute('http-headers', values.join(';'));
            }
        }
    });

    /*----------------*/
    /* PUBLIC METHODS */
    /*----------------*/

    /**
     * Executes when created, fires attributeChangedCallback for each attribute set
     * @access private
     * @returns {void}
     */
    pureForm.createdCallback = function () {

        var self = this;
        var attributes = Array.prototype.slice.call(self.attributes);

        // ensure current attributes are set
        attributes.forEach(function(item) {
            self.attributeChangedCallback(item.name, null, item.value);
        });

        // when a button is clicked, check if we have a link object for it and if so, execute the request
        self.addEventListener('pure-form-button-clicked', function(e) {

            var link = e.detail.link;

            if (link) {

                // if this is a link to a schema, just load it (dont need to fire events)
                if (link.rel.toLowerCase().indexOf('describedby:') === 0) {
                    this.src = link.href;
                }
                else if (self.isValid()) {

                    // fire the submit event, allowing listeners to cancel the submission
                    var allowSubmit = self.dispatchEvent(new CustomEvent('pure-form-submit', { detail: { link: link }, bubbles: true, cancelable: true }));

                    if (allowSubmit) {

                        // otherwise submit data to endpoint
                        submitViaLink.call(this, link);
                    }
                }
            }
        });

        self.addEventListener('change', function(e) {

            e.preventDefault();

            self.dispatchEvent(new CustomEvent('pure-form-value-changed', { detail: { srcElement: e.target }, bubbles: true, cancelable: true }));

            var webStorage = window[self.storage];

            // update stored form data
            if (self.persist && webStorage) {

                var rawData = getRawData.call(self);

                if (rawData) setStorageItem(webStorage, self.src, JSON.stringify(rawData));
            }
        });

        // update stored content when form values are changed externally
        self.addEventListener('pure-form-value-set-complete', function(e) {

            var webStorage = window[self.storage];

            // update stored form data
            if (self.persist && webStorage) {

                var rawData = getRawData.call(self);

                if (rawData) setStorageItem(webStorage, self.src, JSON.stringify(rawData));
            }
        });

        // get iframe CSS if we have any
        var iframeStyles = getStylesBySelector('pure-form .pure-form-html ', true);
        var iframeCSS = Object.keys(iframeStyles || {}).map(function(selector) {
            return selector.replace('pure-form .pure-form-html ', '') + '{' + iframeStyles[selector] + '}';
        }).join('\n');

        // once rendering is complete, update iframes
        self.addEventListener('pure-form-render-complete', function(e) {

            Array.prototype.slice.call(self.querySelectorAll('iframe')).forEach(function (item) {

                if (iframeCSS !== '') {
                    item.contentDocument.head.innerHTML = '<style>' + iframeCSS + '</style>';
                }

                // resize iframe to show all iframe content
                if (item.contentDocument.body.scrollHeight > item.contentDocument.body.clientHeight) {
                    item.style.height = item.contentDocument.body.scrollHeight + 35 + 'px';
                }

                // make editable
                if (item.getAttribute('readonly') !== 'true') {
                    item.contentDocument.body.contentEditable = true;
                }

                // listen for changes so we can tweak height
                item.contentDocument.body.addEventListener('keyup', function(e) {
                    autoResizeElements.call(self);
                    item.dispatchEvent(new CustomEvent('change', { bubbles: true, cancelable: true }));
                });

                // allow blur event to bubble!
                item.contentDocument.body.addEventListener('blur', function(e) {
                    item.dispatchEvent(new CustomEvent('focusout', { bubbles: true, cancelable: true }));
                });
            });
        });

        self.addEventListener('pure-form-schema-loading', function(e) {
            self.setAttribute('schema-loading', 'true');
        });

        self.addEventListener('pure-form-schema-loaded', function(e) {
            self.removeAttribute('schema-loading');
        });

        self.addEventListener('pure-form-data-loading', function(e) {
            self.setAttribute('data-loading', 'true');
        });

        self.addEventListener('pure-form-data-loaded', function(e) {
            self.removeAttribute('data-loading');
        });

        // detect dragging so we can stop button click events incorrectly firing on buttons when dragging
        if (isTouch) {
            self.addEventListener('touchstart', function() { self.__dragging = false; }, { passive: true });
            self.addEventListener('touchmove', function() { self.__dragging = true; }, { passive: true });
            self.addEventListener('touchend', function() { self.__dragging = false; }, { passive: true });
        }
    };

    /**
     * Executes when any pure-form attribute is changed
     * @access private
     * @type {Event}
     * @param {string} attrName - the name of the attribute to have changed
     * @param {string} oldVal - the old value of the attribute
     * @param {string} newVal - the new value of the attribute
     * @returns {void}
     */
    pureForm.attributeChangedCallback = function (attrName, oldVal, newVal) {

        if (oldVal === newVal) return;

        switch (attrName) {

            case 'src': {
                loadSchema.call(this);
            } break;

            case 'data-title': {
                //renderTitle.call(this);
            } break;

            case 'description': {
                renderDescription.call(this);
            } break;

            case 'buttons':
            case 'show-schema-buttons': {
                renderButtons.call(this);
            } break;

            case 'readonly':
            case 'enctype':
            case 'action':
            case 'use-form-tag':
            case 'enforce-maxlength': {

                // we dont want to wipe out the values when a property changes, so save it's value
                var value = this.value;

                // re-render the form
                renderForm.call(this);

                // reassign the value
                this.value = value;
            }

            // NOTE: .schema & .value are properties not attributes!
        }
    };

    /**
     * Clears a form fields error
     * @access public
     * @param {string} fieldName - name of the element to set valid
     * @returns {void}
     */
    pureForm.clearError = function (fieldName) {

        var el = this.querySelector('[name="' + fieldName + '"]');

        if (el) {
            el.setAttribute('data-valid', 'true');
            el.parentNode.removeAttribute('data-error');
        }
    };

    /**
     * Public method to clear all form validation error messages
     * @access public
     * @returns {void}
     */
    pureForm.clearErrors = function () {

        // clear previous validation errors
        this.form.removeAttribute('data-error');

        Array.prototype.slice.call(this.querySelectorAll('[data-error]')).forEach(function (item) {
            item.removeAttribute('data-error');
        });

        Array.prototype.slice.call(this.querySelectorAll('[data-valid]')).forEach(function (item) {
            item.removeAttribute('data-valid');
        });
    };

    /**
     * Sets a form field to invalid
     * @access public
     * @param {string} fieldName - name of the element to set error on
     * @param {string} errorMessage - error message to set on the element
     * @returns {void}
     */
    pureForm.setError = function (fieldName, errorMessage) {

        var el = this.querySelector('[name="' + fieldName + '"]');

        if (el) {
            // mark field as invalid
            el.setAttribute('data-valid', 'false');
            el.parentNode.setAttribute('data-error', errorMessage);
        }
    };

    /**
     * Validates either the passed in object or current form data against the schema
     * @access public
     * @param {object} data - key/value data object to check against schema
     * @param {bool} silent - if true does not update the UI to reflect errors
     * @param {bool} ignoreRequired - ignore required fields
     * @returns {boolean} true if valid otherwise false
     */
    pureForm.isValid = function (data, silent, ignoreRequired) {

        // if validation has been disabled (for example, the Form Builder doesn't want/need it)
        if (this.disableValidation) return true;

        // if a data object is not passed, get the current values
        data = data || getData.call(this);

        var self = this;
        var schema = this.schema;
        var valid = true;

        Object.keys(data).forEach(function(key) {

            // if the item has a regex pattern, grab the raw string - we do this because parseInt strips zero's
            var inputEl = self.querySelector('[name="' + key + '"]');
            var schemaItem = schema.properties[key];
            var pattern = (schemaItem) ? schemaItem.pattern : null;
            var value = '';

            if (pattern) {
                value = (inputEl) ? inputEl.value : data[key];
            }
            else {
                value = data[key];
            }

            var error = validateAgainstSchema(schema, key, value, ignoreRequired);

            if (!silent) {
                if (error) {
                    self.setError(key, error);
                    valid = false;
                }
                else {
                    self.clearError(key);
                }
            }
            else if (error) {
                valid = false;
            }
        });

        if (!silent && this.autofocusError) {
            var firstErrorEl = this.querySelector('form [data-valid="false"]');
            if (firstErrorEl) {
                firstErrorEl.focus();
            }
        }

        if (!silent) {
            if (!valid) {
                this.dispatchEvent(new CustomEvent('pure-form-validation-failed', { bubbles: true, cancelable: true }));
            }
            else {
                this.dispatchEvent(new CustomEvent('pure-form-validation-passed', { bubbles: true, cancelable: true }));
            }
        }

        return valid;
    };

    /**
     * Checks is a key/value is valid against the current schema
     * @param {string} key - schema property name to check
     * @param {*} value - value to test
     * @returns {string} error message if not valid, otherwise null
     */
    pureForm.checkValid = function(key, value) {
        return validateAgainstSchema(this.schema, key, value);
    };

    /**
     * Clears all form values and errors
     * @returns {void}
     */
    pureForm.reset = function() {

        var formData = {};
        var schemaProperties = (this.schema || {}).properties || {};

        Object.keys(schemaProperties).filter(function(key) {
            // skip schema .links or schema properties
            return (key !== 'links' && key.indexOf('$') <= -1);
        })
        .forEach(function(key) {
            formData[key] = (typeof schemaProperties[key].default !== 'undefined') ? schemaProperties[key].default : '';
        });

        this.value = formData;
    };

    /**
     * Submits the form
     * @param {string} rel - optional rel of link object to submit to
     * @returns {void}
     */
    pureForm.submit = function(rel) {

        if (!this.disableValidation && !this.isValid()) return;

        var allowSubmit = false;

        if (rel) {

            // attempt to find the link object matching this rel
            var link = (this.schema && Array.isArray(this.schema.links)) ? arrayWhere(this.schema.links, 'rel', rel, true) : null;

            if (link) {

                // fire the submit event, allowing listeners to cancel the submission
                allowSubmit = this.dispatchEvent(new CustomEvent('pure-form-submit', { bubbles: true, cancelable: true }));

                // if consumer does not cancel the event, proceed with submit
                if (allowSubmit) {
                    submitViaLink.call(this, link);
                }
            }
        }
        else if (this.form && this.form.tagName === 'FORM' && typeof this.form.submit === 'function') {

            // fire the submit event, allowing listeners to cancel the submission
            allowSubmit = this.dispatchEvent(new CustomEvent('pure-form-submit', { bubbles: true, cancelable: true }));

            if (allowSubmit) {
                this.form.submit();
            }
        }
    };

    /*-----------------*/
    /* PRIVATE METHODS */
    /*-----------------*/

    /**
     * Checks if a key/value is valid against the schema
     * @access private
     * @param {string} key - id of field to validate
     * @param {object} value - value to test against schema
     * @returns {boolean} true if valid, otherwise false
     */
    function validateField(key, value) {

        // create fake data object
        var dataItem = {};

        // populate key
        dataItem[key] = value;

        // execute regular form validation but passing a single property to test
        return this.isValid(dataItem);
    }

    /**
     * Loads the JSON schema from .src property
     * @access private
     * @returns {void}
     */
    function loadSchema() {

        var self = this;
        var schemaUrl = this.src;

        // fire schema loading event just before requesting the schema
        self.dispatchEvent(new CustomEvent('pure-form-schema-loading', { detail: schemaUrl, bubbles: true, cancelable: true }));

        http.get(schemaUrl, 'application/json', null, self.authToken, self.httpHeaders, function(error) {
            // fire error event
            self.dispatchEvent(new CustomEvent('pure-form-schema-error', { detail: error, bubbles: true, cancelable: true }));
        },
        function(data) {

            // store the schema
            self.schema = data.body;

            // fire onload event
            self.dispatchEvent(new CustomEvent('pure-form-schema-loaded', { detail: data, bubbles: true, cancelable: true }));

            // if the schema has an 'original' link, load it as it's the original data
            var dataLink = arrayWhere((self.schema || {}).links || [], 'rel', 'original', true);

            if (dataLink && dataLink.href !== '') {
                loadData.call(self, dataLink.href);
            }
            else {

                // save a copy of the data so we can test if values change within isDirty
                self._originalValue = getData.call(self);

                // get the storage object if it exists
                var webStorage = window[self.storage];

                // apply session stored form data if it exists
                if (self.persist && webStorage) {

                    // get value from web storage
                    getStorageItem(webStorage, self.src, function(value) {

                        if (value) {
                            populateForm.call(self, JSON.parse(value));
                        }
                    });
                }
            }
        });
    }

    function loadData(dataUrl) {

        var self = this;

        // fire schema loading event just before requesting the schema
        self.dispatchEvent(new CustomEvent('pure-form-data-loading', { detail: dataUrl, bubbles: true, cancelable: true }));

        http.get(dataUrl, 'application/json', null, self.authToken, self.httpHeaders, function(error) {
            // fire error event
            self.dispatchEvent(new CustomEvent('pure-form-data-error', { detail: error, bubbles: true, cancelable: true }));
        },
        function(data) {

            // store the schema
            self.value = data.body;

            // fire onload event
            self.dispatchEvent(new CustomEvent('pure-form-data-loaded', { detail: data, bubbles: true, cancelable: true }));
        });
    }

    /**
     * Builds the HTML form based on the value of the assigned JSON .schema object
     * @access private
     * @returns {void}
     */
    function renderForm() {

        // console.log('renderForm()');
        // console.trace('traced');

        if (this.schema && typeof this.schema === 'object') {

            var self = this;
            var properties = this.schema.properties;
            var orderedKeys = getSortedSchemaKeys(this.schema);
            var lbl = null;

            // always create a new form tag, therefore remove the old one
            if (this.form && this.form.parentElement) {
                this.form.parentElement.removeChild(this.form);
            }

            if (this.useFormTag) {

                this.form = createEl(null, 'form', {
                    enctype: this.enctype,
                    action: this.action,
                    method: this.method,
                    novalidate: 'novalidate',
                    class: 'pure-form-form'
                });

                // hook form submit event
                this.form.onsubmit = function (e) {

                    var allowSubmit = self.dispatchEvent(new CustomEvent('pure-form-submit', { bubbles: true, cancelable: true }));

                    if (!allowSubmit || !self.disableValidation || !self.isValid()) {
                        e.preventDefault();
                    }
                };
            }
            else {
                this.form = createEl(null, 'div', { class: 'pure-form-form' });
            }

            // add validate on blur handler
            this.form.addEventListener('focusout', function(e) {

                var el = e.target;

                if (self.validateOnBlur && el.type !== 'submit' && el.type !== 'button' && el.type !== 'checkbox') {

                    var value = el.value;

                    // iframe body onblur event is redirected here, so treat that differently
                    if (el.tagName === 'IFRAME' && el.contentDocument && el.contentDocument.body) {
                        value = el.contentDocument.body.innerHTML || '';
                    }

                    validateField.call(self, el.id, value);
                }
            }, true);

            if (self.enforceMaxLength) {

                // enforce max length by rejecting additional printable characters on keydown
                this.form.addEventListener('keydown', function(e) {

                    // number keys || letter keys || numpad keys
                    var isCharacter = (e.keyCode > 47 && e.keyCode < 58) || (e.keyCode > 64 && e.keyCode < 91) || (e.keyCode > 95 && e.keyCode < 112);

                    if (isCharacter && e.target.value.length === e.target.maxLength) {
                        e.preventDefault();
                    }
                });
            }

            // listen for keyboard events in case tabOnEnter is later enabled
            this.form.addEventListener('keyup', function(e) {

                var el = e.target;

                // only intercept keyup for enter key on inputs
                if (e.keyCode === 13 && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {

                    if (self.tabOnEnter) {

                        e.preventDefault();

                        // get all form items, convert to array to make it easier to search
                        var items = Array.prototype.slice.call(self.form.querySelectorAll('.pure-form-item'));

                        // find the input that fired the keyup, grab its index and then move focus to the next input
                        items.forEach(function(item, index) {

                            if (el === item) {

                                // shift focus to the next visible item if it is present
                                if (items[index + 1]) {
                                    items[index + 1].focus();
                                }
                            }
                        });
                    }
                    else if (self.submitOnEnter) {

                        e.preventDefault();

                        // find the first button and click it
                        var button = (self.querySelectorAll('.pure-form-button') || [])[0];

                        if (button) {
                            fireEvent(button, isTouch ? 'touchend' : 'click');
                        }
                    }
                }

                setCharactersRemaining(el);

                if (self.autoResize) {
                    autoResizeElements.call(self);
                }
            });

            this.form.addEventListener('change', function(e) {

                var el = e.target;

                // listen for file change events and add base64 file data as .data item
                if (el && el.tagName === 'INPUT' && el.type === 'file' && !el.data) {

                    // suppress this event
                    e.preventDefault();
                    e.stopPropagation();

                    // convert files into array object
                    var files = Array.prototype.slice.call(e.target.files);

                    // add .data collection to store base64 data
                    el.data = el.data || [];

                    // go through each file (it might be multiple)
                    files.forEach(function(file, index) {

                        // get the file as base64 string add to data array using same index (handles overwrites)
                        getBase64(file, function(base64) {

                            // store the base64 file content on the element
                            el.data[index] = base64;

                            // fire the event now file data has been assigned
                            fireEvent(el, 'change');
                        });
                    });
                }
            });

            // go through array of keys (as string) and remove keys we're not interested in
            orderedKeys = orderedKeys.filter(function (key) {
                return (key !== 'links' && key.indexOf('$') === -1 && properties.hasOwnProperty(key));
            });

            // go through the array of ordered keys and create an element for each item
            for (var i = 0; i < orderedKeys.length; i++) {

                var key = orderedKeys[i];
                var item = properties[key];

                // create a form label container (acts as a row)
                lbl = createEl(null, 'label', { for: key, class: 'pure-form-label' });

                if (item.format) {
                    lbl.setAttribute('data-format', item.format);
                }

                if (item.type) {
                    lbl.setAttribute('data-type', item.type);
                }

                if (item.required) {
                    lbl.setAttribute('data-required', true);
                }

                // create form field name
                createEl(lbl, 'span', { class: 'pure-form-label-text' }, item.title || key);

                // convert schema item to html input item
                var inputEl = schemaItemToHtmlElement.call(this, key, item);

                if (inputEl) {

                    var isHidden = (inputEl.type === 'hidden');

                    // if pure-form is readonly, apply same to elements and dont enable validation
                    if (this.readonly) {
                        inputEl.setAttribute('readonly', 'true');
                        if (inputEl.tagName === 'SELECT') inputEl.setAttribute('disabled', 'true');
                    }

                    if (!isHidden) {
                        // insure all inputs have a dedicated class
                        inputEl.className = 'pure-form-item';
                    }

                    if (key === self.autofocusId) {
                        inputEl.setAttribute('autofocus', 'true');
                    }

                    if (!isHidden) {

                        // add input to form label
                        lbl.appendChild(inputEl);

                        if (item.description && item.description.length > this.placeholderMaxLength) {
                            // description is too long to render as placeholder, insert below input
                            createEl(lbl, 'span', { class: 'pure-form-item-description' }, item.description || '');
                        }

                        // add max length attribute to label if present so we can use CSS to let the user know
                        setCharactersRemaining(inputEl);

                        // add row to form
                        this.form.appendChild(lbl);
                    }
                    else {
                        this.form.appendChild(inputEl);
                    }
                }
                else {
                    throw new Error('Failed to convert schema item to html element (key:' + key + ')');
                }

                this.appendChild(this.form);
            }

            renderButtons.call(this);

            // fire onload event
            self.dispatchEvent(new CustomEvent('pure-form-render-complete', { bubbles: true, cancelable: true }));
        }
    }

    /**
     * Adds .title value to the component
     * @access private
     * @returns {void}
     */
    function renderTitle() {

        if (this.title !== '') {

            // either get existing title tag or create a new one
            var el = this.querySelector('.pure-form-title') || createEl(null, 'div', { class: 'pure-form-title' });

            el.textContent = this.title;

            // if its not in the DOM, append it in the correct location
            if (!el.parentElement) {
                this.insertBefore(el, this.form);
            }
        }
        else {
            // remove close button
            removeElementBySelector(this, '.pure-form-title');
        }
    }

    /**
     * Adds .description value to the component
     * @access private
     * @returns {void}
     */
    function renderDescription() {

        if (this.description !== '') {

            // either get existing title tag or create a new one
            var el = this.querySelector('.pure-form-description') || createEl(null, 'div', { class: 'pure-form-description' });

            el.textContent = this.description;

            // if its not in the DOM, append it in the correct location
            if (!el.parentElement) {
                this.insertBefore(el, this.form);
            }
        }
        else {
            // remove close button
            removeElementBySelector(this, '.pure-form-description');
        }
    }

    /**
     * Adds a button to the form for each item in .buttons property
     * @access private
     * @returns {void}
     */
    function renderButtons() {

        var self = this;

        var schemaButtons = (this.showSchemaButtons && this.schema && Array.isArray(this.schema.links)) ? this.schema.links : [];

        // remove original 'data' link if present
        schemaButtons = schemaButtons.filter(function(link) {
            return link.rel !== 'original';
        });

        // add buttons from array if we have them
        if (this.form && (this.buttons !== '' || schemaButtons.length > 0)) {

            // convert buttons string into array for processing (removing empty items)
            var buttons = this.buttons.split(',').filter(Boolean);

            // get existing button container if it exists
            var buttonContainer = this.form.querySelector('.pure-form-buttons');

            // it does not exist, create one
            if (!buttonContainer) {

                // create new button container
                buttonContainer = createEl(this.form, 'div', { class: 'pure-form-buttons' });

                // add button click event listener
                buttonContainer.addEventListener(mouseClick, function(e) {

                    var el = e.target;

                    if (el.tagName === 'INPUT' && !self.__dragging) {

                        var eventData = {
                            value: el.value,
                            link: null
                        };

                        switch (el.type) {

                            case 'submit': {
                                self.dispatchEvent(new CustomEvent('pure-form-button-clicked', { detail: { value: el.value }, bubbles: true, cancelable: true }));
                            } break;

                            case 'button': {

                                // get rel from button
                                var rel = el.getAttribute('data-rel');

                                // get the schema link item matching this button
                                eventData.link = (self.schema && Array.isArray(self.schema.links)) ? arrayWhere(self.schema.links, 'rel', rel, true) : null;

                                // fire button-clicked event
                                self.dispatchEvent(new CustomEvent('pure-form-button-clicked', { detail: eventData, bubbles: true, cancelable: true }));

                            } break;
                        }
                    }
                });
            }
            else {

                // already exists, clear it
                buttonContainer.innerHTML = '';
            }

            // insert buttons set via this.buttons
            buttons.forEach(function(item) {
                // insert button
                createEl(buttonContainer, 'input', { type: 'submit', value: item.trim(), class: 'pure-form-button' });
            });

            // remove items we would not want a button for
            schemaButtons = schemaButtons.filter(function(link) {
                return link.rel !== 'instances';
            });

            // add button for each schema link
            schemaButtons.forEach(function(link) {

                // use link title if it exists, otherwise use rel
                var label = (link.title || link.rel).trim();

                // add data-rel so we can map clicks back to schema link items
                createEl(buttonContainer, 'input', { type: 'button', 'data-rel': link.rel, value: label, class: 'pure-form-button' });
            });
        }
        else {
            removeElementBySelector(this, '.pure-form-buttons');
        }
    }

    /**
     * Updated data-characters-remaining attribute of a input label (CSS adds UX tips)
     * @param {HTMLElement} input - HTML element to set char attributes on
     * @returns {void}
     */
    function setCharactersRemaining(input) {

        var maxLen = parseInt(input.getAttribute('maxlength') || input.getAttribute('data-maxlength') || '0', 10);
        var label = getParentByAttributeValue(input, 'tagName', 'LABEL');

        if (input.tagName === 'TEXTAREA' && label && maxLen > 0) {

            var valLen = input.value.length;

            // ensure label has a copy of the value so css can render a tip
            label.setAttribute('data-max-length', maxLen);

            if (maxLen > 0) {
                input.parentElement.setAttribute('data-characters-remaining', (maxLen - valLen));
            }
            else {
                input.parentElement.removeAttribute('data-characters-remaining');
            }

            // remove error attribute
            input.removeAttribute('data-valid');
            label.removeAttribute('data-error');
        }
    }

    /**
     * Gets data from the current form based on schema keys
     * @access private
     * @returns {object} JSON containing form data matching schema
     */
    function getData() {

        var self = this;
        var schema = (this.schema || {}).properties || {};
        var formData = {};

        // go through the schema and get the form values
        Object.keys(schema).forEach(function(key) {

            // skip schema .links or schema properties
            if (key === 'links' && key.indexOf('$') > -1) return;

            // this is the schema item not the element itself
            var schemaItem = schema[key];

            // get the value from the element
            var element = self.querySelector('[name="' + key + '"]');

            if (element) {

                switch (schemaItem.type) {

                    case 'array': {

                        if (schemaItem.items.format === 'textarea') {
                            formData[key] = (element.value !== '') ? element.value.split('\n') : [];
                        }
                        else if (schemaItem.items.format === 'uri') {
                            formData[key] = element.data;
                        }
                        else if (Array.isArray(element.value)) {
                            formData[key] = element.value;
                        }
                        else {
                            formData[key] = element.value;
                        }

                    } break;

                    case 'boolean': {
                        formData[key] = (element.checked);
                    } break;

                    case 'integer': {
                        formData[key] = element.value ? parseInt(element.value, 10) : '';
                    } break;

                    case 'number': {
                        formData[key] = element.value ? parseFloat(element.value) : '';
                    } break;

                    default: {

                        var format = schemaItem.format || '';

                        if (format === 'html') {
                            formData[key] = (element.contentDocument) ? (element.contentDocument.body.innerHTML || '').trim() : '';
                        }
                        else if (format.indexOf('custom:') === 0 && element.type === 'file' && element.files && element.files[0]) {
                            formData[key] = (element.files.length === 1) ? element.data[0] : element.data;
                        }
                        else {
                            formData[key] = (element.value || '').trim();
                        }

                        if (schemaItem.maxLength) {
                            formData[key] = formData[key].substr(0, Math.max(schemaItem.maxLength, 0));
                        }
                    } break;
                }
            }

            // remove keys with empty strings
            if (!schemaItem.required && formData[key] === '') {
                delete formData[key];
            }
        });

        return formData;
    }

    /**
     * Gets form data regardless of validation rules
     * @access private
     * @returns {object} object containing raw un-validated form data
     */
    function getRawData() {

        // we need a schema in order to retrieve values in correct types etc
        if (!this.schema) return null;

        var self = this;
        var schema = self.schema.properties;
        var formData = {};

        // get a list of keys we're interested in
        var keys = Object.keys(schema).filter(function(key) {
            return (key !== 'links' && key.indexOf('$') === -1 && !schema[key].readonly);
        });

        // go through the schema and get the form values for each key
        keys.forEach(function(key) {

            var item = schema[key];
            var element = self.querySelector('[name="' + key + '"]');

            if (element && element.type !== 'file') {

                switch (item.type) {

                    case 'array': {

                        if (item.items.format === 'uri' || item.items.type === 'object') {
                            formData[key] = element.data;
                        }
                        else {
                            formData[key] = element.value;
                        }

                    } break;

                    case 'boolean': {
                        formData[key] = (element.checked);
                    } break;

                    case 'string': {

                        if (item.format === 'html' && element.contentDocument) {
                            formData[key] = (element.contentDocument.body.innerHTML || '');
                        }
                        else {
                            formData[key] = (element.value || '').trim();
                        }
                    } break;

                    default: {
                        formData[key] = (element.value || '').trim();
                    }
                }
            }
        });

        return formData;
    }

    /**
     * Submits the form to the server via whichever method detailed in the link object
     * @access private
     * @param {object} linkDescObject - the link object retrieved from the schema .links collection
     * @returns {void}
     */
    function submitViaLink(linkDescObject) {

        if (!linkDescObject) return;

        var self = this;
        var formData = getData.call(this);
        var url = (linkDescObject.href || document.location.href);
        var method = (linkDescObject.method || 'POST').toLowerCase();
        var contentType = (linkDescObject.enctype || 'application/json');

        self.clearErrors();

        http[method](url, contentType, formData, self.authToken, self.httpHeaders, function(err) {
            // fire error event
            self.dispatchEvent(new CustomEvent('pure-form-submit-error', { detail: err, bubbles: true, cancelable: true }));
        },
        function(data) {

            // get the next schema as a link if it exists
            var nextSchemaLink = arrayWhere((data.body || {}).links || [], 'rel', 'describedby:next', true) || {};
            var nextSchemaMethod = nextSchemaLink.method || 'GET';
            var nextSchemaUrl = nextSchemaLink.href || '';

            // 1. if the response has a link to the next schema, auto load that schema
            if (nextSchemaMethod === 'GET' && nextSchemaUrl !== '') {
                self.src = nextSchemaUrl;
            }
            // 2. if the response contains an inline schema, auto load that schema
            else if (data.body && data.body.$schema) {
                self.schema = data.body;
            }
            // 3. if the response does not contain a next schema, fire the complete event
            else {
                // fire onload event
                self.dispatchEvent(new CustomEvent('pure-form-submit-complete', { detail: data, bubbles: true, cancelable: true }));
            }
        });
    }

    /**
     * Go through the data, for each key get the element and set it's value based on element type
     * @access private
     * @param {object} data - data to bind to the form (defaults to internal data value)
     * @returns {void}
     */
    function populateForm(data) {

        var self = this;
        var newData = data;
        var oldData = this.value;

        var eventData = {
            oldValue: oldData,
            newValue: newData
        };

        // fire onload event
        var allow = self.dispatchEvent(new CustomEvent('pure-form-value-set', { detail: eventData, bubbles: true, cancelable: true }));

        // user did not cancel, update form
        if (allow) {

            // go through all keys in data object, if we have an element and a value, set it
            Object.keys(newData).forEach(function(key) {

                var el = self.querySelector('[name="' + key + '"]');
                var value = (typeof newData[key] !== 'undefined') ? newData[key] : '';

                if (el) {
                    setElementValue.call(self, el, value);

                    if (self.schema.properties[key].maxLength) {
                        setCharactersRemaining(el);
                    }
                }
            });

            // resize form field once all values are set
            if (self.autoResize) {
                autoResizeElements.call(self);
            }

            self.dispatchEvent(new CustomEvent('pure-form-value-set-complete', { detail: eventData, bubbles: true, cancelable: true }));
        }
    }

    /**
     * Converts a JSON schema property into a HTML input element
     * @access private
     * @param {string} id - key from schema item to be used as HTML id
     * @param {object} item - individual schema property item
     * @returns {HTMLElement} - the newly created HTML element
     */
    function schemaItemToHtmlElement(id, item) {

        var self = this;
        var el = null;
        var type = item.items && item.items.type || item.type;
        var format = (item.items && item.items.format || item.format || '').toLowerCase();

        // if we have a custom format, skip the type restriction (still enforced in validation)
        if (regExMatches(format, patterns.customURC)) type = '';

        switch (type) {

            case 'number':
            case 'integer': {

                if (Number.isInteger(item.minimum) && Number.isInteger(item.maximum)) {

                    el = createEl(null, 'select', { name: id, id: id });
                    //createEl(el, 'option', { value: '' });

                    for (var i = item.minimum; i <= item.maximum; i++) {
                        createEl(el, 'option', { value: i }, i);
                    }
                }
                else {
                    el = createEl(null, 'input', { name: id, id: id, type: 'number', value: '' });
                }
            } break;

            case 'boolean': {
                el = createEl(null, 'input', { name: id, id: id, type: 'checkbox', value: '1' });
            } break;

            default: {

                if (Array.isArray(item.enum)) {

                    el = createEl(null, 'select', { name: id, id: id });
                    //createEl(el, 'option', { value: '' });

                    item.enum.forEach(function(value) {
                        createEl(el, 'option', { value: value }, value);
                    });
                }
                else {

                    // switch types for special formats or fallback to type text
                    switch (format) {

                        case 'url':
                        case 'uri': {
                            el = createEl(null, 'input', { name: id, id: id, type: 'url', value: '' });
                        } break;

                        case 'textarea': {
                            el = createEl(null, 'textarea', { name: id, id: id, value: '', rows: 3 });
                        } break;

                        case 'html': {
                            el = createEl(null, 'div', { name: id, id: id, contenteditable: true, rows: 3 });
                        } break;

                        case 'html': {
                            el = createEl(null, 'iframe', { name: id, id: id, frameborder: 0, src: 'about:blank' });
                        } break;

                        case 'date': {
                            el = createEl(null, 'input', { name: id, id: id, type: 'date', value: '' });
                        } break;

                        case 'password': {
                            el = createEl(null, 'input', { name: id, id: id, type: 'password', value: '', autocomplete: 'new-password' });
                        } break;

                        case 'email': {
                            el = createEl(null, 'input', { name: id, id: id, type: 'email', pattern: patterns.email, value: '' });
                        } break;

                        default: {

                            // support custom types in URC format (custom:tag;attr1=val1,attr2=val2)
                            if (regExMatches(format, patterns.customURC)) {

                                var captures = patterns.customURC.exec(format);

                                if (captures && captures.length === 3) {

                                    var tag = captures[1];
                                    var attrs = (captures[2] || '').split(',').filter(Boolean);

                                    // create custom element
                                    el = createEl(null, tag, { name: id, id: id });

                                    // add attributes
                                    attrs.forEach(function(attr) {
                                        var parts = attr.split('=');
                                        var key = parts[0];
                                        var val = parts[1];
                                        el.setAttribute(key, val);
                                    });
                                }
                                else {
                                    throw new Error('Invalid custom format on field ' + id);
                                }
                            }
                            else {
                                el = createEl(null, 'input', { name: id, id: id, type: 'text', value: '' });
                            }
                        }
                    }
                }
            }
        }

        if (el) {

            if (!el.getAttribute('autocomplete')) {
                // disable autocomplete for all input items
                el.setAttribute('autocomplete', 'off');
            }

            // assign validation if present
            if (self.readonly || item.readonly) {
                el.setAttribute('readonly', 'true');
                el.setAttribute('tabindex', '-1');
                el.setAttribute('disabled', 'disabled');
            }
            if ((self.readonly || item.readonly) && el.tagName === 'SELECT') el.setAttribute('disabled', 'true');
            if (item.required) el.setAttribute('required', 'required');
            if (item.pattern) el.setAttribute('pattern', item.pattern);
            if (item.min) el.setAttribute('min', item.min);
            if (item.max) el.setAttribute('max', item.max);
            if (item.minLength) el.setAttribute('minlength', item.minLength);
            if (item.maxLength) el.setAttribute((this.enforceMaxLength) ? 'maxlength' : 'data-maxlength', item.maxLength);
            if (item.minItems) el.setAttribute('min-items', item.minItems);
            if (item.maxItems) el.setAttribute('max-items', item.maxItems);
            if (item.description && item.description.length < this.placeholderMaxLength) {
                el.setAttribute('placeholder', item.description || '');
            }

            // you cannot make a checkbox readonly in HTML, therefore disable it
            if (item.type === 'boolean' && item.readonly) el.setAttribute('disabled', 'true');

            // add default value if set in schema
            if (typeof item.default !== 'undefined') setElementValue.call(self, el, item.default);
        }

        return el;
    }

    /*------------------------*/
    /* PRIVATE HELPER METHODS */
    /*------------------------*/

    /**
     * Get a value from web storage regardless of whether it's sync or async
     * @param {any} storage - web based storage object
     * @param {any} key - key of item to retrieve
     * @param {any} callback - function handler
     * @returns {void}
     */
    function getStorageItem(storage, key, callback) {

        if (typeof callback !== 'function') throw new Error('Invalid callback handler');

        var result = storage.getItem(key);

        if (result instanceof window.Promise) {
            result.then(callback);
        }
        else {
            callback(result);
        }
    }

    /**
     * Set a value in web storage regardless of whether it's sync or async
     * @param {any} storage - web based storage object
     * @param {any} key - key of item to retrieve
     * @param {any} value - value to set
     * @param {any} callback - function handler
     * @returns {void}
     */
    function setStorageItem(storage, key, value, callback) {

        var result = storage.setItem(key, value);

        if (result instanceof window.Promise && callback) {
            result.then(callback);
        }
        else if (callback) {
            callback();
        }
    }

    /**
    * Cross browser method to fire events
    * @param {Element} el - html element to fire the event on
    * @param {string} eventName - name of the event to fire
    * @returns {void}
    */
    function fireEvent(el, eventName) {

        eventName = eventName.replace(/on/, '');

        if (document.createEvent) {
            var e = document.createEvent('Event');
            e.initEvent(eventName, true, true);
            el.dispatchEvent(e);
        }
        else if (document.createEventObject) {
            el.fireEvent('on' + eventName);
        }
        else if (typeof el['on' + eventName] === 'function') {
            el['on' + eventName]();
        }
    }

    /**
     * Adjusts the height of iframes and textareas to show all content
     * @returns {void}
     */
    function autoResizeElements() {

        Array.prototype.slice.call(this.querySelectorAll('iframe')).forEach(function (item) {

            var iframeBody = item.contentDocument.body;

            // resize iframe to show all iframe content
            if (iframeBody.scrollHeight > iframeBody.clientHeight) {
                item.style.height = iframeBody.scrollHeight + 35 + 'px';
            }
        });

        Array.prototype.slice.call(this.querySelectorAll('textarea')).forEach(function (item) {

            // resize to show all content
            if (item.scrollHeight > item.clientHeight) {
                item.style.height = item.scrollHeight + 35 + 'px';
            }
        });
    }

    /**
    * Walks up the DOM from the current node and returns an element where the attribute matches the value.
    * @access private
    * @param {object} el - element to indicate the DOM walking starting position
    * @param {string} attName - attribute/property name
    * @param {string} attValue - value of the attribute/property to match
    * @returns {HTMLElement} or null if not found
    */
    function getParentByAttributeValue(el, attName, attValue) {

        attName = (attName === 'class') ? 'className' : attName;
        attValue = (attName === 'className') ? '(^|\\s)' + attValue + '(\\s|$)' : attValue;
        var tmp = el.parentNode;

        while (tmp !== null && tmp.tagName && tmp.tagName.toLowerCase() !== 'html') {
            if (tmp[attName] === attValue || tmp.getAttribute(attName) === attValue || (attName === 'className' && tmp[attName].matches(attValue))) {
                return tmp;
            }
            tmp = tmp.parentNode;
        }

        return null;
    }

    /**
    * Creates, configures & optionally inserts DOM elements via one function call
    * @param {object|string} parent - HTML element or selector string to insert into, null if no insert is required
    * @param {string} tagName of the element to create
    * @param {object?} attrs key:value collection of element attributes to create (if key is not a string, value is set as expando property)
    * @param {string?} text to insert into element once created
    * @param {string?} html to insert into element once created
    * @returns {object} newly constructed html element
    */
    function createEl(parent, tagName, attrs, text, html) {

        var el = document.createElement(tagName);
        var customEl = tagName.indexOf('-') > 0;

        // convert selector into parent element if present
        parent = (typeof parent === 'string' && parent !== '') ? document.querySelector(parent) : parent;
        attrs = attrs || {};

        Object.keys(attrs).forEach(function(key) {
            // assign className
            if (key === 'class') {
                el.className = attrs[key];
            }
            // assign styles
            else if (key === 'style') {
                el.setAttribute('style', attrs[key]);
            }
            // assign id
            else if (key === 'id') {
                el.id = attrs[key];
            }
            // assign name attribute, even for customEl
            else if (key === 'name') {
                el.setAttribute(key, attrs[key]);
            }
            // assign object properties
            else if (customEl || (key in el)) {
                el[key] = attrs[key];
            }
            // assign regular attribute
            else {
                el.setAttribute(key, attrs[key]);
            }
        });

        if (typeof text !== 'undefined' && typeof text !== 'object') {
            el.appendChild(document.createTextNode(text));
        }

        if (typeof html !== 'undefined') {
            el.innerHTML = '';
            stringToDOM(html, el);
        }
        if (parent) {
            parent.appendChild(el);
        }

        return el;
    }

    /**
     * Converts string containing HTML into a DOM elements - whilst removing script tags
     * @access private
     * @param {string} src - string containing HTML
     * @param {HTMLElement} [parent] - optional parent to append children into
     * @returns {DocumentFragment} fragment containing newly created elements (less script tags)
     */
    function stringToDOM(src, parent) {

        parent = parent || document.createDocumentFragment();

        var el = null;
        var tmp = document.createElement('div');

        // inject content into none live element
        tmp.innerHTML = src;

        // remove script tags
        var scripts = tmp.getElementsByTagName('script');
        for (var i = scripts.length - 1; i >= 0; i--) {
            scripts[i].parentElement.removeChild(scripts[i]);
        }

        // append elements
        while (el = tmp.firstChild) {
            parent.appendChild(el);
        }

        return parent;
    }

    /**
     * Validates a value against a schema item matches by key
     * @access private
     * @param {object} schema - complete form schema
     * @param {string} prop - the name of the property to validate
     * @param {any} value - the value to test
     * @param {boolean} ignoreRequired - skip required field checks
     * @returns {string} string containing error message or null
     */
    function validateAgainstSchema(schema, prop, value, ignoreRequired) {

        var schemaItem = getPropertyByPath(schema, prop, true);
        var valLen = (value + '').length;

        if (schemaItem) {

            if (value && schemaItem.type === 'string' && schemaItem.format === 'email' && !regExMatches(value.toString(), patterns.email)) {
                return 'Invalid email address';
            }

            if (value && schemaItem.minLength && valLen < schemaItem.minLength) {
                return 'The value must have a minimum of ' + schemaItem.minLength + ' character(s)';
            }

            if (value && schemaItem.maxLength && valLen > schemaItem.maxLength) {
                return 'Maximum ' + schemaItem.maxLength + ' character' + ((valLen > 1) ? 's' : '');
            }

            // check required status
            if (!ignoreRequired && schemaItem.required && ((schemaItem.type !== 'boolean' && !value) || (Array.isArray(value) && value.length <= 0))) {
                return 'This field must have a value';
            }

            if (schemaItem.minItems && (Array.isArray(value) && value.length < schemaItem.minItems)) {
                return 'Please select at least ' + schemaItem.minItems + ' item(s)';
            }

            if (schemaItem.maxItems && (Array.isArray(value) && value.length > schemaItem.maxItems)) {
                return 'Please select a maximum of ' + schemaItem.maxItems + ' item(s)';
            }

            if (value && schemaItem.pattern && !regExMatches(value.toString(), schemaItem.pattern)) {
                return 'The value is not in the expected format';
            }

            if (value && schemaItem.minimum && parseInt(value, 10) < schemaItem.minimum) {
                return 'The value must not be lower than ' + schemaItem.minimum;
            }

            if (value && schemaItem.maximum && parseInt(value, 10) > schemaItem.maximum) {
                return 'The value must not be higher than ' + schemaItem.maximum;
            }

            if (value && schemaItem.type === 'integer' && !/^[0-9]+$/.test(value.toString())) {
                return 'The value must be a whole number';
            }

            if (value && schemaItem.type === 'number' && !/^[0-9.]+$/.test(value.toString())) {
                return 'The value must be a number';
            }
        }

        return null;
    }

    /**
    * Recursively searches an object for a matching property name and returns it's value if found
    * @access private
    * @param {object} obj - object to inspect
    * @param {string} prop - property path e.g. 'basics.name'
    * @param {boolean} isSchema - set to true if the object is a JSON schema, otherwise false
    * @returns {object} returns property value or null
    */
    function getPropertyByPath(obj, prop, isSchema) {

        if (typeof obj === 'undefined') {
            return false;
        }

        // is this a schema object?
        isSchema = obj.$schema !== undefined || isSchema;

        // all json schema properties are prefixed with either properties or items
        if (isSchema) {

            // if the object has a properties property, search that
            if (obj.properties && prop.indexOf('.properties') <= -1) {
                prop = 'properties.' + prop;
            }
            // otherwise check if it has an items property
            else if (obj.items && prop.indexOf('.items') <= -1) {
                prop = 'items.' + prop;
            }
        }

        // check if we have any children properties
        var index = prop.indexOf('.');

        if (index > -1) {

            obj = obj[prop.substring(0, index)];
            prop = prop.substr(index + 1);

            return getPropertyByPath(obj, prop, isSchema);
        }

        return obj[prop];
    }

    /**
    * Returns JSON Schema property keys in order based on value of .id property value
    * @access private
    * @param {object} schema - JSON schema object
    * @returns {array} returns a string array of schema keys ordered by .id int value
    */
    function getSortedSchemaKeys(schema) {

        schema = schema.properties || schema;

        // get the keys
        var keys = Object.keys(schema);

        keys.sort(function (a, b) {

            var aId = parseFloat((schema[a].id || '0').replace(/[^0-9.]+/gi, ''));
            var bId = parseFloat((schema[b].id || '0').replace(/[^0-9.]+/gi, ''));

            return (aId - bId);
        });

        return keys;
    }

    /**
     * Set the value of a HTML input/select element
     * @access private
     * @param {HTMLElement} el - html element to set
     * @param {any} value - value to set
     * @returns {void}
     */
    function setElementValue(el, value) {

        var tag = (el) ? el.tagName.toLowerCase() : '';
        var type = el.type || '';

        switch (tag) {

            case 'input': {

                if (type === 'checkbox') {
                    el.checked = (value === true);
                }
                else if (type === 'file') {
                    el.type = '';
                    el.value = value;
                    el.type = 'file';
                    delete el.data; // remove base64 file data property potentially set by previous onchange event
                }
                else {
                    el.value = value;
                }

            } break;

            case 'textarea': {
                el.value = (value.join) ? value.join('\n') : value;
            } break;

            case 'div': {
                el.innerHTML = value || '';
            } break;

            case 'iframe': {

                if (el.contentDocument) {

                    var iframeBody = el.contentDocument.body;

                    // clear the iframe
                    iframeBody.innerHTML = '';

                    // add content as elements (removes script tags)
                    stringToDOM(value || '', iframeBody);
                }
            } break;

            default: {
                el.value = value;
            }
        }
    }

    /**
     * Returns an object/array from an array where its property equals value.
     * @access private
     * @param {Array} src - array to search
     * @param {string} property - property to check
     * @param {object} value - value to test
     * @param {bool} firstOnly - only returns first value if true
     * @returns {array|object} returns an array of matches, or single item if @firstOnly param set
     */
    function arrayWhere(src, property, value, firstOnly) {
        var res = [];
        src = src || [];
        for (var i = 0, l = src.length; i < l; i++) {
            if (src[i][property] === value) {
                if (firstOnly) {
                    return src[i];
                }
                res.push(src[i]);
            }
        }
        return (firstOnly) ? null : res;
    }

    /**
     * Removes an element from the dom by CSS selector
     * @access private
     * @param {HTMLElement} parent - html element to look within
     * @param {string} selector - CSS selector
     * @returns {void}
     */
    function removeElementBySelector(parent, selector) {

        // remove container
        var el = (parent || document).querySelector(selector);

        if (el) {
            el.parentElement.removeChild(el);
        }
    }

    /**
     * Returns true if the string matches the regular expression pattern
     * @access private
     * @param {string} src - value to compare
     * @param {string|RegExp} pattern - pattern to match
     * @returns {boolean} returns true if pattern matches src, otherwise false
     */
    function regExMatches(src, pattern) {
        return ((pattern.constructor !== RegExp) ? new RegExp(pattern, 'g') : pattern).test(src);
    }

    /**
     * Reads a client side file and returns it as a Base64 string (IE10+)
     * @param {string} file - file path from file input element value
     * @param {function} callback - function to call when operation complete, passing base64 data
     * @returns {void}
     */
    function getBase64(file, callback) {
        var reader = new FileReader();
        reader.onload = function () {
            callback(reader.result.split(',').pop());
        };
        reader.readAsDataURL(file);
    }

    // patch CustomEvent to allow constructor creation (IE/Chrome) - resolved once initCustomEvent no longer exists
    if ('initCustomEvent' in document.createEvent('CustomEvent')) {

        window.CustomEvent = function(event, params) {

            params = params || { bubbles: false, cancelable: false, detail: undefined };

            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };

        window.CustomEvent.prototype = window.Event.prototype;
    }

    /**
     * AJAX request(s) helper
     */
    var http = (function() {

        /**
         * Checks if a string is a serialized JSON object
         * @param {string} value - string to inspect
         * @returns {Boolean} true if string is JSON otherwise false
         */
        function isJson(value) {

            try {
                JSON.parse(value);
            }
            catch (e) {
                return false;
            }
            return true;
        }

        /**
         * Converts a JSON object into HTTP encoded data
         * @param {object} data - key/value object containing data
         * @returns {string} containing object flattened and concat with '&'
         */
        function encodeData(data) {
            return Object.keys(data || {}).map(function(key) {
                return encodeURI(key + '=' + data[key]);
            }).join('&');
        }

        /**
         * Executes an AJAX GET request
         * @param {string} method - HTTP method to use
         * @param {string} url - url to request
         * @param {string} contentType - the content type to send to the server
         * @param {object} data - data to sent
         * @param {string} authToken - HTTP Authorization Bearer token
         * @param {object} httpHeaders - key/value JSON object of HTTP headers to add to each request
         * @param {function} error - method to handle an error
         * @param {function} callback - method to handle success response
         * @returns {void}
         */
        function exec(method, url, contentType, data, authToken, httpHeaders, error, callback) {

            var xhr = ('withCredentials' in new XMLHttpRequest()) ? new XMLHttpRequest() : new XDomainRequest();

            if (xhr) {

                method = method || 'GET';
                contentType = contentType || 'application/json';
                authToken = authToken || '';

                xhr.open(method, url);
                xhr.withCredentials = true;
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhr.setRequestHeader('Content-Type', contentType);

                // add httpHeaders if set
                Object.keys(httpHeaders || {}).forEach(function(key) {
                    xhr.setRequestHeader(key, httpHeaders[key]);
                });

                if (xhr.overrideMimeType) {
                    xhr.overrideMimeType('application/json');
                }

                // add HTTP Authorization header if authToken is present
                if (authToken !== '') {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + authToken);
                }

                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {

                        var responseData = isJson(xhr.responseText) ? JSON.parse(xhr.responseText) : xhr.responseText;
                        var success = (xhr.status >= 200 && xhr.status <= 300);

                        if (success || (xhr.status === 0 && xhr.responseText !== '')) {
                            callback({
                                url: url,
                                status: xhr.status,
                                body: responseData
                            });
                        }
                        else {
                            error({
                                url: url,
                                status: xhr.status,
                                body: responseData
                            });
                        }
                    }
                };

                if (data) {

                    switch (contentType) {

                        case 'application/x-www-form-urlencoded': {
                            data = encodeData(data);
                        } break;

                        default: {
                            data = JSON.stringify(data);
                        } break;

                    }
                }

                xhr.send(data || null);
            }
        }

        return {
            get: function(url, contentType, data, authToken, httpHeaders, error, callback) {
                exec('GET', url, contentType, data, authToken, httpHeaders, error, callback);
            },
            post: function(url, contentType, data, authToken, httpHeaders, error, callback) {
                exec('POST', url, contentType, data, authToken, httpHeaders, error, callback);
            },
            put: function(url, contentType, data, authToken, httpHeaders, error, callback) {
                exec('PUT', url, contentType, data, authToken, httpHeaders, error, callback);
            },
            patch: function(url, contentType, data, authToken, httpHeaders, error, callback) {
                exec('PATCH', url, contentType, data, authToken, httpHeaders, error, callback);
            },
            delete: function(url, contentType, data, authToken, httpHeaders, error, callback) {
                exec('DELETE', url, contentType, data, authToken, httpHeaders, error, callback);
            }
        };
    })();

    /**
     * Get all CSS style blocks matching a CSS selector from stylesheets
     * @param {string} className - class name to match
     * @param {boolean} startingWith - if true matches all items starting with selector, default = false (exact match only)
     * @example getStylesBySelector('pure-form .pure-form-html ')
     * @returns {object} key/value object containing matching styles otherwise null
     */
    function getStylesBySelector(className, startingWith) {

        if (!className || className === '') throw new Error('Please provide a css class name');

        var styleSheets = window.document.styleSheets;
        var result = {};

        // NOTES: this must be in a try catch in case it attempts to access CSS rules from another domain!
        try {

            // go through all stylesheets in the DOM
            for (var i = 0, l = styleSheets.length; i < l; i++) {

                var classes = styleSheets[i].rules || styleSheets[i].cssRules || [];

                // go through all classes in each document
                for (var x = 0, ll = classes.length; x < ll; x++) {

                    var selector = classes[x].selectorText || '';
                    var content = classes[x].cssText || classes[x].style.cssText || '';

                    // if the selector matches
                    if ((startingWith && selector.indexOf(className) === 0) || selector === className) {

                        // create an object entry with selector as key and value as content
                        result[selector] = content.split(/(?:{|})/)[1].trim();
                    }
                }
            }
        }
        catch(e) {
            // none
        }

        // only return object if we have values, otherwise null
        return Object.keys(result).length > 0 ? result : null;
    }

    if (document.registerElement) {
        // register component with the dom
        document.registerElement('pure-form', { prototype: pureForm });
    }
    else {
        throw new Error('document.registerElement does not exist. Are you missing the polyfill?');
    }

})(HTMLElement.prototype, this, document);