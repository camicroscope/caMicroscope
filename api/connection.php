<?php
// The page that contains the MYSQL connection and some other useful functions
require("constants.php");

$timezone = "Asia/Singapore"; 
if(function_exists('date_default_timezone_set')) date_default_timezone_set($timezone);

$connection = mysql_connect(DB_SERVER,DB_USER,DB_PASS);
if (!$connection) {
    die("Database connection failed: " . mysql_error());
}
else
{
   mysql_query("SET character_set_results=utf8", $connection);
   mb_language('uni');
   mb_internal_encoding('UTF-8');
}

$db_select = mysql_select_db(DB_NAME,$connection);
if (!$db_select) {
    die("Database selection failed: " . mysql_error());
}
else mysql_query("set names 'utf8'",$connection);

function mysql_prep( $value ) {
    // To modify strings to meet MYSQL standards
    $magic_quotes_active = get_magic_quotes_gpc();
    $new_enough_php = function_exists( "mysql_real_escape_string" ); // i.e. PHP >= v4.3.0
    if( $new_enough_php ) { // PHP v4.3.0 or higher
        // undo any magic quote effects so mysql_real_escape_string can do the work
        if( $magic_quotes_active ) { $value = stripslashes( $value ); }
        $value = mysql_real_escape_string( $value );
    } else { // before PHP v4.3.0
        // if magic quotes aren't already on then add slashes manually
        if( !$magic_quotes_active ) { $value = addslashes( $value ); }
        // if magic quotes are active, then the slashes already exist
    }
    return $value;
}
?>
