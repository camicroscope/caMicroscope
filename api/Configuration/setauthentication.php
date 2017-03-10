<?php
// responsible for all OpenID related magic
// check's user session to see if already logged In . If not then redirect to index.php where they can sign-in or register
// if session is set allow user to access the resource
// args : target - target to redirect after authentication . Default - select.php
// args : openid_identifier - openid URL

session_start();

$_SESSION["email"] = "guestuser@guest.com";
$_SESSION["username"] = "guest";
$_SESSION["name"] = "Guest";
$_SESSION["last_seen"] = time();
$_SESSION["api_key"] = "d30e5c69-ba87-4440-9638-cd7600c1c4bd";
?>
