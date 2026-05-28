<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Dedicated PDO Connection setup as requested
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
} catch (\PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

// Validate Upload
if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["status" => "error", "message" => "No file uploaded or upload error occurred."]);
    exit;
}

$fileTmpPath = $_FILES['csv_file']['tmp_name'];
$fileName = $_FILES['csv_file']['name'];
$fileSize = $_FILES['csv_file']['size'];

if ($fileSize === 0) {
    echo json_encode(["status" => "error", "message" => "The uploaded file is empty."]);
    exit;
}

$fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
if ($fileExtension !== 'csv') {
    echo json_encode(["status" => "error", "message" => "Invalid file format. Only .csv files are allowed."]);
    exit;
}

// Process File
if (($handle = fopen($fileTmpPath, "r")) !== FALSE) {
    $pdo->beginTransaction();
    try {
        $checkSql = "SELECT COUNT(*) FROM thesis_archive_final WHERE thesis_title = ?";
        $checkStmt = $pdo->prepare($checkSql);

        $sql = "INSERT INTO thesis_archive_final 
                (thesis_title, group_code, batch_year, section_block, author_name, student_number, main_adviser, final_panel_members, abstract) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);

        $headerSkipped = false;
        $importCount = 0;
        $skippedCount = 0;

        while (($data = fgetcsv($handle, 10000, ",")) !== FALSE) {
            if (!$headerSkipped) {
                $headerSkipped = true;
                continue; // Skip headers
            }

            // Pad the array to 9 elements to avoid undefined offset notices if columns are missing
            $data = array_pad($data, 9, "");

            $thesis_title = trim($data[0]);
            if (empty($thesis_title)) continue; // Enforce Title NOT NULL at application level

            // Check if the thesis title already exists in the database
            $checkStmt->execute([$thesis_title]);
            if ($checkStmt->fetchColumn() > 0) {
                $skippedCount++;
                continue; // Skip this row to avoid duplicates
            }

            $group_code = trim($data[1]);
            $section_block = trim($data[3]);

            if (empty($section_block) && preg_match('/^\d{4}$/', $group_code)) {
                $section_block = 'BSCPE ' . substr($group_code, 0, 1) . '-' . substr($group_code, 1, 1);
            }

            $stmt->execute([
                $thesis_title, 
                $group_code !== '' ? $group_code : null, 
                trim($data[2]), 
                $section_block, 
                trim($data[4]), 
                $data[5] !== '' ? trim($data[5]) : null, 
                trim($data[6]), 
                $data[7] !== '' ? trim($data[7]) : null, 
                trim($data[8])
            ]);
            $importCount++;
        }
        fclose($handle);
        $pdo->commit();
        
        echo json_encode(["status" => "success", "imported_count" => $importCount, "skipped_count" => $skippedCount, "message" => "Data imported successfully. " . ($skippedCount > 0 ? "$skippedCount duplicates skipped." : "")]);
    } catch (Exception $e) {
        $pdo->rollBack();
        fclose($handle);
        echo json_encode(["status" => "error", "message" => "Error importing data: " . $e->getMessage()]);
    }
}
?>