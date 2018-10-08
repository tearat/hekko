<?php

$dirname = $_SERVER['DOCUMENT_ROOT'].'/data';
$filename = $_SERVER['DOCUMENT_ROOT'].'/data/database.json';

if (!is_dir( $dirname )) {
    mkdir($_SERVER['DOCUMENT_ROOT']."/data");
}

if (!file_exists( $filename )) {
    file_put_contents( $filename, "[]" );
}

if ( $_GET['action'] == "load" ) {
    $data = file_get_contents( $filename );
    header($_SERVER['SERVER_PROTOCOL']." 200 OK");
    header('Content-Type: application/json');
    echo json_encode($data);
}

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