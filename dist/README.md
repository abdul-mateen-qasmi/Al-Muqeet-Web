# AURUM Studio — cPanel Deployment

This folder is bundled into the production `dist/` build.

## Files
- `index.html` — Vite SPA entry (hash routes: `#/`, `#/about`, `#/services`, `#/projects`, `#/careers`, `#/contact`, `#/admin`)
- `api.php` — JSON API (get / save / login / message / messages / media)
- `upload.php` — Media uploads
- `data/site-data.json` — Site content (admin-editable)
- `data/users.json` — Bcrypt admin hash. Default user `admin` / password `admin123`
- `data/messages.json` — Inbound contact messages
- `uploads/` — Media uploads (writable)
- `.htaccess` — SPA rewrite + security headers

## Permissions (cPanel)
```
chmod 755 data uploads
chmod 644 data/*.json
```

## Admin
1. Visit `/#/admin`
2. Login with `admin` / `admin123` (change in `data/users.json`)
3. Edit any section, click **Save & Publish**
