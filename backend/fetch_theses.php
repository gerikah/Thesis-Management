<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

include 'db_connect.php';

$sql = "SELECT * FROM thesis_archive_final ORDER BY created_at DESC";

$result = $conn->query($sql);

$theses = array();
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $theses[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $theses]);
$conn->close();
?>
