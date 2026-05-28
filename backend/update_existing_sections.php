<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Using the same connection setup as import_csv.php
$host = 'localhost';
$db   = 'cpe_thesis_repository';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    $sql = "UPDATE thesis_archive_final 
            SET section_block = CONCAT('BSCPE ', SUBSTRING(group_code, 1, 1), '-', SUBSTRING(group_code, 2, 1)) 
            WHERE (section_block IS NULL OR section_block = '' OR section_block NOT LIKE 'BSCPE %') 
            AND group_code REGEXP '^[0-9]{4}$'";
            
    $stmt = $pdo->query($sql);
    $rowCount = $stmt->rowCount();
    
    echo json_encode(["status" => "success", "message" => "Successfully updated $rowCount records."]);
} catch (\PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>