<?php 

exec('mysqldump tvspy > /var/www/html/backup.sql', $output, $return);
if (!$return) {
    echo "true";
} else {
    echo "false";
}
?>