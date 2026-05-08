export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MeResponse {
  user: User;
}

export interface QueueAction {
  id: string;
  action_type: string;
  lead_name: string;
  company: string;
  linkedin_url: string;
  offer_tier?: string;
  bottleneck_stage?: string;
  reply_content?: string;
  days_since_sent?: number;
  priority: 'high' | 'medium' | 'low' | string;
  created_at: string;
}

export interface QueueGroup {
  conversions: QueueAction[];
  replies: QueueAction[];
  walkthrough: QueueAction[];
  outreach: QueueAction[];
}

export interface QueueResponse {
  actions: QueueAction[];
  grouped: QueueGroup;
}

export interface PipelineLead {
  id: string;
  lead_name: string;
  company: string;
  days_in_stage: number;
  stage: string;
}

export interface PipelineLane {
  stage: string;
  leads: PipelineLead[];
  count: number;
}

export interface PipelineResponse {
  lanes: PipelineLane[];
}

export interface ApprovedItem {
  id: string;
  action_type: string;
  lead_name: string;
  company: string;
  linkedin_url: string;
  status: 'approved' | 'skipped';
  approved_date: string;
  created_at: string;
  priority: string;
}

export interface ApprovedResponse {
  items: ApprovedItem[];
}

export interface StatsResponse {
  totalPending: number;
  totalApproved: number;
  totalSkipped: number;
  conversionRate: number;
  totalLeads: number;
  pipelineSummary: PipelineStageSummary[];
  weeklyTrends: WeeklyTrend[];
  activityByType: ActivityByType[];
}

export interface PipelineStageSummary {
  stage: string;
  count: number;
  color: string;
}

export interface WeeklyTrend {
  week: string;
  approved: number;
  skipped: number;
  pending: number;
}

export interface ActivityByType {
  type: string;
  count: number;
  color: string;
}

export interface HealthResponse {
  status: string;
}

export type FilterType = 'all' | 'approved' | 'skipped';

export type PriorityTab = 'conversions' | 'replies' | 'walkthrough' | 'outreach';

export interface PriorityConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  gradient: string;
}
