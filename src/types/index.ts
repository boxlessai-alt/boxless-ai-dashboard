export interface User {
  username: string;
  name: string;
  role: 'admin' | 'approver';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface QueueAction {
  id: string;
  lead_name: string;
  company: string;
  linkedin_url: string;
  action_type: string;
  draft_message: string;
  context_clue: string;
  proof_angle: string;
  next_action_date: string;
  approved: string;
  sent: string;
  notes: string;
}

export interface QueueStats {
  pending: number;
  approvedToday: number;
  skippedToday: number;
  sentToday: number;
}

export interface QueueResponse {
  actions: QueueAction[];
  stats: QueueStats;
  repliedFlagged: boolean;
  pendingCount: number;
}

export interface ApprovedResponse {
  items: QueueAction[];
}

export interface DashboardStats {
  stats: QueueStats;
  pendingCount: number;
  totalActions: number;
  actionTypeBreakdown: Record<string, number>;
  todayActions: number;
  hasRepliedFlagged: boolean;
}

export interface EditPayload {
  draft_message: string;
}

export interface PipelineLead {
  id: string;
  lead_name: string;
  company: string;
  days_in_stage: number;
}

export interface PipelineLane {
  stage: string;
  count: number;
  leads: PipelineLead[];
}

export interface PipelineResponse {
  lanes: PipelineLane[];
}

// Action type color mapping
export const ACTION_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  first_dm: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  followup_1: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
  followup_2: { bg: 'bg-lime-500/15', text: 'text-lime-400', border: 'border-lime-500/30' },
  breakup: { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30' },
  connection_invite: { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30' },
  post_comment: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  revival: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  replied_flagged: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
};

export function getActionTypeColor(actionType: string) {
  return ACTION_TYPE_COLORS[actionType] || {
    bg: 'bg-white/[0.06]',
    text: 'text-white/60',
    border: 'border-white/[0.1]',
  };
}

// Action type display labels
export const ACTION_TYPE_LABELS: Record<string, string> = {
  first_dm: 'First DM',
  followup_1: 'Follow-up 1',
  followup_2: 'Follow-up 2',
  breakup: 'Breakup',
  connection_invite: 'Connection Invite',
  post_comment: 'Post Comment',
  revival: 'Revival',
  replied_flagged: 'Replied',
};

export function getActionTypeLabel(actionType: string) {
  return ACTION_TYPE_LABELS[actionType] || actionType;
}

// Action type priority order for sorting
export const ACTION_PRIORITY = [
  'replied_flagged',
  'first_dm',
  'followup_1',
  'followup_2',
  'breakup',
  'connection_invite',
  'post_comment',
  'revival',
];

export function getActionPriority(actionType: string): number {
  const idx = ACTION_PRIORITY.indexOf(actionType);
  return idx === -1 ? 999 : idx;
}
