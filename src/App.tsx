import React, { useState, useEffect } from "react";
import { 
  BusinessInfo, MessagingPlatform, AgentModeId, 
  ActivityItem, ApprovalItem, LeadItem, SocialPost 
} from "./types";
import SetupWizard from "./components/SetupWizard";
import DashboardHome from "./components/DashboardHome";
import AgentModes from "./components/AgentModes";
import ApprovalsQueue from "./components/ApprovalsQueue";
import ActivityLog from "./components/ActivityLog";
import IntegrationsHub from "./components/IntegrationsHub";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import AgencyDashboard from "./components/AgencyDashboard";
import ChatSimulator from "./components/ChatSimulator";
import LandingPage from "./components/LandingPage";
import LeadsDatabase from "./components/LeadsDatabase";

import { 
  LayoutDashboard, ToggleLeft, ClipboardList, ListCollapse, 
  Share2, BarChart2, Briefcase, Settings2, ShieldAlert,
  Menu, X, MessageSquare, ExternalLink, RefreshCcw, HelpCircle,
  Database, Search, ChevronRight, LogOut
} from "lucide-react";

export default function App() {
  const [view, setView] = useState<"landing" | "app">("landing");
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showFloatingChat, setShowFloatingChat] = useState<boolean>(true);

  // Global search state
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchFocused(true);
        const searchInput = document.getElementById("global-search-input");
        if (searchInput) {
          searchInput.focus();
        }
      } else if (e.key === "Escape") {
        setIsSearchFocused(false);
        const searchInput = document.getElementById("global-search-input");
        if (searchInput) {
          searchInput.blur();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Core Onboarding State
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: "DentalCare Austin",
    niche: "Dental Clinics and Orthodontists",
    website: "dentalcareaustin.com",
    targetAudience: "Busy families and local professionals looking for premium cosmetic dentistry",
    toneOfVoice: "Authoritative, compassionate, extremely clean and precise"
  });
  const [platform, setPlatform] = useState<MessagingPlatform>(MessagingPlatform.WHATSAPP);
  const [activeModes, setActiveModes] = useState<AgentModeId[]>([
    AgentModeId.LEAD_FINDER,
    AgentModeId.OUTREACH,
    AgentModeId.SOCIAL_CONTENT,
    AgentModeId.REVENUE_REPORTER
  ]);
  const [heartbeat, setHeartbeat] = useState<string>("4h");
  const [notifications, setNotifications] = useState<"whatsapp" | "dashboard" | "both">("both");
  const [status, setStatus] = useState<"Active" | "Paused">("Active");

  // Mock Database State (Restored from localStorage on load)
  const [activityLog, setActivityLog] = useState<ActivityItem[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);

  // Load state from localStorage if available
  useEffect(() => {
    const cachedOnboard = localStorage.getItem("omniagent_onboarded");
    if (cachedOnboard === "true") {
      setIsOnboarded(true);
    }

    const cachedBusiness = localStorage.getItem("omniagent_business");
    if (cachedBusiness) {
      setBusinessInfo(JSON.parse(cachedBusiness));
    }

    const cachedPlatform = localStorage.getItem("omniagent_platform");
    if (cachedPlatform) {
      setPlatform(cachedPlatform as MessagingPlatform);
    }

    const cachedHeartbeat = localStorage.getItem("omniagent_heartbeat");
    if (cachedHeartbeat) {
      setHeartbeat(cachedHeartbeat);
    }

    const cachedLog = localStorage.getItem("omniagent_activityLog");
    if (cachedLog) {
      setActivityLog(JSON.parse(cachedLog));
    } else {
      const defaultLogs = [
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
    }

    const cachedApprovals = localStorage.getItem("omniagent_approvals");
    if (cachedApprovals) {
      setApprovals(JSON.parse(cachedApprovals));
    } else {
      const defaultApprovals = [
        {
          id: "1",
          type: "lead",
          title: "Approve Lead: Apex Dental Care",
          description: "Emma Larson (Lead Finder found high-intent budget signals: Active Ads running, missing live calendar booking). Reply 'Approve' to outreach.",
          metadata: {
            company: "Apex Dental Care",
            linkedin: "linkedin.com/in/emma-larson-apex",
            source: "Google Maps Scrape",
            niche: "Cosmetic Dentistry",
            budgetSignal: "High (Running Google Ads)"
          },
          timestamp: "06:15 AM",
          status: "pending"
        },
        {
          id: "2",
          type: "social_post",
          title: "Approve LinkedIn Draft",
          description: "Drafted daily post focused on local dentist marketing tips. Ready to queue for automated publishing.",
          metadata: {
            content: "Did you know that 78% of local patients book dentists online during off-hours? If your practice doesn't have an automated calendar system or chatbot, you are directly gifting patients to competitors down the street. It's time to build digital infrastructure! #DentalMarketing #LocalAgency #DentistAustin"
          },
          timestamp: "05:00 AM",
          status: "pending"
        },
        {
          id: "3",
          type: "calendar_confirm",
          title: "Confirm Booking: Dr. Marcus Vance",
          description: "Dr. Marcus Vance requested a demo call via Calendly link after Outreach follow-up sequence. Select to validate.",
          metadata: {
            time: "Tomorrow, 2:30 PM CST",
            email: "contact@vanceortho.com"
          },
          timestamp: "Yesterday",
          status: "pending"
        }
      ];
      setApprovals(defaultApprovals);
    }

    const cachedLeads = localStorage.getItem("omniagent_leads");
    if (cachedLeads) {
      setLeads(JSON.parse(cachedLeads));
    } else {
      const defaultLeads = [
        {
          id: "1",
          name: "Emma Larson",
          company: "Apex Dental Care",
          niche: "Cosmetic Dentistry",
          email: "emma.l@apexdental.com",
          linkedin: "linkedin.com/in/emma-larson-apex",
          source: "Google Maps Scrape",
          budgetSignal: "High",
          notes: "Missing online scheduling, running active campaigns on Meta.",
          status: "approved",
          address: "901 E 5th St, Austin, TX 78702",
          lat: 30.2635,
          lng: -97.7303
        },
        {
          id: "2",
          name: "Marcus Vance",
          company: "Vance Orthodontics",
          niche: "Orthodontics",
          email: "marcus.v@vanceortho.com",
          linkedin: "linkedin.com/in/marcus-vance-ortho",
          source: "Facebook Groups",
          budgetSignal: "Medium",
          notes: "Posted looking for website optimization recommendations.",
          status: "warm",
          address: "1301 W 38th St, Austin, TX 78705",
          lat: 30.3065,
          lng: -97.7441
        }
      ];
      setLeads(defaultLeads);
    }
  }, [view]);

  // Save changes to localStorage
  useEffect(() => {
    if (activityLog.length > 0) {
      localStorage.setItem("omniagent_activityLog", JSON.stringify(activityLog));
    }
  }, [activityLog]);

  useEffect(() => {
    if (approvals.length > 0) {
      localStorage.setItem("omniagent_approvals", JSON.stringify(approvals));
    }
  }, [approvals]);

  useEffect(() => {
    if (leads.length > 0) {
      localStorage.setItem("omniagent_leads", JSON.stringify(leads));
    }
  }, [leads]);

  const handleOnboardingComplete = (data: {
    businessInfo: BusinessInfo;
    platform: MessagingPlatform;
    activeModes: AgentModeId[];
    heartbeat: string;
    notifications: "whatsapp" | "dashboard" | "both";
  }) => {
    setBusinessInfo(data.businessInfo);
    setPlatform(data.platform);
    setActiveModes(data.activeModes);
    setHeartbeat(data.heartbeat);
    setNotifications(data.notifications);
    setIsOnboarded(true);

    // Cache state
    localStorage.setItem("omniagent_onboarded", "true");
    localStorage.setItem("omniagent_business", JSON.stringify(data.businessInfo));
    localStorage.setItem("omniagent_platform", data.platform);
    localStorage.setItem("omniagent_heartbeat", data.heartbeat);

    // Sync state with server state
    fetch("/api/dashboard-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessInfo: data.businessInfo,
        platform: data.platform,
        activeModes: data.activeModes,
        heartbeat: data.heartbeat,
        notifications: data.notifications
      })
    }).catch(err => console.error("Failed to sync onboarding state to backend server:", err));

    handleAddLog(
      "Agent Sandboxed Boot Completed",
      `Launched isolated OpenClaw container. Synchronized custom SOUL.md settings for ${data.businessInfo.name}.`,
      "success"
    );
  };

  const handleAddLog = (title: string, desc: string, type: "success" | "warning" | "error" | "pending" = "success") => {
    const newLog: ActivityItem = {
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title,
      description: desc,
      status: type
    };
    setActivityLog(prev => [newLog, ...prev]);
  };

  const handleResetWizard = () => {
    localStorage.removeItem("omniagent_onboarded");
    localStorage.removeItem("omniagent_business");
    localStorage.removeItem("omniagent_platform");
    localStorage.removeItem("omniagent_heartbeat");
    setIsOnboarded(false);
    setActiveTab("home");
    setView("app");
  };

  // Callback triggers from Dynamic Agent actions
  const handleAgentAddLead = (leadPayload: any) => {
    const austinCenterLat = 30.2672;
    const austinCenterLng = -97.7431;
    const latOffset = (Math.random() - 0.5) * 0.08;
    const lngOffset = (Math.random() - 0.5) * 0.08;
    const generatedLat = parseFloat((austinCenterLat + latOffset).toFixed(5));
    const generatedLng = parseFloat((austinCenterLng + lngOffset).toFixed(5));
    const localAddresses = [
      "Congress Ave, Austin, TX 78701",
      "S Lamar Blvd, Austin, TX 78704",
      "Guadalupe St, Austin, TX 78705",
      "E César Chávez St, Austin, TX 78702",
      "Burnet Rd, Austin, TX 78757"
    ];
    const randomAddress = `${Math.floor(Math.random() * 2000) + 100} ${localAddresses[Math.floor(Math.random() * localAddresses.length)]}`;

    const newLead: LeadItem = {
      id: String(Date.now()),
      name: leadPayload.name || "Active Prospect",
      company: leadPayload.company || "Growth Enterprise",
      niche: leadPayload.niche || businessInfo.niche,
      email: leadPayload.email || "contact@growthenterprise.com",
      linkedin: leadPayload.linkedin || "linkedin.com",
      source: leadPayload.source || "Autonomous Agent Scan",
      budgetSignal: leadPayload.budgetSignal || "High",
      notes: leadPayload.notes || "Added autonomously via WhatsApp prompt.",
      status: "new",
      address: leadPayload.address || randomAddress,
      lat: leadPayload.lat || generatedLat,
      lng: leadPayload.lng || generatedLng
    };

    setLeads(prev => [newLead, ...prev]);

    // Also append to approvals queue
    const newApproval: ApprovalItem = {
      id: String(Date.now() + 1),
      type: "lead",
      title: `Approve Lead: ${newLead.company}`,
      description: `${newLead.name} (${newLead.notes}). Reply 'Approve' to trigger outreach sequence.`,
      metadata: {
        company: newLead.company,
        linkedin: newLead.linkedin,
        source: newLead.source,
        niche: newLead.niche,
        budgetSignal: newLead.budgetSignal
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "pending"
    };
    setApprovals(prev => [newApproval, ...prev]);
  };

  const handleAgentAddSocialPost = (postPayload: any) => {
    const newPost: ApprovalItem = {
      id: String(Date.now()),
      type: "social_post",
      title: `Approve ${postPayload.platform} Draft`,
      description: "Auto-generated draft tailored to your target audience. Ready to publish.",
      metadata: {
        content: postPayload.content
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "pending"
    };
    setApprovals(prev => [newPost, ...prev]);
  };

  const handleToggleModeFromAgent = (modeId: AgentModeId, enabled: boolean) => {
    if (enabled) {
      setActiveModes(prev => [...prev.filter(m => m !== modeId), modeId]);
    } else {
      setActiveModes(prev => prev.filter(m => m !== modeId));
    }
  };

  // Computed live search results across Leads, Activity logs, and Pending approvals
  const matchingLeads = globalSearchQuery.trim() === "" ? [] : leads.filter(lead => 
    lead.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    lead.company.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    lead.niche.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    lead.notes.toLowerCase().includes(globalSearchQuery.toLowerCase())
  ).slice(0, 5);

  const matchingActivities = globalSearchQuery.trim() === "" ? [] : activityLog.filter(log => 
    log.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
    log.description.toLowerCase().includes(globalSearchQuery.toLowerCase())
  ).slice(0, 5);

  const matchingApprovals = globalSearchQuery.trim() === "" ? [] : approvals.filter(app => 
    app.status === "pending" && (
      app.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(globalSearchQuery.toLowerCase())
    )
  ).slice(0, 5);

  const totalResultsCount = matchingLeads.length + matchingActivities.length + matchingApprovals.length;

  return (
    <div id="main-layout" className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      
      {view === "landing" ? (
        <LandingPage onLaunchDemo={() => setView("app")} />
      ) : !isOnboarded ? (
        <SetupWizard 
          onComplete={handleOnboardingComplete} 
          onBackToSales={() => setView("landing")}
        />
      ) : (
        <div className="flex-1 flex flex-col md:flex-row">
          
          {/* LEFT SIDEBAR (Enterprise Control Panel) */}
          <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex-shrink-0 flex flex-col justify-between border-r border-slate-800">
            <div>
              {/* Logo / Brand Header */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white flex items-center">
                    <span className="text-blue-500 mr-1.5">Omni</span>AgentAI
                  </h1>
                  <span className="text-[10px] text-slate-400 font-mono">OpenClaw Autonomous 2.0</span>
                </div>
                
                {/* Mobile Menu Trigger */}
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden text-slate-400 hover:text-white"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>

              {/* Navigation Menu */}
              <nav className={`p-4 space-y-1.5 ${mobileMenuOpen ? "block" : "hidden md:block"}`}>
                {[
                  { key: "home", label: "Dashboard Home", icon: LayoutDashboard },
                  { key: "modes", label: "Agent Skills (6)", icon: ToggleLeft },
                  { key: "leads", label: "Leads Database (CRM)", icon: Database },
                  { key: "approvals", label: "Approvals Queue", icon: ClipboardList, badge: approvals.filter(a => a.status === "pending").length },
                  { key: "logs", label: "Terminal Activity Feed", icon: ListCollapse },
                  { key: "integrations", label: "API Integrations Hub", icon: Share2 },
                  { key: "analytics", label: "Analytics & KPI Stats", icon: BarChart2 },
                  { key: "agency", label: "Agency Portal (OTO2)", icon: Briefcase },
                  { key: "settings", label: "System Advanced Config", icon: Settings2 }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setActiveTab(item.key);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full p-3 rounded-xl text-xs font-semibold text-left transition flex items-center justify-between ${
                        isActive 
                          ? "bg-blue-600 text-white font-bold" 
                          : "hover:bg-slate-800 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                      
                      {item.badge && item.badge > 0 ? (
                        <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full font-mono">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
                <div className="pt-4 mt-4 border-t border-slate-800">
                  <button
                    onClick={handleResetWizard}
                    className="w-full p-3 rounded-xl text-xs font-semibold text-left transition flex items-center justify-between text-slate-400 hover:bg-slate-800 hover:text-rose-400"
                  >
                    <div className="flex items-center space-x-2.5">
                      <LogOut className="h-4 w-4" />
                      <span>Logout / Reset Sandbox</span>
                    </div>
                  </button>
                </div>
              </nav>
            </div>

            {/* Sandbox details summary footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Active Instance:</span>
                <span className="font-bold text-white">{businessInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Docker Memory:</span>
                <span className="font-semibold text-slate-300">128MB / 4GB</span>
              </div>
              <div className="flex justify-between">
                <span>Bridge Status:</span>
                <span className="font-semibold text-emerald-400 flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                  {platform} Live
                </span>
              </div>
            </div>
          </aside>

          {/* MAIN PAGE CONTAINER (Varying Content) */}
          <main className="flex-1 flex flex-col p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-x-hidden">
            
            {/* Context bar / Top Header */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm relative overflow-visible">
              <div className="flex-shrink-0">
                <p className="text-xs font-mono text-slate-400">Manage client context / container</p>
                <div className="flex items-center space-x-2 mt-1">
                  <h1 className="text-xl font-extrabold text-slate-900">{businessInfo.name}</h1>
                  <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-bold text-blue-700">
                    Active retainer
                  </span>
                </div>
              </div>

              {/* GLOBAL SEARCH SYSTEM */}
              <div className="flex-1 w-full max-w-md lg:mx-4 relative" id="global-search-container">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-3.5 w-3.5" />
                  </div>
                  <input
                    id="global-search-input"
                    type="text"
                    placeholder="Search leads, approvals, logs... (⌘K)"
                    value={globalSearchQuery}
                    onChange={(e) => {
                      setGlobalSearchQuery(e.target.value);
                      setIsSearchFocused(true);
                    }}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-full pl-9 pr-12 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center space-x-1.5">
                    {globalSearchQuery && (
                      <button
                        onClick={() => {
                          setGlobalSearchQuery("");
                          setIsSearchFocused(false);
                        }}
                        className="p-0.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[9px] font-bold text-slate-400">
                      <span className="text-[8px]">⌘</span>K
                    </kbd>
                  </div>
                </div>

                {/* Search overlay click-away backdrop */}
                {isSearchFocused && (
                  <div 
                    className="fixed inset-0 bg-transparent z-40" 
                    onClick={() => setIsSearchFocused(false)}
                  />
                )}

                {/* Dropdown Results Box */}
                {isSearchFocused && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-[420px] overflow-y-auto divide-y divide-slate-100 flex flex-col">
                    {globalSearchQuery.trim() === "" ? (
                      <div className="p-4 space-y-3">
                        <p className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Quick Shortcuts</p>
                        <div className="space-y-1.5">
                          {leads.slice(0, 3).map(l => (
                            <button
                              key={l.id}
                              onClick={() => {
                                setGlobalSearchQuery(l.company);
                                setActiveTab("leads");
                                setIsSearchFocused(false);
                                handleAddLog("Global Search Selection", `Navigated to Leads CRM for "${l.company}".`, "success");
                              }}
                              className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl text-left transition group cursor-pointer"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition">
                                  <Database className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-800">{l.company}</h4>
                                  <p className="text-[10px] text-slate-400">{l.name} • {l.niche}</p>
                                </div>
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* MATCHING LEADS */}
                        {matchingLeads.length > 0 && (
                          <div className="p-3">
                            <div className="px-2 pb-1.5">
                              <span className="text-[10px] font-bold font-mono text-indigo-500 uppercase tracking-wider">Leads CRM ({matchingLeads.length})</span>
                            </div>
                            <div className="space-y-1">
                              {matchingLeads.map(l => (
                                <button
                                  key={l.id}
                                  onClick={() => {
                                    setGlobalSearchQuery(l.company);
                                    setActiveTab("leads");
                                    setIsSearchFocused(false);
                                    handleAddLog("Global Search Selection", `Selected and highlighted "${l.company}" lead in CRM.`, "success");
                                  }}
                                  className="w-full flex items-center justify-between p-2 hover:bg-indigo-50/50 rounded-xl text-left transition group cursor-pointer"
                                >
                                  <div className="flex items-center space-x-2.5">
                                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                      <Database className="h-3.5 w-3.5" />
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-bold text-slate-800">{l.company}</h4>
                                      <p className="text-[10px] text-slate-500">{l.name} • {l.niche}</p>
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-mono group-hover:bg-indigo-100 group-hover:text-indigo-700 transition">
                                    {l.status}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* PENDING APPROVALS */}
                        {matchingApprovals.length > 0 && (
                          <div className="p-3">
                            <div className="px-2 pb-1.5">
                              <span className="text-[10px] font-bold font-mono text-rose-500 uppercase tracking-wider">Pending Approvals ({matchingApprovals.length})</span>
                            </div>
                            <div className="space-y-1">
                              {matchingApprovals.map(app => (
                                <button
                                  key={app.id}
                                  onClick={() => {
                                    setGlobalSearchQuery(app.title);
                                    setActiveTab("approvals");
                                    setIsSearchFocused(false);
                                    handleAddLog("Global Search Selection", `Opened approvals pipeline to review draft: "${app.title}".`, "success");
                                  }}
                                  className="w-full flex items-center justify-between p-2 hover:bg-rose-50/50 rounded-xl text-left transition group cursor-pointer"
                                >
                                  <div className="flex items-center space-x-2.5">
                                    <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                                      <ClipboardList className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className="text-xs font-bold text-slate-800 truncate">{app.title}</h4>
                                      <p className="text-[10px] text-slate-500 truncate">{app.description}</p>
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-400 font-mono flex-shrink-0 ml-2">
                                    {app.timestamp}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* RECENT ACTIVITIES */}
                        {matchingActivities.length > 0 && (
                          <div className="p-3">
                            <div className="px-2 pb-1.5">
                              <span className="text-[10px] font-bold font-mono text-emerald-600 uppercase tracking-wider">Terminal Activities ({matchingActivities.length})</span>
                            </div>
                            <div className="space-y-1">
                              {matchingActivities.map(log => (
                                <button
                                  key={log.id}
                                  onClick={() => {
                                    setGlobalSearchQuery(log.title);
                                    setActiveTab("logs");
                                    setIsSearchFocused(false);
                                    handleAddLog("Global Search Selection", `Focused terminal log details for: "${log.title}".`, "success");
                                  }}
                                  className="w-full flex items-center justify-between p-2 hover:bg-emerald-50/50 rounded-xl text-left transition group cursor-pointer"
                                >
                                  <div className="flex items-center space-x-2.5 min-w-0">
                                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                                      log.status === "error" ? "bg-rose-50 text-rose-600" :
                                      log.status === "warning" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                                    }`}>
                                      <ListCollapse className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className="text-xs font-bold text-slate-800 truncate">{log.title}</h4>
                                      <p className="text-[10px] text-slate-500 truncate">{log.description}</p>
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-mono text-slate-400 flex-shrink-0 ml-2">
                                    {log.timestamp}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* EMPTY STATE */}
                        {totalResultsCount === 0 && (
                          <div className="p-8 text-center flex flex-col items-center justify-center space-y-1 text-slate-400">
                            <Search className="h-6 w-6 text-slate-300" />
                            <p className="text-xs font-bold text-slate-700">No matches found</p>
                            <p className="text-[10px] text-slate-400">We couldn't find anything matching "{globalSearchQuery}"</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 w-full lg:w-auto">
                <button
                  onClick={() => setView("landing")}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-100 text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">View Sales Page</span>
                </button>

                <button
                  onClick={() => setShowFloatingChat(!showFloatingChat)}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                    showFloatingChat 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{platform} Assistant Chat</span>
                </button>
                
                <button
                  onClick={handleResetWizard}
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition cursor-pointer"
                  title="Reset Setup Wizard"
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
              </div>
            </header>

            {/* Render Tab pages dynamically */}
            <div className="flex-1">
              {activeTab === "home" && (
                <DashboardHome
                  businessInfo={businessInfo}
                  platform={platform}
                  activeModes={activeModes}
                  heartbeat={heartbeat}
                  status={status}
                  setStatus={setStatus}
                  approvals={approvals}
                  setApprovals={setApprovals}
                  activityLog={activityLog}
                  setActivityLog={setActivityLog}
                  leads={leads}
                  setLeads={setLeads}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onAddLog={(title, desc, type) => handleAddLog(title, desc, type)}
                />
              )}

              {activeTab === "modes" && (
                <AgentModes
                  businessInfo={businessInfo}
                  activeModes={activeModes}
                  setActiveModes={setActiveModes}
                  onAddLog={(title, desc, type) => handleAddLog(title, desc, type)}
                />
              )}

              {activeTab === "leads" && (
                <LeadsDatabase
                  leads={leads}
                  setLeads={setLeads}
                  businessInfo={businessInfo}
                  onAddLog={(title, desc, type) => handleAddLog(title, desc, type)}
                  onAddApproval={(newApproval) => setApprovals(prev => [newApproval, ...prev])}
                  searchTermOverride={globalSearchQuery}
                  onClearSearchOverride={() => setGlobalSearchQuery("")}
                />
              )}

              {activeTab === "approvals" && (
                <ApprovalsQueue
                  approvals={approvals}
                  setApprovals={setApprovals}
                  setLeads={setLeads}
                  onAddLog={(title, desc, type) => handleAddLog(title, desc, type)}
                  searchTermOverride={globalSearchQuery}
                />
              )}

              {activeTab === "logs" && (
                <ActivityLog
                  activityLog={activityLog}
                  setActivityLog={setActivityLog}
                  onAddLog={(title, desc, type) => handleAddLog(title, desc, type)}
                  searchTermOverride={globalSearchQuery}
                />
              )}

              {activeTab === "integrations" && (
                <IntegrationsHub
                  onAddLog={(title, desc, type) => handleAddLog(title, desc, type)}
                />
              )}

              {activeTab === "analytics" && (
                <Analytics />
              )}

              {activeTab === "agency" && (
                <AgencyDashboard
                  onAddLog={(title, desc, type) => handleAddLog(title, desc, type)}
                  onChangeClient={(name) => {
                    setBusinessInfo({
                      ...businessInfo,
                      name: name,
                      niche: name === "DentalCare Austin" ? "Dental Clinics and Orthodontists" : "Local Retail Services"
                    });
                  }}
                />
              )}

              {activeTab === "settings" && (
                <Settings
                  businessInfo={businessInfo}
                  setBusinessInfo={setBusinessInfo}
                  heartbeat={heartbeat}
                  setHeartbeat={setHeartbeat}
                  onResetWizard={handleResetWizard}
                  onAddLog={(title, desc, type) => handleAddLog(title, desc, type)}
                />
              )}
            </div>

            {/* FLOATING ACTIVE MESSAGING ASSISTANT PREVIEW */}
            {showFloatingChat && (
              <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
                <div className="bg-emerald-950 text-white px-4 py-1.5 flex justify-between items-center text-[10px] font-bold font-mono">
                  <span>Interactive Agent Sandbox Bridge</span>
                  <button 
                    onClick={() => setShowFloatingChat(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <ChatSimulator
                  businessInfo={businessInfo}
                  platform={platform}
                  heartbeat={heartbeat}
                  status={status}
                  setStatus={setStatus}
                  onAddLead={handleAgentAddLead}
                  onAddSocialPost={handleAgentAddSocialPost}
                  onAddActivity={handleAddLog}
                  onToggleMode={handleToggleModeFromAgent}
                />
              </div>
            )}

          </main>

        </div>
      )}
    </div>
  );
}
