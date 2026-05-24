====================================================
AL MUQEET TECHNICAL SERVICES LLC — cPanel DEPLOYMENT
====================================================
Author: Admin Control Room Build
Deploy path: public_html/preview/
Access URLs:
  Website:  https://almuqeet.ae/preview/
  Admin 1:  https://almuqeet.ae/preview/admin       (preferred — clean URL)
  Admin 2:  https://almuqeet.ae/preview/admin.html  (fallback — same result)
Both URLs load the same admin Control Room.

====================================================
QUICK DEPLOY
====================================================
1. ZIP the entire project folder (all files including index.html, api.php, data/, uploads/, etc.)
2. In cPanel File Manager, go to public_html/
3. Create folder: preview/
4. Upload the ZIP file into preview/
5. Extract the ZIP inside preview/
6. Set folder permissions:
   chmod 755 data uploads data/backups
   chmod 644 data/*.json uploads/* images/*
7. Test website at https://almuqeet.ae/preview/
8. Test admin at https://almuqeet.ae/preview/admin.html

====================================================
ADMIN LOGIN (DEFAULT)
====================================================
URL (preferred):  https://almuqeet.ae/preview/admin
URL (fallback):   https://almuqeet.ae/preview/admin.html
Username: admin
Password: admin123

⚠️ IMPORTANT: CHANGE PASSWORD BEFORE GOING LIVE.
Go to Admin sidebar > Users & Password to update.

====================================================
FILE STRUCTURE
====================================================
/
├── index.html              # React SPA entry (hash routing)
├── admin.html              # (same as index.html via SPA)
├── api.php                 # Main PHP backend — all CRUD actions
├── upload.php              # File upload handler
├── assets/                 # (optional static assets)
├── data/
│   ├── site-data.json      # Live site content (edited via admin)
│   ├── draft.json          # In-progress edit draft
│   ├── users.json          # Bcrypt-hashed passwords
│   ├── messages.json       # Contact form submissions
│   ├── activity-log.json   # Admin action history
│   └── backups/            # Auto & manual snapshots
├── uploads/                # Media uploads (images, videos)
├── images/                 # Default generated AI hero/service/etc images
├── .htaccess               # SPA rewrite + security headers
└── README_DEPLOY_CPANEL.txt

====================================================
TESTING CHECKLIST
====================================================
[ ] Website opens at https://almuqeet.ae/preview/
[ ] Admin opens at https://almuqeet.ae/preview/admin
[ ] Admin also opens at https://almuqeet.ae/preview/admin.html
[ ] Login works with admin / admin123
[ ] Dashboard loads
[ ] Sidebar modules open real panels
[ ] Brand/Logo changes save
[ ] Hero text changes show on frontend after reload
[ ] Hero image URL updates hero visual
[ ] Floating cards enable/disable
[ ] Services add/edit/delete/reorder
[ ] Projects add/edit/delete/reorder
[ ] Contact form on website saves message to data/messages.json
[ ] Messages show in admin inbox
[ ] Export CSV works
[ ] Media upload works (upload.php)
[ ] Media library shows uploaded files
[ ] Backup button creates snapshot in data/backups/
[ ] Restore backup works
[ ] Command Center validates and sends patches
[ ] CSS/JS snippet panel adds entries
[ ] Theme color edits save
[ ] Font edits save
[ ] SEO fields save
[ ] Activity log records actions
[ ] Mobile menu still works on frontend
[ ] No console fatal errors
[ ] All images load

====================================================
PERMISSIONS (cPanel)
====================================================
chmod 755 data/ uploads/ data/backups/
chmod 644 data/*.json uploads/* images/*

If write fails, check owner/group and set 755 on data/ uploads/ folders.

====================================================
SECURITY WARNINGS
====================================================
1. CHANGE DEFAULT ADMIN PASSWORD IMMEDIATELY.
2. Disable directory listing via .htaccess (Options -Indexes is already set).
3. Regularly backup data/ folder.
4. The JSON storage is suitable for small-to-mid traffic. For high traffic, consider MySQL upgrade.
5. This system stores passwords as bcrypt hashes in data/users.json.

====================================================
API REFERENCE (api.php?action=...)
====================================================
GET  get_site          — returns site-data.json
POST save_site         — overwrites site-data.json (auto-backup)
POST login             — { username, password }
POST logout            — destroys session
POST change_password   — { old, new }
POST message           — { name, email, phone, service, message }
GET  messages          — returns messages.json
POST delete_message    — { index } or { id }
POST mark_message      — { index, status }
GET  media             — list of uploaded files
POST delete_media      — { file }
POST backup            — creates snapshot
POST restore_backup    — { file } — restores from snapshot
GET  backups           — list of snapshots
GET  health            — directory writability check
GET  activity          — action log

====================================================
CONTACT
====================================================
If you need support, email the developer.
Enjoy the new Al Muqeet Technical Services website & Control Room.
