<?php
/**
 * AL MUQEET TECH — Production PHP/JSON API for cPanel
 * Version: 3.0 APEX
 * 
 * Endpoints (?action=...):
 *   [Existing]
 *   GET   get_site          -> returns site-data.json
 *   POST  save_site         -> draft + auto-backup, then overwrites site-data.json
 *   GET   get_draft         -> returns data/draft.json
 *   POST  save_draft        -> writes data/draft.json
 *   POST  publish_draft     -> copies draft to site-data.json + backup
 *   POST  login             -> { username, password } -> 200 ok if matches users.json
 *   POST  logout            -> destroys session
 *   POST  change_password   -> { old, new }
 *   POST  message           -> appends to messages.json
 *   GET   messages          -> returns messages.json
 *   POST  delete_message    -> { index } or { id }
 *   POST  mark_message      -> { index, status: "read"|"unread"|"archived"|"starred" }
 *   GET   media             -> returns array of files in /uploads
 *   POST  delete_media      -> { file }
 *   GET   backup            -> returns data/backups/backup-{ts}.zip / json
 *   POST  restore_backup    -> { file }
 *   GET   backups           -> lists backup files
 *   GET   health            -> directory permissions check
 *   GET   activity          -> returns activity-log.json
 *   GET   read_csv_messages -> exports messages to CSV
 * 
 *   [New v3.0]
 *   POST  command_preview      -> AI parses command -> returns plan
 *   POST  command_apply        -> Apply approved patch
 *   POST  command_undo         -> Pop undo-stack -> restore
 *   POST  command_redo         -> Pop redo-stack -> re-apply
 *   GET   command_history      -> command-history.json
 *   GET   issue_check          -> 12-category scan
 *   GET   project_manifest     -> project-manifest.json
 *   POST  save_project_manifest-> Update manifest
 *   GET   presets              -> presets.json
 *   POST  preset_apply         -> Apply named preset
 *   POST  preset_save          -> Save current as preset
 *   POST  ai_agent             -> Gemini proxy (inspector/command)
 *   POST  ai_chat              -> Public Gemini proxy (rate-limited)
 */
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$base       = __DIR__;
$dataDir    = $base . '/data';
$uploadsDir = $base . '/uploads';
$backupDir  = $dataDir . '/backups';

if (!is_dir($dataDir))    { @mkdir($dataDir, 0775, true); }
if (!is_dir($uploadsDir)) { @mkdir($uploadsDir, 0775, true); }
if (!is_dir($backupDir))  { @mkdir($backupDir, 0775, true); }

// Existing files
$siteFile   = $dataDir . '/site-data.json';
$draftFile  = $dataDir . '/draft.json';
$usersFile  = $dataDir . '/users.json';
$msgFile    = $dataDir . '/messages.json';
$logFile    = $dataDir . '/activity-log.json';

// New v3.0 files
$manifestFile   = $dataDir . '/project-manifest.json';
$presetsFile    = $dataDir . '/presets.json';
$cmdHistoryFile = $dataDir . '/command-history.json';
$undoFile       = $dataDir . '/undo-stack.json';
$redoFile       = $dataDir . '/redo-stack.json';
$rateLimitFile  = $dataDir . '/chat-rate-limits.json';
$chatConvFile   = $dataDir . '/chat-conversations.json';
$issueReportFile= $dataDir . '/issue-report.json';

// Init default files
if (!file_exists($usersFile)) {
  file_put_contents($usersFile, json_encode([
    "admin" => password_hash("admin123", PASSWORD_BCRYPT)
  ], JSON_PRETTY_PRINT));
}
if (!file_exists($msgFile))  file_put_contents($msgFile, "[]");
if (!file_exists($logFile))  file_put_contents($logFile, "[]");

$action = $_GET['action'] ?? 'health';

// ============================================================================
// EXISTING HELPER FUNCTIONS
// ============================================================================

function readJson($path, $fallback = null) {
  if (!file_exists($path)) return $fallback;
  $raw = @file_get_contents($path);
  $j = json_decode($raw, true);
  return $j === null ? $fallback : $j;
}

function writeJson($path, $obj) {
  return file_put_contents($path, json_encode($obj, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
}

function logActivity($action, $detail = "", $user = null) {
  global $logFile;
  $log = readJson($logFile, []);
  $log[] = [
    "action" => $action,
    "detail" => is_array($detail) ? json_encode($detail) : $detail,
    "ts" => time() * 1000,
    "user" => $user ?? ($_SESSION['user'] ?? 'system'),
    "ip"  => $_SERVER['REMOTE_ADDR'] ?? 'cli'
  ];
  if (count($log) > 1000) $log = array_slice($log, -1000);
  writeJson($logFile, $log);
}

function authCheck() {
  if (!isset($_SESSION['admin']) || $_SESSION['admin'] !== true) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
  }
  return true;
}

// ============================================================================
// NEW v3.0 HELPER FUNCTIONS
// ============================================================================

if (!function_exists('json_validate')) {
    function json_validate(string $json): bool {
        json_decode($json);
        return json_last_error() === JSON_ERROR_NONE;
    }
}

function isListArray(array $arr): bool {
    if ($arr === []) return true;
    return array_keys($arr) === range(0, count($arr) - 1);
}

function deepMerge(array $target, array $source): array {
    foreach ($source as $key => $value) {
        if (is_array($value) && isset($target[$key]) && is_array($target[$key]) && !isListArray($value)) {
            $target[$key] = deepMerge($target[$key], $value);
        } else {
            $target[$key] = $value;
        }
    }
    return $target;
}

function setNestedValue(array &$data, string $path, mixed $value): void {
    $keys = explode('.', $path);
    $current = &$data;
    
    foreach ($keys as $i => $key) {
        if (preg_match('/^(\w+)\[(\d+)\]$/', $key, $m)) {
            $arrKey = $m[1];
            $idx = (int)$m[2];
            if (!isset($current[$arrKey]) || !is_array($current[$arrKey])) {
                $current[$arrKey] = [];
            }
            if (!isset($current[$arrKey][$idx])) {
                $current[$arrKey][$idx] = [];
            }
            if ($i === count($keys) - 1) {
                $current[$arrKey][$idx] = $value;
                return;
            }
            $current = &$current[$arrKey][$idx];
        } else {
            if ($i === count($keys) - 1) {
                $current[$key] = $value;
                return;
            }
            if (!isset($current[$key]) || !is_array($current[$key])) {
                $current[$key] = [];
            }
            $current = &$current[$key];
        }
    }
}

function getNestedValue(array $data, string $path): mixed {
    $keys = explode('.', $path);
    $current = $data;
    foreach ($keys as $key) {
        if (preg_match('/^(\w+)\[(\d+)\]$/', $key, $m)) {
            $arrKey = $m[1]; $idx = (int)$m[2];
            if (!isset($current[$arrKey][$idx])) return null;
            $current = $current[$arrKey][$idx];
        } else {
            if (!isset($current[$key])) return null;
            $current = $current[$key];
        }
    }
    return $current;
}

function unsetNestedValue(array &$data, string $path): void {
    $keys = explode('.', $path);
    $current = &$data;
    foreach ($keys as $i => $key) {
        if ($i === count($keys) - 1) {
            if (preg_match('/^(\w+)\[(\d+)\]$/', $key, $m)) {
                unset($current[$m[1]][(int)$m[2]]);
            } else {
                unset($current[$key]);
            }
            return;
        }
        if (preg_match('/^(\w+)\[(\d+)\]$/', $key, $m)) {
            if (!isset($current[$m[1]][(int)$m[2]])) return;
            $current = &$current[$m[1]][(int)$m[2]];
        } else {
            if (!isset($current[$key])) return;
            $current = &$current[$key];
        }
    }
}

function applyOperation(array $siteData, array $op): array {
    $opType = $op['op'] ?? 'set';
    $path = $op['path'] ?? '';
    $value = $op['value'] ?? null;
    
    if (empty($path)) return $siteData;
    
    match($opType) {
        'set' => setNestedValue($siteData, $path, $value),
        'merge' => (function() use (&$siteData, $path, $value) {
            $existing = getNestedValue($siteData, $path) ?? [];
            $merged = is_array($value) ? deepMerge($existing, $value) : $value;
            setNestedValue($siteData, $path, $merged);
        })(),
        'unset' => unsetNestedValue($siteData, $path),
        default => null,
    };
    
    return $siteData;
}

function applyPatch(array $siteData, array $patch): array {
    if (($patch['type'] ?? '') === 'batch' && isset($patch['operations'])) {
        foreach ($patch['operations'] as $op) {
            $siteData = applyOperation($siteData, $op);
        }
        return $siteData;
    }
    return applyOperation($siteData, $patch);
}

function atomicWriteJson(string $path, mixed $data): bool {
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) return false;
    if (!json_validate($json)) return false;
    
    $temp = $path . '.tmp.' . bin2hex(random_bytes(8));
    if (file_put_contents($temp, $json, LOCK_EX) === false) {
        @unlink($temp);
        return false;
    }
    
    if (!rename($temp, $path)) {
        @unlink($temp);
        return false;
    }
    
    @chmod($path, 0644);
    return true;
}

const UNDO_STACK_MAX = 20;
const COMMAND_HISTORY_MAX = 100;

function pushUndoStack(array $snapshot): void {
    global $undoFile, $redoFile;
    $stack = readJson($undoFile, []);
    $stack[] = [
        'id' => bin2hex(random_bytes(8)),
        'timestamp' => date('c'),
        'snapshot' => $snapshot,
    ];
    if (count($stack) > UNDO_STACK_MAX) {
        $stack = array_slice($stack, -UNDO_STACK_MAX);
    }
    atomicWriteJson($undoFile, $stack);
    atomicWriteJson($redoFile, []); // Clear redo on new action
}

function popUndoStack(): ?array {
    global $undoFile;
    $stack = readJson($undoFile, []);
    if (empty($stack)) return null;
    $popped = array_pop($stack);
    atomicWriteJson($undoFile, $stack);
    return $popped;
}

function pushRedoStack(array $snapshot): void {
    global $redoFile;
    $stack = readJson($redoFile, []);
    $stack[] = [
        'id' => bin2hex(random_bytes(8)),
        'timestamp' => date('c'),
        'snapshot' => $snapshot,
    ];
    if (count($stack) > UNDO_STACK_MAX) {
        $stack = array_slice($stack, -UNDO_STACK_MAX);
    }
    atomicWriteJson($redoFile, $stack);
}

function popRedoStack(): ?array {
    global $redoFile;
    $stack = readJson($redoFile, []);
    if (empty($stack)) return null;
    $popped = array_pop($stack);
    atomicWriteJson($redoFile, $stack);
    return $popped;
}

function rateLimitCheck(string $ip, int $maxRequests = 20, int $windowSeconds = 3600): array {
    global $rateLimitFile;
    $limits = readJson($rateLimitFile, []);
    $now = time();
    
    foreach ($limits as $k => $v) {
        if ($now - ($v['firstRequest'] ?? 0) > $windowSeconds) {
            unset($limits[$k]);
        }
    }
    
    $ipKey = hash('sha256', $ip . date('Y-m-d'));
    
    if (isset($limits[$ipKey])) {
        if ($limits[$ipKey]['count'] >= $maxRequests) {
            return [
                'allowed' => false,
                'remaining' => 0,
                'resetAt' => date('c', $limits[$ipKey]['firstRequest'] + $windowSeconds),
                'reason' => 'Rate limit exceeded'
            ];
        }
        $limits[$ipKey]['count']++;
    } else {
        $limits[$ipKey] = [
            'firstRequest' => $now,
            'count' => 1,
        ];
    }
    
    atomicWriteJson($rateLimitFile, $limits);
    
    return [
        'allowed' => true,
        'remaining' => $maxRequests - $limits[$ipKey]['count'],
        'resetAt' => date('c', $limits[$ipKey]['firstRequest'] + $windowSeconds),
    ];
}

function getGeminiApiKey(): string {
    $externalConfig = dirname(dirname(__DIR__)) . '/almuqeet-private/config.php';
    if (file_exists($externalConfig)) {
        require_once $externalConfig;
        if (defined('GEMINI_API_KEY') && GEMINI_API_KEY !== 'GEMINI_API_KEY_HERE') {
            return GEMINI_API_KEY;
        }
    }
    $localConfig = __DIR__ . '/private-config.php';
    if (file_exists($localConfig)) {
        require_once $localConfig;
        if (defined('GEMINI_API_KEY') && GEMINI_API_KEY !== 'GEMINI_API_KEY_HERE') {
            return GEMINI_API_KEY;
        }
    }
    return '';
}

function callGeminiAPI(string $userPrompt, string $systemPrompt, string $apiKey, array $options = []): array {
    if (empty($apiKey) || $apiKey === 'GEMINI_API_KEY_HERE') {
        return ['ok' => false, 'error' => 'Gemini API key not configured.'];
    }
    
    $temperature = $options['temperature'] ?? 0.3;
    $maxTokens = $options['maxTokens'] ?? 2048;
    $jsonMode = $options['jsonMode'] ?? false;
    
    $payload = [
        'contents' => [
            ['role' => 'user', 'parts' => [
                ['text' => $systemPrompt . "\n\n---\n\n" . $userPrompt]
            ]]
        ],
        'generationConfig' => [
            'temperature' => $temperature,
            'maxOutputTokens' => $maxTokens,
            'topP' => 0.8,
        ],
        'safetySettings' => [
            ['category' => 'HARM_CATEGORY_HARASSMENT', 'threshold' => 'BLOCK_ONLY_HIGH'],
            ['category' => 'HARM_CATEGORY_HATE_SPEECH', 'threshold' => 'BLOCK_ONLY_HIGH'],
            ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_ONLY_HIGH'],
            ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_ONLY_HIGH'],
        ],
    ];
    
    if ($jsonMode) {
        $payload['generationConfig']['responseMimeType'] = 'application/json';
    }
    
    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$apiKey}";
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'User-Agent: AlMuqeet/3.0',
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) return ['ok' => false, 'error' => "Network error: {$curlError}"];
    
    if ($httpCode !== 200) {
        $errorData = json_decode($response, true);
        $errorMsg = $errorData['error']['message'] ?? "HTTP {$httpCode}";
        return ['ok' => false, 'error' => "Gemini API: {$errorMsg}"];
    }
    
    $data = json_decode($response, true);
    if (!is_array($data)) return ['ok' => false, 'error' => 'Invalid response from Gemini'];
    
    $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
    if (empty($text)) {
        $finishReason = $data['candidates'][0]['finishReason'] ?? 'unknown';
        return ['ok' => false, 'error' => "Empty response (reason: {$finishReason})"];
    }
    
    return ['ok' => true, 'text' => $text];
}

// ============================================================================
// ENDPOINT ROUTING
// ============================================================================

switch ($action) {

  // --------------------------------------------------------------------------
  // EXISTING ENDPOINTS (Preserved exactly)
  // --------------------------------------------------------------------------

  case 'get_site':
    $data = readJson($siteFile);
    echo json_encode($data ?: (object)[]);
    break;

  case 'save_site':
    authCheck();
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) {
      http_response_code(400); echo json_encode(["error"=>"Invalid payload"]); exit;
    }
    // auto-backup before overwrite
    $old = readJson($siteFile, []);
    if (!empty($old)) {
      $ts = time();
      writeJson($backupDir . "/auto-backup-{$ts}.json", $old);
      logActivity("auto_backup", "Before save_site");
    }
    if (writeJson($siteFile, $body) === false) {
      http_response_code(500); echo json_encode(["error"=>"Write failed"]); exit;
    }
    logActivity("save_site", "Site data saved");
    echo json_encode(["ok"=>true]);
    break;

  case 'get_draft':
    $data = readJson($draftFile);
    echo json_encode($data ?: (object)[]);
    break;

  case 'save_draft':
    authCheck();
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) { http_response_code(400); echo json_encode(["error"=>"Invalid"]); exit; }
    writeJson($draftFile, $body);
    logActivity("save_draft", "Draft saved");
    echo json_encode(["ok"=>true]);
    break;

  case 'publish_draft':
    authCheck();
    $draft = readJson($draftFile);
    if (!$draft) { http_response_code(400); echo json_encode(["error"=>"No draft"]); exit; }
    $old = readJson($siteFile, []);
    if (!empty($old)) {
      $ts = time();
      writeJson($backupDir . "/pre-publish-{$ts}.json", $old);
      logActivity("pre_publish_backup", "Before publish");
    }
    writeJson($siteFile, $draft);
    logActivity("publish", "Draft published to live");
    echo json_encode(["ok"=>true]);
    break;

  case 'login':
    $body = json_decode(file_get_contents('php://input'), true);
    $u = $body['username'] ?? '';
    $p = $body['password'] ?? '';
    $users = readJson($usersFile, []);
    if (isset($users[$u]) && password_verify($p, $users[$u])) {
      $_SESSION['admin'] = true;
      $_SESSION['user'] = $u;
      logActivity("login", "User: {$u}");
      echo json_encode(["ok"=>true]);
    } else {
      http_response_code(401); echo json_encode(["error"=>"Invalid credentials"]);
    }
    break;

  case 'logout':
    $_SESSION = [];
    session_destroy();
    echo json_encode(["ok"=>true]);
    break;

  case 'change_password':
    authCheck();
    $body = json_decode(file_get_contents('php://input'), true);
    $old = $body['old'] ?? '';
    $new = $body['new'] ?? '';
    $users = readJson($usersFile, []);
    $u = $_SESSION['user'] ?? 'admin';
    if (!isset($users[$u]) || !password_verify($old, $users[$u])) {
      http_response_code(403); echo json_encode(["error"=>"Old password incorrect"]); exit;
    }
    $users[$u] = password_hash($new, PASSWORD_BCRYPT);
    writeJson($usersFile, $users);
    logActivity("change_password", "User: {$u}");
    echo json_encode(["ok"=>true]);
    break;

  case 'message':
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) { http_response_code(400); echo json_encode(["error"=>"Invalid"]); exit; }
    $list = readJson($msgFile, []);
    $body['ts'] = $body['ts'] ?? (time() * 1000);
    $body['status'] = $body['status'] ?? "unread";
    $body['id'] = uniqid("msg_");
    $list[] = $body;
    writeJson($msgFile, $list);
    logActivity("message", "From: " . ($body['name'] ?? 'anon'));
    echo json_encode(["ok"=>true]);
    break;

  case 'messages':
    authCheck();
    echo json_encode(readJson($msgFile, []));
    break;

  case 'delete_message':
    authCheck();
    $body = json_decode(file_get_contents('php://input'), true);
    $idx = $body['index'] ?? -1;
    $id  = $body['id'] ?? '';
    $list = readJson($msgFile, []);
    if ($idx >= 0 && $idx < count($list)) {
      array_splice($list, $idx, 1);
    } elseif ($id) {
      $list = array_values(array_filter($list, fn($m) => ($m['id'] ?? '') !== $id));
    }
    writeJson($msgFile, $list);
    echo json_encode(["ok"=>true]);
    break;

  case 'mark_message':
    authCheck();
    $body = json_decode(file_get_contents('php://input'), true);
    $idx = $body['index'] ?? -1;
    $id  = $body['id'] ?? '';
    $status = $body['status'] ?? 'read';
    $list = readJson($msgFile, []);
    if ($idx >= 0 && $idx < count($list)) {
      $list[$idx]['status'] = $status;
    } elseif ($id) {
      foreach ($list as &$m) {
        if (($m['id'] ?? '') === $id) { $m['status'] = $status; break; }
      }
    }
    writeJson($msgFile, $list);
    echo json_encode(["ok"=>true]);
    break;

  case 'media':
    authCheck();
    $files = [];
    foreach (scandir($uploadsDir) as $f) {
      if ($f === '.' || $f === '..') continue;
      $files[] = ["name" => $f, "url" => "uploads/" . rawurlencode($f)];
    }
    echo json_encode($files);
    break;

  case 'delete_media':
    authCheck();
    $body = json_decode(file_get_contents('php://input'), true);
    $file = $body['file'] ?? '';
    $path = $uploadsDir . '/' . basename($file);
    if (file_exists($path)) @unlink($path);
    logActivity("delete_media", $file);
    echo json_encode(["ok"=>true]);
    break;

  case 'backup':
    authCheck();
    $ts = time();
    $backFile = $backupDir . "/backup-{$ts}.json";
    $data = readJson($siteFile, []);
    writeJson($backFile, $data);
    logActivity("backup", "Manual backup {$ts}");
    echo json_encode(["ok"=>true, "file" => "data/backups/backup-{$ts}.json", "ts" => $ts]);
    break;

  case 'restore_backup':
    authCheck();
    $body = json_decode(file_get_contents('php://input'), true);
    $file = $body['file'] ?? '';
    $path = $backupDir . '/' . basename($file);
    if (!file_exists($path)) { http_response_code(404); echo json_encode(["error"=>"Backup not found"]); exit; }
    $old = readJson($siteFile, []);
    if (!empty($old)) writeJson($backupDir . "/pre-restore-" . time() . ".json", $old);
    $restore = readJson($path);
    if (!$restore) { http_response_code(500); echo json_encode(["error"=>"Invalid backup"]); exit; }
    writeJson($siteFile, $restore);
    logActivity("restore_backup", "Restored: {$file}");
    echo json_encode(["ok"=>true]);
    break;

  case 'backups':
    authCheck();
    $files = [];
    foreach (scandir($backupDir) as $f) {
      if ($f === '.' || $f === '..') continue;
      $files[] = ["name" => $f, "url" => "data/backups/" . rawurlencode($f), "ts" => filemtime($backupDir . '/' . $f)];
    }
    rsort($files);
    echo json_encode($files);
    break;

  case 'health':
    $checks = [];
    foreach ([$dataDir, $uploadsDir, $backupDir] as $dir) {
      $checks[basename($dir)] = is_dir($dir) && is_writable($dir);
    }
    foreach ([$siteFile, $usersFile, $msgFile, $logFile] as $f) {
      $checks[basename($f)] = is_writable(dirname($f));
    }
    echo json_encode([
      "status" => in_array(false, $checks) ? "warning" : "ok",
      "checks" => $checks,
      "php" => PHP_VERSION,
      "ts"   => time()
    ]);
    break;

  case 'activity':
    authCheck();
    echo json_encode(readJson($logFile, []));
    break;

  case 'read_csv_messages':
    authCheck();
    $list = readJson($msgFile, []);
    header("Content-Type: text/csv; charset=utf-8");
    header("Content-Disposition: attachment; filename=messages.csv");
    $out = fopen("php://output", "w");
    fputcsv($out, ["Name", "Email", "Phone", "Service", "Message", "Date"]);
    foreach ($list as $m) {
      fputcsv($out, [
        $m['name'] ?? '',
        $m['email'] ?? '',
        $m['phone'] ?? '',
        $m['service'] ?? '',
        $m['message'] ?? '',
        date("Y-m-d H:i", ($m['ts'] ?? 0) / 1000)
      ]);
    }
    fclose($out);
    exit;

  // --------------------------------------------------------------------------
  // NEW v3.0 ENDPOINTS
  // --------------------------------------------------------------------------

  case 'command_preview':
    authCheck();
    $body = json_decode(file_get_contents('php://input'), true);
    $command = $body['command'] ?? '';
    if (empty($command)) {
        http_response_code(400); echo json_encode(["error" => "Command required"]); exit;
    }
    
    $manifest = readJson($manifestFile, []);
    $siteData = readJson($siteFile, []);
    
    $systemPrompt = "You are the Al Muqeet website management AI. Parse the user's command and return a JSON patch plan ONLY.\n\nSAFE EDITABLE PATHS:\n" . json_encode($manifest['safeEditPaths'] ?? []) . "\n\nCURRENT SITE DATA (subset):\n" . json_encode(array_intersect_key($siteData, array_flip(['hero', 'brand', 'announcementBar', 'theme']))) . "\n\nALWAYS return valid JSON in this exact format:\n{\n  \"understood\": \"English explanation\",\n  \"risk\": \"low|medium|high\",\n  \"riskReason\": \"why\",\n  \"affectedPaths\": [\"path\"],\n  \"affectedFiles\": [\"site-data.json\"],\n  \"affectedComponents\": [\"Component\"],\n  \"breakageRisk\": \"Risk text\",\n  \"patch\": {\n    \"type\": \"batch\",\n    \"operations\": [\n      { \"op\": \"set\", \"path\": \"exact.path\", \"value\": \"exact value\" }\n    ]\n  },\n  \"previewNote\": \"What will change\",\n  \"undoable\": true,\n  \"requiresRebuild\": false,\n  \"codeChangeNeeded\": false,\n  \"codeChangeReason\": \"\"\n}";
    
    $apiKey = getGeminiApiKey();
    $res = callGeminiAPI($command, $systemPrompt, $apiKey, ['jsonMode' => true, 'temperature' => 0.1]);
    
    if (!$res['ok']) {
        http_response_code(500); echo json_encode(["error" => $res['error']]); exit;
    }
    
    $plan = json_decode($res['text'], true);
    if (!$plan) {
        http_response_code(500); echo json_encode(["error" => "AI returned invalid JSON plan"]); exit;
    }
    
    echo json_encode(["ok" => true, "plan" => $plan]);
    break;

  case 'command_apply':
    authCheck();
    $body = json_decode(file_get_contents('php://input'), true);
    $plan = $body['plan'] ?? null;
    $command = $body['command'] ?? 'Unknown command';
    
    if (!$plan || !isset($plan['patch'])) {
        http_response_code(400); echo json_encode(["error" => "Valid plan required"]); exit;
    }
    
    $siteData = readJson($siteFile, []);
    
    // 1. Push Undo
    pushUndoStack($siteData);
    
    // 2. Auto-backup
    $ts = time();
    atomicWriteJson($backupDir . "/cmd-backup-{$ts}.json", $siteData);
    
    // 3. Apply Patch
    $newData = applyPatch($siteData, $plan['patch']);
    
    // 4. Atomic Write
    if (!atomicWriteJson($siteFile, $newData)) {
        http_response_code(500); echo json_encode(["error" => "Failed to write updated site data"]); exit;
    }
    
    // 5. History
    $history = readJson($cmdHistoryFile, []);
    $history[] = [
        'id' => bin2hex(random_bytes(8)),
        'timestamp' => date('c'),
        'command' => $command,
        'plan' => $plan
    ];
    if (count($history) > COMMAND_HISTORY_MAX) $history = array_slice($history, -COMMAND_HISTORY_MAX);
    atomicWriteJson($cmdHistoryFile, $history);
    
    // 6. Log
    logActivity("command_apply", "Applied AI command: " . substr($command, 0, 50));
    
    echo json_encode(["ok" => true, "backupId" => "cmd-backup-{$ts}.json"]);
    break;

  case 'command_undo':
    authCheck();
    $siteData = readJson($siteFile, []);
    $popped = popUndoStack();
    
    if (!$popped) {
        http_response_code(400); echo json_encode(["error" => "Nothing to undo"]); exit;
    }
    
    pushRedoStack($siteData);
    
    if (!atomicWriteJson($siteFile, $popped['snapshot'])) {
        http_response_code(500); echo json_encode(["error" => "Failed to restore undo snapshot"]); exit;
    }
    
    logActivity("command_undo", "Reverted to snapshot " . $popped['id']);
    echo json_encode(["ok" => true]);
    break;

  case 'command_redo':
    authCheck();
    $siteData = readJson($siteFile, []);
    $popped = popRedoStack();
    
    if (!$popped) {
        http_response_code(400); echo json_encode(["error" => "Nothing to redo"]); exit;
    }
    
    pushUndoStack($siteData);
    
    if (!atomicWriteJson($siteFile, $popped['snapshot'])) {
        http_response_code(500); echo json_encode(["error" => "Failed to restore redo snapshot"]); exit;
    }
    
    logActivity("command_redo", "Re-applied snapshot " . $popped['id']);
    echo json_encode(["ok" => true]);
    break;

  case 'command_history':
    authCheck();
    echo json_encode(readJson($cmdHistoryFile, []));
    break;

  case 'issue_check':
    authCheck();
    $report = [
        'lastRun' => date('c'),
        'issues' => [],
        'summary' => ['critical' => 0, 'warning' => 0, 'info' => 0]
    ];
    
    // 1. API Health
    if (version_compare(PHP_VERSION, '8.2.0', '<')) {
        $report['issues'][] = ['category' => 'API Health', 'severity' => 'warning', 'message' => 'PHP version is below 8.2.'];
        $report['summary']['warning']++;
    }
    
    // 2. File System
    foreach ([$dataDir, $uploadsDir, $backupDir] as $dir) {
        if (!is_dir($dir) || !is_writable($dir)) {
            $report['issues'][] = ['category' => 'File System', 'severity' => 'critical', 'message' => "Directory not writable: " . basename($dir)];
            $report['summary']['critical']++;
        }
    }
    
    // 3. JSON Validity
    $siteData = readJson($siteFile);
    if (!$siteData) {
        $report['issues'][] = ['category' => 'JSON Validity', 'severity' => 'critical', 'message' => 'site-data.json is invalid or missing.'];
        $report['summary']['critical']++;
    }
    
    // 4. Schema Integrity
    if ($siteData && empty($siteData['services'])) {
        $report['issues'][] = ['category' => 'Schema Integrity', 'severity' => 'warning', 'message' => 'Services array is empty.'];
        $report['summary']['warning']++;
    }
    
    // 8. Performance
    if (file_exists($siteFile) && filesize($siteFile) > 500000) {
        $report['issues'][] = ['category' => 'Performance', 'severity' => 'warning', 'message' => 'site-data.json exceeds 500KB.'];
        $report['summary']['warning']++;
    }
    
    // 9. AI Config
    if (empty(getGeminiApiKey())) {
        $report['issues'][] = ['category' => 'AI Configuration', 'severity' => 'warning', 'message' => 'Gemini API key is not configured. AI features will be disabled.'];
        $report['summary']['warning']++;
    }
    
    // 10. Backup Health
    $backups = glob($backupDir . '/*.json');
    if (count($backups) === 0) {
        $report['issues'][] = ['category' => 'Backup Health', 'severity' => 'warning', 'message' => 'No backups found.'];
        $report['summary']['warning']++;
    }
    
    atomicWriteJson($issueReportFile, $report);
    echo json_encode(["ok" => true, "report" => $report]);
    break;

  case 'project_manifest':
    authCheck();
    echo json_encode(readJson($manifestFile, []));
    break;

  case 'save_project_manifest':
    authCheck();
    $body = json_decode(file_get_contents('php://input'), true);
    if (!is_array($body)) { http_response_code(400); echo json_encode(["error"=>"Invalid"]); exit; }
    atomicWriteJson($manifestFile, $body);
    echo json_encode(["ok"=>true]);
    break;

  case 'presets':
    authCheck();
    echo json_encode(readJson($presetsFile, []));
    break;

  case 'preset_apply':
    authCheck();
    $body = json_decode(file_get_contents('php://input'), true);
    $presetId = $body['presetId'] ?? '';
    $category = $body['category'] ?? ''; // e.g., 'themePresets'
    
    $presets = readJson($presetsFile, []);
    if (!isset($presets[$category][$presetId]['patch'])) {
        http_response_code(404); echo json_encode(["error" => "Preset not found"]); exit;
    }
    
    $siteData = readJson($siteFile, []);
    pushUndoStack($siteData);
    atomicWriteJson($backupDir . "/preset-backup-" . time() . ".json", $siteData);
    
    $newData = applyPatch($siteData, $presets[$category][$presetId]['patch']);
    
    if (!atomicWriteJson($siteFile, $newData)) {
        http_response_code(500); echo json_encode(["error" => "Failed to apply preset"]); exit;
    }
    
    logActivity("preset_apply", "Applied preset: {$presetId}");
    echo json_encode(["ok" => true]);
    break;

  case 'preset_save':
    authCheck();
    $body = json_decode(file_get_contents('php://input'), true);
    $category = $body['category'] ?? 'customPresets';
    $presetId = $body['presetId'] ?? uniqid('preset_');
    $presetData = $body['preset'] ?? null;
    
    if (!$presetData) {
        http_response_code(400); echo json_encode(["error" => "Preset data required"]); exit;
    }
    
    $presets = readJson($presetsFile, []);
    if (!isset($presets[$category])) $presets[$category] = [];
    $presets[$category][$presetId] = $presetData;
    
    atomicWriteJson($presetsFile, $presets);
    logActivity("preset_save", "Saved preset: {$presetId}");
    echo json_encode(["ok" => true, "presetId" => $presetId]);
    break;

  case 'ai_agent':
    authCheck();
    $body = json_decode(file_get_contents('php://input'), true);
    $type = $body['type'] ?? 'inspector';
    $prompt = $body['prompt'] ?? '';
    
    if (empty($prompt)) {
        http_response_code(400); echo json_encode(["error" => "Prompt required"]); exit;
    }
    
    $apiKey = getGeminiApiKey();
    $manifest = readJson($manifestFile, []);
    $siteData = readJson($siteFile, []);
    
    if ($type === 'inspector') {
        $sys = "You are the Al Muqeet Project Inspector — a READ-ONLY expert AI.\n\nPROJECT CONTEXT:\nManifest:\n" . json_encode($manifest) . "\n\nSite Data Keys:\n" . json_encode(array_keys($siteData)) . "\n\nYOUR JOB: Answer user questions about file structure, data flow, and safe edit paths. ALWAYS respond in this JSON format:\n{\n  \"answer\": {\n    \"summary\": \"1-2 sentence direct answer\",\n    \"dataSource\": \"site-data.json key path or N/A\",\n    \"renderedIn\": \"file path + component\",\n    \"clickChain\": [\"step 1\"],\n    \"adminEdit\": \"where to edit safely\",\n    \"risk\": \"low|medium|high\",\n    \"safelyEditable\": true,\n    \"suggestedCommand\": \"Read-only suggestion\",\n    \"additionalNotes\": \"\"\n  },\n  \"relatedItems\": []\n}";
        $res = callGeminiAPI($prompt, $sys, $apiKey, ['jsonMode' => true]);
    } else {
        http_response_code(400); echo json_encode(["error" => "Unknown agent type"]); exit;
    }
    
    if (!$res['ok']) {
        http_response_code(500); echo json_encode(["error" => $res['error']]); exit;
    }
    
    echo json_encode(["ok" => true, "response" => json_decode($res['text'], true)]);
    break;

  case 'ai_chat':
    // Public endpoint, requires rate limiting
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $limit = rateLimitCheck($ip, 20, 3600);
    
    if (!$limit['allowed']) {
        http_response_code(429);
        echo json_encode(["error" => "Rate limit exceeded. Try again later.", "resetAt" => $limit['resetAt']]);
        exit;
    }
    
    $body = json_decode(file_get_contents('php://input'), true);
    $messages = $body['messages'] ?? [];
    
    if (empty($messages)) {
        http_response_code(400); echo json_encode(["error" => "Messages required"]); exit;
    }
    
    $siteData = readJson($siteFile, []);
    $contact = $siteData['contact'] ?? [];
    
    $sys = "You are the Al Muqeet Technical Services AI assistant.\nCOMPANY: Al Muqeet Technical Services LLC, Ajman, UAE.\nSERVICES: Construction, MEP, Civil, Renovation, Plumbing, Electrical, Roofing, Aluminium, Wood, Industrial, Maintenance, Skilled Manpower.\nCONTACT: Phone: {$contact['phone']}, Email: {$contact['email']}, WhatsApp: {$contact['whatsapp']}.\nTONE: Friendly, professional, concise (max 3 short paragraphs). Match user's language.\nYOUR JOB: Answer service questions, encourage contact for quotes. Never make up prices. Output plain text only.";
    
    // Format history for Gemini
    $prompt = "Conversation history:\n";
    foreach ($messages as $m) {
        $role = $m['role'] === 'user' ? 'User' : 'Assistant';
        $prompt .= "{$role}: {$m['content']}\n";
    }
    $prompt .= "\nAssistant:";
    
    $apiKey = getGeminiApiKey();
    $res = callGeminiAPI($prompt, $sys, $apiKey, ['temperature' => 0.7, 'maxTokens' => 1024]);
    
    if (!$res['ok']) {
        http_response_code(500); echo json_encode(["error" => $res['error']]); exit;
    }
    
    // Save conversation for admin review
    $convs = readJson($chatConvFile, []);
    $sessionId = $body['sessionId'] ?? uniqid('chat_');
    $convs[$sessionId] = [
        'ts' => date('c'),
        'ip' => hash('sha256', $ip),
        'messages' => array_merge($messages, [['role' => 'assistant', 'content' => $res['text']]])
    ];
    if (count($convs) > 500) array_shift($convs);
    atomicWriteJson($chatConvFile, $convs);
    
    echo json_encode(["ok" => true, "text" => $res['text'], "remaining" => $limit['remaining']]);
    break;

  default:
    http_response_code(404);
    echo json_encode(["error"=>"Unknown action", "available" => [
      "get_site","save_site","get_draft","save_draft","publish_draft",
      "login","logout","change_password",
      "message","messages","delete_message","mark_message",
      "media","delete_media",
      "backup","restore_backup","backups",
      "health","activity","read_csv_messages",
      "command_preview","command_apply","command_undo","command_redo","command_history",
      "issue_check","project_manifest","save_project_manifest",
      "presets","preset_apply","preset_save","ai_agent","ai_chat"
    ]]);
}