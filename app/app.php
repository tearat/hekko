<?php

$img_dir = $_SERVER['DOCUMENT_ROOT'].'/images/';
$dirname = $_SERVER['DOCUMENT_ROOT'].'/data';
$filename = $_SERVER['DOCUMENT_ROOT'].'/data/database.json';

if (!is_dir( $dirname )) {
    mkdir($_SERVER['DOCUMENT_ROOT']."/data");
}

if (!is_dir( $img_dir )) {
    mkdir($_SERVER['DOCUMENT_ROOT']."/images");
}

if (!file_exists( $filename )) {
    file_put_contents( $filename, "[]" );
}

// load data (returns in JSON)
if ( $_GET['action'] == "load" ) {
    $data = file_get_contents( $filename );
    header($_SERVER['SERVER_PROTOCOL']." 200 OK");
    header('Content-Type: application/json');
    echo json_encode($data);
}

// save data (received as TEXT)
if ( $_POST['action'] == "save" )
{
    $data = $_POST['stream'];
    $file = '../data/database.json';
    file_put_contents($file, $data);
    echo "saved";
}

// adding a thread (received as POST data by form)
if ( $_POST['action'] == "add_thread" )
{
    // Получаю входящие данные
    $title = $_POST['title'];
    $body = $_POST['body'];
    
    // Если файл не ебического размера
    if ( $_FILES['img']['size'] < 1000000 ) { 
        $original_name = $_FILES['img']['name'];
        $random_seed = rand(1000000, 9999999).date('now')."_";
        $new_full_path = $img_dir . $random_seed . $original_name;
        $new_server_path = '/images/' . $random_seed . $original_name;
        $temp_name = $_FILES['img']['tmp_name'];
        move_uploaded_file($temp_name, $new_full_path);
    }
    
    // Если файла нет
    if ( $_FILES['img']['size'] == 0 ) { 
        $new_server_path = "no";
    }
    
    // Получаю массив из JSON и добавляю в него новое значение
    $data = file_get_contents( $filename );
    $data = json_decode($data, true);
    
    // Создаю новый элемент для базы данных
    $new_item = [];
    $new_item['id'] = $data[count($data)-1]['id']+1;
    $new_item['title'] = $title;
    $new_item['body'] = $body;
    $new_item['parent'] = 0;
    $new_item['updated'] = time();
    $new_item['img'] = $new_server_path;
    
    $data[] = $new_item;
    
    // Преобразую массив обратно в JSON
    $data = json_encode($data, JSON_UNESCAPED_UNICODE);
    
    // Перезаписываю файл
    file_put_contents($filename, $data);
    header("location: /");
}

?>