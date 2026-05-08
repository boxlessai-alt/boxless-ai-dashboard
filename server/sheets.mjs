/**
 * Google Sheets API Wrapper
 * Handles all interactions with the Google Sheet for lead data.
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

const RANGE = "Sheet1!A1:Q1000";

// Column mapping: A=0, B=1, etc.
const COL = {
  lead_name: 0,        // A
  company: 1,          // B
  linkedin_url: 2,     // C
  action_type: 3,      // D
  status: 4,           // E
  priority: 5,         // F
  notes: 6,            // G
  assigned_date: 7,    // H
  last_contact: 8,     // I
  reply_content: 9,    // J
  offer_tier: 10,      // K
  bottleneck_stage: 11,// L
  days_since_sent: 12, // M
  lead_email: 13,      // N
  phone: 14,           // O
  country: 15,         // P
  industry: 16,        // Q
};

/**
 * Fetch all rows from the Google Sheet.
 * @returns {Promise<Array<Array<string>>>} Raw rows from the sheet.
 */
export async function getAllRows() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueRenderOption: "UNFORMATTED_VALUE",
    });
    return res.data.values || [];
  } catch (error) {
    console.error("[sheets] Error fetching rows:", error.message);
    throw error;
  }
}

/**
 * Update a specific cell in the sheet.
 * @param {string} range - Cell range (e.g., "Sheet1!E5")
 * @param {string} value - Value to set
 */
export async function updateCell(range, value) {
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values: [[value]],
      },
    });
  } catch (error) {
    console.error(`[sheets] Error updating cell ${range}:`, error.message);
    throw error;
  }
}

/**
 * Update the status column (E) for a given row.
 * @param {number} rowIndex - 1-based row index in the sheet
 * @param {string} status - New status value
 */
export async function updateStatus(rowIndex, status) {
  const range = `Sheet1!E${rowIndex}`;
  await updateCell(range, status);
}

/**
 * Update the last_contact column (I) for a given row.
 * @param {number} rowIndex - 1-based row index in the sheet
 * @param {string} date - ISO date string
 */
export async function updateLastContact(rowIndex, date) {
  const range = `Sheet1!I${rowIndex}`;
  await updateCell(range, date);
}

/**
 * Parse raw rows into structured ActionItem objects.
 * Skips the header row.
 * @param {Array<Array<string>>} rows
 * @returns {Array<Object>}
 */
export function parseRowsToActions(rows) {
  if (!rows || rows.length < 2) return [];
  const dataRows = rows.slice(1);
  return dataRows
    .map((row, idx) => {
      const rowNum = idx + 2; // 1-based row number in sheet (row 1 is header)
      const get = (colIdx) => (row[colIdx] !== undefined ? String(row[colIdx]).trim() : "");
      return {
        id: String(rowNum),
        lead_name: get(COL.lead_name),
        company: get(COL.company),
        linkedin_url: get(COL.linkedin_url),
        action_type: get(COL.action_type) || "connection_request",
        status: (get(COL.status) || "PENDING").toUpperCase(),
        priority: get(COL.priority) || "Outreach",
        notes: get(COL.notes),
        assigned_date: get(COL.assigned_date),
        last_contact: get(COL.last_contact),
        reply_content: get(COL.reply_content),
        offer_tier: get(COL.offer_tier),
        bottleneck_stage: get(COL.bottleneck_stage),
        days_since_sent: parseInt(get(COL.days_since_sent), 10) || 0,
        lead_email: get(COL.lead_email),
        phone: get(COL.phone),
        country: get(COL.country),
        industry: get(COL.industry),
      };
    })
    .filter((item) => item.lead_name || item.company);
}

/**
 * Filter actions by status (case-insensitive).
 * @param {Array<Object>} actions
 * @param {string} status
 * @returns {Array<Object>}
 */
export function filterByStatus(actions, status) {
  return actions.filter((a) => a.status.toUpperCase() === status.toUpperCase());
}

/**
 * Group pending actions by priority category.
 * @param {Array<Object>} pendingActions
 * @returns {Object}
 */
export function groupByPriority(pendingActions) {
  const order = ["Conversions", "Replies", "Walkthrough", "Outreach"];
  const grouped = {
    conversions: [],
    replies: [],
    walkthrough: [],
    outreach: [],
  };
  for (const action of pendingActions) {
    const p = action.priority;
    const key = p?.toLowerCase() || "outreach";
    if (grouped[key]) {
      grouped[key].push(action);
    } else {
      grouped.outreach.push(action);
    }
  }
  // Sort each group
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => (b.days_since_sent || 0) - (a.days_since_sent || 0));
  }
  return grouped;
}

/**
 * Derive pipeline stage from action_type and status.
 * @param {Object} action
 * @returns {string}
 */
export function deriveStage(action) {
  const type = action.action_type?.toLowerCase() || "";
  const status = action.status?.toUpperCase() || "";

  if (status === "DONE") return "Booking Confirmed";
  if (type === "form_submitted" || type === "tier_routed") return "Tier Routed";
  if (type === "booking_confirmed") return "Booking Confirmed";
  if (type === "walkthrough_nudge") return "Walkthrough";
  if (type === "reply" || type === "follow_up") return "Replied";
  if (type === "connection_request" || type === "warm_intro") return "Connected";
  if (type === "cold_outreach" || type === "re_engagement") return "Prospecting";
  if (type === "meeting_booking") return "In Conversation";
  if (type === "value_proposition" || type === "case_study") return "In Conversation";

  // Default fallback based on priority
  const priorityMap = {
    "Conversions": "Form Submitted",
    "Replies": "Replied",
    "Walkthrough": "Walkthrough",
    "Outreach": "Prospecting",
  };
  return priorityMap[action.priority] || "Prospecting";
}

/**
 * Build pipeline lanes from all actions.
 * @param {Array<Object>} actions
 * @returns {Array<Object>}
 */
export function buildPipeline(actions) {
  const stageOrder = [
    "Prospecting",
    "Connected",
    "In Conversation",
    "Replied",
    "Walkthrough",
    "Form Submitted",
    "Tier Routed",
    "Booking Confirmed",
  ];

  const stageMap = {};
  for (const stage of stageOrder) {
    stageMap[stage] = [];
  }

  const seen = new Set();
  for (const action of actions) {
    const key = action.linkedin_url || action.lead_email || action.lead_name;
    if (seen.has(key)) continue;
    seen.add(key);

    const stage = deriveStage(action);
    if (stageMap[stage]) {
      stageMap[stage].push({
        id: action.id,
        lead_name: action.lead_name,
        company: action.company,
        linkedin_url: action.linkedin_url,
        stage,
        last_activity: action.last_contact || action.assigned_date || "",
        days_in_stage: action.days_since_sent || 0,
        priority: action.priority,
      });
    }
  }

  return stageOrder.map((stage) => ({
    stage,
    leads: stageMap[stage],
    count: stageMap[stage].length,
  }));
}

export { COL, RANGE };
