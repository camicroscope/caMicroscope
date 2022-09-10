function makeTreeTable(id) {
  var
    $table = $('#' + id);
  var rows = $table.find('tr');

  rows.each(function(index, row) {
    var
      $row = $(row);
    var level = $row.data('level');
    var id = $row.data('id');
    var $columnName = $row.find('td[data-column="name"]');
    var children = $table.find('tr[data-parent="' + id + '"]');

    if (children.length) {
      var expander = $columnName.prepend('' +
                '<span class="treegrid-expander glyphicon glyphicon-chevron-right">&#9660;</span>' +
                '');

      children.hide();

      expander.on('click', function(e) {
        var $target = $(e.target);
        if ($target.hasClass('glyphicon-chevron-right')) {
          $target
              .removeClass('glyphicon-chevron-right')
              .addClass('glyphicon-chevron-down');

          children.show();
        } else {
          $target
              .removeClass('glyphicon-chevron-down')
              .addClass('glyphicon-chevron-right');

          reverseHide($table, $row);
        }
      });
    }

    $columnName.prepend('' +
            '<span class="treegrid-indent" style="width:' + 25 * level + 'px"></span>' +
            '');
  });

  // Reverse hide all elements
  reverseHide = function(table, element) {
    var
      $element = $(element);
    var id = $element.data('id');
    var children = table.find('tr[data-parent="' + id + '"]');

    if (children.length) {
      children.each(function(i, e) {
        reverseHide(table, e);
      });

      $element
          .find('.glyphicon-chevron-down')
          .removeClass('glyphicon-chevron-down')
          .addClass('glyphicon-chevron-right');

      children.hide();
    }
  };
}
