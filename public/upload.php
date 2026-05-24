<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$uploads = __DIR__ . '/uploads';
if (!is_dir($uploads)) { @mkdir($uploads, 0775, true); }

if (!isset($_FILES['file'])) {
  http_response_code(400);
  echo json_encode(["error" => "No file"]); exit;
}

$f = $_FILES['file'];
$max = 20 * 1024 * 1024; // 20MB
if ($f['size'] > $max) { http_response_code(413); echo json_encode(["error"=>"File too large"]); exit; }

$allow = ['jpg','jpeg','png','webp','gif','svg','mp4','webm','pdf'];
$ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
if (!in_array($ext, $allow)) { http_response_code(415); echo json_encode(["error"=>"File type not allowed"]); exit; }

$safe = preg_replace('/[^a-zA-Z0-9._-]/', '_', pathinfo($f['name'], PATHINFO_FILENAME));
$name = $safe . '_' . time() . '.' . $ext;
$dest = $uploads . '/' . $name;

if (!move_uploaded_file($f['tmp_name'], $dest)) {
  http_response_code(500); echo json_encode(["error"=>"Move failed"]); exit;
}

echo json_encode(["ok" => true, "name" => $name, "url" => "uploads/" . rawurlencode($name)]);
