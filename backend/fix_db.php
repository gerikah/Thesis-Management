<?php
<<<<<<< HEAD
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
=======
ini_set('display_errors', 1);
include 'db_connect.php';

echo "<h3>Repairing Database Schema...</h3>";

// Temporarily disable foreign key checks to allow dropping tables
$conn->query("SET FOREIGN_KEY_CHECKS = 0");

// 1. Rebuild theses table
$conn->query("DROP TABLE IF EXISTS theses");
$conn->query("CREATE TABLE theses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    abstract TEXT NOT NULL,
    batch_year INT NOT NULL,
    section VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

// 2. Rebuild authors table
$conn->query("DROP TABLE IF EXISTS authors");
$conn->query("CREATE TABLE authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    thesis_id INT NOT NULL,
    student_number VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    FOREIGN KEY (thesis_id) REFERENCES theses(id) ON DELETE CASCADE
)");

// 3. Rebuild faculty table
$conn->query("DROP TABLE IF EXISTS faculty");
$conn->query("CREATE TABLE faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
)");

// 4. Rebuild thesis_panels table (Fixing the 'role' column issue)
$conn->query("DROP TABLE IF EXISTS thesis_panels");
$conn->query("CREATE TABLE thesis_panels (
    thesis_id INT NOT NULL,
    faculty_id INT NOT NULL,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (thesis_id, faculty_id, role),
    FOREIGN KEY (thesis_id) REFERENCES theses(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
)");

$conn->query("SET FOREIGN_KEY_CHECKS = 1");

echo "<h2 style='color: green;'>✅ Database schema perfectly rebuilt!</h2>";
echo "<p>You can now close this tab, go back to your Dashboard on localhost:3000, and register your thesis.</p>";
>>>>>>> a3b5764f2a0fcca104f4a1fdcb52f6e7ac5c5dc8
?>