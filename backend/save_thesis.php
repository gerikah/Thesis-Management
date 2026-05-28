<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

include 'db_connect.php';

$json = file_get_contents("php://input");
$data = json_decode($json, true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No data provided or invalid JSON: " . json_last_error_msg()]);
    exit;
}

$conn->begin_transaction();

try {
    // Check for duplicate thesis title
    $check_sql = "SELECT archive_id FROM thesis_archive_final WHERE thesis_title = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("s", $data['thesis_title']);
    $check_stmt->execute();
    $check_stmt->store_result();
    if ($check_stmt->num_rows > 0) {
        throw new Exception("A thesis with this title already exists.");
    }
    $check_stmt->close();

    // Insert thesis using the new thesis_archive_final schema
    $sql = "INSERT INTO thesis_archive_final (thesis_title, group_code, batch_year, section_block, author_name, student_number, main_adviser, final_panel_members, abstract) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    // Convert author list into comma-separated strings for names and student numbers
    $author_names = [];
    $student_numbers = [];
    if (isset($data['authors']) && is_array($data['authors'])) {
        foreach ($data['authors'] as $author) {
            if (!empty($author['name'])) {
                $author_names[] = $author['name'];
                $student_numbers[] = $author['student_number'] ?? '';
            }
        }
    }
    $author_name_str = implode(", ", $author_names);
    $student_number_str = implode(", ", $student_numbers);

    $stmt->bind_param("sssssssss", 
        $data['thesis_title'], 
        $data['group_code'], 
        $data['batch_year'], 
        $data['section_block'], 
        $author_name_str,
        $student_number_str,
        $data['main_adviser'],
        $data['final_panel_members'],
        $data['abstract']
    );
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $thesis_id = $conn->insert_id;

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Thesis archived successfully", "id" => $thesis_id]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
}
?>