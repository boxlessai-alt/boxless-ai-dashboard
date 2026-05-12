/**
 * API Route Handlers
 * Boxless AI LinkedIn Approval Dashboard
 */
import { Router } from "express";
import {
  getAllRows,
  parseRowsToActions,
  filterByApproved,
  getStats,
  getHistory,
  filterHistoryByDate,
  filterByActionType,
  sortByActionPriority,
  hasRepliedFlagged,
  getPendingCount,
  updateApproved,
  updateDraftMessage,
  updateSent,
  updateNextActionDate,
} from "./sheets.mjs";
import { authenticateUser, generateToken, requireAuth } from "./auth.mjs";

const router = Router();

// ─── Auth Routes ───────────────────────────────────────────────

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

router.get("/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ─── Queue Routes ──────────────────────────────────────────────

/** GET /api/queue — pending actions + stats */
router.get("/queue", requireAuth, async (req, res) => {
  try {
    const rows = await getAllRows();
    const allActions = parseRowsToActions(rows);
    const pendingActions = filterByApproved(allActions, "PENDING");
    const sorted = sortByActionPriority(pendingActions);
    const stats = getStats(allActions);
    const repliedFlagged = hasRepliedFlagged(allActions);
    res.json({
      actions: sorted,
      stats,
      repliedFlagged,
      pendingCount: pendingActions.length,
    });
  } catch (error) {
    console.error("[routes] /queue error:", error.message);
    res.status(500).json({ error: "Failed to fetch queue", details: error.message });
  }
});

/** GET /api/queue/stats — just the 4 stat numbers */
router.get("/queue/stats", requireAuth, async (req, res) => {
  try {
    const rows = await getAllRows();
    const allActions = parseRowsToActions(rows);
    const stats = getStats(allActions);
    const pendingCount = getPendingCount(allActions);
    res.json({ stats, pendingCount });
  } catch (error) {
    console.error("[routes] /queue/stats error:", error.message);
    res.status(500).json({ error: "Failed to fetch stats", details: error.message });
  }
});

// ─── Approve ───────────────────────────────────────────────────

/** POST /api/approve/:id */
router.post("/approve/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 2) {
      return res.status(400).json({ error: "Invalid row id" });
    }
    const today = new Date().toISOString().split("T")[0];
    await updateApproved(id, "Approved");
    await updateSent(id, "Yes");
    await updateNextActionDate(id, today);
    console.log(`[routes] Row ${id} approved by ${req.user?.username || "unknown"}`);
    res.json({ success: true, id: String(id) });
  } catch (error) {
    console.error("[routes] /approve error:", error.message);
    res.status(500).json({ error: "Failed to approve", details: error.message });
  }
});

// ─── Skip ──────────────────────────────────────────────────────

/** POST /api/skip/:id */
router.post("/skip/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 2) {
      return res.status(400).json({ error: "Invalid row id" });
    }
    const today = new Date().toISOString().split("T")[0];
    await updateApproved(id, "Skip");
    await updateNextActionDate(id, today);
    console.log(`[routes] Row ${id} skipped by ${req.user?.username || "unknown"}`);
    res.json({ success: true, id: String(id) });
  } catch (error) {
    console.error("[routes] /skip error:", error.message);
    res.status(500).json({ error: "Failed to skip", details: error.message });
  }
});

// ─── Edit ──────────────────────────────────────────────────────

/** POST /api/edit/:id */
router.post("/edit/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 2) {
      return res.status(400).json({ error: "Invalid row id" });
    }
    const { draft_message } = req.body || {};
    const today = new Date().toISOString().split("T")[0];
    if (draft_message !== undefined) {
      await updateDraftMessage(id, draft_message);
    }
    await updateApproved(id, "Approved");
    await updateSent(id, "Yes");
    await updateNextActionDate(id, today);
    console.log(`[routes] Row ${id} edited and approved by ${req.user?.username || "unknown"}`);
    res.json({ success: true, id: String(id) });
  } catch (error) {
    console.error("[routes] /edit error:", error.message);
    res.status(500).json({ error: "Failed to edit", details: error.message });
  }
});

// ─── Approved History ──────────────────────────────────────────

/** GET /api/approved */
router.get("/approved", requireAuth, async (req, res) => {
  try {
    const { dateRange = "all", actionType = "all" } = req.query;
    const rows = await getAllRows();
    const allActions = parseRowsToActions(rows);
    let history = getHistory(allActions);
    history = filterHistoryByDate(history, dateRange);
    history = filterByActionType(history, actionType);
    res.json({ items: history });
  } catch (error) {
    console.error("[routes] /approved error:", error.message);
    res.status(500).json({ error: "Failed to fetch history", details: error.message });
  }
});

// ─── Stats ─────────────────────────────────────────────────────

/** GET /api/stats */
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const rows = await getAllRows();
    const allActions = parseRowsToActions(rows);
    const stats = getStats(allActions);
    const pendingCount = getPendingCount(allActions);

    // Activity by action type
    const typeCounts = {};
    for (const a of allActions) {
      const t = a.action_type || "unknown";
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    }

    // Action types breakdown for today
    const today = new Date().toISOString().split("T")[0];
    const todayActions = allActions.filter((a) =>
      (a.next_action_date || "").startsWith(today)
    );

    res.json({
      stats,
      pendingCount,
      totalActions: allActions.length,
      actionTypeBreakdown: typeCounts,
      todayActions: todayActions.length,
      hasRepliedFlagged: hasRepliedFlagged(allActions),
    });
  } catch (error) {
    console.error("[routes] /stats error:", error.message);
    res.status(500).json({ error: "Failed to fetch stats", details: error.message });
  }
});

// ─── Health / Debug ────────────────────────────────────────────

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.get("/debug", (req, res) => {
  const envStatus = {
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID ? "Set" : "Missing",
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? "Set" : "Missing",
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
      ? `Set (${process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.length} chars)`
      : "Missing",
    JWT_SECRET: process.env.JWT_SECRET ? "Set" : "Missing",
    NODE_ENV: process.env.NODE_ENV || "not set",
  };
  res.json({ env: envStatus });
});

export default router;
