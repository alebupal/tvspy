<?php

// class MyDB extends SQLite3
// {
//     function __construct()
//     {
//         $this->open('../bd.s3db');
//     }
// }
//
// $db = new MyDB();
//
// $result = $db->query('SELECT * FROM usuario');
// var_dump($result->fetchArray());
//

// Create or open a database file
$file_db = new SQLite3('../bd.db');

// Wrap your code in a try statement and catch PDOException
try {
	$result = $file_db->query('SELECT * FROM usuario');
	while ($row = $result->fetchArray()) {
  	var_dump($row);
	}
} catch(PDOException $e) {
    echo $e->getMessage();
}
