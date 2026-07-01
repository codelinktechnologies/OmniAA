import React, { useState } from "react";
import { AgentModeId, BusinessInfo } from "../types";
import { 
  Search, Mail, Share2, Calendar, DollarSign, 
  Eye, Check, Save, Sparkles, ToggleLeft, ToggleRight, 
  HelpCircle, Settings, MapPin, Sliders, Hash, Globe, Phone
} from "lucide-react";

interface AgentModesProps {
  businessInfo: BusinessInfo;
  activeModes: AgentModeId[];
  setActiveModes: React.Dispatch<React.SetStateAction<AgentModeId[]>>;
  onAddLog: (title: string, desc: string, type?: "success" | "warning" | "error" | "pending") => void;
}

export default function AgentModes({
  businessInfo,
  activeModes,
  setActiveModes,
  onAddLog
}: AgentModesProps) {
  const [selectedMode, setSelectedMode] = useState<AgentModeId>(AgentModeId.LEAD_FINDER);
  
  // Local states for detailed configurations
  const [leadFinderConfig, setLeadFinderConfig] = useState({
    location: "Austin, TX",
    keywords: "cosmetic dentistry, orthodontist, dental surgeon",
    companySize: "1-10 employees",
    budgetFilters: ["Active Ads", "Low Rating"],
    ratingFilter: 4.2
  });

  const [outreachConfig, setOutreachConfig] = useState({
    channel: "Email",
    template: `Subject: Quick feedback on {{company}} website

Hi {{first_name}},

I came across {{company}} while reviewing clinics in {{location}}. Your cosmetic work looks top-notch, but I noticed you don't have a calendar scheduler or live chatbot, which likely leaks 15-20% of off-hours booking opportunities.

I drafted a responsive customized scheduler for you guys here. Let me know if you want to check it out!`,
    tone: "conversational",
    delayBetweenSends: 6, // minutes
    autopilot: false
  });

  const [socialConfig, setSocialConfig] = useState({
    platforms: ["LinkedIn", "Twitter"],
    frequency: "Daily",
    themes: "Practical tips, client case studies, industry trends",
    hashtags: "#localbusiness #growthmarketing #aiagent",
    recycleEnabled: true
  });

  const [appointmentConfig, setAppointmentConfig] = useState({
    calendlyLink: "https://calendly.com/acme-agency/30min",
    reminderEmail: "Hello, looking forward to our call tomorrow!",
    reminderDelay: 24, // hours before call
    calendarProvider: "Google Calendar"
  });

  const [revenueConfig, setRevenueConfig] = useState({
    jvzooSecret: "••••••••••••••••••••",
    warriorPlusKey: "••••••••••••••••••••",
    stripeKey: "••••••••••••••••••••",
    paypalEmail: "billing@acme.com",
    reportsTime: "07:00 AM"
  });

  const [competitorConfig, setCompetitorConfig] = useState({
    targets: [
      "https://competitor-one.com",
      "https://dentalcare-austin-group.com"
    ],
    checksInterval: "Daily",
    trackPricing: true,
    trackLaunches: true
  });

  const handleToggleModeGlobal = (id: AgentModeId) => {
    if (activeModes.includes(id)) {
      setActiveModes(prev => prev.filter(m => m !== id));
      onAddLog(
        "Agent Mode Disabled",
        `De-allocated the ${id.replace("_", " ")} openclaw skill from the active container.`,
        "warning"
      );
    } else {
      setActiveModes(prev => [...prev, id]);
      onAddLog(
        "Agent Mode Activated",
        `Injected and allocated the ${id.replace("_", " ")} openclaw skill into the active container.`,
        "success"
      );
    }
  };

  const handleSaveConfig = () => {
    onAddLog(
      "Configuration Saved",
      `Saved custom properties for the ${selectedMode.replace("_", " ")} mode. Reloading container SOUL.md context...`,
      "success"
    );
  };

  const modesInfo = [
    {
      id: AgentModeId.LEAD_FINDER,
      name: "Lead Finder Agent",
      icon: Search,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      desc: "Autonomously scrapes, qualifies, and deduplicates high-intent local business leads."
    },
    {
      id: AgentModeId.OUTREACH,
      name: "Outreach Agent",
      icon: Mail,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      desc: "Writes and dispatches personalized emails, cold messages, or LinkedIn messages with delays."
    },
    {
      id: AgentModeId.SOCIAL_CONTENT,
      name: "Social Content Agent",
      icon: Share2,
      color: "text-purple-600 bg-purple-50 border-purple-100",
      desc: "Generates weekly niche-optimized value posts and publishes on a structured rotation."
    },
    {
      id: AgentModeId.APPOINTMENT_BOOKING,
      name: "Appointment Booking Agent",
      icon: Calendar,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      desc: "Autonomously detects intent to book a demo call and coordinates scheduling handshakes."
    },
    {
      id: AgentModeId.REVENUE_REPORTER,
      name: "Built-In Revenue Engine",
      icon: DollarSign,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      desc: "Pulls metrics daily from JVZoo, Stripe, and PayPal to build natural language sales briefs."
    },
    {
      id: AgentModeId.COMPETITOR_MONITOR,
      name: "Competitor Monitor Agent",
      icon: Eye,
      color: "text-rose-600 bg-rose-50 border-rose-100",
      desc: "Scrapes competitor websites for price changes, sales, and product announcement signals."
    },
    {
      id: AgentModeId.BROWSER_CONTROL,
      name: "Browser Control Agent",
      icon: Globe,
      color: "text-cyan-600 bg-cyan-50 border-cyan-100",
      desc: "Navigate web pages, click elements, fill forms, and extract deep web data fully autonomously."
    },
    {
      id: AgentModeId.VOICE_CALLER,
      name: "Voice Caller Agent",
      icon: Phone,
      color: "text-orange-600 bg-orange-50 border-orange-100",
      desc: "Places AI-powered voice calls to leads, confirming bookings and handling simple Q&A instantly."
    }
  ];

  const activeModeDetails = modesInfo.find(m => m.id === selectedMode)!;
  const isSelectedActive = activeModes.includes(selectedMode);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[550px]">
      
      {/* Sidebar: Mode Selector */}
      <div className="w-full md:w-80 border-r border-slate-100 bg-slate-50/50 p-4 space-y-2 flex-shrink-0 overflow-y-auto">
        <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider px-3 mb-4">8 Active Agent Skills</h3>
        {modesInfo.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeModes.includes(mode.id);
          const isChosen = selectedMode === mode.id;

          return (
            <div
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`w-full p-3.5 rounded-xl cursor-pointer text-left transition relative flex items-center justify-between ${
                isChosen 
                  ? "bg-white shadow border border-slate-200" 
                  : "hover:bg-slate-100 border border-transparent"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg border ${mode.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-950">{mode.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {isActive ? "Skill Enabled" : "Disabled"}
                  </p>
                </div>
              </div>

              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleModeGlobal(mode.id);
                }}
                className="p-1 cursor-pointer"
                title={isActive ? "Disable this Skill" : "Enable this Skill"}
              >
                {isActive ? (
                  <ToggleRight className="h-6 w-6 text-blue-600" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-slate-300 hover:text-slate-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Panel: Configuration properties */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
        <div className="space-y-6">
          
          {/* Active Mode Header */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`p-2 rounded-xl border ${activeModeDetails.color}`}>
                  <activeModeDetails.icon className="h-5 w-5" />
                </span>
                <h2 className="text-lg font-bold text-slate-900">{activeModeDetails.name}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-2 max-w-xl">{activeModeDetails.desc}</p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-mono">Global State:</span>
              <button
                onClick={() => handleToggleModeGlobal(selectedMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                  isSelectedActive 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                    : "bg-slate-100 border-slate-200 text-slate-500"
                }`}
              >
                {isSelectedActive ? "✓ Active" : "Paused"}
              </button>
            </div>
          </div>

          {/* Config Fields Grid */}
          <div className="space-y-4">
            
            {/* Lead Finder Configuration */}
            {selectedMode === AgentModeId.LEAD_FINDER && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" /> Target Geographic Location
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={leadFinderConfig.location}
                    onChange={(e) => setLeadFinderConfig({ ...leadFinderConfig, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 flex items-center">
                    <Sliders className="h-3 w-3 mr-1" /> Minimum Rating Filter (Google Maps)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={leadFinderConfig.ratingFilter}
                    onChange={(e) => setLeadFinderConfig({ ...leadFinderConfig, ratingFilter: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600">Search Keywords (comma separated)</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={leadFinderConfig.keywords}
                    onChange={(e) => setLeadFinderConfig({ ...leadFinderConfig, keywords: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Company Size Filter</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={leadFinderConfig.companySize}
                    onChange={(e) => setLeadFinderConfig({ ...leadFinderConfig, companySize: e.target.value })}
                  >
                    <option>1-10 employees</option>
                    <option>11-50 employees</option>
                    <option>51-200 employees</option>
                    <option>Any size</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">High-Intent Budget Signals</label>
                  <div className="flex space-x-2 mt-1">
                    {["Running Ads", "Missing Pixel", "Claimed Maps"].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          const active = leadFinderConfig.budgetFilters.includes(b);
                          setLeadFinderConfig({
                            ...leadFinderConfig,
                            budgetFilters: active 
                              ? leadFinderConfig.budgetFilters.filter(f => f !== b)
                              : [...leadFinderConfig.budgetFilters, b]
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition ${
                          leadFinderConfig.budgetFilters.includes(b)
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Outreach Configuration */}
            {selectedMode === AgentModeId.OUTREACH && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Default Outreach Channel</label>
                    <select
                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={outreachConfig.channel}
                      onChange={(e) => setOutreachConfig({ ...outreachConfig, channel: e.target.value })}
                    >
                      <option>Email</option>
                      <option>LinkedIn InMail</option>
                      <option>Instagram DM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Tone of Voice (Claude Engine)</label>
                    <select
                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={outreachConfig.tone}
                      onChange={(e) => setOutreachConfig({ ...outreachConfig, tone: e.target.value })}
                    >
                      <option value="conversational">Friendly & Casual (Highest response)</option>
                      <option value="direct">Short & Direct (Good for busy owners)</option>
                      <option value="corporate">Polished & Professional</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Personalized Outreach Template (supports Handlebars)</label>
                  <textarea
                    rows={5}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono resize-none"
                    value={outreachConfig.template}
                    onChange={(e) => setOutreachConfig({ ...outreachConfig, template: e.target.value })}
                  />
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Autopilot Mode (Fully Autonomous)</p>
                    <p className="text-[10px] text-slate-500 leading-tight">If enabled, the agent sends outreach emails immediately without waiting in your Approvals Queue.</p>
                  </div>
                  <button
                    onClick={() => setOutreachConfig({ ...outreachConfig, autopilot: !outreachConfig.autopilot })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      outreachConfig.autopilot 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {outreachConfig.autopilot ? "Autopilot ON" : "Autopilot OFF"}
                  </button>
                </div>
              </div>
            )}

            {/* Social Configuration */}
            {selectedMode === AgentModeId.SOCIAL_CONTENT && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Active Social Channels</label>
                  <div className="flex space-x-2 mt-1">
                    {["LinkedIn", "Twitter", "Facebook"].map((p) => {
                      const active = socialConfig.platforms.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setSocialConfig({
                              ...socialConfig,
                              platforms: active 
                                ? socialConfig.platforms.filter(plat => plat !== p)
                                : [...socialConfig.platforms, p]
                            });
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                            active 
                              ? "bg-purple-50 border-purple-200 text-purple-700" 
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Posting Frequency</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={socialConfig.frequency}
                    onChange={(e) => setSocialConfig({ ...socialConfig, frequency: e.target.value })}
                  >
                    <option>Daily</option>
                    <option>Mon / Wed / Fri</option>
                    <option>Once a week (Monday morning)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600">Key Themes / Directives</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={socialConfig.themes}
                    onChange={(e) => setSocialConfig({ ...socialConfig, themes: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 flex items-center">
                    <Hash className="h-3 w-3 mr-0.5 text-slate-400" /> Hashtag Preset
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    value={socialConfig.hashtags}
                    onChange={(e) => setSocialConfig({ ...socialConfig, hashtags: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Appointment Booking Configuration */}
            {selectedMode === AgentModeId.APPOINTMENT_BOOKING && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600">Calendly / Booking Link</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={appointmentConfig.calendlyLink}
                    onChange={(e) => setAppointmentConfig({ ...appointmentConfig, calendlyLink: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Primary Calendar Sync</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={appointmentConfig.calendarProvider}
                    onChange={(e) => setAppointmentConfig({ ...appointmentConfig, calendarProvider: e.target.value })}
                  >
                    <option>Google Calendar</option>
                    <option>Apple iCloud Calendar</option>
                    <option>Outlook 365</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Follow-up Reminder Delay (Hours)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={appointmentConfig.reminderDelay}
                    onChange={(e) => setAppointmentConfig({ ...appointmentConfig, reminderDelay: parseInt(e.target.value) })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600">Automated Reminder Template</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={appointmentConfig.reminderEmail}
                    onChange={(e) => setAppointmentConfig({ ...appointmentConfig, reminderEmail: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Built-In Revenue Engine Configuration */}
            {selectedMode === AgentModeId.REVENUE_REPORTER && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">JVZoo Instant Payment Notification Key</label>
                  <input
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    value={revenueConfig.jvzooSecret}
                    onChange={(e) => setRevenueConfig({ ...revenueConfig, jvzooSecret: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">WarriorPlus API Key</label>
                  <input
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    value={revenueConfig.warriorPlusKey}
                    onChange={(e) => setRevenueConfig({ ...revenueConfig, warriorPlusKey: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Stripe Live Secret Key</label>
                  <input
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    value={revenueConfig.stripeKey}
                    onChange={(e) => setRevenueConfig({ ...revenueConfig, stripeKey: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">PayPal Email Link</label>
                  <input
                    type="email"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={revenueConfig.paypalEmail}
                    onChange={(e) => setRevenueConfig({ ...revenueConfig, paypalEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Morning Reporting Schedule (WhatsApp Brief)</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={revenueConfig.reportsTime}
                    onChange={(e) => setRevenueConfig({ ...revenueConfig, reportsTime: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Competitor Monitor Configuration */}
            {selectedMode === AgentModeId.COMPETITOR_MONITOR && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Competitor Websites / Product URLs (One per line)</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono resize-none"
                    value={competitorConfig.targets.join("\n")}
                    onChange={(e) => setCompetitorConfig({ ...competitorConfig, targets: e.target.value.split("\n") })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Monitoring Scan Interval</label>
                    <select
                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={competitorConfig.checksInterval}
                      onChange={(e) => setCompetitorConfig({ ...competitorConfig, checksInterval: e.target.value })}
                    >
                      <option>Real-Time (Hourly)</option>
                      <option>Daily</option>
                      <option>Every Monday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Enabled Trackers</label>
                    <div className="flex space-x-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setCompetitorConfig({ ...competitorConfig, trackPricing: !competitorConfig.trackPricing })}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition ${
                          competitorConfig.trackPricing
                            ? "bg-rose-50 border-rose-200 text-rose-700"
                            : "bg-white border-slate-200 text-slate-600"
                        }`}
                      >
                        Pricing Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setCompetitorConfig({ ...competitorConfig, trackLaunches: !competitorConfig.trackLaunches })}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition ${
                          competitorConfig.trackLaunches
                            ? "bg-rose-50 border-rose-200 text-rose-700"
                            : "bg-white border-slate-200 text-slate-600"
                        }`}
                      >
                        Sales & Product Launches
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Browser Control Configuration */}
            {selectedMode === AgentModeId.BROWSER_CONTROL && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Target Web Workflows</label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Navigate to LinkedIn, click 'Connect' on profiles matching 'CEO', and send templated DM."
                    defaultValue="Scan local Yelp directory, extract contact details of unverified businesses, and populate into Leads CRM."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Browser Execution Speed</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option>Human-like (Safe, Random Delays)</option>
                      <option>Fast (May trigger captchas)</option>
                      <option>Background Stealth Mode</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Proxy Rotation</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option>Auto-Rotate (Recommended)</option>
                      <option>Static Datacenter IP</option>
                      <option>Residential IP Network</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Voice Caller Configuration */}
            {selectedMode === AgentModeId.VOICE_CALLER && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">AI Voice Profile</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option>Emma (Friendly, Professional)</option>
                      <option>Marcus (Authoritative, Calm)</option>
                      <option>Sarah (Energetic, Upbeat)</option>
                      <option>James (Consultative, Deep)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Call Objective</label>
                    <select className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option>Demo Confirmation</option>
                      <option>Cold Intro Pitch</option>
                      <option>Feedback Collection</option>
                      <option>Invoice Follow-up</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Custom Script Override</label>
                  <textarea
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    placeholder="Leave blank to use dynamic Gemini-generated conversational script, or paste your exact required script here..."
                    defaultValue={`Hi! I'm calling from ${businessInfo.name} regarding your recent inquiry. Are you still interested in scheduling a quick call?`}
                  />
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Action Bar */}
        <div className="flex justify-end items-center pt-6 border-t border-slate-100 mt-6">
          <button
            onClick={handleSaveConfig}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <Save className="h-4 w-4" />
            <span>Save properties</span>
          </button>
        </div>

      </div>

    </div>
  );
}
