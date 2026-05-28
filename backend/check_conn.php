<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = "localhost";
$username = "root";
$password = "";
$dbname = "cpe_thesis_repository";

$conn = new mysqli($host, $username, $password);

if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "message" => "Connection failed: " . $conn->connect_error,
        "hint" => "Check if MySQL is running in XAMPP and if 'root' has a password."
    ]);
    exit;
}

$db_exists = $conn->select_db($dbname);

$databases = [];
$db_result = $conn->query("SHOW DATABASES");
while($row = $db_result->fetch_array()) {
    $databases[] = $row[0];
}

$tables = [];
if ($db_exists) {
    $table_result = $conn->query("SHOW TABLES");
    while($row = $table_result->fetch_array()) {
        $tables[] = $row[0];
    }
}

echo json_encode([
    "status" => "success",
    "connection" => "Connected successfully to MySQL",
    "database_selected" => $db_exists ? "Yes: $dbname" : "No (Database '$dbname' not found)",
    "available_databases" => $databases,
    "tables_in_cpe_db" => $tables,
    "php_user" => get_current_user(),
    "server_software" => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
]);
?>