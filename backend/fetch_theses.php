<?php
// 1. Error Reporting (Keep this on while debugging, but remove in production)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// 2. Single set of CORS Headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// 3. Handle the Preflight Request ONCE
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 4. Connect to Database
include 'db_connect.php';

// 5. Initialize search parameters
$search = trim($_GET['search'] ?? '');
$batchYear = trim($_GET['batch_year'] ?? '');
$adviser = trim($_GET['adviser'] ?? '');
$section = trim($_GET['section'] ?? '');

$sql = "SELECT * FROM thesis_archive_final";
$conditions = array();
$types = "";
$params = array();

if ($search !== '') {
    $conditions[] = "(thesis_title LIKE ? OR abstract LIKE ?)";
    $searchLike = "%" . $search . "%";
    for ($i = 0; $i < 2; $i++) {
        $params[] = $searchLike;
        $types .= "s";
    }
}

if ($batchYear !== '') {
    $conditions[] = "batch_year = ?";
    $params[] = $batchYear;
    $types .= "s";
}

if ($adviser !== '') {
    $conditions[] = "main_adviser = ?";
    $params[] = $adviser;
    $types .= "s";
}

if ($section !== '') {
    $conditions[] = "section_block = ?";
    $params[] = $section;
    $types .= "s";
}

if (!empty($conditions)) {
    $sql .= " WHERE " . implode(" AND ", $conditions);
}

$sql .= " ORDER BY created_at DESC";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to prepare query."]);
    $conn->close();
    exit;
}

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$theses = array();
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $theses[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $theses]);
$stmt->close();
$conn->close();
?>