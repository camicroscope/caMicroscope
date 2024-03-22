/**
 * stacktable.js
 * Author & copyright (c) 2012: John Polacek
 * CardTable by: Justin McNally (2015)
 * MIT license
 *
 * Page: http://johnpolacek.github.com/stacktable.js
 * Repo: https://github.com/johnpolacek/stacktable.js/
 *
 * jQuery plugin for stacking tables on small screens
 * Requires jQuery version 1.7 or above
 *
 */
;(function($) {
  $.fn.cardtable = function(options) {
    var $tables = this,
        defaults = {headIndex:0},
        settings = $.extend({}, defaults, options),
        headIndex;

    // checking the "headIndex" option presence... or defaults it to 0
    if(options && options.headIndex)
      headIndex = options.headIndex;
    else
      headIndex = 0;

    return $tables.each(function() {
      var $table = $(this);
      if ($table.hasClass('stacktable')) {
        return;
      }
      var table_css = $(this).prop('class');
      var $stacktable = $('<div></div>');
      if (typeof settings.myClass !== 'undefined') $stacktable.addClass(settings.myClass);
      var markup = '';
      var $caption, $topRow, headMarkup, bodyMarkup, tr_class;

      $table.addClass('stacktable large-only');

      $caption = $table.find(">caption").clone();
      $topRow = $table.find('>thead>tr,>tbody>tr,>tfoot>tr,>tr').eq(0);

      // Remove any existing stacked tables
      $table.siblings().filter('.stacktable.small-only').remove();

      // using rowIndex and cellIndex in order to reduce ambiguity
      $table.find('>tbody>tr').each(function() {

        // declaring headMarkup and bodyMarkup, to be used for separately head and body of single records
        headMarkup = '';
        bodyMarkup = '';
        tr_class = $(this).prop('class');
        // for the first row, "headIndex" cell is the head of the table
        // for the other rows, put the "headIndex" cell as the head for that row
        // then iterate through the key/values
        $(this).find('>td,>th').each(function(cellIndex) {
          if ($(this).html() !== ''){
            bodyMarkup += '<tr class="' + tr_class +'">';
            if ($topRow.find('>td,>th').eq(cellIndex).html()){
              bodyMarkup += '<td class="st-key">'+$topRow.find('>td,>th').eq(cellIndex).html()+'</td>';
            } else {
              bodyMarkup += '<td class="st-key"></td>';
            }
            bodyMarkup += '<td class="st-val '+$(this).prop('class')  +'">'+$(this).html()+'</td>';
            bodyMarkup += '</tr>';
          }
        });

        markup += '<table class=" '+ table_css +' stacktable small-only"><tbody>' + headMarkup + bodyMarkup + '</tbody></table>';
      });

      $table.find('>tfoot>tr>td').each(function(rowIndex,value) {
        if ($.trim($(value).text()) !== '') {
          markup += '<table class="'+ table_css + ' stacktable small-only"><tbody><tr><td>' + $(value).html() + '</td></tr></tbody></table>';
        }
      });

      $stacktable.prepend($caption);
      $stacktable.append($(markup));
      $table.before($stacktable);
    });
  };

  // Rest of the code remains unchanged...
})(jQuery);
