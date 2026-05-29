<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

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
    
    $sql1 = "UPDATE thesis_archive_final SET batch_year = '2015-2016' WHERE batch_year = '2016'";
    $stmt1 = $pdo->query($sql1);
    $count1 = $stmt1->rowCount();
    
    $sql2 = "UPDATE thesis_archive_final SET batch_year = '2019-2020' WHERE batch_year = '2020'";
    $stmt2 = $pdo->query($sql2);
    $count2 = $stmt2->rowCount();
    
    echo json_encode(["status" => "success", "message" => "Successfully updated batch years.", "updated_2016" => $count1, "updated_2020" => $count2]);
} catch (\PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>