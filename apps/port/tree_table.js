function makeTreeTable(id) {
  let
    $table = $('#' + id);
  let rows = $table.find('tr');

  rows.each(function(index, row) {
    let
      $row = $(row);
    let level = $row.data('level');
    let id = $row.data('id');
    let $columnName = $row.find('td[data-column="name"]');
    let children = $table.find('tr[data-parent="' + id + '"]');

    if (children.length) {
      let expander = $columnName.prepend('' +
                '<span class="treegrid-expander glyphicon glyphicon-chevron-right">&#9660;</span>' +
                '');

      children.hide();

      expander.on('click', function(e) {
        let $target = $(e.target);
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
    let
      $element = $(element);
    let id = $element.data('id');
    let children = table.find('tr[data-parent="' + id + '"]');

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
