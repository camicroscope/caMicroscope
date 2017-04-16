<?php

$user = $_POST["user"];
if (strpos(file_get_contents("./super_users.txt"), $user) !== false) {
    echo 1;
} else {
    echo 0;
}

?> 
