<?php

if ($_GET['location']) {
    $location = $_GET['location'];
} else {
    $location = 0;
}

require('views/index.html');

?>