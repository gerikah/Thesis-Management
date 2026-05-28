<?php
<<<<<<< HEAD
// Database configuration for XAMPP
$host = "localhost";
$username = "root";
$password = "";
$dbname = "cpe_thesis_repository";

// Create connection
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
=======
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
>>>>>>> a3b5764f2a0fcca104f4a1fdcb52f6e7ac5c5dc8
