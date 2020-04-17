// requires: Api_Utils
// METHODS HERE RETURN PROMISES
// for test server
try {
  var fetch = require('node-fetch');
} catch (e) {
  var b;
}

/**
 * converts an object into a string of url components
 * @param {object} obj - keys and values
 * @return the url encoded string
 **/
function objToParamStr(obj) {
  const parts = [];
  for (const i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (Array.isArray(obj[i])) {
        // arrays are a list of strings with escaped quotes, surrounded by []
        parts.push(encodeURIComponent(i) +
         '=' + encodeURIComponent('[' + obj[i].map((x) => '\"' + x + '\"').toString() + ']'));
      } else {
        parts.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]));
      }
    }
  }
  return parts.join('&');
}
/**
 * @constructor
 * Storage interpreter for camicroscope, uses same auth as origin
 * @param base - base url for data
 * @param [validation] - validation dict where keys are lowercase of types
 * @param [config] - configuration options, unused so far
 **/
class Store {
  constructor(base, validation, config) {
    this.base = base || './data/';
    this.validation = validation || {};
    this.config = config;
  }
  /**
   * errorHandler: handle the error response, and clean
   * @param  {Response} response
   * @return {object}
   */
  errorHandler(response) {
    if (!response.ok) {
      return {
        error: !response.ok,
        text: response.statusText,
        url: response.url,
      };
    }
    return response.json();
  }
  filterBroken(data, type) {
    if (Array.isArray(data)) {
      if (this.validation[type.toLowerCase()]) {
        return data.filter(this.validation[type]);
      } else {
        return data;
      }
    } else { // unlikely case?
      if (this.validation[type.toLowerCase()]) {
        if (this.validation[type](data)) {
          return data;
        } else {
          return undefined;
        }
      }
    }
  }
  /**
   * find marks matching slide and/or marktype
   * will search by slide field as exactly given and by the oid slide of that name
   * @param {string} [name] - the associated slide name
   * @param {string} [slide] - the associated marktype name, supporting regex match
   * @return {promise} - promise which resolves with data
   **/
  findMark(slide, name, footprint, source, x0, x1, y0, y1) {
    const suffix = 'Mark/find';
    const url = this.base + suffix;
    const query = {};
    let bySlideId;
    if (slide) {
      query.slide = slide;
    }
    if (name) {
      query['provenance.analysis.execution_id'] = name;
    }
    if (footprint) {
      query.footprint = footprint;
    }
    if (source) {
      query.source = source;
    }
    if (x0) {
      query.x0 = x0;
    }
    if (x1) {
      query.x1 = x1;
    }
    if (y0) {
      query.y0 = y0;
    }
    if (y1) {
      query.y1 = y1;
    }
    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler).then((x)=>this.filterBroken(x, 'mark'));
  }

  getMarkByIds(ids, slide, source, footprint, x0, x1, y0, y1) {
    if (!Array.isArray(ids) || !slide) {
      return {
        hasError: true,
        message: 'args are illegal',
      };
    }
    let bySlideId;
    const suffix = 'Mark/multi';
    const url = this.base + suffix;
    const query = {};
    const stringifiedIds = ids.map((id) => `"${id}"`).join(',');
    query.nameList = `[${stringifiedIds}]`;
    query['provenance.image.slide'] = slide;
    if (source) {
      query.source = source;
    }
    if (footprint) {
      query.footprint = footprint;
    }
    if (x0) {
      query.x0 = x0;
    }
    if (x1) {
      query.x1 = x1;
    }
    if (y0) {
      query.y0 = y0;
    }
    if (y1) {
      query.y1 = y1;
    }

    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler).then((x)=>this.filterBroken(x, 'mark'));
  }


  /**
   * get mark by id
   * @param {string} id - the mark id
   * @return {promise} - promise which resolves with data
   **/
  getMark(id) {
    const suffix = 'Mark/find';
    const url = this.base + suffix;
    const query = {
      '_id': id,
    };

    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler).then((x)=>this.filterBroken(x, 'mark'));
  }
  fetchMark(slideId) {
    const suffix = 'Mark/find';
    const url = this.base + suffix;
    const query = {};
    query['provenance.image.slide'] = slideId;
    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler).then((x)=>this.filterBroken(x, 'mark'));
  }
  /**
   * post mark
   * @param {object} json - the mark data
   * @return {promise} - promise which resolves with response
   **/
  addMark(json) {
    const suffix = 'Mark/post';
    const url = this.base + suffix;
    if (this.validation.mark && !this.validation.mark(json)) {
      console.warn(this.validation.mark.errors);
    }
    return fetch(url, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(json),
    }).then(this.errorHandler);
  }
  /**
   * delete mark
   * @param {object} id - the mark object id
   * @param {object} slide - the associated slide
   * @return {promise} - promise which resolves with response
   **/
  deleteMark(id, slide) {
    const suffix = 'Mark/delete';
    const url = this.base + suffix;
    const query = {
      '_id': id,
      'provenance.image.slide': slide,
    };
    return fetch(url + '?' + objToParamStr(query), {
      method: 'DELETE',
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }
  /**
   * find marktypes given slide and name
   * @param {string} [name] - the associated slide name
   * @param {string} [slide] - the marktype name, supporting regex match
   * @return {promise} - promise which resolves with data
   **/
  findMarkTypes(slide, name) {
    const suffix = 'Mark/types';

    const query = {};
    //
    if (!slide) {
      console.error('Store.findMarkTypes needs slide ... ');
      return null;
    }
    query['provenance.image.slide'] = slide;
    if (name) {
      query['provenance.analysis.execution_id'] = name;
    }
    const url = this.base + suffix;
    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }

  findHeatmap(slide, name, subject, study) {
    const suffix = 'Heatmap/find';
    const url = this.base + suffix;
    const query = {};
    let bySlideId;
    if (name) {
      query['provenance.analysis.execution_id'] = name;
    }
    if (slide) {
      query['provenance.image.slide'] = slide;
    }
    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler).then((x)=>this.filterBroken(x, 'heatmap'));
  }
  fetchHeatMap(slideId) {
    const suffix = 'Heatmap/find';
    const url = this.base + suffix;
    const query = {};
    query['provenance.image.slide'] = slideId;
    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler).then((x)=>this.filterBroken(x, 'heatmap'));
  }
  findHeatmapType(slide, name) {
    const suffix = 'Heatmap/types';
    const url = this.base + suffix;
    const query = {};
    if (name) {
      query['provenance.analysis.execution_id'] = name;
    }
    if (slide) {
      query['provenance.image.slide'] = slide;
    }
    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler).then((x)=>this.filterBroken(x, 'heatmap'));
  }
  /**
   * get heatmap by id
   * @param {string} id - the heatmap id
   * @return {promise} - promise which resolves with data
   **/
  getHeatmap(slide, name) {
    const suffix = 'Heatmap/find';
    const url = this.base + suffix;
    const query = {};
    query['provenance.image.slide'] = slide;
    query['provenance.analysis.execution_id'] = name;

    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler).then((x)=>this.filterBroken(x, 'heatmap'));
  }
  /**
   * post heatmap
   * @param {object} json - the mark data
   * @return {promise} - promise which resolves with response
   **/
  addHeatmap(json) {
    const suffix = 'Heatmap/post';
    const url = this.base + suffix;
    if (this.validation.heatmap && !this.validation.heatmap(json)) {
      console.warn(this.validation.heatmap.errors);
    }
    return fetch(url, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(json),
    }).then(this.errorHandler);
  }
  /**
   * delete heatmap
   * @param {object} id - the heatmap object id
   * @param {object} slide - the associated slide
   * @return {promise} - promise which resolves with response
   **/
  deleteHeatmap(id, slide) {
    const suffix = 'Heatmap/delete';
    const url = this.base + suffix;
    const query = {
      '_id': id,
      'provenance.image.slide': slide,
    };
    return fetch(url + '?' + objToParamStr(query), {
      method: 'DELETE',
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }


  updateHeatmapFields(slide, name, fields, setting) {
    const suffix = 'Heatmap/update';
    const url = this.base + suffix;
    const query = {};


    if (slide) {
      query['provenance.image.slide'] = slide;
    }

    if (name) {
      query['provenance.analysis.execution_id'] = name;
    }

    var data = {
      'provenance.analysis.fields': JSON.parse(fields),
      'provenance.analysis.setting': JSON.parse(setting),
    };
    return fetch(url + '?' + objToParamStr(query), {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }

  /**
   * add a Heatmap Edit Data
   * @param {object} json - the heatmap edit data
   * @return {promise} - promise which resolves with response
   *
   **/
  addHeatmapEdit(json) {
    const suffix = 'HeatmapEdit/post';
    const url = this.base + suffix;
    // TODO check on valid
    // if (this.validation.mark && !this.validation.mark(json)){
    //   console.warn(this.validation.mark.errors)
    // }
    return fetch(url, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(json),
    }).then(this.errorHandler);
  }

  updateHeatmapEdit(user, slide, name, data) {
    const suffix = 'HeatmapEdit/update';
    const url = this.base + suffix;
    const query = {};

    if (user) {
      query['user_id'] = user;
    }

    if (slide) {
      query['provenance.image.slide'] = slide;
    }

    if (name) {
      query['provenance.analysis.execution_id'] = name;
    }

    return fetch(url + '?' + objToParamStr(query), {
      method: 'POST',
      body: JSON.stringify({
        data: JSON.parse(data),
      }),
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }

  findHeatmapEdit(user, slide, name) {
    const suffix = 'HeatmapEdit/find';
    const url = this.base + suffix;
    const query = {};
    if (user) {
      query['user_id'] = user;
    }
    if (slide) {
      query['provenance.image.slide'] = slide;
    }
    if (name) {
      query['provenance.analysis.execution_id'] = name;
    }
    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }
  /**
   * delete heatmap
   * @param {object} id - the heatmap object id
   * @param {object} slide - the associated slide
   * @return {promise} - promise which resolves with response
   **/
  deleteHeatmapEdit(user, slide, name) {
    const suffix = 'HeatmapEdit/delete';
    const url = this.base + suffix;
    const query = {};
    if (user) {
      query['user_id'] = user;
    }
    if (slide) {
      query['provenance.image.slide'] = slide;
    }

    if (name) {
      query['provenance.analysis.execution_id'] = name;
    }
    return fetch(url + '?' + objToParamStr(query), {
      method: 'DELETE',
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }


  /**
   * find overlays matching name and/or type
   * @param {string} [name] - the overlay, supporting regex match
   * @param {string} [slide] - the associated slide id
   * @return {promise} - promise which resolves with data
   **/
  findOverlay(name, slide) {
    const suffix = 'Overlay/find';
    const url = this.base + suffix;
    const query = {};
    if (name) {
      query.name = name;
    }
    if (slide) {
      query.slide = slide;
    }

    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }

  /**
   * find overlays matching name and/or type
   * @param {string} [name] - the slide name
   * @param {string} [location] - the slide location, supporting regex match
   * @return {promise} - promise which resolves with data
   **/
  findSlide(slide, specimen, study, location) {
    const suffix = 'Slide/find';
    const url = this.base + suffix;
    const query = {};
    if (slide) {
      query.slide = slide;
    }
    if (study) {
      query.study = study;
    }
    if (specimen) {
      query.specimen = specimen;
    }
    if (location) {
      query.location = location;
    }

    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }

  /**
   * get slide by id
   * @param {string} id - the slide id
   * @return {promise} - promise which resolves with data
   **/
  getSlide(id) {
    const suffix = 'Slide/find';
    const url = this.base + suffix;
    const query = {
      '_id': id,
    };

    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler).then((x)=>this.filterBroken(x, 'slide'));
  }

  /**
   * find templates matching name and/or type
   * @param {string} [name] - the template name, supporting regex match
   * @param {string} [type] - the template type, supporting regex match
   * @return {promise} - promise which resolves with data
   **/
  findTemplate(name, type) {
    const suffix = 'Template/find';
    const url = this.base + suffix;
    const query = {};
    if (name) {
      query.name = name;
    }
    if (type) {
      query.slide = slide;
    }

    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler).then((x)=>this.filterBroken(x, 'template'));
  }

  /**
   * get template by id
   * @param {string} id - the template id
   * @return {promise} - promise which resolves with data
   **/
  getTemplate(id) {
    const suffix = 'Template/find';
    const url = this.base + suffix;
    const query = {
      '_id': id,
    };

    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler).then((x)=>this.filterBroken(x, 'template'));
  }

  /**
   * add a log item
   ** @param {object} json - the log data
   * @return {promise} - promise which resolves with data
   **/
  addLog(json) {
    const suffix = 'Log/post';
    const url = this.base + suffix;
    return fetch(url, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(json),
    }).then(this.errorHandler);
  }

  /**
   * get a config setting
   ** @param {object} json - the log data
   * @return {promise} - promise which resolves with data
   **/
  getConfigByName(name) {
    const suffix = 'Configuration/find';
    const url = this.base + suffix;
    const query = {
      'name': name,
    };

    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }
  /**
   * post data
   * @param {string} type - the datatype to post
   * @param {object} data - the data to post
   * @return {promise} - promise which resolves with data
   **/
  post(type, data) {
    var postUrl = this.base + type + '/post';

    return fetch(postUrl, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(data),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    }).then(this.errorHandler);
  }

  /**
   * delete slide
   * @param {object} id - the slide object id
   * @return {promise} - promise which resolves with response
   **/
  deleteSlide(id) {
    const suffix = 'Slide/delete';
    const url = this.base + suffix;
    const query = {
      '_id': id,
    };
    return fetch(url + '?' + objToParamStr(query), {
      method: 'DELETE',
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler)
        .then(() => {
          initialize();
        });
  }

  /**
   * request deletion of slide
   * @param {object} slideId - the slide object id
   * @param {object} slideName - the slide name
   * @param {object} fileName - the slide filename on server system
   * @return {promise} - promise which resolves with response
   **/
  requestToDeleteSlide(slideId, slideName=null, fileName=null) {
    const suffix = 'Request/add';
    const url = this.base + suffix;
    const query = {};
    const data =
                  {
                    'slideName': String(slideName),
                    'fileName': String(fileName),
                    'slideId': String(slideId),
                  };
    return fetch(url + '?' + objToParamStr(query), {
      method: 'POST',
      body: JSON.stringify({
        'requestedBy': String(getUserId()),
        'type': 'deleteSlide',
        'slideDetails': data,
      }),
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler)
        .then(() => {
          showSuccessPopup('Delete request submitted');
          initialize();
        });
  }

  /**
  * decline request deletion of slide
  * @param {object} reqId - the request object id
  * @return {promise} - promise which resolves with response
  **/
  cancelRequestToDeleteSlide(reqId, onlyRequestCancel=true) {
    // If only cancelling request and not deleting slide file then set onlyRequestCancel to true
    const suffix = 'Request/delete';
    const url = this.base + suffix;
    const query = {
      '_id': reqId,
    };
    return fetch(url + '?' + objToParamStr(query), {
      method: 'DELETE',
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler)
        .then(() => {
          if (onlyRequestCancel) {
            showSuccessPopup('Delete request declined');
          }
          initialize();
        });
  }

  findRequest(userType=getUserType()) {
    const suffix = 'Request/find';
    const url = this.base + suffix;
    if (userType === 'Admin') {
      var query = {};

      return fetch(url + '?' + objToParamStr(query), {
        credentials: 'include',
        mode: 'cors',
      }).then(this.errorHandler);
    } else {
      var query = {
        'requestedBy': getUserId(),
      };

      return fetch(url + '?' + objToParamStr(query), {
        credentials: 'include',
        mode: 'cors',
      }).then(this.errorHandler);
    }
  }


  // Update slide name
  updateSlideName(id, newName) {
    const suffix = 'Slide/update';
    const url = this.base + suffix;
    console.log(id+ '   '+ newName);
    const query = {
      '_id': id,
    };
    const update = {
      'name': newName,
    };
    return fetch(url + '?' + objToParamStr(query), {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(update),
    });
  }

  /**
   * request creation of user
   * @param {object} email - the requested user email
   * @param {object} userFilter - the requested user filters
   * @param {object} userType - the requested user type
   * @return {promise} - promise which resolves with response
   **/
  requestToCreateUser(email, userFilter, userType) {
    const suffix = 'Request/add';
    const url = '../../data/' + suffix;
    const query = {};
    const data =
                  {
                    'email': email,
                    'userType': userType,
                    'userFilter': userFilter,
                  };
    return fetch(url + '?' + objToParamStr(query), {
      method: 'POST',
      body: JSON.stringify({
        'requestedBy': String(getUserId()),
        'type': 'addUser',
        'userDetails': data,
      }),
      credentials: 'same-origin',
      mode: 'cors',
    })
        .then((response) => {
          if (!response.ok) {
            alert('There was some error. Please try again or refresh the page.');
            throw new Error('Network response was not ok');
          };
          return response.blob();
        })
        .then((data) => {
          showSuccessPopup('User registration request submitted');
          document.getElementById('userForm').reset();
          // window.location.reload();
        })
        .catch((error) => {
          console.error('There has been a problem with your fetch operation:', error);
        });
  }

  /**
   * accept request creation of user
   * @param {object} email - the requested user email
   * @param {object} userFilter - the requested user filters
   * @param {object} userType - the requested user type
   * @param {object} reqId - the request object id
  * @return {promise} - promise which resolves with response
  **/
  acceptRequestToDeleteSlide(email, userFilter, userType, reqId) {
    // If only cancelling request and not deleting slide file then set onlyRequestCancel to true
    const suffix = 'User/post';
    const url = this.base + suffix;
    const query = {};
    const data = {
      'email': email,
      'userFilter': userFilter,
      'userType': userType,
    };

    return fetch(url + '?' + objToParamStr(query), {
      method: 'POST',
      mode: 'cors', // no-cors, cors, *same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(this.errorHandler)
        .then(() => {
          showSuccessPopup('User creation successful');
          initialize();
        });
  }

  /**
  * decline user creation request
  * @param {object} reqId - the request object id
  * @return {promise} - promise which resolves with response
  **/
  cancelRequestToCreateUser(reqId, onlyRequestCancel=true) {
    // If only cancelling request and not deleting slide file then set onlyRequestCancel to true
    const suffix = 'Request/delete';
    const url = this.base + suffix;
    const query = {
      '_id': reqId,
    };
    return fetch(url + '?' + objToParamStr(query), {
      method: 'DELETE',
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler)
        .then(() => {
          if (onlyRequestCancel) {
            initialize();
            // alert('User creation request declined');
            showSuccessPopup('User creation request declined');
          }
        });
  }
};


try {
  module.exports = Store;
} catch (e) {
  var a;
}
