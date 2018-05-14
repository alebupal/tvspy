<?php

class MyDB extends SQLite3
{
    function __construct()
    {
        $this->open('../bd.s3db');
    }
}

$db = new MyDB();

$result = $db->query('SELECT * FROM usuario');
var_dump($result->fetchArray());
