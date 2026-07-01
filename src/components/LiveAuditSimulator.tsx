import React, { useState } from "react";
import { 
  Search, ShieldCheck, AlertCircle, FileText, Send, Sparkles, 
  ChevronRight, ArrowRight, RefreshCw, CheckCircle, Globe, Building, Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CardGlow from "./CardGlow";
import confetti from "canvas-confetti";

interface AuditResult {
  score: number;
  grade: string;
  niche: string;
  companyName: string;
  website: string;
  gaps: {
    id: string;
    title: string;
    status: "critical" | "warning" | "optimal";
    description: string;
    impact: string;
  }[];
  proposalSubject: string;
  proposalBody: string;
}

const INDUSTRY_PRESETS = [
  { id: "spa", label: "Spa, Well-being & Wellness Center", defaultName: "Zen Float Oasis" },
  { id: "dental", label: "Dentist & Dental Practice", defaultName: "Starlight Dentistry" },
  { id: "gym", label: "Gym, CrossFit or Yoga Studio", defaultName: "Iron Pulse Gym" },
  { id: "service", label: "HVAC, Plumbing or Local Contractor", defaultName: "Rapid Rescue Plumbing" },
  { id: "agency", label: "Design, Marketing or Tech Agency", defaultName: "Vortex Creative Agency" }
];

export default function LiveAuditSimulator() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("spa");
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [auditReport, setAuditReport] = useState<AuditResult | null>(null);
  const [proposalSent, setProposalSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const scanSteps = [
    "🔍 Fetching active DNS pointers and resolving domain layout...",
    "📱 Running simulated lighthouse checks for mobile response rates...",
    "🛒 Auditing page source code for scheduling CTAs, booking iframe integrations, or Calendly links...",
    "🤖 Simulating automated response latency of contact mail handlers...",
    "📝 Drafting personalized, low-friction Outreach blueprint..."
  ];

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isScanning) return;
    
    const cleanCompany = businessName.trim();
    const cleanUrl = websiteUrl.trim();
    
    setIsScanning(true);
    setScanStep(0);
    setAuditReport(null);
    setProposalSent(false);
    setErrorMsg(null);

    let fetchedReport: AuditResult | null = null;
    let fetchError: string | null = null;

    // Start background fetch to our secure backend API
    const apiPromise = fetch("/api/generate-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: cleanCompany,
        website: cleanUrl,
        industry: selectedIndustry
      })
    })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error("Failed to communicate with our AI audit core");
      }
      const data = await res.json();
      if (data.status === "success" && data.report) {
        fetchedReport = data.report;
      } else {
        throw new Error(data.error || "Failed to compile custom report");
      }
    })
    .catch((err) => {
      console.error("Audit scan error:", err);
      fetchError = err.message || "A network or validation error occurred during scan.";
    });

    // Animate scanning steps step-by-step
    for (let idx = 0; idx < scanSteps.length; idx++) {
      await new Promise((resolve) => setTimeout(resolve, 850));
      setScanStep(idx + 1);
    }

    // Await API response if it has not resolved yet
    try {
      await apiPromise;
    } catch (e) {
      // Handled inside promise chain
    }

    setIsScanning(false);

    if (fetchError) {
      setErrorMsg(fetchError);
    } else if (fetchedReport) {
      setAuditReport(fetchedReport);
      
      // Celebrate successful live scan!
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.8 },
        colors: ["#a855f7", "#6366f1", "#10b981"]
      });
    }
  };

  return (
    <CardGlow 
      glowColor="rgba(168, 85, 247, 0.08)" 
      hoverBorderColor="border-slate-200 hover:border-purple-500/30"
      className="bg-white border border-slate-200/80 shadow-xl rounded-3xl p-6 md:p-8"
    >
      <div className="space-y-6">
        
        {/* Header tag */}
        <div className="flex items-center space-x-2">
          <div className="bg-purple-100 text-purple-700 p-2 rounded-xl">
            <Target className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold font-mono text-purple-600 uppercase tracking-widest block">FEATURE 1: GAP ANALYZER</span>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Run Instant Lead-Finder Audit</h3>
          </div>
        </div>

        <p className="text-slate-600 text-xs leading-relaxed">
          Experience exactly how our <strong>Lead Finder Agent</strong> scans listings, uncovers booking gaps, and builds high-intent proposals. Enter any business details below to try it out.
        </p>

        {/* Input Form */}
        <form onSubmit={handleStartScan} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">Business Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Building className="h-3.5 w-3.5" />
                </div>
                <input
                  type="text"
                  disabled={isScanning}
                  placeholder="Zen Float Oasis"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">Website URL (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <input
                  type="text"
                  disabled={isScanning}
                  placeholder="www.zenfloat.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">Select Target Industry Group</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {INDUSTRY_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  disabled={isScanning}
                  onClick={() => setSelectedIndustry(p.id)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition text-center ${
                    selectedIndustry === p.id
                      ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/10"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {p.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isScanning}
            className={`w-full py-3 rounded-xl text-xs font-black tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md ${
              isScanning
                ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20 hover:shadow-lg cursor-pointer"
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                <span>SCANNING DIGITAL TOUCHPOINTS...</span>
              </>
            ) : (
              <>
                <Search className="h-4.5 w-4.5" />
                <span>GENERATE FREE RADAR AUDIT REPORT</span>
              </>
            )}
          </button>
        </form>

        {/* Scan Animation Progress */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-950 text-slate-200 p-4 rounded-2xl border border-white/5 font-mono text-[10px] space-y-2.5 shadow-inner"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2 text-slate-400">
                <span>SYSTEM DIAGNOSTIC SCAN</span>
                <span className="animate-pulse">RUNNING...</span>
              </div>
              <div className="space-y-1.5">
                {scanSteps.map((step, idx) => {
                  const isDone = scanStep > idx;
                  const isActive = scanStep === idx;
                  return (
                    <div 
                      key={idx}
                      className={`flex items-start space-x-2 transition-opacity ${
                        isDone ? "text-emerald-400" : isActive ? "text-purple-300 font-bold" : "text-slate-600"
                      }`}
                    >
                      <span>{isDone ? "✓" : isActive ? "→" : "•"}</span>
                      <span className="flex-1">{step}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="h-4.5 w-4.5 text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Scan Incomplete</p>
              <p className="text-slate-600 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Audit Report Result Panel */}
        <AnimatePresence>
          {auditReport && !isScanning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border border-purple-100 rounded-3xl overflow-hidden shadow-lg bg-purple-50/20"
            >
              
              {/* Report Header Scorecard */}
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-5 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 space-y-1">
                  <span className="text-[10px] font-bold font-mono text-purple-200 uppercase tracking-widest bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-500/20">
                    DIAGNOSTIC REPORT FOR: {auditReport.companyName.toUpperCase()}
                  </span>
                  <h4 className="text-md font-black tracking-tight mt-1">{auditReport.niche}</h4>
                  <p className="text-xs text-purple-200/80 font-mono truncate">{auditReport.website}</p>
                </div>
                
                {/* Score Circle */}
                <div className="md:col-span-4 flex items-center md:justify-end gap-3.5">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-purple-200 block">REVENUE GAP GRADE</span>
                    <span className="text-xs font-bold text-rose-300 font-mono block">CRITICAL IMPACT</span>
                  </div>
                  <div className="h-14 w-14 rounded-full border-4 border-rose-500 flex flex-col items-center justify-center bg-black/30 shadow">
                    <span className="text-lg font-black font-mono text-rose-400">{auditReport.grade}</span>
                    <span className="text-[8px] text-slate-400 font-mono">Score: {auditReport.score}</span>
                  </div>
                </div>
              </div>

              {/* Gap Breakdown List */}
              <div className="p-5 md:p-6 space-y-5">
                <h5 className="text-[11px] font-black font-mono text-slate-400 uppercase tracking-wider">DETECTED BOOKING GAPS</h5>
                
                <div className="grid grid-cols-1 gap-4">
                  {auditReport.gaps.map((gap) => (
                    <div 
                      key={gap.id}
                      className="bg-white border border-slate-100 p-4 rounded-2xl flex items-start gap-3.5 shadow-sm"
                    >
                      <div className={`p-1.5 rounded-full mt-0.5 ${
                        gap.status === "critical" ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h6 className="text-xs font-bold text-slate-800 tracking-tight">{gap.title}</h6>
                          <span className={`text-[8px] font-black font-mono px-1.5 py-0.5 rounded uppercase ${
                            gap.status === "critical" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {gap.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal mt-1">{gap.description}</p>
                        <div className="mt-2 text-[10px] font-mono text-rose-600 font-bold bg-rose-50/50 p-2 rounded-lg border border-rose-500/10 flex items-center gap-1">
                          <span className="font-extrabold uppercase text-[8px] bg-rose-500 text-white px-1.5 py-0.1 rounded-full mr-1">Loss Risk:</span>
                          {gap.impact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Proposal Draft Section */}
                <div className="border-t border-slate-100 pt-5 mt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[11px] font-black font-mono text-slate-400 uppercase tracking-wider">AUTO-GENERATED PITCH DRAFT</h5>
                    <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Personal Writer V2.0</span>
                  </div>

                  <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 font-mono text-[11px] text-slate-200 space-y-2 relative shadow-inner">
                    <div className="flex border-b border-white/5 pb-2 text-slate-400">
                      <span className="w-16">Subject:</span>
                      <span className="text-white font-bold">{auditReport.proposalSubject}</span>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-300 pt-1">
                      {auditReport.proposalBody}
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!auditReport || proposalSent) return;
                        
                        setProposalSent(true);
                        
                        const newLead = {
                          id: "audit-lead-" + Date.now(),
                          name: "Owner / Decision Maker",
                          company: auditReport.companyName,
                          niche: auditReport.niche,
                          email: `contact@${auditReport.website.replace(/^https?:\/\/(www\.)?/, "")}`,
                          linkedin: `linkedin.com/company/${auditReport.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
                          source: "Live Audit Suite",
                          budgetSignal: `High (Running Ads, Grade: ${auditReport.grade})`,
                          notes: `Scanned from live dashboard. Identified conversion bottlenecks: ${auditReport.gaps.map(g => g.title).join(", ")}.`,
                          status: "new",
                          address: "Local business sector",
                          lat: 30.2672 + (Math.random() - 0.5) * 0.08,
                          lng: -97.7431 + (Math.random() - 0.5) * 0.08
                        };

                        const newApproval = {
                          id: "audit-approval-" + Date.now(),
                          type: "lead",
                          title: `Approve Outreach: ${auditReport.companyName}`,
                          description: `Audit Score: ${auditReport.score}% (${auditReport.grade}). Gaps: ${auditReport.gaps.map(g => g.title).join(", ")}. Reply 'Approve' to trigger outbound pitch.`,
                          metadata: {
                            company: auditReport.companyName,
                            website: auditReport.website,
                            gaps: auditReport.gaps,
                            proposalSubject: auditReport.proposalSubject,
                            proposalBody: auditReport.proposalBody
                          },
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          status: "pending"
                        };

                        const newActivity = {
                          id: "audit-activity-" + Date.now(),
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          modeId: "lead_finder",
                          title: `Live Radar Scan: ${auditReport.companyName}`,
                          description: `Audited ${auditReport.website} (${auditReport.score}% score). Added to live dashboard database.`,
                          status: "success"
                        };

                        try {
                          const existingLeads = JSON.parse(localStorage.getItem("omniagent_leads") || "[]");
                          const existingApprovals = JSON.parse(localStorage.getItem("omniagent_approvals") || "[]");
                          const existingActivityLog = JSON.parse(localStorage.getItem("omniagent_activityLog") || "[]");

                          localStorage.setItem("omniagent_leads", JSON.stringify([newLead, ...existingLeads]));
                          localStorage.setItem("omniagent_approvals", JSON.stringify([newApproval, ...existingApprovals]));
                          localStorage.setItem("omniagent_activityLog", JSON.stringify([newActivity, ...existingActivityLog]));
                        } catch (e) {
                          console.error("Local storage sync error:", e);
                        }

                        fetch("/api/dashboard-state")
                          .then(res => res.json())
                          .then(state => {
                            const updatedLeads = [newLead, ...(state.leads || [])];
                            const updatedApprovals = [newApproval, ...(state.approvals || [])];
                            const updatedActivityLog = [newActivity, ...(state.activityLog || [])];
                            
                            return fetch("/api/dashboard-state", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                leads: updatedLeads,
                                approvals: updatedApprovals,
                                activityLog: updatedActivityLog
                              })
                            });
                          })
                          .catch(err => console.error("Error syncing audited lead to server state:", err));

                        confetti({
                          particleCount: 100,
                          spread: 80,
                          origin: { y: 0.8 },
                          colors: ["#10b981", "#6366f1", "#a855f7"]
                        });
                      }}
                      disabled={proposalSent}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wider flex items-center space-x-1.5 transition-all shadow-md ${
                        proposalSent
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-none cursor-default"
                          : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/15 cursor-pointer"
                      }`}
                    >
                      {proposalSent ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>PITCH COMMITTED TO APPROVALS QUEUE!</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>COMMIT TO OUTBOUND QUEUE</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </CardGlow>
  );
}
