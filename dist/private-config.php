<?php
/**
 * Al Muqeet Private Configuration
 * 
 * SECURITY: This file is blocked from web access by .htaccess
 * Get your free Gemini API key from: https://aistudio.google.com/apikey
 */

// Replace 'GEMINI_API_KEY_HERE' with your actual key
define('GEMINI_API_KEY', 'GEMINI_API_KEY_HERE');

// Optional: separate key for public chat (can be same)
define('GEMINI_API_KEY_CHAT', 'GEMINI_API_KEY_HERE');

// Rate limiting configuration
define('CHAT_RATE_LIMIT', 20);          // Max requests per IP
define('CHAT_RATE_WINDOW', 3600);       // Window in seconds (1 hour)

// Stack sizes
define('UNDO_STACK_SIZE', 20);
define('COMMAND_HISTORY_SIZE', 100);

// AI behavior
define('AI_TEMPERATURE_COMMAND', 0.3);  // Low for consistent commands
define('AI_TEMPERATURE_CHAT', 0.7);     // Higher for natural chat
define('AI_MAX_TOKENS_COMMAND', 2048);
define('AI_MAX_TOKENS_CHAT', 1024);