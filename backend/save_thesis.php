<?php
<<<<<<< HEAD
ini_set('display_errors', 1);
error_reporting(E_ALL);
=======
ini_set('display_errors', 0); // Prevent PHP from outputting HTML errors
>>>>>>> a3b5764f2a0fcca104f4a1fdcb52f6e7ac5c5dc8

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

<<<<<<< HEAD
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
=======
// Handle CORS Preflight request cleanly
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
>>>>>>> a3b5764f2a0fcca104f4a1fdcb52f6e7ac5c5dc8
}

include 'db_connect.php';

<<<<<<< HEAD
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
=======
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get JSON payload
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // Backend Data Type & Requirement Validation
    if (empty($data['group_code']) || empty($data['title']) || empty($data['abstract']) || empty($data['section'])) {
        echo json_encode(["status" => "error", "message" => "Validation Error: Missing basic required fields."]);
        exit();
    }

    if (!isset($data['batch_year']) || !is_numeric($data['batch_year'])) {
        echo json_encode(["status" => "error", "message" => "Validation Error: Batch year must be a valid number."]);
        exit();
    }

    if (empty($data['authors']) || !is_array($data['authors'])) {
        echo json_encode(["status" => "error", "message" => "Validation Error: At least one author must be assigned."]);
        exit();
    }

    if (empty($data['panels']['Panel Chair'])) {
        echo json_encode(["status" => "error", "message" => "Validation Error: Panel Chair is required."]);
        exit();
    }

    try {
        // Begin Transaction
        $conn->begin_transaction();

        // 1. Insert into theses
        $stmt = $conn->prepare("INSERT INTO theses (group_code, title, abstract, batch_year, section) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssis", $data['group_code'], $data['title'], $data['abstract'], $data['batch_year'], $data['section']);
        $stmt->execute();
        $thesis_id = $conn->insert_id;

        // 2. Insert into authors
        $stmt_author = $conn->prepare("INSERT INTO authors (thesis_id, full_name, student_number) VALUES (?, ?, ?)");
        foreach ($data['authors'] as $author) {
            if (!empty($author['name'])) {
                $stmt_author->bind_param("iss", $thesis_id, $author['name'], $author['student_number']);
                $stmt_author->execute();
            }
        }

        // 3. Helper to insert/fetch faculty and link to panel
        $stmt_faculty = $conn->prepare("INSERT IGNORE INTO faculty (name) VALUES (?)");
        $stmt_get_faculty = $conn->prepare("SELECT id FROM faculty WHERE name = ?");
        $stmt_panel = $conn->prepare("INSERT INTO thesis_panels (thesis_id, faculty_id, role) VALUES (?, ?, ?)");

        foreach ($data['panels'] as $role => $name) {
            if (!empty($name)) {
                // Insert faculty if they don't exist yet
                $stmt_faculty->bind_param("s", $name);
                $stmt_faculty->execute();
                
                // Get their ID
                $stmt_get_faculty->bind_param("s", $name);
                $stmt_get_faculty->execute();
                $faculty_id = $stmt_get_faculty->get_result()->fetch_assoc()['id'];

                // Link them to the thesis
                $stmt_panel->bind_param("iis", $thesis_id, $faculty_id, $role);
                $stmt_panel->execute();
            }
        }

        $conn->commit();
        echo json_encode(["status" => "success", "message" => "Thesis successfully registered!"]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["status" => "error", "message" => "Database Error: " . $e->getMessage()]);
    }
>>>>>>> a3b5764f2a0fcca104f4a1fdcb52f6e7ac5c5dc8
}
?>