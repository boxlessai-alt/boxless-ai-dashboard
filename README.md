# Boxless AI LinkedIn Approval Dashboard

Mobile-first glassmorphism dashboard for approving LinkedIn outreach actions pulled from a Google Sheet.

## Deploy to Render

### Step 1: Push to GitHub

```bash
cd boxless-ai-dashboard
git init
git add .
git commit -m "v2: live Google Sheets integration"
git remote add origin https://github.com/YOUR_USERNAME/boxless-ai-dashboard.git
git push -u origin main --force
```

### Step 2: Create Render Service

1. Go to https://dashboard.render.com/
2. Click **New +** → **Web Service**
3. Connect your GitHub repo
4. Render will auto-detect `render.yaml` settings:
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server/index.mjs`

### Step 3: Set Environment Variables

In your Render service dashboard → **Environment** tab, add these:

| Key | Value |
|-----|-------|
| `GOOGLE_SHEET_ID` | `1gVJrD0TkwyoafcnN-pjs9nZpbQZF8Ffpa3NX4jh0Lyk` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `sylvia-agent@leads-gorilla-465413.iam.gserviceaccount.com` |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Paste the full private key (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`) |
| `JWT_SECRET` | `boxless-ai-dashboard-secret-key-2024` (or any random string) |

### Step 4: Deploy

Click **Manual Deploy** → **Deploy latest commit**

### Login Credentials

| Username | Password | Role |
|----------|----------|------|
| `sylvia` | `sylvia2024` | admin |
| `joseph` | `joseph2024` | approver |

## Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express + Google Sheets API v4 + JWT auth
- **Data**: Live from Google Sheet — no mock data
- **API**: All frontend data comes from `/api/*` endpoints via SWR

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Validate token |
| GET | `/api/queue` | Pending actions grouped by priority |
| GET | `/api/pipeline` | 8-stage pipeline lanes |
| GET | `/api/approved` | Approved/skipped history |
| GET | `/api/stats` | Dashboard statistics |
| POST | `/api/approve/:id` | Approve action → updates Sheet |
| POST | `/api/skip/:id` | Skip action → updates Sheet |
| GET | `/api/health` | Health check |

## Sheets Column Mapping

| Column | Field |
|--------|-------|
| A | lead_name |
| B | company |
| C | linkedin_url |
| D | action_type |
| E | status (PENDING/APPROVED/SKIPPED/DONE) |
| F | priority |
| G | notes |
| H | assigned_date |
| I | last_contact |
| J | reply_content |
| K | offer_tier |
| L | bottleneck_stage |
| M | days_since_sent |
| N | lead_email |
| O | phone |
| P | country |
| Q | industry |
