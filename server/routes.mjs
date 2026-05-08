/**
 * API Route Handlers
 * All routes for the Boxless AI LinkedIn Approval Dashboard.
 */
import { Router } from "express";
import {
  getAllRows,
  parseRowsToActions,
  filterByStatus,
  groupByPriority,
  buildPipeline,
  updateStatus,
  updateLastContact,
  deriveStage,
} from "./sheets.mjs";
import { authenticateUser, generateToken, requireAuth } from "./auth.mjs";

const router = Router();

// ─── Auth Routes ───────────────────────────────────────────────

/** POST /api/auth/login */
router.post("/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  const user = authenticateUser(username, password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = generateToken(user);
  res.json({ token, user });
});

/** GET /api/auth/me */
router.get("/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ─── Queue Routes ──────────────────────────────────────────────

/** GET /api/queue */
router.get("/queue", requireAuth, async (req, res) => {
  try {
    const rows = await getAllRows();
    const allActions = parseRowsToActions(rows);
    const pendingActions = filterByStatus(allActions, "PENDING");
    const grouped = groupByPriority(pendingActions);
    res.json({ actions: pendingActions, grouped });
  } catch (error) {
    console.error("[routes] /queue error:", error.message);
    res.status(500).json({ error: "Failed to fetch queue data from Google Sheets", details: error.message });
  }
});

// ─── Pipeline Routes ───────────────────────────────────────────

/** GET /api/pipeline */
router.get("/pipeline", requireAuth, async (req, res) => {
  try {
    const rows = await getAllRows();
    const allActions = parseRowsToActions(rows);
    const lanes = buildPipeline(allActions);
    res.json({ lanes });
  } catch (error) {
    console.error("[routes] /pipeline error:", error.message);
    res.status(500).json({ error: "Failed to fetch pipeline data", details: error.message });
  }
});

// ─── Approve / Skip Routes ─────────────────────────────────────

/** POST /api/approve/:id */
router.post("/approve/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const rowIndex = parseInt(id, 10);
    if (isNaN(rowIndex) || rowIndex < 2) {
      return res.status(400).json({ error: "Invalid row id" });
    }
    await updateStatus(rowIndex, "APPROVED");
    const today = new Date().toISOString().split("T")[0];
    await updateLastContact(rowIndex, today);
    console.log(`[routes] Row ${rowIndex} approved by ${req.user?.username || "unknown"}`);
    res.json({ success: true, id: String(id) });
  } catch (error) {
    console.error("[routes] /approve error:", error.message);
    res.status(500).json({ error: "Failed to approve action", details: error.message });
  }
});

/** POST /api/skip/:id */
router.post("/skip/:id", requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const rowIndex = parseInt(id, 10);
    if (isNaN(rowIndex) || rowIndex < 2) {
      return res.status(400).json({ error: "Invalid row id" });
    }
    await updateStatus(rowIndex, "SKIPPED");
    console.log(`[routes] Row ${rowIndex} skipped by ${req.user?.username || "unknown"}`);
    res.json({ success: true, id: String(id) });
  } catch (error) {
    console.error("[routes] /skip error:", error.message);
    res.status(500).json({ error: "Failed to skip action", details: error.message });
  }
});

// ─── Approved History Routes ───────────────────────────────────

/** GET /api/approved */
router.get("/approved", requireAuth, async (req, res) => {
  try {
    const { filter = "all" } = req.query;
    const rows = await getAllRows();
    const allActions = parseRowsToActions(rows);
    let filtered = allActions.filter(
      (a) => a.status === "APPROVED" || a.status === "SKIPPED"
    );
    if (filter === "approved") {
      filtered = filtered.filter((a) => a.status === "APPROVED");
    } else if (filter === "skipped") {
      filtered = filtered.filter((a) => a.status === "SKIPPED");
    }
    const currentUser = req.user?.name || "System";
    const items = filtered.map((a) => ({
      ...a,
      approved_date: a.assigned_date || new Date().toISOString().split("T")[0],
      approved_by: currentUser,
    }));
    res.json({ items });
  } catch (error) {
    console.error("[routes] /approved error:", error.message);
    res.status(500).json({ error: "Failed to fetch approved history", details: error.message });
  }
});

// ─── Stats Routes ──────────────────────────────────────────────

/** GET /api/stats */
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const rows = await getAllRows();
    const allActions = parseRowsToActions(rows);
    const totalPending = allActions.filter((a) => a.status === "PENDING").length;
    const totalApproved = allActions.filter((a) => a.status === "APPROVED").length;
    const totalSkipped = allActions.filter((a) => a.status === "SKIPPED").length;
    const totalDone = allActions.filter((a) => a.status === "DONE").length;
    const totalResolved = totalApproved + totalSkipped + totalDone;
    const conversionRate = totalResolved > 0
      ? Math.round((totalApproved / totalResolved) * 100)
      : 0;

    // Pipeline summary
    const lanes = buildPipeline(allActions);
    const pipelineSummary = lanes.map((l) => ({ stage: l.stage, count: l.count }));

    // Weekly trends (group by assigned_date week)
    const weekMap = {};
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const weekLabel = `Week ${getWeekNumber(d)}`;
      weekMap[weekLabel] = { week: weekLabel, approved: 0, skipped: 0, pending: 0 };
    }
    for (const a of allActions) {
      const dateStr = a.assigned_date || a.last_contact;
      if (dateStr) {
        try {
          const d = new Date(dateStr);
          const weekLabel = `Week ${getWeekNumber(d)}`;
          if (weekMap[weekLabel]) {
            if (a.status === "APPROVED") weekMap[weekLabel].approved++;
            else if (a.status === "SKIPPED") weekMap[weekLabel].skipped++;
            else if (a.status === "PENDING") weekMap[weekLabel].pending++;
          }
        } catch { /* ignore bad dates */ }
      }
    }
    const weeklyTrends = Object.values(weekMap);

    // Activity by type
    const typeMap = {};
    for (const a of allActions) {
      const t = a.action_type || "unknown";
      typeMap[t] = (typeMap[t] || 0) + 1;
    }
    const activityByType = Object.entries(typeMap).map(([type, count]) => ({ type, count }));

    res.json({
      totalPending,
      totalApproved,
      totalSkipped,
      conversionRate,
      pipelineSummary,
      weeklyTrends,
      activityByType,
    });
  } catch (error) {
    console.error("[routes] /stats error:", error.message);
    res.status(500).json({ error: "Failed to fetch stats", details: error.message });
  }
});

// ─── Health Check ──────────────────────────────────────────────

/** GET /api/health */
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Helpers ───────────────────────────────────────────────────

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default router;
