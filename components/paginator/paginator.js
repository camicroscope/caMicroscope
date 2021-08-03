
/**
 * CaMicroscope Paginator. A paginator component control the pagination
 * @constructor
 * @param {Object} options
 *        All required and optional settings for instantiating a new instance of a CaMessage.
 * @param {String} options.id
 *        Id of the element to append the CaMessage's container element to.
 */
function Paginator(options) {
  this.name = 'Paginator';
  /**
       * @property {Element} elt The element to append the CaMessage's container element to.
       */
  this.elt;
  this.setting = {
    totalPage: 10,
    pageRange: 2,
    currentPage: 1, // page start from 0;
    sizing: null, // pagination-lg, pagination-sm
    justifyContent: null, // justify-content-enter, justify-content-end
    onChange: null,
  };

  extend(this.setting, options);
  this.elt = document.getElementById(this.setting.id);
  if (!this.elt) {
    console.error(`${this.name}: No Main Element...`);
    return;
  }

  // draw the pagination
  this.draw();

  // bind events
}

/**
   *  reset the message's content to default
   */
Paginator.prototype.draw = function() {
  empty(this.elt);

  this.elt.innerHTML = `<ul class="pagination ${this.setting.sizing?this.setting.sizing:''} ${this.setting.justifyContent?this.setting.justifyContent:''}">${this.__createPaginationContent()}</ul>`;


  // for page num
  const pages = this.elt.querySelectorAll('.page-item.page');
  pages.forEach((elt)=>{
    elt.addEventListener('click', (e)=>{
      if (this.setting.currentPage == elt.dataset.num) return;
      this.setting.currentPage = +elt.dataset.num;
      this.draw();
      if (this.setting.onChange&&isFunction(this.setting.onChange)) {
        this.setting.onChange({
          currentPage: this.setting.currentPage,
          totalPage: this.setting.totalPage,
        });
      }
    });
  });
  const prev = this.elt.querySelector('.page-item.prev');
  prev.addEventListener('click', (e)=>{
    if (this.setting.currentPage==1) return;
    this.setting.currentPage--;
    this.draw();
    if (this.setting.onChange&&isFunction(this.setting.onChange)) {
      this.setting.onChange({
        currentPage: this.setting.currentPage,
        totalPage: this.setting.totalPage,
      });
    }
  });
  const next = this.elt.querySelector('.page-item.next');
  next.addEventListener('click', (e)=>{
    if (this.setting.currentPage==this.setting.totalPage) return;
    this.setting.currentPage++;

    this.draw();
    if (this.setting.onChange&&isFunction(this.setting.onChange)) {
      this.setting.onChange({
        currentPage: this.setting.currentPage,
        totalPage: this.setting.totalPage,
      });
    }
  });
};


Paginator.prototype.__createPaginationContent = function() {
  const pageItems = [];
  let i;
  const {currentPage, pageRange, totalPage} = this.setting;

  var rangeStart = currentPage - pageRange;
  var rangeEnd = currentPage + pageRange;

  if (rangeEnd > totalPage) {
    rangeEnd = totalPage;
    rangeStart = totalPage - pageRange * 2;
    rangeStart = rangeStart < 1 ? 1 : rangeStart;
  }

  if (rangeStart <= 1) {
    rangeStart = 1;
    rangeEnd = Math.min(pageRange * 2 + 1, totalPage);
  }

  // create previous item
  pageItems.push(this.__createPageItem('prev', currentPage==1?'disabled':''));

  if (rangeStart <= 3) {
    for (i = 1; i < rangeStart; i++) {
      pageItems.push(this.__createPageItem(i, currentPage==i?'active':''));
    }
  } else {
    // first page
    pageItems.push(this.__createPageItem(1, currentPage==1?'active':''));
    // ellipsis
    pageItems.push(this.__createPageItem('ellipsis'));
  }

  for (i = rangeStart; i <= rangeEnd; i++) {
    pageItems.push(this.__createPageItem(i, currentPage==i?'active':''));
  }

  if (rangeEnd >= totalPage - 2) {
    for (i = rangeEnd + 1; i <= totalPage; i++) {
      pageItems.push(this.__createPageItem(i, currentPage==i?'active':''));
    }
  } else {
    // ellipsis
    pageItems.push(this.__createPageItem('ellipsis'));
    // last page
    pageItems.push(this.__createPageItem(totalPage, currentPage==totalPage?'active':''));
  }
  // create next item
  pageItems.push(this.__createPageItem('next', currentPage==totalPage?'disabled':''));

  return pageItems.join('');
};

Paginator.prototype.__createPageItem = function(type=null, status) {
  // type -> num, next, previous, ellopsis
  // status -> disabled, active
  // Previous -> &laquo;
  // Next     -> &raquo;
  if (Number.isInteger(type)) { // normal
    return `<li class="page-item page ${status?status:''}" data-num=${type} ${status=='disabled'?'aria-disabled="true" disabled':''}><a class="page-link" href="#">${type}</a></li>`;
  } else if (type=='prev') { // previous
    return `<li class="page-item prev ${status?status:''}" ${status=='disabled'?'aria-disabled="true" disabled':''}><a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo</span></a></li>`;
  } else if (type=='next') { // next
    return `<li class="page-item next ${status?status:''}" ${status=='disabled'?'aria-disabled="true" disabled':''}><a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo</span></a></li>`;
  } else { // create ellopsis
    return `<li class="page-item disabled" disabled><a class="page-link" href="#">...</a></li>`;
  }
};


// function render(isBoot) {
//   var self = this;
//   var model = self.model;
//   var el = model.el || $('<div class="paginationjs"></div>');
//   var isForced = isBoot !== true;

//   self.callHook('beforeRender', isForced);

//   var currentPage = model.pageNumber || attributes.pageNumber;
//   var pageRange = attributes.pageRange || 0;
//   var totalPage = self.getTotalPage();

//   var rangeStart = currentPage - pageRange;
//   var rangeEnd = currentPage + pageRange;

//   if (rangeEnd > totalPage) {
//     rangeEnd = totalPage;
//     rangeStart = totalPage - pageRange * 2;
//     rangeStart = rangeStart < 1 ? 1 : rangeStart;
//   }

//   if (rangeStart <= 1) {
//     rangeStart = 1;
//     rangeEnd = Math.min(pageRange * 2 + 1, totalPage);
//   }

//   el.html(self.generateHTML({
//     currentPage: currentPage,
//     pageRange: pageRange,
//     rangeStart: rangeStart,
//     rangeEnd: rangeEnd,
//   }));

//   // There is only one page
//   if (attributes.hideWhenLessThanOnePage) {
//     el[totalPage <= 1 ? 'hide' : 'show']();
//   }

//   self.callHook('afterRender', isForced);

//   return el;
// };

// function generatePageNumbersHTML(rangeStart, rangeEnd) {
//   const pageItems = [];
//   const {currentPage, totalPage} = this.setting;
//   let i;
//   if (rangeStart <= 3) {
//     for (i = 1; i < rangeStart; i++) {
//       pageItems.push(this.__createPageItem(i, currentPage==i?'active':''));
//     }
//   } else {
//     // first page
//     pageItems.push(this.__createPageItem(1, currentPage==1?'active':''));
//     // ellipsis
//     pageItems.push(this.__createPageItem('ellipsis'));
//   }

//   for (i = rangeStart; i <= rangeEnd; i++) {
//     pageItems.push(this.__createPageItem(i, currentPage==i?'active':''));
//   }

//   if (rangeEnd >= totalPage - 2) {
//     for (i = rangeEnd + 1; i <= totalPage; i++) {
//       pageItems.push(this.__createPageItem(i, currentPage==i?'active':''));
//     }
//   } else {
//     // ellipsis
//     pageItems.push(this.__createPageItem('ellipsis'));
//     // first page
//     pageItems.push(this.__createPageItem(totalPage, currentPage==totalPage?'active':''));
//   }

//   return html;
// };

