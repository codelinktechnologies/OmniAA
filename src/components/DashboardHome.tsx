import React, { useState } from "react";
import { 
  ActivityItem, ApprovalItem, BusinessInfo, MessagingPlatform, AgentModeId, LeadItem 
} from "../types";
import { 
  Play, Pause, RefreshCw, AlertCircle, CheckCircle2, 
  XCircle, TrendingUp, Sparkles, DollarSign, ArrowRight,
  ShieldAlert, Clock, Inbox, Mail, Calendar, Share2
} from "lucide-react";
import { motion } from "motion/react";

interface DashboardHomeProps {
  businessInfo: BusinessInfo;
  platform: MessagingPlatform;
  activeModes: AgentModeId[];
  heartbeat: string;
  status: "Active" | "Paused";
  setStatus: (s: "Active" | "Paused") => void;
  approvals: ApprovalItem[];
  setApprovals: React.Dispatch<React.SetStateAction<ApprovalItem[]>>;
  activityLog: ActivityItem[];
  setActivityLog: React.Dispatch<React.SetStateAction<ActivityItem[]>>;
  leads: LeadItem[];
  setLeads: React.Dispatch<React.SetStateAction<LeadItem[]>>;
  onNavigate: (tab: string) => void;
  onAddLog: (title: string, desc: string, type?: "success" | "warning" | "error" | "pending") => void;
}

export default function DashboardHome({
  businessInfo,
  platform,
  activeModes,
  heartbeat,
  status,
  setStatus,
  approvals,
  setApprovals,
  activityLog,
  setActivityLog,
  leads,
  setLeads,
  onNavigate,
  onAddLog
}: DashboardHomeProps) {
  const [triggeringCheck, setTriggeringCheck] = useState(false);

  // Filter for pending approvals
  const pendingApprovals = approvals.filter(app => app.status === "pending");

  // Mock revenue metrics
  const revenueMetrics = {
    yesterday: 222.00,
    thisWeek: 1104.00,
    projectedMonth: 4416.00,
    salesCount: 6,
    bestProduct: "LocalAI Agency Kit",
    conversions: "Yesterday's top converter: Product Y (12%)"
  };

  const handleManualHeartbeat = async () => {
    setTriggeringCheck(true);
    
    let openClawApiKey = "";
    let openClawEndpoint = "";
    try {
      const cached = localStorage.getItem("omniagent_keysConfig");
      if (cached) {
        const parsed = JSON.parse(cached);
        openClawApiKey = parsed.openClawApiKey || "";
        openClawEndpoint = parsed.openClawEndpoint || "";
      }
    } catch (e) {}

    try {
      const response = await fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessInfo, activeModes, status, openClawApiKey, openClawEndpoint })
      });

      const resData = await response.json();
      setTriggeringCheck(false);

      if (resData.status === "paused") {
        onAddLog(
          "Heartbeat Ignored",
          resData.message,
          "warning"
        );
        return;
      }

      if (resData.status === "success" && resData.data) {
        const { lead, socialPost } = resData.data;

        // Generate dynamic IDs to prevent duplicates
        const leadId = String(Date.now());
        const postId = String(Date.now() + 1);

        // Define the new approval items
        const newLeadApproval: ApprovalItem = {
          id: leadId,
          type: "lead",
          title: `Approve Lead: ${lead.company}`,
          description: `${lead.name} (${lead.notes}). Review details to authorize personalized outreach sequence.`,
          metadata: {
            company: lead.company,
            linkedin: lead.linkedin,
            source: resData.mode === "openclaw" ? "Real-Time OpenClaw.ai Scrape" : "Autonomous Crawler Scan",
            niche: businessInfo.niche || "Target Niche",
            budgetSignal: lead.budgetSignal
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "pending"
        };

        const newPostApproval: ApprovalItem = {
          id: postId,
          type: "social_post",
          title: `Approve ${socialPost.platform} Draft`,
          description: `Auto-generated social media content tailored to your target audience.`,
          metadata: {
            content: socialPost.content
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: "pending"
        };

        // Add to approvals state
        setApprovals(prev => [newLeadApproval, newPostApproval, ...prev]);

        // Add to leads database CRM state
        const newLead: LeadItem = {
          id: leadId,
          name: lead.name || "Contact Person",
          company: lead.company,
          niche: businessInfo.niche || "Target Niche",
          email: lead.email || "hello@domain.com",
          linkedin: lead.linkedin || "linkedin.com",
          source: resData.mode === "openclaw" ? "Real-Time OpenClaw.ai Scrape" : "Autonomous Crawler Scan",
          budgetSignal: lead.budgetSignal || "High",
          notes: lead.notes || "Discovered during live scanner cycle.",
          status: "new"
        };
        setLeads(prev => [newLead, ...prev]);

        // Add activity log items
        const crawlerLogTitle = resData.mode === "openclaw" 
          ? "Live OpenClaw.ai Execution Completed" 
          : "Autonomous Crawler Scan Completed";
        const crawlerLogDesc = resData.mode === "openclaw"
          ? `Direct pipeline scraped a high-intent lead in real-time from openclaw.ai for "${lead.company}". Saved to Approvals Queue.`
          : `Scraped high-intent prospective lead in the ${businessInfo.niche || "local"} niche: ${lead.company}. Added to Approvals Queue.`;

        onAddLog(crawlerLogTitle, crawlerLogDesc, "success");

        const postLogTitle = resData.mode === "openclaw"
          ? "OpenClaw.ai Content Compiled"
          : "Social Media Post Drafted";

        onAddLog(
          postLogTitle,
          `Generated optimized content copy for ${socialPost.platform}. Added to Approvals Queue.`,
          "success"
        );
      } else {
        onAddLog(
          "Manual Heartbeat Triggered",
          `OpenClaw checked system endpoints. Everything is synchronized. No new tasks compiled.`,
          "success"
        );
      }
    } catch (err) {
      console.error("Error running heartbeat sync:", err);
      setTriggeringCheck(false);
      onAddLog(
        "Sync Process Failed",
        `Handshake error with OpenClaw bridge daemon: ${(err as Error).message}`,
        "error"
      );
    }
  };

  const handleApprove = (id: string, itemType: string) => {
    setApprovals(prev => prev.map(app => app.id === id ? { ...app, status: "approved" } : app));
    
    let logTitle = "Action Approved";
    let logDesc = "";
    
    if (itemType === "lead") {
      logDesc = "Approved lead for hyper-personalized cold outreach campaign.";
      const approvedApp = approvals.find(app => app.id === id);
      if (approvedApp && approvedApp.metadata && approvedApp.metadata.company) {
        setLeads(prev => prev.map(l => l.company === approvedApp.metadata.company ? { ...l, status: "approved" } : l));
      }
    } else if (itemType === "social_post") {
      logDesc = "Approved draft social content; sent to queue for autonomous publishing.";
    } else {
      logDesc = "Approved calendar scheduling handshake.";
    }

    onAddLog(logTitle, logDesc, "success");
  };

  const handleReject = (id: string, itemType: string) => {
    setApprovals(prev => prev.map(app => app.id === id ? { ...app, status: "rejected" } : app));
    
    let logTitle = "Action Discarded";
    let logDesc = "";
    
    if (itemType === "lead") {
      logDesc = "Lead rejected. Agent has removed them from outreach cycle.";
      const rejectedApp = approvals.find(app => app.id === id);
      if (rejectedApp && rejectedApp.metadata && rejectedApp.metadata.company) {
        setLeads(prev => prev.map(l => l.company === rejectedApp.metadata.company ? { ...l, status: "rejected" } : l));
      }
    } else if (itemType === "social_post") {
      logDesc = "Social draft rejected. Scheduled content cancelled.";
    } else {
      logDesc = "Calendar scheduling conflict resolved.";
    }

    onAddLog(logTitle, logDesc, "warning");
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Agent Status Block */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Agent Sandbox</p>
              <h3 className="text-lg font-bold text-slate-900 mt-1">OpenClaw Engine</h3>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border flex items-center space-x-1.5 ${
              status === "Active" 
                ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                : "bg-amber-50 text-amber-700 border-amber-100"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <span>{status}</span>
            </span>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span>Dedicated Bridge</span>
              <span className="font-semibold text-slate-800">{platform} Channel</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span>Heartbeat Interval</span>
              <span className="font-semibold text-slate-800">Every {heartbeat}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Last Sync Check</span>
              <span className="font-semibold text-slate-800">12 mins ago</span>
            </div>
          </div>

          <div className="mt-6 flex space-x-2">
            <button
              onClick={() => {
                const nextStatus = status === "Active" ? "Paused" : "Active";
                setStatus(nextStatus);
                onAddLog(
                  `Agent ${nextStatus}`,
                  `OpenClaw autonomous agent background loops have been ${nextStatus.toLowerCase()} by user.`,
                  nextStatus === "Active" ? "success" : "warning"
                );
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center space-x-1.5 ${
                status === "Active"
                  ? "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"
                  : "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
              }`}
            >
              {status === "Active" ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause Agent</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Resume Agent</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleManualHeartbeat}
              disabled={triggeringCheck}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-700 rounded-xl border border-slate-200 transition flex items-center justify-center"
              title="Force Heartbeat Sync"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${triggeringCheck ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Sales Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Revenue Briefing</p>
                <h3 className="text-lg font-bold text-slate-900 mt-1">JVZoo / Payments</h3>
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>

            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900">${revenueMetrics.yesterday.toFixed(2)}</span>
              <span className="text-xs text-emerald-600 font-semibold">Yesterday</span>
            </div>

            <p className="text-[10px] text-slate-500 mt-1">
              Top converter: <span className="font-semibold text-slate-800">{revenueMetrics.bestProduct}</span>
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50 text-xs text-slate-500 flex justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase">This Week</p>
              <p className="font-bold text-slate-800">${revenueMetrics.thisWeek.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Projected Month</p>
              <p className="font-bold text-slate-800">${revenueMetrics.projectedMonth.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Active Sales</p>
              <p className="font-bold text-slate-800">{revenueMetrics.salesCount}</p>
            </div>
          </div>
        </div>

        {/* AI Insight Box (Clause Reasoning output mockup) */}
        <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
            <Sparkles className="h-32 w-32 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center space-x-1 bg-slate-800 px-2.5 py-1 rounded-full text-[10px] font-semibold text-blue-400 border border-slate-700 w-fit">
              <Sparkles className="h-3 w-3" />
              <span>Claude Autonomous Advice</span>
            </div>
            
            <p className="text-xs text-slate-300 italic mt-3 leading-relaxed">
              "We noticed a 12% conversion spike on Product Y yesterday. Recommend shifting Lead Finder settings to Cosmetic Surgeons and drafting a customized promo sequence."
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
            <span className="text-blue-400 font-semibold">{revenueMetrics.conversions}</span>
            <button 
              onClick={() => onNavigate("modes")}
              className="text-white hover:text-blue-400 flex items-center space-x-1 font-bold"
            >
              <span>Optimize Settings</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Main Grid: Approvals + Action Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pending Approvals (Takes 2/3 space on large displays) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Approvals Sign-Off Queue</h3>
              <p className="text-xs text-slate-500 mt-0.5">Actions requiring manual validation prior to external API dispatch.</p>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold font-mono">
              {pendingApprovals.length} Pending
            </span>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
              <Inbox className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">All caught up!</p>
              <p className="text-[10px] text-slate-400 mt-0.5">No tasks are currently waiting in the approval queue.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
              {pendingApprovals.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0"
                >
                  <div className="flex items-start space-x-3 max-w-lg">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 mt-0.5 text-slate-600">
                      {item.type === "lead" && <Mail className="h-4 w-4" />}
                      {item.type === "social_post" && <Share2 className="h-4 w-4" />}
                      {item.type === "calendar_confirm" && <Calendar className="h-4 w-4" />}
                      {item.type === "competitor_alert" && <ShieldAlert className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                      
                      {item.type === "lead" && (
                        <div className="flex space-x-4 mt-2 text-[10px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-100 w-fit">
                          <span>Niche: {item.metadata.niche}</span>
                          <span>Source: {item.metadata.source}</span>
                          <span className="text-emerald-700">Budget: {item.metadata.budgetSignal}</span>
                        </div>
                      )}
                      
                      {item.type === "social_post" && (
                        <div className="mt-2 text-[10px] bg-slate-900 text-slate-200 px-3 py-2 rounded-lg font-mono">
                          {item.metadata.content}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleReject(item.id, item.type)}
                      className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                    >
                      <XCircle className="h-3.5 w-3.5 text-rose-500" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(item.id, item.type)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center space-x-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Action Feed (1/3 space) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900">Today's Activity Feed</h3>
              <button 
                onClick={() => onNavigate("logs")}
                className="text-[10px] font-bold text-blue-600 hover:underline"
              >
                View Full Logs
              </button>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {activityLog.slice(0, 5).map((log) => (
                <div key={log.id} className="relative flex space-x-3 items-start text-xs border-l border-slate-100 pl-4 pb-2 ml-2">
                  <div className="absolute -left-1.5 top-0.5 h-3.5 w-3.5 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      log.status === "success" ? "bg-emerald-500" :
                      log.status === "warning" ? "bg-amber-500" :
                      log.status === "error" ? "bg-rose-500" : "bg-blue-500"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-slate-800">{log.title}</p>
                      <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">{log.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50 bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-[10px] text-slate-500 flex items-start space-x-2">
            <Clock className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-700">OpenClaw Daemon Status</p>
              <p className="mt-0.5">Scheduler loop operating fully in background container. Next autonomous sync: in ~3 hrs 48 mins.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
