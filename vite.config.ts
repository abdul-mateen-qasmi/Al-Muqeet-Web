import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function phpApiMockPlugin(): Plugin {
  const dataDir = path.resolve(__dirname, "public/data");
  const uploadsDir = path.resolve(__dirname, "public/uploads");

  const actionToFile: Record<string, string> = {
    get_site: "site-data.json",
    get_draft: "draft.json",
    messages: "messages.json",
    activity: "activity-log.json",
    backups: "backups.json",
    command_history: "command-history.json",
    project_manifest: "project-manifest.json",
    presets: "presets.json",
    issue_check: "issue-report.json",
  };

  return {
    name: "php-api-mock",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith("/api.php")) return next();

        const url = new URL(req.url, "http://localhost");
        const action = url.searchParams.get("action") || "";
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");

        if (action === "health") {
          res.end(JSON.stringify({ ok: true, mode: "vite-dev-mock" }));
          return;
        }

        if (action === "media") {
          try {
            const files = fs.existsSync(uploadsDir)
              ? fs.readdirSync(uploadsDir).filter((f) => !f.startsWith("."))
              : [];
            res.end(JSON.stringify(files));
          } catch {
            res.end(JSON.stringify([]));
          }
          return;
        }

        const fileName = actionToFile[action];
        if (fileName) {
          const filePath = path.join(dataDir, fileName);
          if (fs.existsSync(filePath)) {
            res.end(fs.readFileSync(filePath, "utf-8"));
            return;
          }
          res.statusCode = 404;
          res.end(JSON.stringify({ ok: false, error: `Missing ${fileName}` }));
          return;
        }

        // Write actions are not supported by the mock — return a clear error.
        res.statusCode = 501;
        res.end(
          JSON.stringify({
            ok: false,
            error: `Action "${action}" requires PHP backend (not available in Vite dev mode)`,
          })
        );
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [phpApiMockPlugin(), react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
