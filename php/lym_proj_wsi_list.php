<?php 
  session_start();
  require '../../authenticate.php';

  $config = require '../api/Configuration/config.php';
?>

<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <link rel="stylesheet" href="lym_proj_wsi_list.css">
  <title>Whole Slide Image List</title>
</head>
<body>
<?PHP
  $page_size = 10;

  $page = $_GET['page'];
  $type = $_GET['type'];
  $email = $_SESSION['email'];

  $handle = fopen(sprintf("wsi_list-%s.txt", $type), "r");
  if ($handle) {
    printf("<div><h2>%s slides</h2><ul>\n", strtoupper($type));
    $idx = 0;
    $max_page = 0;
    while (($slide = fgets($handle)) !== false) {
      $slide = rtrim($slide);
      if (($page-1)*$page_size <= $idx && $idx < $page*$page_size) {
        printf("<li><a href=\"/camicroscope_levu/osdCamicroscope.php?tissueId=%s&cancerType=%s\" target=\"_blank\">%s",
               $slide, $type, $slide);
	if (file_exists(sprintf("../data/%s_%s.txt", $slide, $email))) {
          print "&nbsp; <font size=2>Automatic prediction finalized</font>"; 
        }
        print "</a></li>\n"; 
      }
      ++$idx;
      $max_page = $idx / $page_size;
    }
    fclose($handle);
    printf("</ul></div>\n");
  }
?>

<p>
<font face="Lucida Console">
<a href=lym_proj_wsi_list.php?type=<?PHP printf("%s", $type);?>&page=<?PHP printf("%d", $page - 1);?>>Prev Page</a>
&nbsp; <?PHP printf("[%d/%d]", $page, ceil($max_page));?> &nbsp;
<a href=lym_proj_wsi_list.php?type=<?PHP printf("%s", $type);?>&page=<?PHP printf("%d", $page + 1);?>>Next Page</a>
</font>

<form action="lym_proj_wsi_list.php" method="get">
<input type="submit" value="go to page">
<input type="text" name="page" size="3">
<input type="hidden" name="type" value="<?PHP printf("%s", $type);?>"/>
</form>

<br>

<form action="/camicroscope_levu/osdCamicroscope.php" method="get" target="_blank">
<input type="submit" value="go to slide">
<input type="text" name="tissueId" size="30">
<input type="hidden" name="cancerType" value="<?PHP printf("%s", $type);?>"/>
</form>

</body>
</html>

