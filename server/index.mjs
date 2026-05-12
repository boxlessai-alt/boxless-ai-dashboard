/**
 * Boxless AI LinkedIn Approval Dashboard - Express Backend
 * Main server entry point.
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes.mjs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const elapsed = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} - ${elapsed}ms`
    );
  });
  next();
});

// ─── API Routes ────────────────────────────────────────────────

app.use("/api", routes);

// ─── Static Files (Production) ─────────────────────────────────

const distPath = path.resolve(__dirname, "..", "dist");
app.use(express.static(distPath));

// Fallback for SPA routes
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      res.status(404).json({ error: "Not found" });
    }
  });
});

// ─── Error Handling ────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error("[server] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start Server ──────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║  Boxless AI LinkedIn Approval Dashboard - Backend        ║
  ╠══════════════════════════════════════════════════════════╣
  ║  Server running on port ${PORT}                              ║
  ║  API base: http://localhost:${PORT}/api                       ║
  ╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;
