import React, { useState } from "react";
import { ActivityItem, AgentModeId } from "../types";
import { Search, RotateCcw, AlertTriangle, CheckCircle, Info, Filter, Trash2 } from "lucide-react";

interface ActivityLogProps {
  activityLog: ActivityItem[];
  setActivityLog: React.Dispatch<React.SetStateAction<ActivityItem[]>>;
  onAddLog: (title: string, desc: string, type?: "success" | "warning" | "error" | "pending") => void;
  searchTermOverride?: string;
}

export default function ActivityLog({
  activityLog,
  setActivityLog,
  onAddLog,
  searchTermOverride
}: ActivityLogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");

  React.useEffect(() => {
    if (searchTermOverride !== undefined) {
      setSearchQuery(searchTermOverride);
      if (searchTermOverride) {
        setStatusFilter("all");
        setModeFilter("all");
      }
    }
  }, [searchTermOverride]);

  const filteredLogs = activityLog.filter((log) => {
    const matchesSearch = 
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesMode = modeFilter === "all" || log.modeId === modeFilter;

    return matchesSearch && matchesStatus && matchesMode;
  });

  const handleClearLogs = () => {
    setActivityLog([]);
    onAddLog("Activity Logs Flushed", "Cleared log storage cache successfully.", "warning");
  };

  const handleRestoreDefaults = () => {
    const defaultLogs: ActivityItem[] = [
      {
        id: "1",
        timestamp: "07:05 AM",
        modeId: AgentModeId.REVENUE_REPORTER,
        title: "Revenue Report Compiled",
        description: "Checked JVZoo and Stripe APIs. Logged $222.00 across 6 sales. Dispatch message scheduled via WhatsApp.",
        status: "success"
      },
      {
        id: "2",
        timestamp: "06:15 AM",
        modeId: AgentModeId.LEAD_FINDER,
        title: "Completed Austin Dental Scan",
        description: "Scraped 34 cosmetic clinics in Austin. Identified 3 high-intent targets with missing appointment booking widgets.",
        status: "success"
      },
      {
        id: "3",
        timestamp: "Yesterday",
        modeId: AgentModeId.SOCIAL_CONTENT,
        title: "Published LinkedIn Post",
        description: "Autonomous content successfully validated and published to linked profile: 'Why busy local business owners require execution agents in 2026...'",
        status: "success"
      },
      {
        id: "4",
        timestamp: "Yesterday",
        modeId: AgentModeId.COMPETITOR_MONITOR,
        title: "Competitor Price Drop Signal",
        description: "Scraped pricing table at dentalcare-austin-group.com. Found $50 rebate offering on cosmetic cleans. Strategy advice sent to queue.",
        status: "warning"
      }
    ];
    setActivityLog(defaultLogs);
    onAddLog("Restored Sample Log Data", "Seeded default log timelines into OpenClaw instance.", "success");
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Agent Activity Timeline</h2>
          <p className="text-xs text-slate-500 mt-1">Real-time terminal execution logs from your dedicated OpenClaw Docker sandbox.</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleRestoreDefaults}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold flex items-center space-x-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restore Samples</span>
          </button>
          
          <button
            onClick={handleClearLogs}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Flush Logs</span>
          </button>
        </div>
      </div>

      {/* Filter and search controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl w-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search keywords, leads, posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <select
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Execution States</option>
            <option value="success">Success</option>
            <option value="warning">Warning / Alerts</option>
            <option value="error">Failed operations</option>
          </select>
        </div>

        <div>
          <select
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
          >
            <option value="all">All Agent Modes</option>
            <option value={AgentModeId.LEAD_FINDER}>Lead Finder</option>
            <option value={AgentModeId.OUTREACH}>Outreach Agent</option>
            <option value={AgentModeId.SOCIAL_CONTENT}>Social Content</option>
            <option value={AgentModeId.APPOINTMENT_BOOKING}>Appointment Booking</option>
            <option value={AgentModeId.REVENUE_REPORTER}>Built-In Revenue Engine</option>
            <option value={AgentModeId.COMPETITOR_MONITOR}>Competitor Monitor</option>
          </select>
        </div>
      </div>

      {/* Logs Feed */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-16 border border-slate-100 rounded-xl bg-slate-50/50">
          <Info className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">No logs found</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Try widening your filters or search query.</p>
        </div>
      ) : (
        <div className="border border-slate-800 rounded-2xl overflow-hidden font-mono text-xs shadow-lg">
          <div className="bg-slate-950 text-slate-300 px-4 py-3 flex items-center justify-between border-b border-slate-900">
            <span className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>openclaw-sandbox-stdout.log</span>
            </span>
            <span className="text-[9px] bg-slate-900 text-emerald-400 border border-emerald-950 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">
              sandbox active
            </span>
          </div>
          
          <div className="divide-y divide-slate-900 bg-black max-h-[450px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className={`p-4 flex items-start space-x-3.5 transition hover:bg-slate-950/80`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {log.status === "success" && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                  {log.status === "warning" && <AlertTriangle className="h-4 w-4 text-amber-400" />}
                  {log.status === "error" && <AlertTriangle className="h-4 w-4 text-rose-400" />}
                  {log.status === "pending" && <Info className="h-4 w-4 text-blue-400" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] font-semibold text-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-100 font-bold">{log.title}</span>
                      {log.modeId && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                          {log.modeId.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 sm:mt-0 font-normal">{log.timestamp}</span>
                  </div>
                  
                  <p className="text-slate-400 leading-relaxed text-[11px] font-normal">{log.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
