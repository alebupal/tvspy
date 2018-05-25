<?php

/*
 * DataTables example server-side processing script.
 *
 * Please note that this script is intentionally extremely simply to show how
 * server-side processing can be implemented, and probably shouldn't be used as
 * the basis for a large complex system. It is suitable for simple use cases as
 * for learning.
 *
 * See http://datatables.net/usage/server-side for full details on the server-
 * side processing requirements of DataTables.
 *
 * @license MIT - http://datatables.net/license_mit
 */

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Easy set variables
 */

/**
 * @author alebupal
*/

require_once "../clases/Util.php";

// DB table to use
$table = 'registro';

// Table's primary key
$primaryKey = 'id';

// Array of database columns which should be read and sent back to DataTables.
// The `db` parameter represents the column name in the database, while the `dt`
// parameter represents the DataTables column identifier. In this case simple
// indexes
$columns = array(
	array( 'db' => 'id', 'dt' => 0 ),
	array( 'db' => 'usuario', 'dt' => 1 ),
	array( 'db' => 'canal', 'dt' => 2 ),
	array( 'db' => 'inicio', 'dt' => 3 ),
	array( 'db' => 'fin', 'dt' => 4 ),
	array( 'db' => 'hostname', 'dt' => 5 ),
	array( 'db' => 'reproductor', 'dt' => 6 ),
	array( 'db' => 'tiempo', 'dt' => 7 ),
	array( 'db' => 'errores', 'dt' => 8 )
);

/*
$sql_details = array(
	'db' => "../bd.db"
);
*/
$sql_details = array(
	'user' => Util::$usuarioBD,
	'pass' => Util::$contrasenaBD,
	'db'   => Util::$base_datos,
	'host' => Util::$servidor
);



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * If you just want to use the basic configuration for DataTables with PHP
 * server-side, there is no need to edit below this line.
 */
require( 'ssp.class.php' );

echo json_encode(
    SSP::simple( $_GET, $sql_details, $table, $primaryKey, $columns )
);
