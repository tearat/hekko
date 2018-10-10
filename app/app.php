<?php

$img_dir = $_SERVER['DOCUMENT_ROOT'].'/images/';
$data_dir = $_SERVER['DOCUMENT_ROOT'].'/data';
$database_filename = $data_dir.'/database.json';

if (!is_dir( $data_dir )) {
    mkdir($_SERVER['DOCUMENT_ROOT']."/data");
}

if (!is_dir( $img_dir )) {
    mkdir($_SERVER['DOCUMENT_ROOT']."/images");
}

if (!file_exists( $database_filename )) {
    file_put_contents( $database_filename, "[]" );
}

// load data (returns in JSON)
if ( $_GET['action'] == "load" ) {
    $data = file_get_contents( $database_filename );
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
    if ( $_FILES['img']['size'] < 10000000 ) { 
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
    $data = file_get_contents( $database_filename );
    $data = json_decode($data, true);
    
    // Создаю новый элемент для базы данных
    $new_item = [];
    $new_item['id'] = $data[count($data)-1]['id']+1;
    $new_item['title'] = $title;
    $new_item['body'] = $body;
    $new_item['parent'] = 0;
//    $new_item['updated'] = time();
    $new_item['img'] = $new_server_path;
    
    $data[] = $new_item;
    
    // Преобразую массив обратно в JSON
    $data = json_encode($data, JSON_UNESCAPED_UNICODE);
    
    // Перезаписываю файл
    file_put_contents($database_filename, $data);
    header("location: /");
}

// adding a comment (received as POST data by form)
if ( $_POST['action'] == "add_comment" )
{
    // Получаю входящие данные
    $location = $_POST['location'];
    $title = $_POST['title'];
    $body = $_POST['body'];
    
    // Получаю массив из JSON и добавляю в него новое значение
    $data = file_get_contents( $database_filename );
    $data = json_decode($data, true);
    
    // Создаю новый элемент для базы данных
    $new_item = [];
    $new_item['id'] = $data[count($data)-1]['id']+1;
    $new_item['title'] = $title;
    $new_item['body'] = $body;
    $new_item['parent'] = intval($location);
//    $new_item['updated'] = time();
    
    $data[] = $new_item;
    
    // Преобразую массив обратно в JSON
    $data = json_encode($data, JSON_UNESCAPED_UNICODE);
    
    // Перезаписываю файл
    file_put_contents($database_filename, $data);
    header("location: /".$location);
}

// deleting a thread 
// -> POST data with thread's id

if ( $_POST['action'] == "delete_thread" )
{
    // Получаю входящие данные
    $id = $_POST['id'];
    
    // Получаю массив из JSON и добавляю в него новое значение
    $data = file_get_contents( $database_filename );
    $data = json_decode($data, true);
    
    // Ищу нужную запись по ID и удаляю её
    foreach($data as $index => $entry) {
        if($entry['id'] == $id) {
            unset($data[$index]);
        }
    }
    
    // Преобразую массив обратно в JSON
    // https://stackoverflow.com/questions/11722059/php-array-to-json-array-using-json-encode
    $data = array_values($data); 
    $data = json_encode($data, JSON_UNESCAPED_UNICODE);
    
    // Перезаписываю файл
    file_put_contents($database_filename, $data);
    header("location: /");
}

if ( $_POST['action'] == "delete_comment" )
{
    // Получаю входящие данные
    $id = $_POST['id'];
    $location = $_POST['location'];
    
    // Получаю массив из JSON и добавляю в него новое значение
    $data = file_get_contents( $database_filename );
    $data = json_decode($data, true);
    
    // Ищу нужную запись по ID и удаляю её
    foreach($data as $key => &$entry) {
        if($entry['id'] == $id) {
            unset($data[$key]);
        }
    }
    
    // Преобразую массив обратно в JSON
    // https://stackoverflow.com/questions/11722059/php-array-to-json-array-using-json-encode
    $data = array_values($data); 
    $data = json_encode($data, JSON_UNESCAPED_UNICODE);
    
    // Перезаписываю файл
    file_put_contents($database_filename, $data);
    header("location: /".$location);
}

?>