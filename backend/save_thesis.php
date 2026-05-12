<?php
ini_set('display_errors', 0); // Prevent PHP from outputting HTML errors

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle CORS Preflight request cleanly
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    http_response_code(200);
    exit();
}

include 'db_connect.php';

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
}
?>