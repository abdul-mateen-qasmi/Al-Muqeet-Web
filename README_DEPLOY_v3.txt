====================================================
AL MUQEET TECHNICAL SERVICES LLC — v3.0 APEX DEPLOYMENT
====================================================
Target Path: public_html/preview/
Target URL:  https://almuqeet.ae/preview/
Admin URL:   https://almuqeet.ae/preview/admin

1. WHAT'S NEW IN v3.0
---------------------
- AI Project Inspector (Read-only diagnostics)
- Command Center V2 (AI-powered site editing with preview/undo/redo)
- System Diagnostics (12-category health check)
- Visitor Chat Widget (Public AI assistant with lead capture)
- Preset Gallery (One-click theme/hero configurations)

2. PRE-DEPLOYMENT CHECKLIST
---------------------------
[ ] Ensure you have a free Gemini API key from https://aistudio.google.com/apikey
[ ] Ensure you have cPanel File Manager access.
[ ] Ensure the old WordPress site at public_html/ remains untouched.

3. BACKUP CURRENT PREVIEW
-------------------------
Before uploading v3.0, backup the existing preview:
1. Go to cPanel File Manager -> public_html/preview/
2. Select all files, click "Compress" -> preview-v2-backup.zip
3. Download the ZIP to your local machine.

4. UPLOAD + EXTRACT
-------------------
1. Upload `almuqeet-preview-v3-production.zip` to `public_html/preview/`.
2. Extract the ZIP file.
3. Overwrite existing files when prompted.

5. SET PERMISSIONS (CRITICAL)
-----------------------------
If files do not work, ensure these permissions are set in cPanel:
- Folders: 755 (rwxr-xr-x)
  -> data/
  -> data/backups/
  -> uploads/
- Files: 644 (rw-r--r--)
  -> data/*.json
  -> *.php
  -> .htaccess
  -> index.html
- Secure File: 600 (rw-------)
  -> private-config.php (Owner read/write only!)

6. CONFIGURE GEMINI API KEY
---------------------------
Option A (Most Secure - Recommended):
1. Create a folder OUTSIDE `public_html` (e.g., `/home/username/almuqeet-private/`).
2. Create `config.php` inside it:
   <?php define('GEMINI_API_KEY', 'your-real-key-here'); ?>

Option B (Local Secure):
1. Open `public_html/preview/private-config.php` in cPanel editor.
2. Replace 'GEMINI_API_KEY_HERE' with your real key.
3. Save. (This file is blocked from public access via .htaccess).

7. VERIFY DEPLOYMENT
--------------------
1. Visit https://almuqeet.ae/preview/ (Hard refresh: Ctrl+F5)
2. Verify the Chat Widget appears in the bottom right.
3. Visit https://almuqeet.ae/preview/admin
4. Login with your existing credentials (default: admin / admin123).

8. RUN ISSUE CHECKER
--------------------
1. In Admin, go to "🩺 Issue Checker".
2. Click "Run Full Scan".
3. Ensure API Health, File System, and AI Configuration show green/healthy.

9. CHANGE DEFAULT PASSWORD
--------------------------
If you haven't already, go to "Users & Password" and change `admin123` to a secure password.

10. TEST AI FEATURES
--------------------
- Ask the AI Inspector: "Where is the hero button?"
- Try a Command Center V2 preview: "Change theme to minimal clean"
- Test the public chat widget.

11. DEFAULT CREDENTIALS
-----------------------
User: admin
Pass: admin123

12. URLs
--------
Public: https://almuqeet.ae/preview/
Admin:  https://almuqeet.ae/preview/admin

13. DO NOT TOUCH LIST
---------------------
- NEVER modify files in `public_html/` (outside of `preview/`).
- NEVER delete `data/users.json` unless you want to reset to default.
- NEVER remove the `.htaccess` file in `preview/`.

14. SUPPORT / TROUBLESHOOTING
-----------------------------
- If AI features return 500 errors, check `private-config.php` API key.
- If settings don't save, check `data/` folder permissions (must be 755).
- If chat widget doesn't appear, clear browser cache.