<?php
ini_set('display_errors', 0); // Disable HTML error output
mysqli_report(MYSQLI_REPORT_STRICT | MYSQLI_REPORT_ERROR); // Force mysqli to throw exceptions

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'cpe_thesis_repository';

try {
    // Create connection
    $conn = new mysqli($host, $username, $password, $database);
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "message" => "Database Connection Failed: " . $e->getMessage()]);
    exit();
}
?>
