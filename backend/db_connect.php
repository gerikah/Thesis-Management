<?php
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