/**
 * Google Sheets API Wrapper
 * Handles all interactions with the Google Sheet for lead data.
 * Sheet: LinkedIn Outreach Pipeline//Boxless AI
 * Columns: A=lead_name, B=company, C=linkedin_url, D=action_type,
 *          E=draft_message, F=context_clue, G=proof_angle,
 *          H=next_action_date, I=approved, J=sent, K=notes
 */
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);

if (!SHEET_ID || !SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_PRIVATE_KEY) {
  throw new Error("Missing required Google Sheets environment variables");
}

const auth = new google.auth.JWT(
  SERVICE_ACCOUNT_EMAIL,
  null,
  SERVICE_ACCOUNT_PRIVATE_KEY,
  ["https://www.googleapis.com/auth/spreadsheets"]
);

const sheets = google.sheets({ version: "v4", auth });

// Column mapping: A=0, B=1, etc.
const COL = {
  lead_name: 0,         // A
  company: 1,           // B
  linkedin_url: 2,      // C
  action_type: 3,       // D
  draft_message: 4,     // E
  context_clue: 5,      // F
  proof_angle: 6,       // G
  next_action_date: 7,  // H
  approved: 8,          // I
  sent: 9,              // J
  notes: 10,            // K
};

const NUM_COLS = 11; // A through K

// Cache for sheet name
let detectedSheetName = null;

/**
 * Auto-detect the first available sheet name in the spreadsheet.
 */
async function getSheetName() {
  if (detectedSheetName) return detectedSheetName;

  const envSheetName = process.env.GOOGLE_SHEET_NAME;
  if (envSheetName) {
    detectedSheetName = envSheetName;
    return detectedSheetName;
  }

  try {
    const res = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
      fields: "sheets.properties.title",
    });
    const sheetsList = res.data.sheets || [];
    if (sheetsList.length > 0) {
      detectedSheetName = sheetsList[0].properties.title;
      console.log(`[sheets] Auto-detected sheet name: "${detectedSheetName}"`);
      return detectedSheetName;
    }
  } catch (err) {
    console.error("[sheets] Could not auto-detect sheet name:", err.message);
  }

  detectedSheetName = "Approval Queue";
  return detectedSheetName;
}

async function getRange() {
  const sheetName = await getSheetName();
  // Always quote sheet name — "Approval Queue" has a space
  return `'${sheetName}'!A1:K1000`;
}

async function getCellRange(cell) {
  const sheetName = await getSheetName();
  return `'${sheetName}'!${cell}`;
}

/**
 * Fetch all rows from the Google Sheet.
 */
export async function getAllRows() {
  try {
    const range = await getRange();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
      valueRenderOption: "UNFORMATTED_VALUE",
    });
    return res.data.values || [];
  } catch (error) {
    console.error("[sheets] Error fetching rows:", error.message);
    throw error;
  }
}

/**
 * Update a specific cell.
 */
export async function updateCell(cellRef, value) {
  try {
    const range = await getCellRange(cellRef);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: "RAW",
      requestBody: { values: [[value]] },
    });
  } catch (error) {
    console.error(`[sheets] Error updating cell ${cellRef}:`, error.message);
    throw error;
  }
}

/**
 * Update approved column (I) for a row.
 */
export async function updateApproved(rowIndex, value) {
  await updateCell(`I${rowIndex}`, value);
}

/**
 * Update draft_message column (E) for a row.
 */
export async function updateDraftMessage(rowIndex, value) {
  await updateCell(`E${rowIndex}`, value);
}

/**
 * Update sent column (J) for a row.
 */
export async function updateSent(rowIndex, value) {
  await updateCell(`J${rowIndex}`, value);
}

/**
 * Update next_action_date column (H) for a row.
 */
export async function updateNextActionDate(rowIndex, value) {
  await updateCell(`H${rowIndex}`, value);
}

/**
 * Parse raw rows into structured ActionItem objects.
 */
export function parseRowsToActions(rows) {
  if (!rows || rows.length < 2) return [];
  const dataRows = rows.slice(1);
  return dataRows
    .map((row, idx) => {
      const rowNum = idx + 2;
      const get = (colIdx) => (row[colIdx] !== undefined ? String(row[colIdx]).trim() : "");
      return {
        id: String(rowNum),
        lead_name: get(COL.lead_name),
        company: get(COL.company),
        linkedin_url: get(COL.linkedin_url),
        action_type: get(COL.action_type) || "connection_invite",
        draft_message: get(COL.draft_message),
        context_clue: get(COL.context_clue),
        proof_angle: get(COL.proof_angle),
        next_action_date: get(COL.next_action_date),
        approved: get(COL.approved) || "PENDING",
        sent: get(COL.sent) || "NO",
        notes: get(COL.notes),
      };
    })
    .filter((item) => item.lead_name || item.company);
}

/**
 * Filter by approved status (case-insensitive).
 */
export function filterByApproved(actions, status) {
  return actions.filter((a) => a.approved.toUpperCase() === status.toUpperCase());
}

/**
 * Get today's date as YYYY-MM-DD.
 */
function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get stats: pending count, approved today, skipped today, sent today.
 */
export function getStats(actions) {
  const today = getTodayStr();
  const pending = actions.filter((a) => a.approved.toUpperCase() === "PENDING").length;
  const approvedToday = actions.filter(
    (a) => a.approved.toUpperCase() === "APPROVED" && (a.next_action_date || "").startsWith(today)
  ).length;
  const skippedToday = actions.filter(
    (a) => a.approved.toUpperCase() === "SKIP" && (a.next_action_date || "").startsWith(today)
  ).length;
  const sentToday = actions.filter(
    (a) => a.sent.toUpperCase() === "YES" && (a.next_action_date || "").startsWith(today)
  ).length;
  return { pending, approvedToday, skippedToday, sentToday };
}

/**
 * Get all approved/skipped items for history.
 */
export function getHistory(actions) {
  return actions.filter(
    (a) => a.approved.toUpperCase() === "APPROVED" || a.approved.toUpperCase() === "SKIP"
  );
}

/**
 * Filter history by date range.
 */
export function filterHistoryByDate(actions, range) {
  const today = getTodayStr();
  const now = new Date();

  if (range === "today") {
    return actions.filter((a) => (a.next_action_date || "").startsWith(today));
  } else if (range === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return actions.filter((a) => {
      if (!a.next_action_date) return false;
      const d = new Date(a.next_action_date);
      return d >= weekAgo;
    });
  }
  return actions; // all
}

/**
 * Filter by action type.
 */
export function filterByActionType(actions, type) {
  if (type === "all") return actions;
  if (type === "dms") return actions.filter((a) => a.action_type.includes("dm"));
  if (type === "comments") return actions.filter((a) => a.action_type.includes("comment"));
  if (type === "invites") return actions.filter((a) => a.action_type.includes("invite"));
  if (type === "followups") return actions.filter((a) => a.action_type.includes("followup"));
  return actions;
}

/**
 * Action type sort priority.
 */
const ACTION_PRIORITY = [
  "replied_flagged",
  "first_dm",
  "followup_1",
  "followup_2",
  "breakup",
  "connection_invite",
  "post_comment",
  "revival",
];

export function sortByActionPriority(actions) {
  return [...actions].sort((a, b) => {
    const aIdx = ACTION_PRIORITY.indexOf(a.action_type);
    const bIdx = ACTION_PRIORITY.indexOf(b.action_type);
    if (aIdx === -1 && bIdx === -1) return 0;
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });
}

/**
 * Check if any replied_flagged items exist.
 */
export function hasRepliedFlagged(actions) {
  return actions.some((a) => a.action_type.toLowerCase() === "replied_flagged" && a.approved.toUpperCase() === "PENDING");
}

/**
 * Get count of pending items (for badge).
 */
export function getPendingCount(actions) {
  return actions.filter((a) => a.approved.toUpperCase() === "PENDING").length;
}

export { COL };
