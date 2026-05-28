<?php
$host = "localhost";
$username = "root";
$password = "";

// Create connection
$conn = new mysqli($host, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database if not exists
$sql = "CREATE DATABASE IF NOT EXISTS cpe_thesis_repository";
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully or already exists<br>";
} else {
    die("Error creating database: " . $conn->error);
}

$conn->select_db("cpe_thesis_repository");

// Rebuild tables to match user specifications
// Dropping existing tables to ensure schema matches exactly
$conn->query("SET FOREIGN_KEY_CHECKS = 0");
$conn->query("DROP TABLE IF EXISTS thesis_panels");
$conn->query("DROP TABLE IF EXISTS authors");
$conn->query("DROP TABLE IF EXISTS faculty");
$conn->query("DROP TABLE IF EXISTS theses");
$conn->query("DROP TABLE IF EXISTS thesis_archives");
$conn->query("DROP TABLE IF EXISTS thesis_archive_simplified");
$conn->query("SET FOREIGN_KEY_CHECKS = 1");

$tables = [
    "CREATE TABLE thesis_archive_final (
        archive_id INT AUTO_INCREMENT PRIMARY KEY,
        thesis_title VARCHAR(255) NOT NULL,
        group_code VARCHAR(50) DEFAULT NULL,
        batch_year VARCHAR(10) NOT NULL,
        section_block VARCHAR(50) NOT NULL,
        author_name VARCHAR(255) NOT NULL,
        student_number VARCHAR(50) DEFAULT NULL,
        main_adviser VARCHAR(255) NOT NULL,
        final_panel_members TEXT DEFAULT NULL,
        abstract TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"
];

foreach ($tables as $sql) {
    if ($conn->query($sql) === TRUE) {
        echo "Table created successfully<br>";
    } else {
        echo "Error creating table: " . $conn->error . "<br>";
    }
}

echo "Database schema updated to match specifications.";
?>