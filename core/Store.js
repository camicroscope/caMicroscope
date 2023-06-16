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
  getUsers(email) {
    const suffix = 'User/find';
    const url = email ? `${this.base}${suffix}?${objToParamStr({email})}` : `${this.base}${suffix}`;
    return fetch(url, {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler).then((x) => this.filterBroken(x, 'mark'));
  }
  /**
   * update a collection info
   * @param {string} id - the collection id
   * @param {object} json - the data
   * @return {promise} - promise which resolves with data
   **/
  updateUser(id, data) {
    const suffix = 'User/update';
    const url = this.base + suffix;
    const query = {
      '_id': id,
    };
    return fetch(url + '?' + objToParamStr(query), {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(data),
    });
  }
  /**
   * post user
   * @param {object} json - the user data
   * @return {promise} - promise which resolves with response
   **/
  addUser(json) {
    const suffix = 'User/post';
    const url = this.base + suffix;
    if (this.validation.user && !this.validation.user(json)) {
      console.warn(this.validation.user.errors);
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
   * delete user
   * @param {object} id - the user object id
   * @return {promise} - promise which resolves with response
  **/
  deleteUser(id) {
    const suffix = 'User/delete';
    const url = this.base + suffix;
    const query = {
      '_id': id,
    };
    return fetch(url + '?' + objToParamStr(query), {
      method: 'DELETE',
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }
  /**
  * Get a description of the system's user permissions
  * @param {string} userType - the target user type.
  **/
  getUserPermissions(userType) {
    const suffix = 'User/wcido';
    const url = this.base + suffix;
    const query = {
      'ut': userType,
    };
    return fetch(url + '?' + objToParamStr(query), {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
    });
  }
  /**
   * find marks matching slide and/or marktype
   * will search by slide field as exactly given and by the oid slide of that name
   * @param {string} [name] - the associated slide name
   * @param {string} [slide] - the associated marktype name, supporting regex match
   * @return {promise} - promise which resolves with data
   **/
  findMark(slide, name, footprint, source, x0, x1, y0, y1) {
    const suffix = 'Mark/spatial';
    const url = this.base + suffix;
    const query = {};
    let bySlideId;
    if (slide) {
      query['provenance.image.slide'] = slide;
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
    }).then(this.errorHandler).then((x) => this.filterBroken(x, 'mark'));
  }
  markSegmentationCount(slide, x0, x1, y0, y1) {
    const suffix = 'Mark/segmentationCount';
    const url = this.base + suffix;
    const query = {};
    if (slide) {
      query['provenance.image.slide'] = slide;
    }
    query['provenance.analysis.source'] = 'computer';
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
    }).then(this.errorHandler);
  }
  getMarkByIds(ids, slide, notes, source, footprint, x0, x1, y0, y1) {
    if (!slide) {
      return {
        hasError: true,
        message: 'args are illegal',
      };
    }
    let bySlideId;
    const suffix = 'Mark/multi';
    const url = this.base + suffix;
    const query = {};
    query['provenance.image.slide'] = slide;

    if (source) {
      query.source = source;
    }

    if (notes) {
      query.notes = notes;
    }

    if (Array.isArray(ids)) {
      // const stringifiedIds = ids.map((id) => `"${id}"`).join(',');
      query.ids = ids;
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
    return fetch(url, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(query),
    }).then(this.errorHandler).then((x) => this.filterBroken(x, 'mark'));
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
    }).then(this.errorHandler).then((x) => this.filterBroken(x, 'mark'));
  }
  fetchMark(slideId) {
    const suffix = 'Mark/find';
    const url = this.base + suffix;
    const query = {};
    query['provenance.image.slide'] = slideId;
    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler).then((x) => this.filterBroken(x, 'mark'));
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
  deleteMarkByExecId(execId, slide) {
    const suffix = 'Mark/delete';
    const url = this.base + suffix;
    const query = {
      'provenance.analysis.execution_id': execId,
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
  // findMarkTypes(slide, name) {
  //   const suffix = 'Mark/types';

  //   const query = {};
  //   //
  //   if (!slide) {
  //     console.error('Store.findMarkTypes needs slide ... ');
  //     return null;
  //   }
  //   query['provenance.image.slide'] = slide;
  //   if (name) {
  //     query['provenance.analysis.execution_id'] = name;
  //   }
  //   const url = this.base + suffix;
  //   return fetch(url + '?' + objToParamStr(query), {
  //     credentials: 'include',
  //     mode: 'cors',
  //   }).then(this.errorHandler);
  // }


  findMarkTypes(slide, type) { // type = 'human' or 'computer'
    const suffix = 'Mark/findMarkTypes';

    const query = {};
    //
    if (!slide || !type) {
      console.error('Store.findMarkTypes needs slide and type ... ');
      return null;
    }
    query['slide'] = slide;
    query['type'] = type;

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
    }).then(this.errorHandler).then((x) => this.filterBroken(x, 'heatmap'));
  }
  fetchHeatMap(slideId) {
    const suffix = 'Heatmap/find';
    const url = this.base + suffix;
    const query = {};
    query['provenance.image.slide'] = slideId;
    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler).then((x) => this.filterBroken(x, 'heatmap'));
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
    }).then(this.errorHandler).then((x) => this.filterBroken(x, 'heatmap'));
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
    }).then(this.errorHandler).then((x) => this.filterBroken(x, 'heatmap'));
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
   * @param {string} [name] - the slide's name
   * @param {string} [specimen] - the slide's noted specimen
   * @param {string} [study] - the slide's noted study
   * @param {string} [location] - the slide's file location
   * @param {string} [q] - override query - ignores all other params if set
   * @return {promise} - promise which resolves with data
   **/
  findSlide(name, specimen, study, location, q) {
    let query = {};
    const suffix = 'Slide/find';
    const url = this.base + suffix;
    if (q) {
      query = q;
    } else {
      if (name) {
        query.name = name;
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
    }).then(this.errorHandler).then((x) => this.filterBroken(x, 'slide'));
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
    }).then(this.errorHandler).then((x) => this.filterBroken(x, 'template'));
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
    }).then(this.errorHandler).then((x) => this.filterBroken(x, 'template'));
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
      'config_name': name,
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
  requestToDeleteSlide(slideId, slideName = null, fileName = null) {
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
  cancelRequestToDeleteSlide(reqId, onlyRequestCancel = true) {
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

  findRequest(userType = getUserType()) {
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

  addPresetLabels(labels) {
    const suffix = 'Presetlabels/add';
    const url = this.base + suffix;
    return fetch(url, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(labels),
    }).then(this.errorHandler);
  }

  updatePresetLabels(id, labels) {
    const suffix = 'Presetlabels/update';
    const url = this.base + suffix;
    const query = {id: id};

    return fetch(url + '?' + objToParamStr(query), {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(labels),
    }).then(this.errorHandler);
  }

  updateMarksLabel(id, name) {
    const suffix = 'Mark/updateMarksLabel';
    const url = this.base + suffix;
    const query = {id, name};

    return fetch(url + '?' + objToParamStr(query), {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }

  removePresetLabels(id) {
    const suffix = 'Presetlabels/remove';
    const url = this.base + suffix;
    const query = {id: id};
    return fetch(url + '?' + objToParamStr(query), {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }


  /**
   * post collection
   * @param {object} json - the collection data
   * @return {promise} - promise which resolves with response
   **/
  addCollection(json) {
    const suffix = 'Collection/post';
    const url = this.base + suffix;
    if (this.validation.collection && !this.validation.collection(json)) {
      console.warn(this.validation.collection.errors);
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
   * get a freeform document by id. Try not to use this in core.
   * @param {string} id - the mongo doc's id
   * @return {promise} - promise which resolves with data
   **/
  getFreeform(id) {
    const suffix = 'Freeform/find';
    const url = this.base + suffix;
    const query = {
      '_id': id,
    };
    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }

  /**
   * find a freeform document by arbitrary query. Try not to use this in core.
   * @param {string} id - the mongo doc's id
   * @return {promise} - promise which resolves with data
   **/
  findFreeform(query) {
    const suffix = 'Freeform/find';
    const url = this.base + suffix;
    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }

  /**
   * post a freeform document.  Try not to use this in core.
   * @param {object} json - the collection data
   * @return {promise} - promise which resolves with response
   **/
  addFreeform(json) {
    const suffix = 'Freeform/post';
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
   * delete freeform document
   * @param {object} id - the freeform object id
   * @return {promise} - promise which resolves with response
   **/
  deleteFreeform(id) {
    const suffix = 'Freeform/delete';
    const url = this.base + suffix;
    const query = {
      '_id': id,
    };
    return fetch(url + '?' + objToParamStr(query), {
      method: 'DELETE',
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }
  /**
   * get a collection info
   * @param {object} json - the log data
   * @return {promise} - promise which resolves with data
   **/
  getAllCollection() {
    const suffix = 'Collection/find';
    const url = this.base + suffix;

    return fetch(url, {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }
  /**
   * get a collection info
   * @param {string} id - the mongo doc's id
   * @return {promise} - promise which resolves with data
   **/
  getCollection(id) {
    const suffix = 'Collection/find';
    const url = this.base + suffix;
    const query = {
      '_id': id,
    };
    return fetch(url + '?' + objToParamStr(query), {
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }
  /**
   * update a collection info
   * @param {string} id - the collection id
   * @param {object} json - the data
   * @return {promise} - promise which resolves with data
   **/
  updateCollection(id, data) {
    const suffix = 'Collection/update';
    const url = this.base + suffix;
    const query = {
      '_id': id,
    };
    return fetch(url + '?' + objToParamStr(query), {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(data),
    });
  }
  /**
   * delete collection
   * @param {object} id - the collection object id
   * @return {promise} - promise which resolves with response
   **/
  deleteCollection(id) {
    const suffix = 'Collection/delete';
    const url = this.base + suffix;
    const query = {
      '_id': id,
    };
    return fetch(url + '?' + objToParamStr(query), {
      method: 'DELETE',
      credentials: 'include',
      mode: 'cors',
    }).then(this.errorHandler);
  }


  // Update slide review status
  updateSlideReview(id, newStatus) {
    const suffix = 'Slide/update';
    const url = this.base + suffix;
    const query = {
      '_id': id,
    };
    const update = {
      'review': newStatus,
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
  cancelRequestToCreateUser(reqId, onlyRequestCancel = true) {
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
