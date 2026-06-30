import React, { useState } from "react";
import { ApprovalItem, LeadItem } from "../types";
import { 
  Check, X, AlertCircle, Inbox, Mail, Share2, 
  Calendar, Eye, ClipboardCheck, Sparkles 
} from "lucide-react";

interface ApprovalsQueueProps {
  approvals: ApprovalItem[];
  setApprovals: React.Dispatch<React.SetStateAction<ApprovalItem[]>>;
  setLeads: React.Dispatch<React.SetStateAction<LeadItem[]>>;
  onAddLog: (title: string, desc: string, type?: "success" | "warning" | "error" | "pending") => void;
  searchTermOverride?: string;
}

export default function ApprovalsQueue({
  approvals,
  setApprovals,
  setLeads,
  onAddLog,
  searchTermOverride
}: ApprovalsQueueProps) {
  const [filter, setFilter] = useState<"all" | "lead" | "social_post" | "calendar_confirm">("all");

  React.useEffect(() => {
    if (searchTermOverride) {
      setFilter("all");
    }
  }, [searchTermOverride]);

  const pendingApprovals = approvals.filter(
    app => app.status === "pending" && 
    (filter === "all" || app.type === filter) &&
    (!searchTermOverride || 
      app.title.toLowerCase().includes(searchTermOverride.toLowerCase()) || 
      app.description.toLowerCase().includes(searchTermOverride.toLowerCase())
    )
  );

  const handleApprove = (id: string, itemType: string) => {
    setApprovals(prev => prev.map(app => app.id === id ? { ...app, status: "approved" } : app));
    
    if (itemType === "lead") {
      const approvedApp = approvals.find(app => app.id === id);
      if (approvedApp && approvedApp.metadata && approvedApp.metadata.company) {
        setLeads(prev => prev.map(l => l.company === approvedApp.metadata.company ? { ...l, status: "approved" } : l));
      }
    }

    onAddLog(
      "Direct Approvals Validation",
      `Successfully signed off on ${itemType.replace("_", " ")} element. Dispatching payload directly to connected API.`,
      "success"
    );
  };

  const handleReject = (id: string, itemType: string) => {
    setApprovals(prev => prev.map(app => app.id === id ? { ...app, status: "rejected" } : app));
    
    if (itemType === "lead") {
      const rejectedApp = approvals.find(app => app.id === id);
      if (rejectedApp && rejectedApp.metadata && rejectedApp.metadata.company) {
        setLeads(prev => prev.map(l => l.company === rejectedApp.metadata.company ? { ...l, status: "rejected" } : l));
      }
    }

    onAddLog(
      "Action Discarded",
      `Discarded and deleted ${itemType.replace("_", " ")} draft element from queue.`,
      "warning"
    );
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
      
      {/* Tab Filter bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Approvals Sign-Off</h2>
          <p className="text-xs text-slate-500 mt-1">Review drafts and leads created autonomously by your agent before dispatch.</p>
        </div>
        
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {[
            { key: "all", label: "All Items" },
            { key: "lead", label: "Cold Leads" },
            { key: "social_post", label: "Social Drafts" },
            { key: "calendar_confirm", label: "Meetings" }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === tab.key 
                  ? "bg-white text-slate-950 shadow" 
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container */}
      {pendingApprovals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
          <ClipboardCheck className="h-12 w-12 text-slate-300 mb-2 animate-bounce" />
          <h3 className="text-sm font-bold text-slate-800">Clear queue!</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">No actions matching your filter require verification right now. The OpenClaw agent will compile new tasks on the next heartbeat cycle.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingApprovals.map((item) => (
            <div 
              key={item.id}
              className="border border-slate-100 rounded-2xl p-5 hover:border-slate-200 transition bg-slate-50/50 space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 mt-0.5 shadow-sm">
                    {item.type === "lead" && <Mail className="h-5 w-5 text-blue-600" />}
                    {item.type === "social_post" && <Share2 className="h-5 w-5 text-purple-600" />}
                    {item.type === "calendar_confirm" && <Calendar className="h-5 w-5 text-emerald-600" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-950">{item.title}</h4>
                      <span className="text-[10px] font-mono bg-slate-200/60 px-2 py-0.5 rounded-full text-slate-600">
                        {item.type.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.description}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-2">Triggered via autonomous check at {item.timestamp}</p>
                  </div>
                </div>

                <div className="flex space-x-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleReject(item.id, item.type)}
                    className="px-3.5 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                  >
                    <X className="h-4 w-4 text-rose-500" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleApprove(item.id, item.type)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow"
                  >
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>

              {/* Rich metadata views */}
              {item.type === "lead" && (
                <div className="bg-white rounded-xl border border-slate-100 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Company</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{item.metadata.company}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">LinkedIn Profile</span>
                    <a href="#" className="font-semibold text-blue-600 hover:underline mt-0.5 block">{item.metadata.linkedin}</a>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Budget Signal</span>
                    <span className="font-semibold text-emerald-700 mt-0.5 block">{item.metadata.budgetSignal}</span>
                  </div>
                </div>
              )}

              {item.type === "social_post" && (
                <div className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs border border-slate-800 relative">
                  <div className="absolute right-3 top-3 text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center space-x-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                    <Sparkles className="h-3 w-3" />
                    <span>Claude Copy</span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed pr-24">{item.metadata.content}</p>
                </div>
              )}

              {item.type === "calendar_confirm" && (
                <div className="bg-white rounded-xl border border-slate-100 p-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Requested Meeting Time</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{item.metadata.time}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Contact Guest</span>
                    <span className="font-semibold text-slate-600 mt-0.5 block">{item.metadata.email}</span>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
