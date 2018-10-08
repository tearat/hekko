<?php

echo $_POST['action'];

if ( $_POST['action'] == "save" )
{
    $data = $_POST['stream'];
    $file = '../data/database.json';
    file_put_contents($file, $data);
    echo "saved";
} else {
    echo "not saved";
}

?>