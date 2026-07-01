export interface BusinessInfo {
  name: string;
  niche: string;
  website: string;
  targetAudience: string;
  toneOfVoice: string;
}

export enum MessagingPlatform {
  WHATSAPP = "WhatsApp",
  TELEGRAM = "Telegram"
}

export enum AgentModeId {
  LEAD_FINDER = "lead_finder",
  OUTREACH = "outreach",
  SOCIAL_CONTENT = "social_content",
  APPOINTMENT_BOOKING = "appointment_booking",
  REVENUE_REPORTER = "revenue_reporter",
  COMPETITOR_MONITOR = "competitor_monitor",
  BROWSER_CONTROL = "browser_control",
  VOICE_CALLER = "voice_caller"
}

export interface AgentMode {
  id: AgentModeId;
  name: string;
  description: string;
  enabled: boolean;
  config: Record<string, any>;
}

export interface Integration {
  id: string;
  name: string;
  category: "messaging" | "calendar" | "email" | "social" | "payment";
  connected: boolean;
  username?: string;
  icon: string;
}

export interface ActivityItem {
  id: string;
  timestamp: string; // ISO format or nice string
  modeId?: AgentModeId;
  title: string;
  description: string;
  status: "success" | "warning" | "error" | "pending";
}

export interface ApprovalItem {
  id: string;
  type: "lead" | "social_post" | "calendar_confirm" | "competitor_alert";
  title: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: string;
  status: "pending" | "approved" | "rejected";
}

export interface LeadItem {
  id: string;
  name: string;
  company: string;
  niche: string;
  email: string;
  linkedin: string;
  source: string;
  budgetSignal: string;
  notes: string;
  status: "new" | "approved" | "rejected" | "outreached" | "warm" | "booked";
  address?: string;
  lat?: number;
  lng?: number;
}

export interface SocialPost {
  id: string;
  platform: "LinkedIn" | "Twitter" | "Facebook" | "Instagram";
  content: string;
  scheduledTime: string;
  status: "draft" | "approved" | "published" | "rejected";
}

export interface CompetitorAlert {
  id: string;
  competitor: string;
  type: "price" | "feature" | "launch" | "viral";
  title: string;
  description: string;
  suggestedStrategy: string;
}

export interface ClientInstance {
  id: string;
  name: string;
  businessName: string;
  niche: string;
  status: "Active" | "Paused";
  leadsCount: number;
  revenueThisWeek: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
}
