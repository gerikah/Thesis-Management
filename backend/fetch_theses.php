<?php
<<<<<<< HEAD
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
=======
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

include 'db_connect.php';

// Fetch records with their assigned Main Adviser from the relational tables
$sql = "SELECT t.*, 
        (SELECT f.name FROM faculty f JOIN thesis_panels tp ON f.id = tp.faculty_id WHERE tp.thesis_id = t.id AND tp.role = 'Main Adviser' LIMIT 1) as main_adviser,
        (SELECT GROUP_CONCAT(a.full_name SEPARATOR ', ') FROM authors a WHERE a.thesis_id = t.id) as group_members
        FROM theses t 
        ORDER BY t.created_at DESC";

try {
    $result = $conn->query($sql);
    $theses = [];
    
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $theses[] = $row;
        }
    }
    
    echo json_encode(["status" => "success", "data" => $theses]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
}
>>>>>>> a3b5764f2a0fcca104f4a1fdcb52f6e7ac5c5dc8
?>