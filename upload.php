<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $uploadDir = 'chat-img/'; // Change this to your desired server folder

    // Check if the 'dpImg' file was uploaded without errors
    if (isset($_FILES['dpImg']) && $_FILES['dpImg']['error'] === UPLOAD_ERR_OK) {
        // Extract file information
        $uploadedFile = $_FILES['dpImg'];
        $originalName = basename($uploadedFile['name']);
        $fileExtension = pathinfo($originalName, PATHINFO_EXTENSION);

        // Use the original filename
        $uploadPath = $uploadDir . $originalName;

        // Check if the file already exists
        $counter = 1;
        while (file_exists($uploadPath)) {
            // If the file already exists, append a counter to the filename
            $newFileName = pathinfo($originalName, PATHINFO_FILENAME) . '_' . $counter . '.' . $fileExtension;
            $uploadPath = $uploadDir . $newFileName;
            $counter++;
        }

        // Move the uploaded file to the server folder
        if (move_uploaded_file($uploadedFile['tmp_name'], $uploadPath)) {
            echo json_encode(['message' => 'File uploaded successfully']);
        } else {
            echo json_encode(['error' => 'Error moving file']);
            error_log(print_r($_FILES['dpImg'], true));
        }
    } else {
        echo json_encode(['error' => 'File upload error']);
        error_log(print_r($_FILES['dpImg'], true));
    }
} else {
    echo json_encode(['error' => 'Invalid request']);
    error_log(print_r($_FILES['dpImg'], true));
}
?>
